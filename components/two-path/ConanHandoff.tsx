'use client'

import { useEffect } from 'react'

// Wide screens pass the reader from one spread to the next without two headlines ever crossing.
// Each hand-off is keyed to where the incoming block stands in the window, so it holds at any
// scroll speed and any stop:
// - the hero's words ([data-mask-out]) are gone (--hand, 1 to 0) while the principle's top climbs
//   from 82% to 66% of the window, and only then does the statement ([data-hand-in]) rise in
//   (--enter, 0 to 1, from 62% to 42%); the held room behind ([data-lens-auto]) fades (--cover)
//   only once the principle has covered most of it;
// - the statement ([data-hand-out]) stays whole while the paper sheet of the audiences
//   ([data-hand-sheet]) rises over the pinned spread, and leaves just before the sheet's edge
//   would touch its last line; the spread dims (--dim) only in the sheet's last stretch;
// - the sheet's own content ([data-hand-arrive]) rises in as the sheet passes 78% to 68%.
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
    const section = next?.closest<HTMLElement>('section') ?? null
    const media = document.querySelector<HTMLElement>('[data-lens-auto]')
    // The statement's foot in the window without its own lift, so the lift never feeds back.
    const footOf = (el: HTMLElement, base: HTMLElement) => {
      let y = el.offsetHeight
      for (let node: HTMLElement | null = el; node && node !== base; node = node.offsetParent as HTMLElement | null) {
        y += node.offsetTop
      }
      return base.getBoundingClientRect().top + y
    }
    const update = () => {
      frame = 0
      const height = window.innerHeight
      if (words && next && section && heroWide.matches) {
        const at = section.getBoundingClientRect().top / height
        set(words, '--hand', clamp01((at - 0.66) / 0.16))
        set(next, '--enter', clamp01((0.62 - at) / 0.2))
        set(media, '--cover', clamp01((at - 0.16) / 0.3))
      } else {
        set(words, '--hand', null)
        set(next, '--enter', null)
        set(media, '--cover', null)
      }
      if (sheet && out && section && spreadWide.matches) {
        const edge = sheet.getBoundingClientRect().top
        set(out, '--hand', clamp01((edge - footOf(out, section) - 8) / 40))
        set(section, '--dim', 0.3 + 0.7 * clamp01(edge / (height * 0.4)))
        set(arrive, '--arrive', clamp01((0.78 - edge / height) / 0.1))
      } else {
        set(out, '--hand', null)
        set(section, '--dim', null)
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
      set(next, '--enter', null)
      set(media, '--cover', null)
      set(out, '--hand', null)
      set(section, '--dim', null)
      set(arrive, '--arrive', null)
    }
  }, [])
  return null
}
