'use client'

import { useEffect } from 'react'

// Wide screens pass the reader from one spread to the next without two headlines ever on screen
// together. Each hand-off is keyed to where the incoming block stands in the window, so it holds
// at any scroll speed and any stop:
// - the hero's words ([data-mask-out]) are gone (--hand, 1 to 0) before the principle's headline
//   ([data-hand-in]) can enter the window;
// - the principle's statement ([data-hand-out]) fades and lifts away while the paper sheet of the
//   audiences ([data-hand-sheet]) rises over the pinned spread, before the sheet's edge reaches it;
// - the sheet's own content ([data-hand-arrive]) only rises in once the statement is gone.
// Motion only, and only where the hero and the principle pin (signatures.ts): elsewhere the page
// scrolls as a plain document and every block stays as set.
const HERO_WIDE = '(min-width: 900px)'
const SPREAD_WIDE = '(min-width: 1000px)'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export default function ConanHandoff() {
  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains('motion')) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const words = document.querySelector<HTMLElement>('[data-mask-out]')
    const next = document.querySelector<HTMLElement>('[data-hand-in]')
    const out = document.querySelector<HTMLElement>('[data-hand-out]')
    const sheet = document.querySelector<HTMLElement>('[data-hand-sheet]')
    const arrive = sheet?.querySelector<HTMLElement>('[data-hand-arrive]') ?? null
    const heroWide = matchMedia(HERO_WIDE)
    const spreadWide = matchMedia(SPREAD_WIDE)
    let frame = 0

    const set = (el: HTMLElement | null, name: string, value: number | null) => {
      if (!el) return
      if (value === null) el.style.removeProperty(name)
      else el.style.setProperty(name, value.toFixed(3))
    }
    const update = () => {
      frame = 0
      const height = window.innerHeight
      // The words hold through the pinned hero and are out while the principle's top is still
      // 60px under the window's foot; its headline stands below that top, so it is never in sight
      // with them.
      if (words && next && heroWide.matches) {
        const top = next.getBoundingClientRect().top
        set(words, '--hand', clamp01((top - height + 60) / (height * 0.14)))
      } else set(words, '--hand', null)
      // The statement leaves while the sheet's top climbs from 98% to 80% of the window; the
      // sheet's content arrives between 78% and 68%, after it, so a stop anywhere past that finds
      // the sheet whole.
      if (sheet && spreadWide.matches) {
        const edge = sheet.getBoundingClientRect().top / height
        set(out, '--hand', clamp01((edge - 0.8) / 0.18))
        set(arrive, '--arrive', clamp01((0.78 - edge) / 0.1))
      } else {
        set(out, '--hand', null)
        set(arrive, '--arrive', null)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // Pins add their spacers after first paint and move every block below them: measure again
    // whenever the document's height changes.
    const layout = new ResizeObserver(onScroll)
    layout.observe(document.body)
    heroWide.addEventListener('change', onScroll)
    spreadWide.addEventListener('change', onScroll)
    update()
    return () => {
      cancelAnimationFrame(frame)
      layout.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      heroWide.removeEventListener('change', onScroll)
      spreadWide.removeEventListener('change', onScroll)
      set(words, '--hand', null)
      set(out, '--hand', null)
      set(arrive, '--arrive', null)
    }
  }, [])
  return null
}
