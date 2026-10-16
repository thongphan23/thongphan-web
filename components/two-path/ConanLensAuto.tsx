'use client'

import { useEffect, useRef } from 'react'

// The lens in the hero's ink sheet (app/conan/page.module.css, .heroMask) is steered by the mouse
// in maskFlight (signatures.ts), which writes --lens-x/-y/-on and --pan-x/-y on the hero. Left
// alone for two seconds, or on a wide screen with no mouse at all, the lens takes its own slow
// path across the word instead. The same properties are written one level down, on the media box
// ([data-lens-auto]), mixed with the hero's values by a weight that rises while the mouse rests
// and falls as soon as it moves, so the hand-off either way is a glide, not a jump.
const IDLE_MS = 2000
const START_S = 1.6
const OPEN = 0.88
const PROPS = ['--lens-x', '--lens-y', '--lens-on', '--pan-x', '--pan-y']
// Wide screens hang the word 16px below the top of the room (page.module.css, --word-y). Its
// letters, with their cream rim, reach 0.99 of the outline's height, which is 0.2991 of its width;
// a 12px gap is kept above the first line of the words below.
const WORD_TOP = 16
const WORD_GAP = 12
const WORD_DEPTH = 0.99 * 0.2991

export default function ConanLensAuto() {
  // The lens path in percent of the media box: centre and swing in x and y, kept to the word.
  const path = useRef({ cx: 50, ax: 37, cy: 47, ay: 15 })
  // Sizing, not motion, so it runs under reduced motion too: the word is made as wide as the room
  // above the headline allows (--mask-fit). Offsets rather than boxes, so the intro rise and the
  // scroll-out of the words never change the answer.
  useEffect(() => {
    const media = document.querySelector<HTMLElement>('[data-lens-auto]')
    const hero = media?.closest<HTMLElement>('[data-mask-flight]')
    const words = hero?.querySelector<HTMLElement>('[data-mask-out]')
    if (!media || !hero || !words) return
    const top = (el: HTMLElement) => {
      let y = 0
      for (let node: HTMLElement | null = el; node && node !== hero; node = node.offsetParent as HTMLElement | null) {
        y += node.offsetTop
      }
      return y
    }
    const fit = () => {
      const blocks = Array.from(words.children) as HTMLElement[]
      const floor = Math.min(...blocks.map(top))
      const room = floor - top(media) - WORD_TOP - WORD_GAP
      if (!Number.isFinite(room)) return
      const fitted = Math.max(0, room / WORD_DEPTH)
      media.style.setProperty('--mask-fit', `${fitted.toFixed(1)}px`)
      // The lens rides the top of the lowercase band (which spans 0.37 to 0.96 of the word's height), so
      // its soft edge fills the letters below it without opening under the headline.
      const width = media.offsetWidth
      const height = media.offsetHeight
      if (!width || !height) return
      const word = Math.min(window.innerWidth * 0.92, fitted, 1880)
      const tall = word * 0.2991
      const low = WORD_TOP + tall * 0.34
      const high = WORD_TOP + tall * 0.56
      // Swings never reach 0: the room's lean divides by them.
      path.current = {
        cx: 50,
        ax: Math.max(1, Math.min(37, (word / width) * 50 * 0.82)),
        cy: (((low + high) / 2) / height) * 100,
        ay: Math.max(1, (((high - low) / 2) / height) * 100),
      }
    }
    const sized = new ResizeObserver(fit)
    ;[hero, words, ...Array.from(words.children)].forEach((el) => sized.observe(el))
    fit()
    return () => {
      sized.disconnect()
      media.style.removeProperty('--mask-fit')
    }
  }, [])

  useEffect(() => {
    const media = document.querySelector<HTMLElement>('[data-lens-auto]')
    const hero = media?.closest<HTMLElement>('[data-mask-flight]')
    const root = document.documentElement
    if (!media || !hero || !root.classList.contains('motion')) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wide = matchMedia('(min-width: 900px)')
    const mouse = matchMedia('(hover: hover) and (pointer: fine)')
    const born = performance.now()
    let lastMove = -Infinity
    let weight = 0
    let then = 0
    let frame = 0
    let inView = true

    const theirs = (name: string, fallback: number) => {
      const value = parseFloat(hero.style.getPropertyValue(name))
      return Number.isFinite(value) ? value : fallback
    }
    const live = () => inView && wide.matches && document.visibilityState === 'visible'
    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(64, now - (then || now))
      then = now
      const t = (now - born) / 1000
      const resting = !mouse.matches || now - lastMove > IDLE_MS
      // Only while the word is up: once the reader scrolls, the sheet flies and the lens is the mouse's alone.
      const atTop = window.scrollY < window.innerHeight * 0.06
      const want = resting && atTop && t > START_S && root.classList.contains('motion') ? 1 : 0
      weight += (want - weight) * (1 - Math.pow(want ? 0.982 : 0.86, dt / 16.7))
      if (!want && weight < 0.004) {
        weight = 0
        PROPS.forEach((name) => media.style.removeProperty(name))
      } else {
        // A slow Lissajous figure over the lettering band: wide in x, shallow in y, never repeating
        // the same pass twice in a row.
        const { cx, ax, cy, ay } = path.current
        const x = cx + ax * Math.sin((t / 14) * Math.PI * 2 + 0.35)
        const y = cy + ay * Math.sin((t / 8.6) * Math.PI * 2 + 1.1)
        const mix = (from: number, to: number) => from + (to - from) * weight
        media.style.setProperty('--lens-x', mix(theirs('--lens-x', x), x).toFixed(2))
        media.style.setProperty('--lens-y', mix(theirs('--lens-y', y), y).toFixed(2))
        media.style.setProperty('--lens-on', mix(theirs('--lens-on', 0), OPEN).toFixed(3))
        // The room leans gently against the lens, as it does against the mouse.
        media.style.setProperty('--pan-x', mix(theirs('--pan-x', 0), ((x - cx) / ax) * 0.45).toFixed(3))
        media.style.setProperty('--pan-y', mix(theirs('--pan-y', 0), ((y - cy) / ay) * 0.3).toFixed(3))
      }
      if (live()) frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame || !live()) return
      then = 0
      frame = requestAnimationFrame(tick)
    }
    const moved = () => {
      lastMove = performance.now()
    }
    const seen = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      wake()
    })
    seen.observe(hero)
    hero.addEventListener('pointermove', moved, { passive: true })
    hero.addEventListener('pointerleave', moved)
    wide.addEventListener('change', wake)
    document.addEventListener('visibilitychange', wake)
    wake()
    return () => {
      cancelAnimationFrame(frame)
      seen.disconnect()
      hero.removeEventListener('pointermove', moved)
      hero.removeEventListener('pointerleave', moved)
      wide.removeEventListener('change', wake)
      document.removeEventListener('visibilitychange', wake)
      PROPS.forEach((name) => media.style.removeProperty(name))
    }
  }, [])
  // As the hero leaves, each block of its words fades out (--keep, 1 to 0) between the top of the
  // window's upper two fifths, or where the block rests if that is higher, and a sliver below the
  // window's top edge, so a stop mid-scroll never shows a headline dimmed and cut by that edge.
  // Motion only: without it the words stay as set.
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-mask-flight]')
    const words = hero?.querySelector<HTMLElement>('[data-mask-out]')
    if (!hero || !words || !document.documentElement.classList.contains('motion')) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const blocks = Array.from(words.children) as HTMLElement[]
    // The room's flight (--flight, 0 to 1 over the pinned stretch, 0.7 of a window as in maskFlight)
    // and exit (--exit, 0 to 1 as the hero's top then climbs a window out), for its scrubbed drift.
    const media = hero.querySelector<HTMLElement>('[data-lens-auto]')
    let frame = 0
    // Where a block's top sits in the window at the top of the page: its offset in the hero plus
    // the hero's place in the document (its pin spacer's, while ScrollTrigger pins it).
    const restTop = (block: HTMLElement) => {
      let y = 0
      for (let node: HTMLElement | null = block; node && node !== hero; node = node.offsetParent as HTMLElement | null) {
        y += node.offsetTop
      }
      const spacer = hero.parentElement?.classList.contains('pin-spacer') ? hero.parentElement : hero
      return y + spacer.getBoundingClientRect().top + window.scrollY
    }
    const update = () => {
      frame = 0
      const height = window.innerHeight
      const end = height * 0.06
      const spacer = hero.parentElement?.classList.contains('pin-spacer') ? hero.parentElement : hero
      const clamp01 = (value: number) => Math.min(1, Math.max(0, value)).toFixed(3)
      media?.style.setProperty('--flight', clamp01(-spacer.getBoundingClientRect().top / (height * 0.7)))
      media?.style.setProperty('--exit', clamp01(-hero.getBoundingClientRect().top / height))
      blocks.forEach((block) => {
        const start = Math.max(end + 40, Math.min(height * 0.4, restTop(block) - 1))
        const keep = (block.getBoundingClientRect().top - end) / (start - end)
        block.style.setProperty('--keep', Math.min(1, Math.max(0, keep)).toFixed(3))
      })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      blocks.forEach((block) => block.style.removeProperty('--keep'))
      media?.style.removeProperty('--exit')
      media?.style.removeProperty('--flight')
    }
  }, [])
  return null
}
