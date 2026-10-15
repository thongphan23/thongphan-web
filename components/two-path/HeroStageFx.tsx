'use client'

import { useEffect, useRef } from 'react'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const REDUCED = '(prefers-reduced-motion: reduce)'

// Pointer response for the first screen. It only writes two custom properties on the stage
// (--hx / --hy, both -1..1, eased); home.module.css turns them into the name sliding against the
// portrait, a few degrees of head-turn and a warm lamp that follows the pointer. The engine
// (signatures.ts) keeps owning transform on the depth layers, so nothing here touches it.
// - Fine pointer: the stage follows the mouse, and drifts on its own when the mouse rests or leaves.
// - Touch: the same slow drift, so the first screen is never a dead photograph.
// - Reduced motion: nothing runs; the stage stays at rest.
export default function HeroStageFx() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const stage = marker.current?.closest<HTMLElement>('[data-stage]')
    if (!stage || window.matchMedia(REDUCED).matches) return

    const fine = window.matchMedia(FINE_POINTER).matches
    const state = { x: 0, y: 0, tx: 0, ty: 0, lastMove: -1e9, visible: true, lastKey: '' }
    let frame = 0
    let start = 0

    const tick = (now: number) => {
      frame = 0
      if (!start) start = now
      const t = (now - start) / 1000
      // The pointer steers for as long as it is moving; a short rest hands control back to the drift.
      const steering = fine && now - state.lastMove < 2600
      if (!steering) {
        state.tx = Math.sin(t * 0.42) * 0.55
        state.ty = Math.cos(t * 0.33) * 0.38
      }
      state.x += (state.tx - state.x) * (steering ? 0.085 : 0.03)
      state.y += (state.ty - state.y) * (steering ? 0.085 : 0.03)

      const key = `${state.x.toFixed(3)} ${state.y.toFixed(3)}`
      if (key !== state.lastKey) {
        state.lastKey = key
        stage.style.setProperty('--hx', state.x.toFixed(3))
        stage.style.setProperty('--hy', state.y.toFixed(3))
        // Without a fine pointer the engine does not move the coloured pools; the drift does.
        if (!fine) {
          stage.style.setProperty('--mx', (0.5 + state.x * 0.28).toFixed(3))
          stage.style.setProperty('--my', (0.5 + state.y * 0.2).toFixed(3))
        }
      }
      if (state.visible) frame = requestAnimationFrame(tick)
    }

    const run = () => {
      if (!frame && state.visible && !document.hidden) frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = stage.getBoundingClientRect()
      state.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2))
      state.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2))
      state.lastMove = performance.now()
    }

    const observer = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting
      if (state.visible) run()
    })
    observer.observe(stage)

    const onVisibility = () => run()
    document.addEventListener('visibilitychange', onVisibility)
    if (fine) stage.addEventListener('pointermove', onMove, { passive: true })
    run()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stage.removeEventListener('pointermove', onMove)
      stage.style.removeProperty('--hx')
      stage.style.removeProperty('--hy')
    }
  }, [])

  return <span ref={marker} hidden />
}
