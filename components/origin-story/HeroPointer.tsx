'use client'

import { useEffect, useRef } from 'react'

// The hero answers the pointer: the photograph drifts against the headline and a warm torch follows
// the cursor across the portrait. It writes four custom properties on the hero (--px/--py as -1..1
// across the section, --tx/--ty as pixels inside the portrait frame) and two attributes
// (data-pointer while the pointer is over the section, data-idle while the light wanders on its
// own); the styles decide what moves. Vanilla rAF on purpose: the page already pays for the motion
// engine, and nothing here needs a tween library.
// Fine pointers on wide screens only, and never under reduced motion; elsewhere the hero is static.
const WIDE_FINE = '(min-width: 900px) and (hover: hover) and (pointer: fine)'
const REDUCED = '(prefers-reduced-motion: reduce)'
// Fraction of the remaining distance covered per frame: the response eases in rather than snapping.
const EASE = 0.085
// With no pointer on it, the light wanders by itself: a slow Lissajous figure around the face, so
// the first screen is never the still state. The two periods (seconds) never line up, so the path
// does not visibly repeat; the centre and reach are fractions of the frame. A 7s sweep is slow
// enough to read as light, fast enough that two glances a second apart differ.
const WANDER = { periodX: 7, periodY: 10.6, cx: 0.53, cy: 0.3, rx: 0.09, ry: 0.07 }
// Where the face sits in the frame: the pointer only leans the light off it, never carries it away.
const FACE = { x: 0.53, y: 0.3, lean: 0.3 }
// The wander starts once the portrait has faded in, and comes back after the pointer rests or leaves.
const IDLE_FIRST = 1800
const IDLE_AFTER_REST = 2600
const IDLE_AFTER_LEAVE = 1200
const TAU = Math.PI * 2

export default function HeroPointer() {
  const sentinel = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const hero = sentinel.current?.parentElement
    if (!hero) return
    if (!window.matchMedia(WIDE_FINE).matches || window.matchMedia(REDUCED).matches) return

    const frame = hero.querySelector<HTMLElement>('[data-hero-frame]')
    const born = performance.now()
    let frameW = frame?.offsetWidth ?? 0
    let frameH = frame?.offsetHeight ?? 0
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let torchX = -1
    let torchY = -1
    let aimX = 0
    let aimY = 0
    let raf = 0
    let idleTimer = 0
    let inside = false
    let idle = false
    let inView = true

    const write = () => {
      hero.style.setProperty('--px', x.toFixed(4))
      hero.style.setProperty('--py', y.toFixed(4))
      hero.style.setProperty('--tx', `${torchX.toFixed(1)}px`)
      hero.style.setProperty('--ty', `${torchY.toFixed(1)}px`)
    }

    // The torch stays on the face: the pointer leans it a little toward its own side of the frame,
    // so a pointer over the headline or the index never pulls the light onto the dark ground.
    const aimAt = (clientX: number, clientY: number) => {
      if (!frame) return
      const f = frame.getBoundingClientRect()
      const faceX = f.width * FACE.x
      const faceY = f.height * FACE.y
      aimX = faceX + (Math.max(0, Math.min(f.width, clientX - f.left)) - faceX) * FACE.lean
      aimY = faceY + (Math.max(0, Math.min(f.height, clientY - f.top)) - faceY) * FACE.lean
    }

    const wander = (now: number) => {
      const t = (now - born) / 1000
      const sx = Math.sin((t / WANDER.periodX) * TAU)
      const sy = Math.sin((t / WANDER.periodY) * TAU + 0.9)
      aimX = frameW * (WANDER.cx + WANDER.rx * sx)
      aimY = frameH * (WANDER.cy + WANDER.ry * sy)
      // The headline and the photograph breathe a little apart with the light.
      targetX = sx * 0.32
      targetY = sy * 0.24
    }

    const tick = (now: number) => {
      raf = 0
      if (idle) wander(now)
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
      if (inView && !document.hidden && (idle || !settled)) raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(tick)
    }
    const sleep = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    const goIdle = () => {
      if (!inView || document.hidden) return
      idle = true
      hero.dataset.idle = ''
      frameW = frame?.offsetWidth ?? frameW
      frameH = frame?.offsetHeight ?? frameH
      // The first wander starts where its path begins, not from the frame's corner.
      if (torchX < 0) {
        wander(performance.now())
        torchX = aimX
        torchY = aimY
      }
      wake()
    }
    const idleIn = (delay: number) => {
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(goIdle, delay)
    }
    const stopIdle = () => {
      idle = false
      delete hero.dataset.idle
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const box = hero.getBoundingClientRect()
      const visible = event.clientY >= box.top && event.clientY <= box.bottom
      if (!visible) {
        if (inside) leave()
        return
      }
      stopIdle()
      if (!inside) {
        inside = true
        hero.dataset.pointer = ''
      }
      targetX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1))
      targetY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1))
      aimAt(event.clientX, event.clientY)
      if (torchX < 0) {
        torchX = aimX
        torchY = aimY
      }
      // A mouse left resting hands the light back to the wander.
      idleIn(IDLE_AFTER_REST)
      wake()
    }

    function leave() {
      inside = false
      delete hero!.dataset.pointer
      targetX = 0
      targetY = 0
      idleIn(IDLE_AFTER_LEAVE)
      wake()
    }

    const onLeaveWindow = () => {
      if (inside) leave()
    }

    // Off screen or in a hidden tab the loop stops; it picks up again where it left off.
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) wake()
      else sleep()
    })
    observer.observe(hero)
    const onVisibility = () => {
      if (document.hidden) sleep()
      else wake()
    }
    const onResize = () => {
      frameW = frame?.offsetWidth ?? frameW
      frameH = frame?.offsetHeight ?? frameH
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)
    idleIn(IDLE_FIRST)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
      observer.disconnect()
      window.clearTimeout(idleTimer)
      sleep()
      delete hero.dataset.pointer
      delete hero.dataset.idle
      for (const name of ['--px', '--py', '--tx', '--ty']) hero.style.removeProperty(name)
    }
  }, [])

  return <span ref={sentinel} hidden aria-hidden="true" />
}
