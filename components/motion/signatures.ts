// Signature interactions: one per showcase page, each built on markup hooks in that page.
// Called from mountMotion inside its gsap.context, so tweens and ScrollTriggers created here
// are reverted with the page; listeners and ticker callbacks are removed by the returned cleanup.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { kanjiWriter } from './kanji-write'

type Cleanup = () => void

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const WIDE = '(min-width: 900px)'

// Home stage ([data-stage]): Thông stands in front of his name.
// - Scrolling away parts the name around him and lets him sink into the floor.
// - With a mouse, the layers ([data-stage-depth]) drift against each other and the pointer
//   steers the light: --mx/--my feed the coloured pools and the rim light in home.module.css.
export function stageHero(root: HTMLElement): Cleanup {
  const stage = root.querySelector<HTMLElement>('[data-stage]')
  if (!stage) return () => {}

  const left = stage.querySelector('[data-stage-part="left"]')
  const right = stage.querySelector('[data-stage-part="right"]')
  const person = stage.querySelector('[data-stage-person]')

  const scroll = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: true },
  })
  if (left) scroll.to(left, { xPercent: -32, opacity: 0.1 }, 0)
  if (right) scroll.to(right, { xPercent: 32, opacity: 0.1 }, 0)
  if (person) scroll.to(person, { scale: 0.9, yPercent: 7 }, 0)

  if (!window.matchMedia(FINE_POINTER).matches) return () => {}

  const state = { mx: 0.5, my: 0.5 }
  const toX = gsap.quickTo(state, 'mx', { duration: 1.1, ease: 'power3.out' })
  const toY = gsap.quickTo(state, 'my', { duration: 1.1, ease: 'power3.out' })
  const layers = Array.from(stage.querySelectorAll<HTMLElement>('[data-stage-depth]')).map((el) => ({
    depth: Number(el.dataset.stageDepth) || 0,
    x: gsap.quickSetter(el, 'x', 'px') as (value: number) => void,
    y: gsap.quickSetter(el, 'y', 'px') as (value: number) => void,
  }))

  // Writes once per frame and only when the eased pointer has actually moved.
  let last = ''
  const write = () => {
    const key = `${state.mx.toFixed(4)} ${state.my.toFixed(4)}`
    if (key === last) return
    last = key
    stage.style.setProperty('--mx', state.mx.toFixed(4))
    stage.style.setProperty('--my', state.my.toFixed(4))
    for (const layer of layers) {
      layer.x((state.mx - 0.5) * layer.depth * 40)
      layer.y((state.my - 0.5) * layer.depth * 16)
    }
  }

  const onMove = (event: PointerEvent) => {
    const rect = stage.getBoundingClientRect()
    toX(gsap.utils.clamp(0, 1, (event.clientX - rect.left) / rect.width))
    toY(gsap.utils.clamp(0, 1, (event.clientY - rect.top) / rect.height))
  }
  const onLeave = () => {
    toX(0.5)
    toY(0.5)
  }

  gsap.ticker.add(write)
  stage.addEventListener('pointermove', onMove, { passive: true })
  stage.addEventListener('pointerleave', onLeave)

  return () => {
    gsap.ticker.remove(write)
    stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('pointerleave', onLeave)
    stage.style.removeProperty('--mx')
    stage.style.removeProperty('--my')
  }
}

// Mask flight ([data-mask-flight], Conan): the room is first seen through the letters of "Conan"
// cut out of an ink sheet ([data-mask-sheet]).
// - On wide screens the sheet holds still until the reader scrolls: the hero pins, the scroll flies
//   the camera into the letters (the sheet's CSS transform-origin) while the ink thins away, and
//   the whole photo rests a moment before the pin lets go.
// - Narrower screens keep the load flight in page.module.css.
// - Everywhere, the words ([data-mask-out]) drift up and dim as the hero leaves.
export function maskFlight(root: HTMLElement): Cleanup {
  const hero = root.querySelector<HTMLElement>('[data-mask-flight]')
  if (!hero) return () => {}
  const sheet = hero.querySelector<HTMLElement>('[data-mask-sheet]')
  const outline = hero.querySelector<HTMLElement>('[data-mask-outline]')
  const shade = hero.querySelector<HTMLElement>('[data-mask-shade]')
  const sheen = hero.querySelector<HTMLElement>('[data-mask-sheen]')
  const words = hero.querySelector<HTMLElement>('[data-mask-out]')
  const leave = (start: () => number) => {
    if (!words) return
    gsap.to(words, {
      y: () => -window.innerHeight * 0.11,
      opacity: 0.12,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start,
        end: () => start() + hero.offsetHeight,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
  }

  const mm = gsap.matchMedia()
  mm.add(WIDE, () => {
    if (!sheet) return
    const flight = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: () => `+=${window.innerHeight * 0.85}`,
        pin: true,
        // The first pin on the page: refreshed before the triggers below so they measure with its spacing.
        refreshPriority: 1,
        scrub: 0.5,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    })
    const flying = outline ? [sheet, outline] : [sheet]
    flight
      .fromTo(flying, { scale: 1 }, { scale: 24, duration: 0.7, ease: 'power2.in' }, 0)
      .fromTo(flying, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.32, ease: 'power1.inOut' }, 0.3)
      .to({}, { duration: 0.3 }, 0.7)
    // While the ink sheet covers everything but the letters, the words below sit on ink, so the
    // shade can wait: the room inside the letters shows at full light, and darkens as the sheet goes.
    if (shade) flight.fromTo(shade, { opacity: 0.2 }, { opacity: 1, duration: 0.4, ease: 'power1.inOut' }, 0.15)
    if (sheen) flight.fromTo(sheen, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, 0.1)
    leave(() => flight.scrollTrigger?.end ?? 0)
  })
  // With a mouse, the room behind the letters drifts against the pointer (--pan-x/--pan-y in -1..1,
  // read by the photo's translate in page.module.css), so the word reads as a window, not a print.
  mm.add(`${WIDE} and ${FINE_POINTER}`, () => {
    const panX = gsap.quickTo(hero, '--pan-x', { duration: 1.1, ease: 'power3' })
    const panY = gsap.quickTo(hero, '--pan-y', { duration: 1.1, ease: 'power3' })
    const move = (event: PointerEvent) => {
      const box = hero.getBoundingClientRect()
      panX(((event.clientX - box.left) / box.width) * 2 - 1)
      panY(((event.clientY - box.top) / box.height) * 2 - 1)
    }
    const rest = () => {
      panX(0)
      panY(0)
    }
    hero.addEventListener('pointermove', move)
    hero.addEventListener('pointerleave', rest)
    return () => {
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerleave', rest)
      gsap.set(hero, { '--pan-x': 0, '--pan-y': 0 })
    }
  })
  mm.add(`not all and ${WIDE}`, () => leave(() => 0))
  return () => mm.revert()
}

// Curtains ([data-curtain]): a section that follows another tone arrives through a shaped window
// that opens fully as its top reaches the upper third. The value picks the window:
// - "" (default) and "sheet": an inset rounded card widening to the full bleed, like a sheet of
//   paper being laid down. "sheet" goes further on wide screens: the section before it holds its
//   last screen still and dims while the sheet slides up over it, so the page turns instead of
//   cutting from one tone to the next.
// - "iris": a disc rising from the middle of the top edge and widening until it fills the screen.
// - "wipe": the new tone sweeps in from the left edge.
// [data-sheet-over] on a section lays it over a held element of the one before it
// ([data-sheet-under], e.g. a sticky line), which steps back and is gone before the sheet's
// content arrives, so the two never show as a double exposure.
export function curtains(root: HTMLElement): Cleanup {
  const mm = gsap.matchMedia()
  const drawn: HTMLElement[] = []
  const entry = { start: 'top bottom', end: 'top 30%', scrub: true } as const
  for (const el of root.querySelectorAll<HTMLElement>('[data-curtain]')) {
    const shape = el.dataset.curtain
    if (shape === 'iris') {
      // Measured in pixels against the part of the section on screen, so the disc reaches the
      // corners exactly as the window ends; then the clip comes off entirely.
      const draw = (progress: number) => {
        if (progress >= 1) {
          el.style.removeProperty('clip-path')
          return
        }
        const reach = Math.hypot(el.offsetWidth / 2, window.innerHeight * 0.7)
        el.style.clipPath = `circle(${(progress * reach).toFixed(1)}px at 50% 0%)`
      }
      drawn.push(el)
      ScrollTrigger.create({
        trigger: el,
        start: entry.start,
        end: entry.end,
        onUpdate: (self) => draw(self.progress),
        onRefresh: (self) => draw(self.progress),
      })
    } else {
      const from = shape === 'wipe' ? 'inset(0% 100% 0% 0% round 0px)' : 'inset(0% 6% 0% 6% round 28px)'
      gsap.fromTo(
        el,
        { clipPath: from },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: el, ...entry } },
      )
    }
    const under = shape === 'sheet' ? el.previousElementSibling : null
    if (!(under instanceof HTMLElement)) continue
    mm.add(WIDE, () => {
      // A section taller than the screen holds only its last screen, so it is never frozen
      // half-read.
      const hold = () => (under.offsetHeight > window.innerHeight + 1 ? 'bottom bottom' : 'top top')
      ScrollTrigger.create({ trigger: under, start: hold, end: 'bottom top', pin: true, pinSpacing: false })
      gsap.fromTo(
        under,
        { opacity: 1 },
        { opacity: 0.28, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true } },
      )
    })
  }
  for (const el of root.querySelectorAll<HTMLElement>('[data-sheet-over]')) {
    const under = el.previousElementSibling?.querySelector<HTMLElement>('[data-sheet-under]')
    if (!under) continue
    gsap.fromTo(
      under,
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: 0.92, ease: 'power1.in', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: true } },
    )
  }
  return () => {
    mm.revert()
    drawn.forEach((el) => el.style.removeProperty('clip-path'))
  }
}

// Tensai stage ([data-lesson-stage]): the hero holds a real lesson card ([data-lesson-card]).
// - Wide screens pin the hero. A little way in, the card answers itself once as a demo (the
//   `lesson:demo` event on [data-lesson-root]; a visitor's own pick is never undone). The words and
//   天才 step back while the card moves to the centre; then a sheet of the band's green
//   ([data-lesson-portal]) settles over the whole card, matching its box and corners, and opens out to
//   fill the screen, and the band that follows ([data-lesson-next]) rises over it with its content,
//   so the card itself becomes the page.
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
    const stageLeft = () => (window.innerWidth - stage.offsetWidth) / 2
    const room = () => window.innerHeight - restTop
    const fit = () => Math.min(1.06, (room() - 48) / card.offsetHeight)
    const cardShift = () => {
      const at = within(card, stage)
      return {
        x: window.innerWidth / 2 - (stageLeft() + at.left + card.offsetWidth / 2),
        y: room() / 2 - (at.top + card.offsetHeight / 2),
      }
    }
    // The card's own face (the lesson sheet) once the card has arrived (scaled about its centre), in
    // the portal's coordinates: the portal spans the whole viewport, from above the stage's top edge.
    const face = lesson ?? card
    const cardBox = () => {
      const scale = fit()
      const at = face === card ? { left: 0, top: 0 } : within(face, card)
      const left = window.innerWidth / 2 - (card.offsetWidth * scale) / 2 + at.left * scale
      const top = restTop + room() / 2 - (card.offsetHeight * scale) / 2 + at.top * scale
      const radius = (Number.parseFloat(getComputedStyle(face).borderTopLeftRadius) || 16) * scale
      return { left, top, width: face.offsetWidth * scale, height: face.offsetHeight * scale, radius }
    }
    const portalSize = () => ({ width: portal?.offsetWidth ?? window.innerWidth, height: portal?.offsetHeight ?? window.innerHeight })
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

    // The band's edge reaches the bottom of the screen at 56% of the pinned scroll, while the sheet is
    // still opening, so its first line rises in just as the green fills the screen.
    // The sheet fills the whole screen, up over the band the header leaves when it hides on the way
    // down, so 天才 is written in the middle of a screen that is all green.
    const lift = () => {
      if (next) next.style.marginTop = `${Math.min(0, window.innerHeight - restTop - stage.offsetHeight - 0.44 * length * window.innerHeight)}px`
      if (portal) {
        portal.style.top = `${-restTop}px`
        portal.style.height = `${window.innerHeight}px`
      }
    }
    lift()
    ScrollTrigger.addEventListener('refreshInit', lift)

    const glyph = portalMark?.querySelector<HTMLElement>('[data-kanji-write]')
    const writer = glyph ? kanjiWriter(glyph) : null
    writer?.draw(0)

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
        },
      },
    })
    if (words) timeline.to(words, { x: () => -window.innerWidth * 0.06, opacity: 0, duration: 0.18 }, 0.12)
    if (aside) timeline.to(aside, { x: () => window.innerWidth * 0.04, opacity: 0, duration: 0.18 }, 0.12)
    if (glow) timeline.to(glow, { opacity: 0, duration: 0.18 }, 0.12)
    // At rest the card stands a little back and turned towards the words, an object on the page
    // rather than a panel in a grid; it squares up to the reader as it comes forward to the middle.
    gsap.set(card, { transformPerspective: 1600, rotationY: -8, rotationX: 3, rotation: 0.6, scale: 0.94 })
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
      // The sheet first floods the card in place, edge for edge and corner for corner, so the card
      // reads as turning green rather than being covered; then it opens out.
      timeline
        .fromTo(portal, { opacity: 0, clipPath: opening }, { opacity: 1, clipPath: opening, duration: 0.06 }, 0.36)
        .to(portal, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.18, ease: 'power2.inOut' }, 0.42)
      // Under the flooded sheet the card goes, so nothing of it shows once the sheet opens.
      timeline.to(card, { opacity: 0, duration: 0.04 }, 0.41)
      // 天才 opens with the sheet, then rises at the band's own pace (`length` screens per unit of
      // progress), keeping a fixed gap above its edge. It stays at full strength until the band's
      // first lines are in, then blurs out fast, so it never reads as a dull ghost on the green.
      if (portalMark) {
        timeline
          .fromTo(
            portalMark,
            { x: () => markStart().x, y: () => markStart().y, scale: () => markStart().scale },
            { x: 0, y: 0, scale: 1, duration: 0.18, ease: 'power2.inOut' },
            0.42,
          )
          // The mark lights at full strength early, so a stop mid-opening shows lime, not a grey ghost.
          .fromTo(portalMark, { opacity: 0 }, { opacity: 1, duration: 0.03, ease: 'power1.out' }, 0.42)
          .to(portalMark, { y: () => -0.4 * length * window.innerHeight, duration: 0.4 }, 0.6)
          // Then it dissolves out of focus in one quick breath, so no frame shows a half-cut glyph.
          .fromTo(
            portalMark,
            { opacity: 1, filter: 'blur(0px)', scale: 1 },
            { opacity: 0, filter: 'blur(18px)', scale: 0.94, duration: 0.07, ease: 'power2.in', immediateRender: false },
            0.76,
          )
        // The brush writes 天才 stroke by stroke while the sheet opens and the mark grows.
        if (writer) {
          const hand = { progress: 0 }
          timeline.fromTo(
            hand,
            { progress: 0 },
            { progress: 1, duration: 0.24, onUpdate: () => writer.draw(hand.progress) },
            0.42,
          )
        }
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
      if (next) next.style.marginTop = ''
      if (portal) {
        portal.style.top = ''
        portal.style.height = ''
      }
      demo(false)
    }
  })

  mm.add('(max-width: 959px)', () => {
    if (!next) return
    gsap.fromTo(
      next,
      { clipPath: 'inset(0% 6% 0% 6% round 28px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true },
      },
    )
  })

  return () => mm.revert()
}

// Chapter rail ([data-chapters]): a reading-progress pill for the about page's five acts.
// - Each act ([data-chapter]) that crosses the reading line becomes the rail's --active row, so
//   the number and title roll to it, and its link ([data-chapter-link]) gets aria-current.
// - Each link's --progress tracks how far its act has been read.
// - Each act's numeral ([data-chapter-numeral]) fills with lacquer (--fill) as the act arrives.
// - The rail shows only while the acts fill the screen (data-visible).
// - On wide screens, where each act's header ([data-chapter-head]) and evidence
//   ([data-chapter-assets]) are held mid-screen, they fade and lift only in the act's last stretch,
//   so an act is never left half-faded while it is still being read.
// - An act that ends on a held line ([data-scrub-stage]) hands over to it as a scene: the act's
//   columns stay at full strength until the stage is halfway up the screen, fade out quickly, and
//   only then does the line fade up.
export function chapterRail(root: HTMLElement): Cleanup {
  const container = root.querySelector<HTMLElement>('[data-chapters]')
  const rail = container?.querySelector<HTMLElement>('[data-chapter-rail]')
  if (!container || !rail) return () => {}
  const chapters = Array.from(container.querySelectorAll<HTMLElement>('[data-chapter]'))
  const links = Array.from(rail.querySelectorAll<HTMLElement>('[data-chapter-link]'))

  const activate = (index: number) => {
    rail.style.setProperty('--active', String(index))
    links.forEach((link, linkIndex) => {
      if (linkIndex === index) link.setAttribute('aria-current', 'step')
      else link.removeAttribute('aria-current')
    })
  }

  chapters.forEach((chapter, index) => {
    const link = links[index]
    const setProgress = (progress: number) => link?.style.setProperty('--progress', progress.toFixed(3))
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) activate(index)
      },
      onUpdate: (self) => setProgress(self.progress),
      onLeave: () => setProgress(1),
      onLeaveBack: () => setProgress(0),
      onRefresh: (self) => setProgress(self.progress),
    })

    const numeral = chapter.querySelector<HTMLElement>('[data-chapter-numeral]')
    if (numeral) {
      gsap.fromTo(
        numeral,
        { '--fill': 0 },
        {
          '--fill': 1,
          ease: 'none',
          scrollTrigger: { trigger: chapter, start: 'top 70%', end: 'center 40%', scrub: true },
        },
      )
    }
  })

  ScrollTrigger.create({
    trigger: container,
    start: 'top 60%',
    end: 'bottom bottom',
    onToggle: (self) => {
      if (self.isActive) rail.dataset.visible = ''
      else delete rail.dataset.visible
    },
  })

  chapters.forEach((chapter) => {
    const stage = chapter.querySelector<HTMLElement>('[data-scrub-stage]')
    const columns = chapter.querySelector<HTMLElement>('[data-origin-act]')
    const line = stage?.querySelector<HTMLElement>('[data-sheet-under] > *')
    if (!stage || !columns || !line) return
    gsap.fromTo(
      columns,
      { opacity: 1 },
      { opacity: 0, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 48%', end: 'top 22%', scrub: true } },
    )
    gsap.fromTo(
      line,
      { opacity: 0, y: 56 },
      { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 30%', end: 'top -4%', scrub: true } },
    )
  })

  const mm = gsap.matchMedia()
  mm.add(WIDE, () => {
    chapters.forEach((chapter) => {
      const held = chapter.querySelectorAll<HTMLElement>('[data-chapter-head], [data-chapter-assets]')
      if (!held.length) return
      gsap.fromTo(
        held,
        { autoAlpha: 1, y: 0 },
        {
          autoAlpha: 0,
          y: -48,
          ease: 'power1.in',
          scrollTrigger: { trigger: chapter, start: 'bottom 62%', end: 'bottom 38%', scrub: true },
        },
      )
    })
  })

  return () => {
    mm.revert()
    delete rail.dataset.visible
    rail.style.removeProperty('--active')
    links.forEach((link) => {
      link.removeAttribute('aria-current')
      link.style.removeProperty('--progress')
    })
  }
}

// Light table ([data-light-table], Conan): class photos ([data-light-item]) laid one over another.
// - Wide screens set data-light-active (CSS stacks the photos in one frame) and pin the table.
//   The pin is split into one stretch of scroll per photo. Crossing into the next stretch plays a
//   short, timed cut: the new photo slides up over the last inside its clip ([data-light-clip])
//   and settles from a slight zoom ([data-light-media]), while the one beneath drifts up and dims
//   ([data-light-shade]). Scrolling back plays it in reverse. Because the cut runs on time, not
//   on the scrollbar, the table can never come to rest on half of one photo over another.
// - The photo in view gets data-current (earlier ones data-past), which swaps the caption; the
//   table's --light-index rolls the counter and --light-progress fills the contact sheet's rule.
// - A thumbnail ([data-light-thumb]) glides the page to the middle of its photo's stretch.
// - Phones and narrow screens keep the plain sequence of photos.
export function lightTable(root: HTMLElement, glide: ((y: number, duration: number) => void) | null): Cleanup {
  const table = root.querySelector<HTMLElement>('[data-light-table]')
  if (!table) return () => {}
  const items = Array.from(table.querySelectorAll<HTMLElement>('[data-light-item]'))
  if (items.length < 2) return () => {}
  const pick = (selector: string) => items.map((item) => item.querySelector<HTMLElement>(selector))
  const clips = pick('[data-light-clip]')
  const media = pick('[data-light-media]')
  const shades = pick('[data-light-shade]')
  const thumbs = Array.from(table.querySelectorAll<HTMLElement>('[data-light-thumb]'))

  const count = items.length
  // The middle of photo i's stretch of the pin.
  const rest = (index: number) => (index + 0.5) / count
  const SHOWN = 'inset(0% 0% 0% 0%)'
  const HIDDEN = 'inset(100% 0% 0% 0%)'
  const CUT = { duration: 0.95, ease: 'power3.inOut', overwrite: 'auto' as const }

  const mm = gsap.matchMedia()
  mm.add(WIDE, () => {
    // Set before the trigger measures, so the pin and its spacing are taken from the stacked table.
    table.dataset.lightActive = 'true'
    clips.forEach((clip, index) => clip && gsap.set(clip, { clipPath: index === 0 ? SHOWN : HIDDEN }))

    let current = -1
    // Lay the stack out for photo `index`: everything up to it uncovered, the ones beneath it
    // drifted and dimmed, the ones after it waiting below the frame. `animate` false jumps there.
    const show = (index: number, animate: boolean) => {
      const from = current
      current = index
      table.style.setProperty('--light-index', String(index))
      items.forEach((item, itemIndex) => {
        item.toggleAttribute('data-current', itemIndex === index)
        item.toggleAttribute('data-past', itemIndex < index)
      })
      thumbs.forEach((thumb, thumbIndex) => {
        if (thumbIndex === index) thumb.setAttribute('aria-current', 'true')
        else thumb.removeAttribute('aria-current')
      })
      const to = animate ? (target: gsap.TweenTarget, vars: gsap.TweenVars) => gsap.to(target, { ...CUT, ...vars }) : gsap.set
      items.forEach((_, i) => {
        const clip = clips[i]
        const photo = media[i]
        const shade = shades[i]
        if (clip && i > 0) to(clip, { clipPath: i <= index ? SHOWN : HIDDEN })
        // Only the photo arriving now settles from the zoom; the rest hold or drift.
        if (photo && animate && i === index && index > from) {
          gsap.fromTo(photo, { yPercent: 14, scale: 1.14 }, { ...CUT, duration: 1.15, ease: 'power3.out', yPercent: 0, scale: 1 })
        } else if (photo) {
          to(photo, { yPercent: i < index ? -7 : 0, scale: 1 })
        }
        if (shade) to(shade, { opacity: i < index ? 0.72 : 0 })
      })
    }

    const trigger = ScrollTrigger.create({
      trigger: table,
      start: 'top top',
      end: () => `+=${count * 0.42 * window.innerHeight}`,
      pin: true,
      // Sits below the Conan journey's pin: a priority puts every trigger in page order, and 0
      // keeps this one after the pins above it, so its start includes their spacing.
      refreshPriority: 0,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        table.style.setProperty('--light-progress', self.progress.toFixed(4))
        const index = gsap.utils.clamp(0, count - 1, Math.floor(self.progress * count))
        if (index !== current) show(index, true)
      },
      onRefresh: (self) => {
        table.style.setProperty('--light-progress', self.progress.toFixed(4))
        show(gsap.utils.clamp(0, count - 1, Math.floor(self.progress * count)), false)
      },
    })

    const onThumb = (event: Event) => {
      const index = Number((event.currentTarget as HTMLElement).dataset.lightThumb)
      if (!Number.isFinite(index)) return
      const y = trigger.start + rest(index) * (trigger.end - trigger.start)
      if (glide) glide(y, 1.1)
      else window.scrollTo({ top: y, behavior: 'smooth' })
    }
    thumbs.forEach((thumb) => thumb.addEventListener('click', onThumb))

    return () => {
      thumbs.forEach((thumb) => {
        thumb.removeEventListener('click', onThumb)
        thumb.removeAttribute('aria-current')
      })
      gsap.killTweensOf([...clips, ...media, ...shades].filter(Boolean))
      gsap.set([...clips, ...media, ...shades].filter(Boolean), { clearProps: 'all' })
      delete table.dataset.lightActive
      table.style.removeProperty('--light-progress')
      table.style.removeProperty('--light-index')
      items.forEach((item) => {
        item.removeAttribute('data-current')
        item.removeAttribute('data-past')
      })
    }
  })
  return () => mm.revert()
}

// Scroll fill ([data-scroll-fill]): a large outlined word fills in (--fill, 0 to 1) as it rises
// through the screen. CSS owns the look; without motion --fill keeps its full default.
export function scrollFill(root: HTMLElement): Cleanup {
  for (const el of root.querySelectorAll<HTMLElement>('[data-scroll-fill]')) {
    gsap.fromTo(
      el,
      { '--fill': 0 },
      { '--fill': 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 70%', scrub: 0.6 } },
    )
  }
  return () => {}
}

// Scroll count ([data-scroll-count]): a figure counts from data-count-from to its own number while
// its stage ([data-scrub-stage]) scrolls through data-count-start/end, and --count (0 to 1) tracks
// it for a bar. The markup holds the final figure, so without motion it simply reads complete.
export function scrollCount(root: HTMLElement): Cleanup {
  const counts = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll-count]'))
  for (const el of counts) {
    const value = el.querySelector<HTMLElement>('[data-count-value]')
    if (!value) continue
    const to = Number(value.textContent)
    const from = Number(el.dataset.countFrom ?? 0)
    const pad = value.textContent?.length ?? 1
    const draw = (progress: number) => {
      value.textContent = String(Math.round(from + (to - from) * progress)).padStart(pad, '0')
      el.style.setProperty('--count', progress.toFixed(3))
    }
    ScrollTrigger.create({
      trigger: el.closest<HTMLElement>('[data-scrub-stage]') ?? el,
      start: el.dataset.countStart ?? 'top 80%',
      end: el.dataset.countEnd ?? 'center 50%',
      onUpdate: (self) => draw(self.progress),
      onRefresh: (self) => draw(self.progress),
    })
    el.dataset.countTo = String(to)
  }
  return () => {
    for (const el of counts) {
      const value = el.querySelector<HTMLElement>('[data-count-value]')
      if (value && el.dataset.countTo) value.textContent = el.dataset.countTo
      el.style.removeProperty('--count')
    }
  }
}

// Sticky swap ([data-swap]): as each step ([data-swap-step]) crosses the reading line, the root's
// data-swap-active switches to its index; CSS wipes in the matching screen and dims the others.
export function stickySwap(root: HTMLElement): Cleanup {
  const swaps = Array.from(root.querySelectorAll<HTMLElement>('[data-swap]'))
  for (const swap of swaps) {
    swap.dataset.swapActive = '0'
    swap.querySelectorAll<HTMLElement>('[data-swap-step]').forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 62%',
        end: 'bottom 62%',
        onToggle: (self) => {
          if (self.isActive) swap.dataset.swapActive = String(index)
        },
      })
    })
  }
  return () => {
    for (const swap of swaps) delete swap.dataset.swapActive
  }
}
