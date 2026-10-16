// Motion engine for the showcase pages (/, /tensai, /conan, /about).
// Loaded with a dynamic import from MotionKernel so none of this counts toward the
// first-load JS budget. Every effect is driven by data attributes in the page markup,
// so pages stay server components and work without JavaScript.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { glPhotos } from './gl-photo'
import { collectPens, guidePen } from './guide-pen'
import { chapterRail, curtains, lessonStage, lightTable, maskFlight, scrollCount, scrollFill, stageHero, stickySwap } from './signatures'

gsap.registerPlugin(ScrollTrigger, SplitText)

const EASE = 'expo.out'
const DESKTOP = '(min-width: 900px)'
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

type Cleanup = () => void

let lenis: Lenis | null = null
let velocity = 0

function tick(time: number) {
  lenis?.raf(time * 1000)
}

function startSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, anchors: { offset: -72 }, autoRaf: false })
  lenis.on('scroll', (instance: Lenis) => {
    velocity = instance.velocity
    ScrollTrigger.update()
  })
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

function stopSmoothScroll() {
  if (!lenis) return
  gsap.ticker.remove(tick)
  lenis.destroy()
  lenis = null
  velocity = 0
}

function numberAttr(el: HTMLElement, name: string, fallback: number) {
  const value = Number(el.dataset[name])
  return Number.isFinite(value) && el.dataset[name] !== undefined ? value : fallback
}

function onEnter(trigger: Element, start = 'top 86%') {
  return { trigger, start, once: true }
}

// Headlines: lines rise out of a mask. Masks get vertical padding so Vietnamese
// stacked diacritics (ầ, Ở, ễ) are never clipped.
function splitHeadlines(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const delay = numberAttr(el, 'splitDelay', 0)
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'motion-line',
      autoSplit: true,
      onSplit(self) {
        self.masks.forEach((mask) => {
          const box = mask as HTMLElement
          box.style.paddingBlock = '0.16em'
          box.style.marginBlock = '-0.16em'
        })
        el.dataset.splitReady = 'true'
        return gsap.from(self.lines, {
          yPercent: 118,
          rotate: 1.6,
          transformOrigin: '0% 100%',
          duration: 1.35,
          ease: EASE,
          stagger: 0.085,
          delay,
          scrollTrigger: onEnter(el, 'top 88%'),
        })
      },
    })
  })
}

// Long statements light up word by word as they scroll through the viewport.
function scrubWords(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      wordsClass: 'motion-word',
      autoSplit: true,
      onSplit(self) {
        el.dataset.splitReady = 'true'
        return gsap.fromTo(
          self.words,
          // Words rest legible (0.42, or data-scrub-from for display-size lines that must hold
          // contrast mid-reveal) and finish lighting before the line reaches mid-screen, so no
          // statement is ever read while still half-ghosted.
          { opacity: Number(el.dataset.scrubFrom ?? 0.42) },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            // data-scrub-end lets a statement high on its page finish sooner. A line held on screen
            // by a taller [data-scrub-stage] reads against the stage instead (data-scrub-start too).
            scrollTrigger: {
              trigger: el.closest<HTMLElement>('[data-scrub-stage]') ?? el,
              start: el.dataset.scrubStart ?? 'top 90%',
              end: el.dataset.scrubEnd ?? 'center 55%',
              scrub: true,
            },
          },
        )
      },
    })
  })
}

// Photos open from a clipped window while the image inside settles from a zoom.
function imageReveals(root: HTMLElement) {
  const shapes: Record<string, string> = {
    up: 'inset(100% 0% 0% 0%)',
    down: 'inset(0% 0% 100% 0%)',
    left: 'inset(0% 100% 0% 0%)',
    right: 'inset(0% 0% 0% 100%)',
    center: 'inset(22% 18% 22% 18%)',
  }
  root.querySelectorAll<HTMLElement>('[data-img-reveal]').forEach((el) => {
    const from = shapes[el.dataset.imgReveal ?? ''] ?? shapes.up
    // A [data-reveal-media] wrapper takes the settle zoom, so the image inside stays free for parallax.
    const media = el.querySelector('[data-reveal-media]') ?? el.querySelector('img, video, canvas')
    const delay = numberAttr(el, 'revealDelay', 0)
    const tl = gsap.timeline({ scrollTrigger: onEnter(el, 'top 90%'), delay })
    tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
    if (media) tl.fromTo(media, { scale: 1.32 }, { scale: 1, duration: 1.9, ease: EASE }, 0)
    tl.eventCallback('onComplete', () => {
      el.style.removeProperty('clip-path')
    })
  })
}

// Generic entrances for blocks and grids.
function blockReveals(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach((el) => {
    const variant = el.dataset.motionReveal
    const from =
      variant === 'mask'
        ? { clipPath: 'inset(0% 0% 100% 0%)', y: 28 }
        : variant === 'drift'
          ? { opacity: 0, y: 48 }
          : { opacity: 0, y: 24 }
    gsap.fromTo(el, from, {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: EASE,
      scrollTrigger: onEnter(el, 'top 90%'),
      clearProps: 'clipPath,transform,opacity',
    })
  })

  root.querySelectorAll<HTMLElement>('[data-reveal-children]').forEach((el) => {
    const children = Array.from(el.children)
    gsap.fromTo(
      children,
      { opacity: 0, y: 56 },
      {
        opacity: 1,
        y: 0,
        duration: 1.25,
        ease: EASE,
        stagger: numberAttr(el, 'stagger', 0.09),
        scrollTrigger: onEnter(el, 'top 88%'),
        clearProps: 'transform,opacity',
      },
    )
  })

  root.querySelectorAll<HTMLElement>('[data-draw-line]').forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: el.dataset.drawLine === 'right' ? '100% 50%' : '0% 50%' },
      { scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: onEnter(el, 'top 92%') },
    )
  })
}

// Depth: elements drift at their own speed, photos slide inside their frames.
// data-speed-wide limits the drift to wide screens, for columns that stack on a phone.
function parallax(root: HTMLElement, mm: gsap.MatchMedia) {
  root.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = numberAttr(el, 'speed', 0.1)
    const drift = () => {
      gsap.fromTo(
        el,
        { y: () => -speed * window.innerHeight * 0.5 },
        {
          y: () => speed * window.innerHeight * 0.5,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        },
      )
    }
    if (el.hasAttribute('data-speed-wide')) mm.add(DESKTOP, drift)
    else drift()
  })

  // A round mark (a seal, a stamp) turns as it passes, as if rolled across the page by the scroll.
  root.querySelectorAll<HTMLElement>('[data-spin]').forEach((el) => {
    const turn = numberAttr(el, 'spin', 90)
    gsap.fromTo(
      el,
      { rotation: -turn / 2 },
      {
        rotation: turn / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    )
  })

  root.querySelectorAll<HTMLElement>('[data-parallax-frame]').forEach((frame) => {
    const media = frame.querySelector('img, picture, video, canvas')
    if (!media) return
    const amount = numberAttr(frame, 'parallaxFrame', 10)
    gsap.set(media, { scale: 1 + amount / 50 })
    gsap.fromTo(
      media,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
  })

  root.querySelectorAll<HTMLElement>('[data-motion-parallax]').forEach((el) => {
    const max = numberAttr(el, 'parallaxMax', 18) * 4
    gsap.fromTo(
      el,
      { y: 0, scale: 1 },
      {
        y: max,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      },
    )
  })
}

// First-screen copy lifts away and dims as the reader leaves the hero.
function scrollOut(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-scroll-out]').forEach((el) => {
    const distance = numberAttr(el, 'scrollOut', 30)
    gsap.to(el, {
      y: () => (-distance / 100) * window.innerHeight * 0.5,
      opacity: 0.12,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section') ?? el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
  })
}

// Zoom-through: the section pins, a photo opens out of the slot between two words until it
// fills the screen, and the words part to make room. Wide screens part them sideways; the
// stacked phone layout parts them up and down.
function zoomReveals(root: HTMLElement, mm: gsap.MatchMedia) {
  root.querySelectorAll<HTMLElement>('[data-zoom-reveal]').forEach((section) => {
    const stage = section.querySelector<HTMLElement>('[data-zoom-stage]')
    const slot = section.querySelector<HTMLElement>('[data-zoom-slot]')
    const media = section.querySelector<HTMLElement>('[data-zoom-media]')
    const image = section.querySelector<HTMLElement>('[data-zoom-image]')
    if (!stage || !slot || !media || !image) return
    const left = section.querySelector('[data-zoom-left]')
    const right = section.querySelector('[data-zoom-right]')
    const after = section.querySelectorAll('[data-zoom-after]')
    // data-zoom-under: the section starts one screen up beneath the sheet before it (CSS), so
    // the first screen of the pin only uncovers the line; the zoom waits for that to finish.
    const under = section.hasAttribute('data-zoom-under')
    const lead = under ? 1.3 : 0
    mm.add({ wide: DESKTOP, narrow: '(max-width: 899px)' }, (context) => {
      const wide = Boolean(context.conditions?.wide)
      section.dataset.zoomActive = 'true'
      const fromSlot = () => {
        const box = stage.getBoundingClientRect()
        const hole = slot.getBoundingClientRect()
        return `inset(${hole.top - box.top}px ${box.right - hole.right}px ${box.bottom - hole.bottom}px ${hole.left - box.left}px round 6px)`
      }
      // On a wide screen the photo stops a margin short of the edges, a framed print under the
      // header rather than a bleed; on a phone it fills the screen.
      const toFrame = () => {
        if (!wide) return 'inset(0px 0px 0px 0px round 0px)'
        const side = Math.round(window.innerWidth * 0.05)
        const top = Math.round(Math.max(76, window.innerHeight * 0.1))
        const bottom = Math.round(window.innerHeight * 0.05)
        return `inset(${top}px ${side}px ${bottom}px ${side}px round 14px)`
      }
      const part = (sign: number) =>
        wide
          ? { x: () => sign * window.innerWidth * 0.32, yPercent: 0 }
          : { y: () => sign * window.innerHeight * 0.26, xPercent: 0 }
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: under ? '+=200%' : '+=105%',
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(media, { clipPath: fromSlot }, { clipPath: toFrame, ease: 'power3.inOut', duration: 1 }, lead)
        .fromTo(image, { scale: 1.5 }, { scale: 1.08, ease: 'power2.inOut', duration: 1.1 }, lead)
        // The words part as the hole opens but are gone before the photo fills the screen, so
        // no letter is ever left floating over the face.
        .to(left, { ...part(-1), ease: 'power2.in', duration: 0.75 }, lead + 0.05)
        .to(right, { ...part(1), ease: 'power2.in', duration: 0.75 }, lead + 0.05)
        .to([left, right], { autoAlpha: 0, duration: 0.42 }, lead + 0.05)
        .fromTo(after, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.3, stagger: 0.06 }, lead + 0.95)
        // The hold before the pin lets go keeps the camera drifting instead of freezing.
        .to(image, { scale: 1, ease: 'sine.out', duration: 0.25 }, lead + 1.1)
      return () => {
        delete section.dataset.zoomActive
      }
    })
  })
}

// Pinned sections whose content travels sideways while the page scrolls down. Each item has a
// resting point (its centre in the middle of the track's window); the item nearest the scroll is
// current, the scroll settles on a resting point when the reader stops, and arrows inside the
// section (an 'hscroll:step' event from ReelControls) move one item at a time.
function horizontalScroll(root: HTMLElement, mm: gsap.MatchMedia) {
  root.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
    const track = section.querySelector<HTMLElement>('[data-hscroll-track]')
    if (!track) return
    // data-hscroll-pace stretches the pinned scroll past the track's own width, so each item dwells longer.
    const pace = Number(section.dataset.hscrollPace ?? 1) || 1
    // data-hscroll-scrub sets how many seconds the row trails the scrollbar (default 0.8).
    const scrub = Number(section.dataset.hscrollScrub ?? 0.8) || 0.8
    // data-hscroll-hold keeps the pin that many screens past the last item's arrival, so it settles
    // before the section lets go. `share` is the part of the pinned scroll that moves the row.
    const hold = Number(section.dataset.hscrollHold ?? 0) || 0
    let share = 1
    const items = Array.from(track.querySelectorAll<HTMLElement>('[data-hscroll-item]'))
    const counter = section.querySelector<HTMLElement>('[data-hscroll-current]')
    const prev = section.querySelector<HTMLButtonElement>('[data-hscroll-prev]')
    const next = section.querySelector<HTMLButtonElement>('[data-hscroll-next]')
    mm.add(DESKTOP, () => {
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
      section.dataset.hscrollActive = 'true'
      let points: number[] = items.map(() => 0)
      let lefts: number[] = items.map(() => 0)
      const measure = () => {
        const room = distance()
        points = items.map((item) =>
          room > 0 ? share * gsap.utils.clamp(0, 1, (item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2) / room) : 0,
        )
        // Rect difference, so the track's own transform and offsetParent drop out.
        const origin = track.getBoundingClientRect().left
        lefts = items.map((item) => item.getBoundingClientRect().left - origin)
      }
      // --hscroll-edge: where each item's left edge sits in the window, in item widths (0 = on the
      // window's left edge, negative = already sliding out), so CSS can retire an item as it leaves.
      // --hscroll-room is the same for the right edge (negative = still arriving).
      const edges = () => {
        const x = Number(gsap.getProperty(track, 'x')) || 0
        items.forEach((item, i) => {
          const width = item.offsetWidth || 1
          const edge = gsap.utils.clamp(-1, 1, (lefts[i] + x) / width)
          const room = gsap.utils.clamp(-1, 1, (track.clientWidth - lefts[i] - x - width) / width)
          item.style.setProperty('--hscroll-edge', edge.toFixed(3))
          item.style.setProperty('--hscroll-room', room.toFixed(3))
        })
      }
      const nearest = (progress: number) =>
        points.reduce((best, point, index) => (Math.abs(point - progress) < Math.abs(points[best] - progress) ? index : best), 0)
      let current = -1
      const mark = (progress: number) => {
        section.style.setProperty('--hscroll-progress', progress.toFixed(4))
        const index = nearest(progress)
        if (index === current || !items.length) return
        current = index
        items.forEach((item, i) => item.toggleAttribute('data-current', i === index))
        section.style.setProperty('--hscroll-index', String(index))
        if (counter) counter.textContent = String(index + 1).padStart(2, '0')
        if (prev) prev.disabled = index === 0
        if (next) next.disabled = index === items.length - 1
      }
      let trigger: ScrollTrigger | undefined
      // The resting point the row last glided to, for data-hscroll-snap (NaN once the reader leaves).
      let rest = Number.NaN
      const scrollToPoint = (index: number, duration: number) => {
        if (!trigger) return
        const y = trigger.start + (trigger.end - trigger.start) * points[index]
        rest = y
        if (lenis) lenis.scrollTo(y, { duration })
        else window.scrollTo({ top: y, behavior: 'smooth' })
      }
      // Once the reader stops inside the pinned stretch, glide to the nearest resting point.
      let settleTimer = 0
      let settling = false
      const settleSoon = (self: ScrollTrigger) => {
        window.clearTimeout(settleTimer)
        if (settling || !lenis) return
        settleTimer = window.setTimeout(() => {
          if (!self.isActive || self.progress <= 0 || self.progress >= share) return
          const index = nearest(self.progress)
          if (Math.abs(points[index] - self.progress) * (self.end - self.start) < 6) return
          settling = true
          scrollToPoint(index, 0.7)
          window.setTimeout(() => (settling = false), 760)
        }, 180)
      }
      // data-hscroll-snap: once the wheel stops feeding Lenis, aim the glide still under way at the
      // resting point nearest to where it was heading, so the row lands in one movement instead of
      // gliding to a stop and then settling.
      const snap = 'hscrollSnap' in section.dataset
      let aimed = Number.NaN
      let aimedAt = 0
      const snapAhead = (self: ScrollTrigger) => {
        if (!snap || !lenis || settling || section.dataset.hscrollDragging) return
        const target = lenis.targetScroll
        const span = self.end - self.start
        const progress = (target - self.start) / span
        if (progress < 0 || progress > 1) rest = Number.NaN
        const now = performance.now()
        if (target !== aimed) {
          aimed = target
          aimedAt = now
          return
        }
        if (now - aimedAt < 110 || progress <= 0 || progress >= share) return
        let index = nearest(progress)
        // One notch of the wheel is shorter than half the gap between photos: rather than spring
        // back to the photo the reader just left, take one step in the direction they scrolled.
        if (Math.abs(target - rest) > 40 && index === nearest((rest - self.start) / span))
          index = gsap.utils.clamp(0, items.length - 1, index + Math.sign(target - rest))
        if (Math.abs(self.start + span * points[index] - target) < 6) return
        settling = true
        scrollToPoint(index, 0.65)
        window.setTimeout(() => (settling = false), 720)
      }
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: hold ? (p: number) => Math.min(1, p / share) : 'none',
        onUpdate: edges,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => {
            const run = distance() * pace
            const rest = hold * window.innerHeight
            share = run > 0 ? run / (run + rest) : 1
            return `+=${run + rest}`
          },
          pin: true,
          scrub,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            mark(self.progress)
            snapAhead(self)
            settleSoon(self)
          },
          onRefresh: (self) => {
            measure()
            current = -1
            mark(self.progress)
            edges()
          },
        },
      })
      const onStep = (event: Event) => {
        const direction = (event as CustomEvent<number>).detail
        const target = gsap.utils.clamp(0, items.length - 1, Math.max(0, current) + direction)
        settling = true
        scrollToPoint(target, 1)
        window.setTimeout(() => (settling = false), 1060)
      }
      trigger = tween.scrollTrigger
      section.addEventListener('hscroll:step', onStep)
      // Mouse drag: pulling the row sideways moves the page by the matching scroll distance (one
      // pixel of track is `pace` pixels of scroll), and letting go glides to the nearest photo.
      const viewport = track.parentElement ?? track
      let drag: { x: number; y: number; moved: boolean } | null = null
      const dragStart = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || !trigger) return
        // Not `isActive`: resting exactly on the pin's first frame counts as outside it.
        const y = lenis?.scroll ?? window.scrollY
        if (y < trigger.start - 2 || y > trigger.end + 2) return
        drag = { x: event.clientX, y, moved: false }
        section.dataset.hscrollDragging = 'true'
      }
      const dragMove = (event: PointerEvent) => {
        if (!drag || !trigger) return
        const dx = event.clientX - drag.x
        if (Math.abs(dx) > 4) drag.moved = true
        const y = gsap.utils.clamp(trigger.start + 1, trigger.end - 1, drag.y - dx * pace * 1.4)
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
        else window.scrollTo(0, y)
      }
      const dragEnd = () => {
        if (!drag || !trigger) return
        const moved = drag.moved
        drag = null
        delete section.dataset.hscrollDragging
        if (!moved) return
        settling = true
        scrollToPoint(nearest(trigger.progress), 0.8)
        window.setTimeout(() => (settling = false), 860)
      }
      viewport.addEventListener('pointerdown', dragStart)
      window.addEventListener('pointermove', dragMove, { passive: true })
      window.addEventListener('pointerup', dragEnd)
      track.querySelectorAll<HTMLElement>('[data-hscroll-media]').forEach((media) => {
        gsap.fromTo(
          media,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: media,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
      })
      return () => {
        window.clearTimeout(settleTimer)
        section.removeEventListener('hscroll:step', onStep)
        viewport.removeEventListener('pointerdown', dragStart)
        window.removeEventListener('pointermove', dragMove)
        window.removeEventListener('pointerup', dragEnd)
        delete section.dataset.hscrollDragging
        delete section.dataset.hscrollActive
        section.style.removeProperty('--hscroll-progress')
        section.style.removeProperty('--hscroll-index')
        items.forEach((item) => {
          item.removeAttribute('data-current')
          item.style.removeProperty('--hscroll-edge')
          item.style.removeProperty('--hscroll-room')
        })
      }
    })
  })
}

// Stacked cards: each card pins under the header while the next one slides over it.
// Sticky cards ([data-stack-card] with position: sticky) give no stable box to measure, so a card
// may be preceded by a spacer ([data-stack-mark]) whose bottom is where that card starts in the
// flow; the card before it then steps back from the moment it enters until it settles at its own
// sticky top. data-stack-media, data-stack-scale and data-stack-opacity tune one pile, and
// data-stack-start holds a card at full strength until the next one is that far up the screen.
function stackCards(root: HTMLElement, mm: gsap.MatchMedia) {
  root.querySelectorAll<HTMLElement>('[data-stack]').forEach((stack) => {
    const cards = Array.from(stack.querySelectorAll<HTMLElement>('[data-stack-card]'))
    // A rail elsewhere in the section ([data-stack-rail]) follows the card on top of the pile.
    const rail = Array.from(stack.closest('section')?.querySelectorAll<HTMLElement>('[data-stack-rail] > li') ?? [])
    if (rail.length) {
      const mark = (index: number) => rail.forEach((item, i) => item.toggleAttribute('data-current', i === index))
      mark(0)
      cards.forEach((card, index) => {
        if (!index) return
        ScrollTrigger.create({
          trigger: card,
          start: 'top 45%',
          onEnter: () => mark(index),
          onLeaveBack: () => mark(index - 1),
        })
      })
    }
    mm.add(stack.dataset.stackMedia ?? DESKTOP, () => {
      cards.forEach((card, index) => {
        const next = cards[index + 1]
        if (!next) return
        const mark = next.previousElementSibling
        const scrollTrigger: ScrollTrigger.Vars =
          mark instanceof HTMLElement && mark.matches('[data-stack-mark]')
            ? {
                trigger: mark,
                start: 'bottom bottom',
                end: () => `bottom ${parseFloat(getComputedStyle(next).top) || window.innerHeight * 0.2}px`,
                scrub: true,
              }
            : { trigger: next, start: stack.dataset.stackStart ?? 'top bottom', end: 'top 20%', scrub: true }
        // The filter starts from an explicit brightness(1): tweening from `none` reads as brightness(0)
        // and flashes the card near black at the start of the step back. Light cards step back less
        // (data-stack-dim), or cream turns to dull grey.
        gsap.fromTo(
          card,
          { filter: 'brightness(1)' },
          {
            scale: numberAttr(stack, 'stackScale', 0.92 + index * 0.015),
            opacity: numberAttr(stack, 'stackOpacity', 0.45),
            filter: `brightness(${numberAttr(stack, 'stackDim', 0.7)})`,
            ease: 'none',
            immediateRender: false,
            scrollTrigger,
          },
        )
      })
    })
  })
}

// Real numbers count up when they arrive. Markup carries the final value for no-JS and SEO.
// data-focus-bloom: an element is marked data-in-focus while it crosses the middle of the
// screen, so a photo can wake into colour as the reader reaches it (touch screens included).
function focusBloom(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-focus-bloom]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 68%',
      end: 'bottom 32%',
      onToggle: (self) => el.toggleAttribute('data-in-focus', self.isActive),
    })
  })
}

// Documentary photos rest in the archive tone and take their colour while they cross the
// middle of the screen; hover and keyboard focus are handled in CSS ([data-photo-bloom]).
function photoBloom(root: HTMLElement): Cleanup {
  const photos = root.querySelectorAll<HTMLElement>('[data-photo-bloom]')
  if (!photos.length) return () => {}
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.toggleAttribute('data-lit', e.isIntersecting)),
    { rootMargin: '-40% -20% -40% -20%' },
  )
  photos.forEach((el) => observer.observe(el))
  return () => {
    observer.disconnect()
    photos.forEach((el) => el.removeAttribute('data-lit'))
  }
}

function counters(root: HTMLElement) {
  const formatter = new Intl.NumberFormat('vi-VN')
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = numberAttr(el, 'count', 0)
    const state = { value: 0 }
    el.textContent = formatter.format(0)
    gsap.to(state, {
      value: target,
      // Short and without a long tail, so the figure settles before the reader's eye lands on it.
      duration: 1.4,
      ease: 'power3.out',
      // Fires as the number enters the screen, so a reader never stops on the 0 it starts from.
      scrollTrigger: onEnter(el, 'top bottom'),
      onUpdate: () => {
        el.textContent = formatter.format(Math.round(state.value))
      },
    })
  })
}

// Endless rows whose speed and direction follow the reader's scroll.
function marquees(root: HTMLElement): Cleanup {
  const loops: gsap.core.Tween[] = []
  root.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
    const track = el.querySelector<HTMLElement>('[data-marquee-track]')
    if (!track) return
    const reverse = el.dataset.marquee === 'reverse'
    const loop = gsap.fromTo(
      track,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, duration: numberAttr(el, 'marqueeDuration', 38), ease: 'none', repeat: -1 },
    )
    loops.push(loop)
  })
  if (!loops.length) return () => {}
  const boost = () => {
    const speed = 1 + Math.min(5, Math.abs(velocity) * 0.18)
    const direction = velocity < -0.2 ? -1 : 1
    loops.forEach((loop) => {
      loop.timeScale(gsap.utils.interpolate(loop.timeScale(), speed * direction, 0.08))
    })
  }
  gsap.ticker.add(boost)
  return () => gsap.ticker.remove(boost)
}

// Photo rows lean into fast scrolling and straighten when the reader stops.
function velocitySkew(root: HTMLElement): Cleanup {
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-velocity-skew]'))
  if (!targets.length) return () => {}
  const setters = targets.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.6, ease: 'power3.out' }))
  const update = () => {
    const skew = gsap.utils.clamp(-5, 5, velocity * -0.32)
    setters.forEach((set) => set(skew))
  }
  gsap.ticker.add(update)
  return () => gsap.ticker.remove(update)
}

// Buttons and doors lean toward the pointer, never more than MAGNETIC_MAX px, and spring back
// on leave; the label inside travels a little further than the frame. The soft elastic below
// overshoots by about 7%, so the goal is held short of the limit to keep the peak inside it.
const MAGNETIC_MAX = 8
const MAGNETIC_GOAL = MAGNETIC_MAX / 1.08

function magnetic(root: HTMLElement): Cleanup {
  const cleanups: Cleanup[] = []
  // The whole shell, so the header's path pills and CTA lean too, not only the stage.
  const scope = root.closest<HTMLElement>('[data-site-shell]') ?? root
  scope.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = numberAttr(el, 'magnetic', 0.32)
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]')
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.75)' })
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.75)' })
    const ix = inner ? gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' }) : null
    const iy = inner ? gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' }) : null
    const move = (event: PointerEvent) => {
      // Measure from the resting centre, so the lean itself does not feed back into the pull.
      const box = el.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2 - Number(gsap.getProperty(el, 'x')))
      const dy = event.clientY - (box.top + box.height / 2 - Number(gsap.getProperty(el, 'y')))
      const pull = Math.min(1, MAGNETIC_GOAL / (Math.hypot(dx, dy) * strength || 1))
      x(dx * strength * pull)
      y(dy * strength * pull)
      ix?.(dx * strength * pull * 0.35)
      iy?.(dy * strength * pull * 0.35)
    }
    const leave = () => {
      x(0)
      y(0)
      ix?.(0)
      iy?.(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.set([el, inner].filter(Boolean), { clearProps: 'transform' })
    })
  })
  return () => cleanups.forEach((fn) => fn())
}

// Tilt: product shots turn slightly toward the pointer.
function tilt(root: HTMLElement): Cleanup {
  const cleanups: Cleanup[] = []
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = numberAttr(el, 'tilt', 6)
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    // GSAP folds the computed CSS `translate` into its transform on first touch. Cards that rise in
    // with a CSS intro would keep the intro's start offset for good, so the offset is zeroed here
    // (the inline `translate: none` GSAP leaves loses to the running intro until it ends).
    gsap.set(el, { transformPerspective: 1100, x: 0, y: 0 })
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect()
      const px = (event.clientX - box.left) / box.width - 0.5
      const py = (event.clientY - box.top) / box.height - 0.5
      ry(px * max * 2)
      rx(-py * max * 2)
      el.style.setProperty('--tilt-x', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--tilt-y', `${(py + 0.5) * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    })
  })
  return () => cleanups.forEach((fn) => fn())
}

// Depth: layers of a stage shift against the pointer by their depth, so the scene reads as
// stacked sheets (near layers move most). Layers must not carry another GSAP x/y (data-speed
// moves y), so they wrap whatever animates inside them.
function depth(root: HTMLElement): Cleanup {
  const cleanups: Cleanup[] = []
  root.querySelectorAll<HTMLElement>('[data-depth-stage]').forEach((stage) => {
    const area = stage.closest<HTMLElement>('section') ?? stage
    const layers = Array.from(stage.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      amount: numberAttr(el, 'depth', 0.5),
      x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
      el,
    }))
    const move = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect()
      const nx = gsap.utils.clamp(-1, 1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2))
      const ny = gsap.utils.clamp(-1, 1, (event.clientY - (box.top + box.height / 2)) / (box.height / 2))
      layers.forEach((layer) => {
        layer.x(-nx * layer.amount * 18)
        layer.y(-ny * layer.amount * 12)
      })
    }
    const leave = () => layers.forEach((layer) => (layer.x(0), layer.y(0)))
    area.addEventListener('pointermove', move)
    area.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      area.removeEventListener('pointermove', move)
      area.removeEventListener('pointerleave', leave)
      gsap.set(layers.map((layer) => layer.el), { clearProps: 'transform' })
    })
  })
  return () => cleanups.forEach((fn) => fn())
}

// Link lists with a floating photo: the photo of the hovered row follows the pointer,
// leaning with horizontal speed. Rows still work as plain links without it.
function hoverReveal(root: HTMLElement): Cleanup {
  const cleanups: Cleanup[] = []
  root.querySelectorAll<HTMLElement>('[data-hover-reveal]').forEach((list) => {
    const float = list.querySelector<HTMLElement>('[data-hover-float]')
    if (!float) return
    const media = Array.from(float.querySelectorAll<HTMLElement>('[data-hover-media]'))
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-hover-item]'))
    gsap.set(float, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 })
    const xTo = gsap.quickTo(float, 'x', { duration: 0.65, ease: 'power3.out' })
    const yTo = gsap.quickTo(float, 'y', { duration: 0.65, ease: 'power3.out' })
    const rTo = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3.out' })
    let lastX = 0
    const move = (event: PointerEvent) => {
      const box = list.getBoundingClientRect()
      xTo(event.clientX - box.left)
      yTo(event.clientY - box.top)
      rTo(gsap.utils.clamp(-10, 10, (event.clientX - lastX) * 0.5))
      lastX = event.clientX
    }
    const show = (key: string | undefined) => {
      media.forEach((item) => {
        gsap.to(item, { autoAlpha: item.dataset.hoverMedia === key ? 1 : 0, duration: 0.35, ease: 'power2.out' })
      })
      gsap.to(float, { scale: 1, autoAlpha: 1, duration: 0.6, ease: EASE })
      if (key) list.dataset.hoverActive = key
    }
    const hide = () => {
      gsap.to(float, { scale: 0.6, autoAlpha: 0, duration: 0.45, ease: 'power3.out' })
      rTo(0)
      delete list.dataset.hoverActive
    }
    const enters = items.map((item) => {
      const enter = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        lastX = event.clientX
        const box = list.getBoundingClientRect()
        gsap.set(float, { x: event.clientX - box.left, y: event.clientY - box.top })
        show(item.dataset.hoverItem)
      }
      item.addEventListener('pointerenter', enter)
      return () => item.removeEventListener('pointerenter', enter)
    })
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', hide)
    cleanups.push(() => {
      enters.forEach((fn) => fn())
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', hide)
      delete list.dataset.hoverActive
    })
  })
  return () => cleanups.forEach((fn) => fn())
}

// The cursor lives for the whole session: a dot that tracks the pointer exactly, a ring that
// trails it (lerp) and a tag that carries a short Vietnamese verb over anything that acts.
// Its colours follow the ground under the pointer (ink on paper, paper on ink and photos), so it
// reads on every background without a blend mode. Over a magnetic control the ring lets go of
// the pointer and settles round the control's own outline, centred on it.
let cursorCleanup: Cleanup | null = null

const CURSOR_LERP = 0.18
// Controls taller than this (the closing door panels) keep the plain ring: a frame that size
// would read as a selection box, not a cursor.
const STICK_MAX_HEIGHT = 140

type Ground = 'light' | 'dark'

// 0–1 channels for a mostly opaque background colour (rgb() or color(srgb)).
function opaqueRgb(value: string): [number, number, number] | null {
  const legacy = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(value)
  const modern = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?/.exec(value)
  const match = legacy ?? modern
  if (!match || (match[4] !== undefined && Number(match[4]) < 0.5)) return null
  const scale = legacy ? 255 : 1
  return [Number(match[1]) / scale, Number(match[2]) / scale, Number(match[3]) / scale]
}

function groundAt(x: number, y: number): Ground {
  for (const node of document.elementsFromPoint(x, y)) {
    // A photo or film frame: the paper cursor (with its ink edge) carries best over pictures.
    if (node instanceof HTMLImageElement || node instanceof HTMLVideoElement || node instanceof HTMLCanvasElement) return 'dark'
    const rgb = opaqueRgb(getComputedStyle(node).backgroundColor)
    if (rgb) return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.45 ? 'light' : 'dark'
  }
  return document.documentElement.dataset.ground === 'paper' ? 'light' : 'dark'
}

// What the tag says: the target's own data-cursor, else a plain verb for what a click does.
// Header and footer links keep a bare ring unless they ask for a label.
function cursorLabel(target: HTMLElement): string {
  if (target.dataset.cursor) return target.dataset.cursor
  if (!target.closest('[data-motion-stage]')) return ''
  if (target.matches('a[href^="#"]')) return 'Xem'
  if (target.matches('a')) return 'Mở'
  return 'Chọn'
}

function startCursor() {
  if (cursorCleanup) return
  const root = document.createElement('div')
  root.className = 'motion-cursor'
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML =
    '<span class="motion-cursor__ring"></span><span class="motion-cursor__dot"></span><span class="motion-cursor__tag"><span class="motion-cursor__label"></span></span>'
  document.body.appendChild(root)
  const ring = root.querySelector<HTMLElement>('.motion-cursor__ring')!
  const dot = root.querySelector<HTMLElement>('.motion-cursor__dot')!
  const tag = root.querySelector<HTMLElement>('.motion-cursor__tag')!
  const label = root.querySelector<HTMLElement>('.motion-cursor__label')!
  const setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') }
  const setRing = { x: gsap.quickSetter(ring, 'x', 'px'), y: gsap.quickSetter(ring, 'y', 'px') }
  const setTag = { x: gsap.quickSetter(tag, 'x', 'px'), y: gsap.quickSetter(tag, 'y', 'px') }
  document.documentElement.dataset.cursorMode = 'custom'
  root.dataset.state = 'idle'

  const pointer = { x: -100, y: -100 }
  const ringAt = { x: -100, y: -100 }
  const tagAt = { x: -100, y: -100 }
  let tagWidth = 0
  let stuck: HTMLElement | null = null
  let sampledAt = 0

  const sample = (force = false) => {
    const now = performance.now()
    if (!force && now - sampledAt < 90) return
    sampledAt = now
    root.dataset.ground = groundAt(pointer.x, pointer.y)
  }

  const unstick = () => {
    if (!stuck) return
    stuck = null
    ring.style.removeProperty('--cursor-w')
    ring.style.removeProperty('--cursor-h')
    ring.style.removeProperty('--cursor-r')
  }

  // One ticker step: the ring eases towards the pointer (or the stuck control's centre) and the
  // tag towards its seat below-right of the pointer, flipping left near the window's edge.
  const follow = () => {
    const f = 1 - Math.pow(1 - CURSOR_LERP, gsap.ticker.deltaRatio(60))
    let goalX = pointer.x
    let goalY = pointer.y
    if (stuck) {
      const box = stuck.getBoundingClientRect()
      goalX = box.left + box.width / 2
      goalY = box.top + box.height / 2
      ring.style.setProperty('--cursor-w', `${box.width + 14}px`)
      ring.style.setProperty('--cursor-h', `${box.height + 14}px`)
    }
    ringAt.x += (goalX - ringAt.x) * f
    ringAt.y += (goalY - ringAt.y) * f
    const flip = pointer.x + 18 + tagWidth > window.innerWidth - 8
    tagAt.x += ((flip ? pointer.x - 14 - tagWidth : pointer.x + 18) - tagAt.x) * f
    tagAt.y += (pointer.y + 20 - tagAt.y) * f
    setRing.x(ringAt.x)
    setRing.y(ringAt.y)
    setTag.x(tagAt.x)
    setTag.y(tagAt.y)
  }
  gsap.ticker.add(follow)

  // Scrolling under a still mouse makes the browser fire pointerover on whatever slides beneath
  // it, which would pop a label over the content being read. Labels stay folded until the mouse
  // itself moves again.
  const scrolled = () => {
    root.dataset.quiet = 'true'
    sample()
  }
  // A mouse left still is set down: after a short rest the bare cursor fades, so it never sits on
  // top of the words the reader is scrolling through. The next move brings it straight back.
  let restTimer = 0
  const rest = () => {
    root.dataset.rest = 'true'
  }
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const first = root.dataset.visible !== 'true'
    pointer.x = event.clientX
    pointer.y = event.clientY
    if (first) {
      ringAt.x = tagAt.x = pointer.x
      ringAt.y = tagAt.y = pointer.y
    }
    root.dataset.visible = 'true'
    delete root.dataset.quiet
    delete root.dataset.rest
    window.clearTimeout(restTimer)
    restTimer = window.setTimeout(rest, 1600)
    setDot.x(pointer.x)
    setDot.y(pointer.y)
    sample(first)
  }
  const over = (event: PointerEvent) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], summary')
    if (event.pointerType === 'mouse') {
      pointer.x = event.clientX
      pointer.y = event.clientY
      sample(true)
    }
    if (!target) {
      unstick()
      root.dataset.state = 'idle'
      delete root.dataset.tagged
      delete root.dataset.tone
      return
    }
    const text = cursorLabel(target)
    label.textContent = text
    tagWidth = text ? label.offsetWidth : 0
    if (text) root.dataset.tagged = 'true'
    else delete root.dataset.tagged
    const tone = target.closest<HTMLElement>('[data-cursor-tone]')?.dataset.cursorTone
    if (tone) root.dataset.tone = tone
    else delete root.dataset.tone
    const box = target.getBoundingClientRect()
    if (target.matches('[data-magnetic]') && box.height <= STICK_MAX_HEIGHT) {
      if (stuck !== target) {
        unstick()
        stuck = target
        const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0
        ring.style.setProperty('--cursor-r', `${Math.min(radius + 7, (box.height + 14) / 2)}px`)
      }
      root.dataset.state = 'stick'
      return
    }
    unstick()
    root.dataset.state = text && target.dataset.cursor !== undefined ? 'label' : 'link'
  }
  const leaveWindow = () => {
    root.dataset.visible = 'false'
  }
  const press = () => {
    root.dataset.pressed = 'true'
  }
  const release = () => {
    root.dataset.pressed = 'false'
  }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('scroll', scrolled, { passive: true })
  document.addEventListener('pointerover', over, { passive: true })
  document.documentElement.addEventListener('pointerleave', leaveWindow)
  window.addEventListener('pointerdown', press, { passive: true })
  window.addEventListener('pointerup', release, { passive: true })
  cursorCleanup = () => {
    window.clearTimeout(restTimer)
    gsap.ticker.remove(follow)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('scroll', scrolled)
    document.removeEventListener('pointerover', over)
    document.documentElement.removeEventListener('pointerleave', leaveWindow)
    window.removeEventListener('pointerdown', press)
    window.removeEventListener('pointerup', release)
    root.remove()
    delete document.documentElement.dataset.cursorMode
    cursorCleanup = null
  }
}

function stopCursor() {
  cursorCleanup?.()
}

// A pinned hero is moved into its pin-spacer when the trigger is built and again on every
// refresh, and a moved element restarts its CSS animations: the headline would blink out and
// play its intro again. The clock of every running CSS animation is read before any pin exists;
// after each move, the restarted ones inside a pin are put back on that clock, or at their end
// once they have played out. Endless loops simply restart.
const INTRO_PARTS = '.intro-word > span, .intro-fade, .intro-clip, .intro-clip img'
const ANY_INTRO = '*'

function cssAnimations(): CSSAnimation[] {
  return document.getAnimations().filter((a): a is CSSAnimation => a instanceof CSSAnimation)
}

function introKey(anim: CSSAnimation): [Element | null, string] {
  const effect = anim.effect as KeyframeEffect | null
  return [effect?.target ?? null, `${effect?.pseudoElement ?? ''}|${anim.animationName}`]
}

function keepIntroClock(): { restore: Cleanup; stop: Cleanup } {
  const now = () => Number(document.timeline.currentTime ?? performance.now())
  // Per element: animation key -> virtual start on the document timeline, or null once played out.
  const clocks = new Map<Element, Map<string, number | null>>()
  const clockOf = (el: Element) => clocks.get(el) ?? clocks.set(el, new Map()).get(el)!
  // Shared intro parts that have already played out (or never ran) must not replay either.
  document.querySelectorAll(INTRO_PARTS).forEach((el) => clockOf(el).set(ANY_INTRO, null))
  cssAnimations().forEach((anim) => {
    const [el, key] = introKey(anim)
    const timing = anim.effect?.getComputedTiming()
    if (!el || !timing || timing.iterations === Infinity) return
    clockOf(el).set(key, now() - Number(anim.currentTime ?? 0))
  })
  const restore = () =>
    cssAnimations().forEach((anim) => {
      const [el, key] = introKey(anim)
      if (!el?.closest('.pin-spacer') || anim.playState === 'paused') return
      const clock = clocks.get(el)
      const start = clock?.has(key) ? clock.get(key) : anim.animationName.startsWith('intro-') ? clock?.get(ANY_INTRO) : undefined
      if (start === undefined) return
      try {
        const end = Number(anim.effect?.getComputedTiming().endTime ?? 0)
        if (start === null || now() - start >= end) {
          anim.finish()
          clock?.set(key, null)
        } else {
          anim.currentTime = now() - start
        }
      } catch {
        // Endless or detached: leave it to CSS.
      }
    })
  ScrollTrigger.addEventListener('refresh', restore)
  return { restore, stop: () => ScrollTrigger.removeEventListener('refresh', restore) }
}

export type MountOptions = { stage: boolean }

// Builds every effect found inside root. Returns a cleanup that reverts all of it, so a
// client-side navigation can tear down one page and mount the next.
export function mountMotion(root: HTMLElement, { stage }: MountOptions): Cleanup {
  const finePointer = window.matchMedia(FINE_POINTER).matches
  if (stage) {
    startSmoothScroll()
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
    if (finePointer) startCursor()
  } else {
    stopSmoothScroll()
    stopCursor()
  }

  const mm = gsap.matchMedia()
  const extra: Cleanup[] = []
  const introClock = keepIntroClock()
  const ctx = gsap.context(() => {
    // Pen anchors are read before SplitText rewrites the headings they sit in.
    const pens = collectPens(root)
    splitHeadlines(root)
    scrubWords(root)
    scrollOut(root)
    imageReveals(root)
    blockReveals(root)
    parallax(root, mm)
    zoomReveals(root, mm)
    horizontalScroll(root, mm)
    stackCards(root, mm)
    counters(root)
    focusBloom(root)
    // The light table glides with Lenis where it runs, so a settle eases like the reader's own scroll.
    const glide = lenis ? (y: number, duration: number) => lenis?.scrollTo(y, { duration }) : null
    extra.push(marquees(root), velocitySkew(root), stageHero(root), maskFlight(root), lessonStage(root), stickySwap(root), chapterRail(root), lightTable(root, glide), curtains(root), scrollFill(root), scrollCount(root))
    // Magnetic controls also live in the shared header and footer, outside the page's stage.
    if (finePointer) extra.push(magnetic(root), tilt(root), depth(root), hoverReveal(root))
    extra.push(photoBloom(root), guidePen(root, pens))
    // The WebGL photo surface is a desktop treat: it needs a mouse, a wide screen and a
    // connection that has not asked to save data.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (finePointer && !saveData && window.matchMedia(DESKTOP).matches) extra.push(glPhotos(root, () => velocity))
  }, root)

  // The triggers above have just moved any pinned hero into its spacer.
  introClock.restore()
  document.documentElement.dataset.motionReady = 'true'
  // Fonts and lazy images change section heights after first layout.
  const refresh = () => ScrollTrigger.refresh()
  document.fonts?.ready.then(refresh).catch(() => {})
  window.addEventListener('load', refresh, { once: true })

  return () => {
    window.removeEventListener('load', refresh)
    introClock.stop()
    extra.forEach((fn) => fn())
    mm.revert()
    ctx.revert()
  }
}

export function teardownMotion() {
  stopSmoothScroll()
  stopCursor()
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
}
