'use client'

import { useEffect, useRef } from 'react'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const REDUCED = '(prefers-reduced-motion: reduce)'

// Pointer response for the first screen. It only writes custom properties on the stage
// (--hx / --hy, both -1..1, eased; --hv, the pointer's sideways speed, -1..1, eased and decaying;
// --tx / --ty, the torch position in px; --tl, the torch level, 0..1, full while the pointer
// steers); home.module.css turns
// them into the name swinging against the portrait, his lean, the rim and lamp following the
// pointer, the grain on its own depth and a warm torch on the backdrop. The engine
// (signatures.ts) keeps owning transform on the depth layers, so nothing here touches it.
// - Fine pointer: the stage follows the mouse with a gain (a small move near the centre still
//   reads), drifts on its own when the mouse rests, and the global cursor grows over the stage.
//   Speed is its own channel: a sweep slides the two words apart like pages caught in the
//   draught, even when the pointer crosses the middle, where its position alone moves little.
// - Touch: the same slow drift, so the first screen is never a dead photograph.
// - Reduced motion: nothing runs; the stage stays at rest.
export default function HeroStageFx() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const stage = marker.current?.closest<HTMLElement>('[data-stage]')
    if (!stage || window.matchMedia(REDUCED).matches) return

    const fine = window.matchMedia(FINE_POINTER).matches
    const state = { x: 0, y: 0, tx: 0, ty: 0, v: 0, tv: 0, cx: -1, px: -1, py: 0, tpx: 0, tpy: 0, tl: 0, lastMove: -1e9, visible: true, lastKey: '' }
    let frame = 0
    let start = 0
    let cursor: HTMLElement | null = null

    const tick = (now: number) => {
      frame = 0
      if (!start) start = now
      const t = (now - start) / 1000
      const w = stage.clientWidth
      const h = stage.clientHeight
      // The pointer steers for as long as it is moving; a short rest hands control back to the drift.
      const steering = fine && now - state.lastMove < 2600
      if (!steering) {
        // A small drift, so the pointer's own pull is unmistakable next to it.
        state.tx = Math.sin(t * 0.42) * 0.12
        state.ty = Math.cos(t * 0.33) * 0.08
        // At rest the torch wanders slowly across the name, from one word to the other.
        state.tpx = w * (0.5 + Math.sin(t * 0.28) * 0.32)
        state.tpy = h * (0.27 + Math.cos(t * 0.21) * 0.05)
      }
      if (state.px < 0) {
        state.px = state.tpx
        state.py = state.tpy
      }
      state.x += (state.tx - state.x) * (steering ? 0.09 : 0.03)
      state.y += (state.ty - state.y) * (steering ? 0.09 : 0.03)
      state.px += (state.tpx - state.px) * (steering ? 0.16 : 0.03)
      state.py += (state.tpy - state.py) * (steering ? 0.16 : 0.03)
      // The speed impulse fades in under a second; the slide follows it softly.
      state.tv *= 0.95
      state.v += (state.tv - state.v) * 0.14
      // The torch fades up on load to a low glow and burns full while the pointer steers it.
      state.tl += ((steering ? 1 : 0.5) - state.tl) * 0.06

      const key = `${state.x.toFixed(3)} ${state.y.toFixed(3)} ${state.v.toFixed(3)} ${Math.round(state.px)} ${Math.round(state.py)} ${state.tl.toFixed(2)}`
      if (key !== state.lastKey) {
        state.lastKey = key
        stage.style.setProperty('--hx', state.x.toFixed(3))
        stage.style.setProperty('--hy', state.y.toFixed(3))
        stage.style.setProperty('--hv', state.v.toFixed(3))
        stage.style.setProperty('--tx', `${Math.round(state.px)}px`)
        stage.style.setProperty('--ty', `${Math.round(state.py)}px`)
        stage.style.setProperty('--tl', state.tl.toFixed(2))
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

    const zone = (on: boolean) => {
      cursor = cursor?.isConnected ? cursor : document.querySelector<HTMLElement>('.motion-cursor')
      if (!cursor) return
      if (on) cursor.dataset.zone = 'stage'
      else delete cursor.dataset.zone
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = stage.getBoundingClientRect()
      const gain = 2.4
      state.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2 * gain))
      state.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2 * gain))
      if (state.cx >= 0) state.tv = Math.max(-1, Math.min(1, state.tv + ((event.clientX - state.cx) / rect.width) * 12))
      state.cx = event.clientX
      state.tpx = event.clientX - rect.left
      state.tpy = event.clientY - rect.top
      state.lastMove = performance.now()
      zone(true)
    }
    const onLeave = () => {
      state.cx = -1
      zone(false)
    }

    const observer = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting
      if (state.visible) run()
      else zone(false)
    })
    observer.observe(stage)

    const onVisibility = () => run()
    document.addEventListener('visibilitychange', onVisibility)
    if (fine) {
      stage.addEventListener('pointermove', onMove, { passive: true })
      stage.addEventListener('pointerleave', onLeave)
    }
    stage.dataset.torch = ''
    run()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      zone(false)
      delete stage.dataset.torch
      ;['--hx', '--hy', '--hv', '--tx', '--ty', '--tl'].forEach((name) => stage.style.removeProperty(name))
    }
  }, [])

  return <span ref={marker} hidden />
}
