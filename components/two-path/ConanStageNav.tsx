'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './ConanShowcase.module.css'

type ConanStageNavProps = {
  // The nav's accessible name, and each stage's (label), written by the page from its content.
  label: string
  stages: readonly { number: string; gloss: string; label: string }[]
}

// The wheel has gone quiet once this long has passed without an event: longer than the gaps inside
// one spin of a mouse wheel, short enough that the glide is over before the reader looks again.
const QUIET_MS = 160
// Lenis eases toward its target at lerp 0.085 a frame (engine.ts), which is a decay of 5.1 a second.
const DECAY = 0.085 * 60
// A gesture that moves the row less than this fraction of a stage does not count as a step.
const NUDGE = 0.12

// The five stages of the journey as a level path, after Brilliant's course path: the stages done
// are filled, the one in hand is lit and larger, the ones ahead are open rings, and any of them can
// be jumped to. While the section is pinned (horizontalScroll in engine.ts) a jump is an
// 'hscroll:step' by the distance from the current stage; elsewhere the card is scrolled into view.
export default function ConanStageNav({ label, stages }: ConanStageNavProps) {
  const ref = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>('[data-hscroll]')
    const track = section?.querySelector<HTMLElement>('[data-hscroll-track]')
    if (!section || !track) return
    const items = Array.from(track.querySelectorAll<HTMLElement>('[data-hscroll-item]'))
    // Pinned: the engine marks the current card.
    const marks = new MutationObserver(() => {
      const index = items.findIndex((item) => item.hasAttribute('data-current'))
      if (index >= 0) setCurrent(index)
    })
    items.forEach((item) => marks.observe(item, { attributes: true, attributeFilter: ['data-current'] }))
    // Swipe row: the card nearest the row's start is current.
    const onScroll = () => {
      if (section.dataset.hscrollActive === 'true') return
      const left = track.scrollLeft
      let best = 0
      items.forEach((item, index) => {
        if (Math.abs(item.offsetLeft - track.offsetLeft - left) < Math.abs(items[best].offsetLeft - track.offsetLeft - left)) best = index
      })
      setCurrent(best)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      marks.disconnect()
      track.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Wheel-end snap. The engine settles on the nearest stage only once the smooth scroll has come
  // to rest, a second or more after the wheel stops, so a reader who looks up sooner sees a card
  // cut by the window's edge. Here a wheel gesture that ends in the pinned stretch, or runs into it
  // from either side, glides on to a stage as soon as the wheel goes quiet: one stage on in the
  // gesture's direction, or as many as the gesture carried. The glide is the engine's own
  // ('hscroll:step'), so its settle and the reader's next gesture take over from it cleanly.
  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>('[data-hscroll]')
    const track = section?.querySelector<HTMLElement>('[data-hscroll-track]')
    const root = document.documentElement
    if (!section || !track || !root.classList.contains('motion')) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = Array.from(track.querySelectorAll<HTMLElement>('[data-hscroll-item]'))
    const pace = Number(section.dataset.hscrollPace ?? 1) || 1
    let timer = 0
    let lastWheel = 0
    // One gesture: where it began, the sum of its wheel deltas and so its direction.
    let burst: { from: number; sum: number; dir: number } | null = null
    let samples: { at: number; y: number }[] = []
    let snapped = { at: -Infinity, index: 0 }

    // The pinned stretch and each stage's resting point in it, as horizontalScroll measures them.
    const geometry = () => {
      const spacer = section.parentElement?.classList.contains('pin-spacer') ? section.parentElement : section
      const start = spacer.getBoundingClientRect().top + window.scrollY
      const room = track.scrollWidth - track.clientWidth
      const rests = items.map((item) => {
        const point = room > 0 ? (item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2) / room : 0
        return start + room * pace * Math.min(1, Math.max(0, point))
      })
      return { start, end: start + room * pace, rests }
    }
    // Where a scroll position falls among the resting points, as a fractional stage index; before
    // the first stage or past the last it runs on at the end stages' spacing (below 0, above last).
    const indexAt = (y: number, rests: number[]) => {
      const last = rests.length - 1
      const step = (i: number) => Math.max(1, rests[i] - rests[i - 1])
      if (last < 1) return 0
      if (y <= rests[0]) return (y - rests[0]) / step(1)
      for (let i = 1; i <= last; i += 1) {
        if (y <= rests[i]) return i - 1 + (y - rests[i - 1]) / step(i)
      }
      return last + (y - rests[last]) / step(last)
    }
    // Where the smooth scroll will come to rest: it decays toward its target at a known rate, so
    // two positions read after the last wheel event give the distance still to go.
    const destination = () => {
      const after = samples.filter((sample) => sample.at > lastWheel + 25)
      const y = window.scrollY
      if (after.length < 2) return y
      const a = after[0]
      const b = after[after.length - 1]
      const growth = Math.exp((DECAY * (b.at - a.at)) / 1000) - 1
      return growth > 0.01 ? b.y + (b.y - a.y) / growth : y
    }
    const fire = () => {
      timer = 0
      const gesture = burst
      burst = null
      if (!gesture || !gesture.dir || section.dataset.hscrollActive !== 'true') return
      const { start, end, rests } = geometry()
      const dest = destination()
      const f = indexAt(dest, rests)
      const last = items.length - 1
      const reach = window.innerHeight * 0.5
      let target = -1
      if (dest < start - reach || dest > end + reach) {
        // A long flick carries the reader well past the section: let it.
      } else if (gesture.from < start - 2) {
        // Running in from above: land on the first stages once the gesture brings the pin near.
        if (gesture.dir > 0) target = Math.max(0, Math.round(f))
      } else if (gesture.from > end + 2) {
        // Coming back from below: land on the stage the gesture reaches.
        if (gesture.dir < 0) target = Math.min(last, Math.round(f))
      } else {
        // Inside: never left between stages, and at least one stage on unless it was a mere nudge.
        const p0 = performance.now() - snapped.at < 1200 ? snapped.index : Math.round(indexAt(gesture.from, rests))
        const moved = f - p0
        if (gesture.dir > 0) target = moved < NUDGE ? p0 : Math.max(p0 + 1, Math.round(f))
        else target = moved > -NUDGE ? p0 : Math.min(p0 - 1, Math.round(f))
      }
      // Out past the first or the last stage the reader is leaving the section: let them.
      if (target < 0 || target > last) return
      const from = Math.max(0, items.findIndex((item) => item.hasAttribute('data-current')))
      snapped = { at: performance.now(), index: target }
      section.dispatchEvent(new CustomEvent('hscroll:step', { detail: target - from }))
    }
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return
      if (!burst) burst = { from: window.scrollY, sum: 0, dir: 0 }
      burst.sum += event.deltaY
      burst.dir = Math.sign(burst.sum)
      lastWheel = performance.now()
      samples = []
      window.clearTimeout(timer)
      timer = window.setTimeout(fire, QUIET_MS)
    }
    const onScroll = () => {
      if (!burst) return
      samples.push({ at: performance.now(), y: window.scrollY })
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const go = (target: number) => {
    const section = ref.current?.closest<HTMLElement>('[data-hscroll]')
    const items = Array.from(section?.querySelectorAll<HTMLElement>('[data-hscroll-item]') ?? [])
    if (!section || !items[target]) return
    if (section.dataset.hscrollActive === 'true') {
      const from = Math.max(0, items.findIndex((item) => item.hasAttribute('data-current')))
      section.dispatchEvent(new CustomEvent('hscroll:step', { detail: target - from }))
      return
    }
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    items[target].scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })
    setCurrent(target)
  }

  return (
    <nav ref={ref} className={styles.stageNav} aria-label={label}>
      <ol className={styles.stageNavList} style={{ '--nav-at': current / Math.max(1, stages.length - 1) } as CSSProperties}>
        {stages.map((stage, index) => (
          <li key={stage.number}>
            <button
              type="button"
              className={styles.stageNavNode}
              aria-current={index === current ? 'step' : undefined}
              aria-label={stage.label}
              data-done={index < current ? '' : undefined}
              data-cursor={stage.gloss}
              data-cursor-tone="lacquer"
              {...(index === 0
                ? { 'data-pen': 'arrow', 'data-pen-tone': 'ember', 'data-pen-to': 'li:last-child > button', 'data-pen-side': 'bottom,bottom' }
                : {})}
              onClick={() => go(index)}
            >
              {stage.number}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
