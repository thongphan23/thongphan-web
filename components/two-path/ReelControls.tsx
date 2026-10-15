'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import styles from './TwoPath.module.css'

const pad = (value: number) => String(value).padStart(2, '0')

// Counter, progress bar and arrows for the reel. When the motion engine pins the reel on a wide
// screen it answers the arrows itself (an 'hscroll:step' event) and keeps the counter; everywhere
// else, reduced motion included, the reel is a swipe row and the arrows scroll it from here.
export default function ReelControls({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null)

  const parts = () => {
    const section = ref.current?.closest<HTMLElement>('[data-hscroll]')
    const track = section?.querySelector<HTMLElement>('[data-hscroll-track]')
    if (!section || !track) return null
    const items = Array.from(track.querySelectorAll<HTMLElement>('[data-hscroll-item]'))
    const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0
    // The photo whose left edge sits closest to the start of the row.
    const nearest = () =>
      items.reduce(
        (best, item, index) =>
          Math.abs(item.offsetLeft - inset - track.scrollLeft) <
          Math.abs(items[best].offsetLeft - inset - track.scrollLeft)
            ? index
            : best,
        0,
      )
    return { section, track, items, inset, nearest, pinned: section.dataset.hscrollActive === 'true' }
  }

  useEffect(() => {
    const found = parts()
    const controls = ref.current
    if (!found || !controls) return
    const { section, track, items, nearest } = found
    const counter = controls.querySelector<HTMLElement>('[data-hscroll-current]')
    const [prev, next] = Array.from(controls.querySelectorAll<HTMLButtonElement>('button'))
    const update = () => {
      if (section.dataset.hscrollActive === 'true') return
      const index = nearest()
      const room = track.scrollWidth - track.clientWidth
      if (counter) counter.textContent = pad(index + 1)
      section.style.setProperty('--hscroll-progress', room > 0 ? (track.scrollLeft / room).toFixed(4) : '0')
      prev.disabled = track.scrollLeft <= 2
      next.disabled = track.scrollLeft >= room - 2 || index === items.length - 1
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const step = (direction: number) => {
    const found = parts()
    if (!found) return
    const { section, track, items, inset, nearest, pinned } = found
    if (pinned) {
      section.dispatchEvent(new CustomEvent('hscroll:step', { detail: direction }))
      return
    }
    const target = items[Math.max(0, Math.min(items.length - 1, nearest() + direction))]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: target.offsetLeft - inset, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div ref={ref} className={styles.reelControls}>
      <p className={styles.reelCounter} aria-hidden="true">
        <span data-hscroll-current>01</span> / {pad(count)}
      </p>
      <span className={styles.reelProgress} aria-hidden="true">
        <span />
      </span>
      <button type="button" className={styles.reelButton} onClick={() => step(-1)} aria-label="Ảnh trước" data-hscroll-prev>
        <ArrowLeft aria-hidden="true" size={20} />
      </button>
      <button type="button" className={styles.reelButton} onClick={() => step(1)} aria-label="Ảnh tiếp theo" data-hscroll-next>
        <ArrowRight aria-hidden="true" size={20} />
      </button>
    </div>
  )
}
