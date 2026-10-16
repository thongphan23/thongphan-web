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
//   so the card itself becomes the page. The opening runs on a clock the moment the scroll passes a
//   threshold (and rewinds below it), so no stop shows a half-open clip; the brush strokes of 天才, the
//   mark's slow growth and its rise above the band's edge ([data-lesson-portal-rise]) follow the scrub,
//   and the brush lifts just as the band's edge comes up, so the next frame is never an empty field.
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

    // The band's edge reaches the bottom of the screen at (1 - pull) of the pinned scroll, the moment
    // the brush lifts, so the first situation rises in as 天才 is finished; when the pin ends its edge
    // stands at (1 - pull * length - gain) of the screen's height, where the mark parks (see `rise`).
    // The sheet fills the whole screen, up over the band the header leaves when it hides on the way
    // down, so 天才 is written in the middle of a screen that is all green.
    const pull = 0.37
    // Over that last stretch the band also catches up by this much of the screen (see `catchUp` below),
    // so it is laid out that much higher.
    const gain = 0.29
    const lift = () => {
      if (next) next.style.marginTop = `${Math.min(0, window.innerHeight - restTop - stage.offsetHeight - (pull * length + gain) * window.innerHeight)}px`
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
          if (self.progress > 0.02) demo(true)
          else if (self.progress < 0.01) demo(false)
          // The sheet opens on a clock, not on the scrub, with a little slack either side of the
          // threshold so a hand resting on it does not make it flutter.
          if (self.progress >= 0.18) settle(true)
          else if (self.progress < 0.16) settle(false)
        },
        // Once the pin lets go the parked mark would ride up into the top edge with the page, so it
        // fades out as the band takes over, and comes back on the way up.
        onLeave: () => {
          if (rise) gsap.to(rise, { opacity: 0, duration: 0.3, ease: 'power1.out', overwrite: 'auto' })
        },
        onEnterBack: () => {
          if (rise) gsap.to(rise, { opacity: 1, duration: 0.3, ease: 'power1.out', overwrite: 'auto' })
        },
      },
    })
    if (words) timeline.to(words, { x: () => -window.innerWidth * 0.06, opacity: 0, duration: 0.12 }, 0.03)
    if (aside) timeline.to(aside, { x: () => window.innerWidth * 0.04, opacity: 0, duration: 0.12 }, 0.03)
    if (glow) timeline.to(glow, { opacity: 0, duration: 0.12 }, 0.03)
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
        duration: 0.12,
        ease: 'power2.inOut',
      },
      0.03,
    )
    // The brush writes 天才 stroke by stroke under the scroll, from just before the sheet opens to just
    // before the band's edge comes up (1 - pull), while the mark grows a little from its foot: the
    // writing is the scroll, so a slower hand writes slower and a stop shows the stroke in progress.
    // It ends whole a beat early, so the mark is finished when the first card starts to slide in.
    const write = { from: 0.16, to: 1 - pull - 0.06 }
    if (writer) {
      const hand = { progress: 0 }
      timeline.fromTo(
        hand,
        { progress: 0 },
        { progress: 1, duration: write.to - write.from, onUpdate: () => writer.draw(hand.progress) },
        write.from,
      )
    }
    if (glyph) {
      gsap.set(glyph, { transformOrigin: '50% 100%' })
      timeline.fromTo(glyph, { scale: 1 }, { scale: 1.12, duration: write.to - write.from }, write.from)
    }
    if (portal) {
      // The line under the mark is gone before the band's heading can reach it: one layer leaves fully
      // before the next one enters, never two headlines crossing mid-fade. Then the rest of the scrub
      // carries the mark up and shrinks it to fit above the band's edge, over the band arriving below
      // it, so no stop shows an empty green field; after the pin it scrolls on with the page. The
      // opening itself is on `open`.
      const promise = rise?.querySelector<HTMLElement>('[data-lesson-portal-promise]')
      if (promise) timeline.to(promise, { opacity: 0, y: -12, duration: 0.07, ease: 'power1.in' }, 0.6)
      if (rise && portalMark) {
        const park = () => {
          const height = window.innerHeight
          const edge = height * (1 - pull * length - gain)
          // At least 6.5% of the screen clear above the mark, so it never meets the top edge.
          const gap = Math.max(24, height * 0.065)
          // The mark's drawn box inside the rise, with the glyph at its grown size (it scales from its
          // foot, so only its top moves). Both share the portal as their offset parent.
          const grow = glyph ? glyph.offsetHeight * 0.12 : 0
          const top = portalMark.offsetTop - rise.offsetTop - grow
          const tall = portalMark.offsetHeight + grow
          const scale = Math.min(1, (edge - 2 * gap) / tall)
          const centre = top + tall / 2 - rise.offsetHeight / 2
          return { y: edge / 2 - height / 2 - centre * scale, scale }
        }
        timeline.to(rise, { y: () => park().y, scale: () => park().scale, duration: 0.31, ease: 'power1.inOut' }, 0.64)
      }
    }
    timeline.to({}, { duration: 0.36 }, 0.64)

    // The band rises faster than the scroll from the moment its edge comes up until the pin lets go:
    // it waits `gain` of the screen below its laid-out place (dropped there while still off screen),
    // then closes the gap on an ease-out, so it hands over to the plain scroll at the same speed and
    // the frame just after the pin shows the first situation whole rather than its top half. It runs
    // on its own trigger, refreshed after all the others, and reads 0 before it starts and once it
    // ends, so every trigger inside the band measures the band where it really is.
    const hero = timeline.scrollTrigger
    const span = pull * length + gain
    const catchUp =
      next && hero
        ? gsap
            .timeline({
              defaults: { ease: 'none', immediateRender: false },
              scrollTrigger: {
                start: () => hero.end - span * window.innerHeight,
                end: () => hero.end,
                scrub: true,
                refreshPriority: -1,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(next, { y: 0 }, { y: () => gain * window.innerHeight, duration: 0.001 }, 0)
            .fromTo(next, { y: () => gain * window.innerHeight }, { y: 0, duration: 1 - gain / span, ease: 'power1.out' }, gain / span)
        : null

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
      catchUp?.scrollTrigger?.kill()
      catchUp?.kill()
      if (next) gsap.set(next, { clearProps: 'transform' })
      writer?.destroy()
      if (rise) {
        gsap.killTweensOf(rise, 'opacity')
        gsap.set(rise, { clearProps: 'opacity' })
      }
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
            scrollTrigger: { trigger: portal, start: 'top bottom', end: 'top 50%', scrub: true },
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
    // The cards after the first play these as they land on the pile (situationPile), not on the scroll.
    const later = (el: HTMLElement) => Boolean(el.closest('[data-stack-card]:not(:first-child)'))
    const unpile = situationPile(root)
    root.querySelectorAll<HTMLElement>('[data-problem-hit]').forEach((hit) => {
      if (later(hit)) return
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
      if (later(track)) return
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

    // The method's lesson window plays each screen's script as that screen comes in (CSS, keyed on
    // [data-replay-in]); it only arms once the window is on screen, so the first screen's script is not
    // over before anyone sees it, and it replays on the way back. The window is sticky, so it stays
    // armed until the grid that holds it scrolls away, not its own resting box.
    const replay = root.querySelector<HTMLElement>('[data-replay]')
    if (replay) {
      ScrollTrigger.create({
        trigger: replay,
        start: 'top 85%',
        endTrigger: replay.closest<HTMLElement>('[data-swap]') ?? replay,
        end: 'bottom 15%',
        onToggle: (self) => replay.toggleAttribute('data-replay-in', self.isActive),
      })
    }
    return () => {
      unpile()
      replay?.removeAttribute('data-replay-in')
    }
  })

  return () => mm.revert()
}

// Situations pile ([data-situation-track] around [data-situation-stack], cards [data-stack-card]): the
// list holds in place while the track's empty end scrolls past, and at two points of that hold the
// next card takes the top of the pile. Each hand-over runs on a clock the moment the scroll passes its
// point (and rewinds below it, with a little slack), so no stop ever shows a card half on: until its
// hand-over a card is hidden (parked a little lower, opacity 0), then it rises onto the pile in one
// gesture while the cards under it step back (smaller, their paper tinted towards the Tensai lime, so
// the edges read as sheets of the brand's colours rather than as greyed-out ones) with their top edges
// in view.
// Its course map and the marker under its key words play as it lands, and the rail held beside the
// pile ([data-stack-rail]) lights its course. The pile is only built where it fits the screen whole
// (data-pile, see the CSS); elsewhere the cards stay in the flow and each later one comes in whole
// once its top is well up the screen. Either way no card shows as a sliver at the bottom edge.
function situationPile(root: HTMLElement): Cleanup {
  const track = root.querySelector<HTMLElement>('[data-situation-track]')
  const list = track?.querySelector<HTMLElement>('[data-situation-stack]')
  const cards = list ? Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-stack-card]')) : []
  if (!track || !list || cards.length < 2) return () => {}
  const rail = Array.from(root.querySelectorAll<HTMLElement>('[data-stack-rail] > li'))
  const wide = window.matchMedia('(min-width: 900px)')
  // Where each later card takes the top, as progress through the hold; the rest is the whole pile.
  const handOver = cards.slice(1).map((_, n) => 0.22 + n * 0.32)
  const slack = 0.03
  let piled = false
  let top = 0
  let current = -1

  const parts = (card: HTMLElement) => ({
    nodes: Array.from(card.querySelector('[data-situation-map]')?.children ?? []) as HTMLElement[],
    hits: Array.from(card.querySelectorAll<HTMLElement>('[data-problem-hit]')),
  })
  const land = (card: HTMLElement) => {
    const { nodes, hits } = parts(card)
    if (nodes.length) {
      gsap.fromTo(
        nodes,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.36, ease: 'back.out(2)', stagger: { amount: 0.22 }, delay: 0.1, overwrite: true },
      )
    }
    if (hits.length) gsap.fromTo(hits, { '--hit': 0 }, { '--hit': 1, duration: 0.45, ease: 'power1.inOut', delay: 0.15, overwrite: true })
  }
  // A card's map and marker before it lands (off) or once landed (on), set at once.
  const landed = (card: HTMLElement, on: boolean) => {
    const { nodes, hits } = parts(card)
    if (nodes.length) gsap.set(nodes, { scale: on ? 1 : 0.3, opacity: on ? 1 : 0, overwrite: true })
    if (hits.length) gsap.set(hits, { '--hit': on ? 1 : 0, overwrite: true })
  }
  const mark = (index: number) => rail.forEach((item, i) => item.toggleAttribute('data-current', i === index))
  const parkY = () => Math.min(window.innerHeight * 0.22, 220)
  // The card's own paper, and the same paper a step deeper in the pile, mixed towards the lime.
  const paper = getComputedStyle(cards[0]).backgroundColor
  const tint = gsap.utils.interpolate(paper, '#c3f331')

  // The pile: card `index` on top, the ones before it under it, the ones after it hidden.
  const go = (index: number, instant = false) => {
    if (index === current) return
    const before = current
    current = index
    cards.forEach((card, i) => {
      const depth = index - i
      const parked = depth < 0
      card.toggleAttribute('data-parked', parked)
      const props = parked
        ? { opacity: 0, y: parkY(), scale: 1, backgroundColor: paper }
        : { opacity: 1, y: 0, scale: 1 - 0.05 * depth, backgroundColor: tint(Math.min(1, 0.24 * depth)) }
      if (instant) {
        gsap.set(card, { ...props, overwrite: true })
        if (i > 0) landed(card, !parked)
        return
      }
      gsap.to(card, {
        ...props,
        duration: parked ? 0.3 : 0.55,
        ease: parked ? 'power2.in' : 'expo.out',
        overwrite: 'auto',
        onComplete: parked && i > 0 ? () => landed(card, false) : undefined,
      })
      if (i > 0 && !parked && i > before) land(card)
    })
    mark(index)
  }
  const step = (progress: number) => {
    let i = Math.max(0, current)
    while (i < handOver.length && progress >= handOver[i]) i += 1
    while (i > 0 && progress < handOver[i - 1] - slack) i -= 1
    return i
  }

  // Without the pile: a later card comes in whole once its top is 62% down the screen.
  const show = (card: HTMLElement, on: boolean, instant = false) => {
    card.toggleAttribute('data-parked', !on)
    const props = on ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }
    if (instant) {
      gsap.set(card, { ...props, overwrite: true })
      landed(card, on)
      return
    }
    gsap.to(card, { ...props, duration: on ? 0.55 : 0.3, ease: on ? 'expo.out' : 'power2.in', overwrite: 'auto' })
    if (on) land(card)
  }

  const hold = ScrollTrigger.create({
    trigger: track,
    start: () => `top ${top}px`,
    end: () => `+=${Math.max(1, track.offsetHeight - list.offsetHeight)}`,
    onUpdate: (self) => {
      if (piled) go(step(self.progress))
    },
  })
  const flows = cards.slice(1).map((card, n) =>
    ScrollTrigger.create({
      trigger: card,
      start: 'top 62%',
      end: 'max',
      onToggle: (self) => {
        if (piled) return
        show(card, self.isActive)
        mark(self.isActive ? n + 1 : n)
      },
    }),
  )

  // Measured with the cards in the flow, before the triggers: the pile is as tall as its tallest card
  // plus the steps above it. Wide screens hold it level with the held heading (16% down) or a little
  // higher when the screen is short; phones hold it in the middle of the screen.
  const layout = () => {
    track.removeAttribute('data-pile')
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const tall = Math.max(...cards.map((card, i) => card.offsetHeight + i * 1.6 * rem))
    const height = window.innerHeight
    top = wide.matches ? Math.min(height * 0.16, height - tall - 16) : (height - tall) / 2
    piled = top >= 12
    track.toggleAttribute('data-pile', piled)
    list.style.setProperty('--pile-top', `${Math.round(top)}px`)
  }
  // Puts every card where the scroll says, at once (after each refresh and on the way in). Read from
  // the scroll and the triggers' measured ends, not their callbacks, which have not run yet here.
  const sync = () => {
    const y = hold.scroll()
    current = -1
    if (piled) {
      go(step(gsap.utils.clamp(0, 1, (y - hold.start) / Math.max(1, hold.end - hold.start))), true)
      return
    }
    gsap.set(cards, { clearProps: 'transform,backgroundColor' })
    let index = 0
    flows.forEach((flow, n) => {
      const on = y >= flow.start
      show(cards[n + 1], on, true)
      if (on) index = n + 1
    })
    cards[0].removeAttribute('data-parked')
    mark(index)
  }
  layout()
  hold.refresh()
  flows.forEach((flow) => flow.refresh())
  sync()
  ScrollTrigger.addEventListener('refreshInit', layout)
  ScrollTrigger.addEventListener('refresh', sync)

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', layout)
    ScrollTrigger.removeEventListener('refresh', sync)
    hold.kill()
    flows.forEach((flow) => flow.kill())
    cards.forEach((card) => {
      const { nodes, hits } = parts(card)
      gsap.killTweensOf([card, ...nodes, ...hits])
      gsap.set(card, { clearProps: 'opacity,transform,backgroundColor' })
      if (nodes.length) gsap.set(nodes, { clearProps: 'opacity,transform' })
      if (hits.length) gsap.set(hits, { clearProps: '--hit' })
      card.removeAttribute('data-parked')
    })
    rail.forEach((item) => item.removeAttribute('data-current'))
    track.removeAttribute('data-pile')
    list.style.removeProperty('--pile-top')
  }
}
