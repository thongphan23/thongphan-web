'use client'

import { useEffect, useRef } from 'react'

// The hero answers the pointer: the photograph drifts against the headline and a warm torch follows
// the cursor across the portrait. It writes four custom properties on the hero (--px/--py as -1..1
// across the section, --tx/--ty as pixels inside the portrait frame) and one attribute
// (data-pointer) while the pointer is over the section; the styles decide what moves. Vanilla rAF
// on purpose: the page already pays for the motion engine, and nothing here needs a tween library.
// Fine pointers on wide screens only, and never under reduced motion; elsewhere the hero is static.
const WIDE_FINE = '(min-width: 900px) and (hover: hover) and (pointer: fine)'
const REDUCED = '(prefers-reduced-motion: reduce)'
// Fraction of the remaining distance covered per frame: the response eases in rather than snapping.
const EASE = 0.085

export default function HeroPointer() {
  const sentinel = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const hero = sentinel.current?.parentElement
    if (!hero) return
    if (!window.matchMedia(WIDE_FINE).matches || window.matchMedia(REDUCED).matches) return

    const frame = hero.querySelector<HTMLElement>('[data-hero-frame]')
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let torchX = 0
    let torchY = 0
    let aimX = 0
    let aimY = 0
    let raf = 0
    let inside = false

    const write = () => {
      hero.style.setProperty('--px', x.toFixed(4))
      hero.style.setProperty('--py', y.toFixed(4))
      hero.style.setProperty('--tx', `${torchX.toFixed(1)}px`)
      hero.style.setProperty('--ty', `${torchY.toFixed(1)}px`)
    }

    const tick = () => {
      raf = 0
      x += (targetX - x) * EASE
      y += (targetY - y) * EASE
      torchX += (aimX - torchX) * (EASE * 1.6)
      torchY += (aimY - torchY) * (EASE * 1.6)
      write()
      const settled =
        Math.abs(targetX - x) < 0.001 &&
        Math.abs(targetY - y) < 0.001 &&
        Math.abs(aimX - torchX) < 0.3 &&
        Math.abs(aimY - torchY) < 0.3
      if (!settled) raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      const box = hero.getBoundingClientRect()
      const visible = event.clientY >= box.top && event.clientY <= box.bottom
      if (!visible) {
        if (inside) leave()
        return
      }
      if (!inside) {
        inside = true
        hero.dataset.pointer = ''
        // The torch starts where the pointer enters, not at the corner it last rested in.
        if (frame) {
          const f = frame.getBoundingClientRect()
          torchX = event.clientX - f.left
          torchY = event.clientY - f.top
        }
      }
      targetX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1))
      targetY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1))
      if (frame) {
        const f = frame.getBoundingClientRect()
        aimX = event.clientX - f.left
        aimY = event.clientY - f.top
      }
      wake()
    }

    function leave() {
      inside = false
      delete hero!.dataset.pointer
      targetX = 0
      targetY = 0
      wake()
    }

    const onLeaveWindow = () => {
      if (inside) leave()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
      if (raf) cancelAnimationFrame(raf)
      delete hero.dataset.pointer
      for (const name of ['--px', '--py', '--tx', '--ty']) hero.style.removeProperty(name)
    }
  }, [])

  return <span ref={sentinel} hidden aria-hidden="true" />
}
