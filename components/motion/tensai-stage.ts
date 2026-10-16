// The Tensai hero sequence, on its own so the shared signature file carries none of it: only the
// /tensai page marks up [data-lesson-stage], and signatures.ts re-exports lessonStage for the engine.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { kanjiWriter } from './kanji-write'

type Cleanup = () => void

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

// Tensai stage ([data-lesson-stage]): the hero holds a real lesson card ([data-lesson-card]).
// - Wide screens pin the hero. A little way in, the card answers itself once as a demo (the
//   `lesson:demo` event on [data-lesson-root]; a visitor's own pick is never undone). The words and
//   天才 step back while the card moves to the centre; then a sheet of the band's green
//   ([data-lesson-portal]) settles over the whole card, matching its box and corners, and opens out to
//   fill the screen, and the band that follows ([data-lesson-next]) rises over it with its content,
//   so the card itself becomes the page. The opening and the brush strokes of 天才 run on a clock the
//   moment the scroll passes a threshold (and rewind below it), so a stop anywhere after that shows the
//   finished green screen; only the mark's rise and fade ([data-lesson-portal-rise]) follow the scrub.
// - Phones keep the card still and lay the band down like a sheet of paper (as curtains does).
export function lessonStage(root: HTMLElement): Cleanup {
  const stage = root.querySelector<HTMLElement>('[data-lesson-stage]')
  const card = stage?.querySelector<HTMLElement>('[data-lesson-card]')
  if (!stage || !card) return () => {}

  const lesson = card.querySelector<HTMLElement>('[data-lesson-root]')
  const words = stage.querySelector<HTMLElement>('[data-lesson-words]')
  const aside = stage.querySelector<HTMLElement>('[data-lesson-aside]')
  const portal = stage.querySelector<HTMLElement>('[data-lesson-portal]')
  const portalMark = portal?.querySelector<HTMLElement>('[data-lesson-portal-mark]')
  const glow = stage.querySelector<HTMLElement>('[data-lesson-glow]')
  const next = root.querySelector<HTMLElement>('[data-lesson-next]')
  const mm = gsap.matchMedia()

  mm.add('(min-width: 960px)', () => {
    // The stage sits just under the fixed header; pinning from where it rests starts the sequence with
    // the first scroll.
    const restTop = Math.max(0, stage.getBoundingClientRect().top + window.scrollY)
    const length = 1.25
    // Offsets from layout boxes, so they ignore this timeline's own transforms and read the same
    // whether or not the stage is pinned.
    const within = (el: HTMLElement, ancestor: HTMLElement) => {
      let left = 0
      let top = 0
      for (let node: HTMLElement | null = el; node && node !== ancestor; node = node.offsetParent as HTMLElement | null) {
        left += node.offsetLeft
        top += node.offsetTop
      }
      return { left, top }
    }
    // The visible width without a classic scrollbar: 100vw / innerWidth would run a scrollbar's width
    // past the page and leave a cream strip at the right edge of the green sheet.
    const viewW = () => document.documentElement.clientWidth
    const stageLeft = () => (viewW() - stage.offsetWidth) / 2
    const room = () => window.innerHeight - restTop
    const fit = () => Math.min(1.06, (room() - 48) / card.offsetHeight)
    const cardShift = () => {
      const at = within(card, stage)
      return {
        x: viewW() / 2 - (stageLeft() + at.left + card.offsetWidth / 2),
        y: room() / 2 - (at.top + card.offsetHeight / 2),
      }
    }
    // The card's own face (the lesson sheet) once the card has arrived (scaled about its centre), in
    // the portal's coordinates: the portal spans the whole viewport, from above the stage's top edge.
    const face = lesson ?? card
    const cardBox = () => {
      const scale = fit()
      const at = face === card ? { left: 0, top: 0 } : within(face, card)
      const left = viewW() / 2 - (card.offsetWidth * scale) / 2 + at.left * scale
      const top = restTop + room() / 2 - (card.offsetHeight * scale) / 2 + at.top * scale
      const radius = (Number.parseFloat(getComputedStyle(face).borderTopLeftRadius) || 16) * scale
      return { left, top, width: face.offsetWidth * scale, height: face.offsetHeight * scale, radius }
    }
    const portalSize = () => ({ width: portal?.offsetWidth ?? viewW(), height: portal?.offsetHeight ?? window.innerHeight })
    const opening = () => {
      const { left, top, width, height, radius } = cardBox()
      const size = portalSize()
      return `inset(${top}px ${size.width - left - width}px ${size.height - top - height}px ${left}px round ${radius}px)`
    }
    // Where the mark starts: centred on the card. The mark and the opening move on the same tween and
    // ease, and each edge of both boxes moves linearly between two nested states, so the mark stays
    // inside the opening the whole way instead of being cut by its edge.
    const markStart = () => {
      if (!portalMark) return { x: 0, y: 0, scale: 1 }
      const box = cardBox()
      const size = portalSize()
      return {
        x: box.left + box.width / 2 - size.width / 2,
        y: box.top + box.height / 2 - size.height / 2,
        scale: Math.min((box.width * 0.62) / portalMark.offsetWidth, (box.height * 0.5) / portalMark.offsetHeight),
      }
    }

    // The band's edge reaches the bottom of the screen at half the pinned scroll, while the sheet is
    // still opening, so its first line rises in just as the green fills the screen; when the pin ends
    // its edge stands at (1 - half the pin) of the screen's height, where the mark parks (see `rise`).
    // The sheet fills the whole screen, up over the band the header leaves when it hides on the way
    // down, so 天才 is written in the middle of a screen that is all green.
    const pull = 0.5
    const lift = () => {
      if (next) next.style.marginTop = `${Math.min(0, window.innerHeight - restTop - stage.offsetHeight - pull * length * window.innerHeight)}px`
      if (portal) {
        portal.style.top = `${-restTop}px`
        portal.style.left = `${-(viewW() - stage.offsetWidth) / 2}px`
        portal.style.width = `${viewW()}px`
        portal.style.height = `${window.innerHeight}px`
      }
    }
    lift()
    ScrollTrigger.addEventListener('refreshInit', lift)

    const glyph = portalMark?.querySelector<HTMLElement>('[data-kanji-write]')
    const writer = glyph ? kanjiWriter(glyph) : null
    writer?.draw(0)

    // The opening is one clock-driven gesture, not a scrubbed one: a stop anywhere past the threshold
    // shows the finished sheet with 天才 fully written, never a half-open clip or half a character.
    // Each tween names both ends, so a refresh while open can re-measure without losing its way back.
    const rise = portal?.querySelector<HTMLElement>('[data-lesson-portal-rise]') ?? null
    const open = portal ? gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } }) : null
    if (open && portal) {
      const full = 'inset(0px 0px 0px 0px round 0px)'
      // The sheet first floods the card in place, edge for edge and corner for corner, so the card
      // reads as turning green rather than being covered; then it opens out over the whole screen.
      open
        .fromTo(portal, { opacity: 0, clipPath: opening }, { opacity: 1, clipPath: opening, duration: 0.14, immediateRender: true }, 0)
        .fromTo(card, { opacity: 1 }, { opacity: 0, duration: 0.04 }, 0.12)
        .fromTo(portal, { clipPath: opening }, { clipPath: full, duration: 0.85, ease: 'power3.inOut' }, 0.16)
      if (portalMark) {
        // The mark starts on the card and settles in the middle on the same ease as the opening, so
        // it stays inside the clip the whole way instead of being cut by its edge.
        open
          .fromTo(
            portalMark,
            { x: () => markStart().x, y: () => markStart().y, scale: () => markStart().scale },
            { x: 0, y: 0, scale: 1, duration: 0.85, ease: 'power3.inOut' },
            0.16,
          )
          .fromTo(portalMark, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', immediateRender: true }, 0.16)
        // The brush writes 天才 stroke by stroke while the sheet opens and the mark grows.
        if (writer) {
          const hand = { progress: 0 }
          open.fromTo(
            hand,
            { progress: 0 },
            { progress: 1, duration: 0.78, ease: 'power1.out', onUpdate: () => writer.draw(hand.progress) },
            0.2,
          )
        }
      }
    }
    const reopen = () => open?.invalidate()
    ScrollTrigger.addEventListener('refreshInit', reopen)
    let opened = false
    const settle = (on: boolean) => {
      if (!open || opened === on) return
      opened = on
      if (on) open.timeScale(1).play()
      else open.timeScale(1.8).reverse()
    }

    let played = false
    const demo = (play: boolean) => {
      if (played === play) return
      played = play
      lesson?.dispatchEvent(new CustomEvent('lesson:demo', { detail: { play } }))
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: () => `top ${restTop}px`,
        end: () => `+=${length * window.innerHeight}`,
        pin: true,
        // This pin is created after the page's other triggers but sits above them. Naming a priority
        // makes ScrollTrigger sort every trigger by page position on refresh, so the ones below
        // measure with this pin's spacing in place instead of firing a whole pin-length early.
        refreshPriority: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > 0.06) demo(true)
          else if (self.progress < 0.03) demo(false)
          // The sheet opens on a clock, not on the scrub, with a little slack either side of the
          // threshold so a hand resting on it does not make it flutter.
          if (self.progress >= 0.36) settle(true)
          else if (self.progress < 0.32) settle(false)
        },
      },
    })
    if (words) timeline.to(words, { x: () => -window.innerWidth * 0.06, opacity: 0, duration: 0.18 }, 0.12)
    if (aside) timeline.to(aside, { x: () => window.innerWidth * 0.04, opacity: 0, duration: 0.18 }, 0.12)
    if (glow) timeline.to(glow, { opacity: 0, duration: 0.18 }, 0.12)
    // At rest the card stands a little back and turned towards the words, an object on the page
    // rather than a panel in a grid; it squares up to the reader as it comes forward to the middle.
    gsap.set(card, { transformPerspective: 1600, rotationY: -5, rotationX: 2, rotation: 0.4, scale: 0.97 })
    timeline.to(
      card,
      {
        x: () => cardShift().x,
        y: () => cardShift().y,
        scale: fit,
        rotationY: 0,
        rotationX: 0,
        rotation: 0,
        duration: 0.2,
        ease: 'power2.inOut',
      },
      0.12,
    )
    if (portal) {
      // The rest of the scrub carries the mark up and shrinks it to fit above the band's edge, over the
      // band arriving below it, so no stop shows an empty green field. It fades out over the last
      // stretch of the pin, so it is gone before the page scrolls on and carries it past the top of the
      // screen: no frame shows 天才 or its line cut by the edge. The opening itself is on `open`.
      if (rise) {
        const park = () => {
          const height = window.innerHeight
          const edge = height * (1 - pull * length)
          const gap = Math.max(24, height * 0.03)
          return { y: edge / 2 - height / 2, scale: Math.min(1, (edge - 2 * gap) / rise.offsetHeight) }
        }
        timeline.to(rise, { y: () => park().y, scale: () => park().scale, duration: 0.45 }, 0.55)
        timeline.to(rise, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0.8)
      }
    }
    timeline.to({}, { duration: 0.36 }, 0.64)

    // With a mouse, the lime bloom slides a few px away from the pointer (eased), like light cast
    // from where the hand is, a layer of depth behind the card's own tilt.
    let unfollow = () => {}
    if (glow && glow.parentElement && window.matchMedia(FINE_POINTER).matches) {
      const slot = glow.parentElement
      const toX = gsap.quickTo(glow, 'x', { duration: 1.2, ease: 'power3.out' })
      const toY = gsap.quickTo(glow, 'y', { duration: 1.2, ease: 'power3.out' })
      const follow = (event: PointerEvent) => {
        const box = slot.getBoundingClientRect()
        toX(gsap.utils.clamp(-12, 12, (box.left + box.width / 2 - event.clientX) * 0.03))
        toY(gsap.utils.clamp(-10, 10, (box.top + box.height / 2 - event.clientY) * 0.03))
      }
      const rest = () => {
        toX(0)
        toY(0)
      }
      stage.addEventListener('pointermove', follow, { passive: true })
      stage.addEventListener('pointerleave', rest)
      unfollow = () => {
        stage.removeEventListener('pointermove', follow)
        stage.removeEventListener('pointerleave', rest)
        gsap.set(glow, { clearProps: 'x,y' })
      }
    }

    return () => {
      unfollow()
      writer?.destroy()
      ScrollTrigger.removeEventListener('refreshInit', lift)
      ScrollTrigger.removeEventListener('refreshInit', reopen)
      if (next) next.style.marginTop = ''
      if (portal) {
        portal.style.top = ''
        portal.style.left = ''
        portal.style.width = ''
        portal.style.height = ''
      }
      demo(false)
    }
  })

  mm.add('(max-width: 959px)', () => {
    // On phones the green sheet is a band in the flow under the card (see the CSS), so the mark is
    // not cut by any opening: the brush writes it as the band rises into view, and its line follows.
    let writer: ReturnType<typeof kanjiWriter> = null
    if (portal) {
      const glyph = portalMark?.querySelector<HTMLElement>('[data-kanji-write]')
      writer = glyph ? kanjiWriter(glyph) : null
      const promise = portal.querySelector<HTMLElement>('[data-lesson-portal-promise]')
      if (writer) {
        const hand = { progress: 0 }
        writer.draw(0)
        gsap.fromTo(
          hand,
          { progress: 0 },
          {
            progress: 1,
            ease: 'none',
            onUpdate: () => writer?.draw(hand.progress),
            scrollTrigger: { trigger: portal, start: 'top 88%', end: 'top 38%', scrub: true },
          },
        )
      }
      if (promise) {
        gsap.fromTo(
          promise,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: { trigger: portal, start: 'top 55%', end: 'top 30%', scrub: true },
          },
        )
      }
    }
    if (next) {
      gsap.fromTo(
        next,
        { clipPath: 'inset(0% 6% 0% 6% round 28px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true },
        },
      )
    }
    return () => writer?.destroy()
  })

  // The lime marker under the key words of each situation sweeps in from the left (--hit, 0 to 1) once
  // the line's words have lit, on every width. Without motion the CSS leaves it fully drawn.
  mm.add('all', () => {
    root.querySelectorAll<HTMLElement>('[data-problem-hit]').forEach((hit) => {
      const line = hit.closest<HTMLElement>('[data-scrub-words]') ?? hit
      gsap.fromTo(
        hit,
        { '--hit': 0 },
        {
          '--hit': 1,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: line, start: 'top 74%', end: 'top 50%', scrub: true },
        },
      )
    })

    // Each situation's course path draws itself node by node, lessons and gates popping in along the
    // track as the card comes up. Transform and opacity only.
    root.querySelectorAll<HTMLElement>('[data-situation-map]').forEach((track) => {
      gsap.fromTo(
        track.children,
        { scale: 0.3, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: 'back.out(2)',
          stagger: 0.06,
          scrollTrigger: { trigger: track, start: 'top 92%', end: 'top 52%', scrub: 0.6 },
        },
      )
    })

    // The closing words ride the lime's leading edge as it comes up, then settle into place, so the
    // band never enters as an empty field of colour.
    const rise = root.querySelector<HTMLElement>('[data-closing-rise]')
    const band = rise?.closest<HTMLElement>('[data-curtain]')
    if (rise && band) {
      gsap.fromTo(
        rise,
        { y: () => -0.07 * window.innerHeight },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 25%', scrub: true, invalidateOnRefresh: true },
        },
      )
    }
  })

  return () => mm.revert()
}
