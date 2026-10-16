'use client'

import { useEffect, useRef } from 'react'
import styles from './TensaiHeroFx.module.css'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const MOTION_OK = '(prefers-reduced-motion: no-preference)'
// The lit window is this many px square; keep it in step with `.window` in the stylesheet.
const SIZE = 600

// A dot field behind the hero that the pointer lights up like a torch.
//
// The lit dots are two layers: a window that follows the pointer (translate only) and, inside it, the
// bright dot pattern moved the opposite way by the same whole pixels, so the dots stay pinned to the
// page's grid while only the light moves. Nothing here animates layout or paint properties, there is
// no listener when the pointer is not a fine one or motion is reduced, and the static dots remain.
export default function TensaiHeroFx() {
  const root = useRef<HTMLDivElement>(null)
  const light = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const win = light.current
    const dots = field.current
    const hero = el?.parentElement
    if (!el || !win || !dots || !hero) return
    if (!window.matchMedia(FINE_POINTER).matches || !window.matchMedia(MOTION_OK).matches) return

    let cx = 0
    let cy = 0
    let x = 0
    let y = 0
    let seen = false
    let inside = false
    let visible = true
    let raf = 0

    const frame = () => {
      raf = 0
      const box = el.getBoundingClientRect()
      const hbox = hero.getBoundingClientRect()
      const px = cx - box.left
      const py = cy - box.top
      const over = visible && cy >= hbox.top && cy <= hbox.bottom
      if (over !== inside) {
        inside = over
        win.toggleAttribute('data-on', over)
      }
      if (!seen) {
        x = px
        y = py
        seen = true
      }
      // The window eases after the pointer.
      x += (px - x) * 0.18
      y += (py - y) * 0.18
      const wx = Math.round(x - SIZE / 2)
      const wy = Math.round(y - SIZE / 2)
      win.style.transform = `translate3d(${wx}px, ${wy}px, 0)`
      dots.style.transform = `translate3d(${-wx}px, ${-wy}px, 0)`
      dots.style.width = `${Math.ceil(box.width)}px`
      dots.style.height = `${Math.ceil(box.height)}px`
      const settled = Math.abs(px - x) < 0.4 && Math.abs(py - y) < 0.4
      if (visible && (!settled || over)) raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      cx = event.clientX
      cy = event.clientY
      wake()
    }
    const onLeave = () => {
      cy = -9999
      wake()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
    })
    observer.observe(hero)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={root} className={styles.fx} aria-hidden="true">
      <div className={styles.base} />
      <div ref={light} className={styles.window}>
        <div className={styles.glow} />
        <div ref={field} className={styles.field} />
      </div>
    </div>
  )
}
