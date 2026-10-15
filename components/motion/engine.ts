// Motion engine for the showcase pages (/, /tensai, /conan, /about).
// Loaded with a dynamic import from MotionKernel so none of this counts toward the
// first-load JS budget. Every effect is driven by data attributes in the page markup,
// so pages stay server components and work without JavaScript.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { glPhotos } from './gl-photo'
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
          room > 0 ? gsap.utils.clamp(0, 1, (item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2) / room) : 0,
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
      const scrollToPoint = (index: number, duration: number) => {
        if (!trigger) return
        const y = trigger.start + (trigger.end - trigger.start) * points[index]
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
          if (!self.isActive || self.progress <= 0 || self.progress >= 1) return
          const index = nearest(self.progress)
          if (Math.abs(points[index] - self.progress) * (self.end - self.start) < 6) return
          settling = true
          scrollToPoint(index, 0.7)
          window.setTimeout(() => (settling = false), 760)
        }, 180)
      }
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        onUpdate: edges,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance() * pace}`,
          pin: true,
          scrub,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            mark(self.progress)
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

// Buttons and doors lean toward the pointer, with the label travelling further than the frame.
function magnetic(root: HTMLElement): Cleanup {
  const cleanups: Cleanup[] = []
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = numberAttr(el, 'magnetic', 0.32)
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]')
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    const ix = inner ? gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' }) : null
    const iy = inner ? gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' }) : null
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      x(dx * strength)
      y(dy * strength)
      ix?.(dx * strength * 0.6)
      iy?.(dy * strength * 0.6)
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

// The cursor lives for the whole session: a dot that tracks the pointer exactly and a
// ring that trails it, grows over links and shows a short label over [data-cursor] targets.
// Over a magnetic button that already says what it does, the ring wraps the button's outline
// instead, so it never covers the label.
let cursorCleanup: Cleanup | null = null

function startCursor() {
  if (cursorCleanup) return
  const ring = document.createElement('div')
  ring.className = 'motion-cursor'
  ring.setAttribute('aria-hidden', 'true')
  ring.innerHTML = '<span class="motion-cursor__dot"></span><span class="motion-cursor__ring"><span class="motion-cursor__label"></span></span>'
  document.body.appendChild(ring)
  const label = ring.querySelector<HTMLElement>('.motion-cursor__label')!
  const dot = ring.querySelector<HTMLElement>('.motion-cursor__dot')!
  const halo = ring.querySelector<HTMLElement>('.motion-cursor__ring')!
  const dx = gsap.quickSetter(dot, 'x', 'px')
  const dy = gsap.quickSetter(dot, 'y', 'px')
  const hx = gsap.quickTo(halo, 'x', { duration: 0.24, ease: 'power3.out' })
  const hy = gsap.quickTo(halo, 'y', { duration: 0.24, ease: 'power3.out' })
  document.documentElement.dataset.cursorMode = 'custom'
  let stuck: HTMLElement | null = null
  const unstick = () => {
    if (!stuck) return
    stuck = null
    halo.style.removeProperty('width')
    halo.style.removeProperty('height')
    halo.style.removeProperty('margin')
  }

  // Scrolling under a still mouse makes the browser fire pointerover on whatever slides beneath
  // it, which would pop a label over the content being read. Labels stay folded until the mouse
  // itself moves again.
  const quiet = () => {
    ring.dataset.quiet = 'true'
  }
  // A mouse left still is set down: after a short rest the cursor fades, so it never sits on
  // top of the words the reader is scrolling through. The next move brings it straight back.
  let restTimer = 0
  const rest = () => {
    ring.dataset.rest = 'true'
  }
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    ring.dataset.visible = 'true'
    delete ring.dataset.quiet
    delete ring.dataset.rest
    window.clearTimeout(restTimer)
    restTimer = window.setTimeout(rest, 1600)
    dx(event.clientX)
    dy(event.clientY)
    if (stuck) {
      // The button itself leans toward the pointer, so its box is read fresh on every move.
      const box = stuck.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const w = box.width + 16
      const h = box.height + 16
      halo.style.width = `${w}px`
      halo.style.height = `${h}px`
      halo.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`
      hx(cx + (event.clientX - cx) * 0.1)
      hy(cy + (event.clientY - cy) * 0.1)
      return
    }
    hx(event.clientX)
    hy(event.clientY)
  }
  const over = (event: PointerEvent) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], summary')
    if (!target) {
      unstick()
      ring.dataset.state = 'idle'
      label.textContent = ''
      return
    }
    if (!target.dataset.cursor && target.matches('[data-magnetic]')) {
      stuck = target
      ring.dataset.state = 'stick'
      label.textContent = ''
      return
    }
    unstick()
    const text = target.dataset.cursor
    ring.dataset.state = text ? 'label' : 'link'
    ring.dataset.tone = target.closest<HTMLElement>('[data-cursor-tone]')?.dataset.cursorTone ?? 'light'
    label.textContent = text ?? ''
  }
  const leaveWindow = () => {
    ring.dataset.visible = 'false'
  }
  const press = () => {
    ring.dataset.pressed = 'true'
  }
  const release = () => {
    ring.dataset.pressed = 'false'
  }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('scroll', quiet, { passive: true })
  document.addEventListener('pointerover', over, { passive: true })
  document.documentElement.addEventListener('pointerleave', leaveWindow)
  window.addEventListener('pointerdown', press, { passive: true })
  window.addEventListener('pointerup', release, { passive: true })
  cursorCleanup = () => {
    window.clearTimeout(restTimer)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('scroll', quiet)
    document.removeEventListener('pointerover', over)
    document.documentElement.removeEventListener('pointerleave', leaveWindow)
    window.removeEventListener('pointerdown', press)
    window.removeEventListener('pointerup', release)
    ring.remove()
    delete document.documentElement.dataset.cursorMode
    cursorCleanup = null
  }
}

function stopCursor() {
  cursorCleanup?.()
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
  const ctx = gsap.context(() => {
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
    if (finePointer) extra.push(magnetic(root), tilt(root), depth(root), hoverReveal(root))
    // The WebGL photo surface is a desktop treat: it needs a mouse, a wide screen and a
    // connection that has not asked to save data.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (finePointer && !saveData && window.matchMedia(DESKTOP).matches) extra.push(glPhotos(root, () => velocity))
  }, root)

  document.documentElement.dataset.motionReady = 'true'
  // Fonts and lazy images change section heights after first layout.
  const refresh = () => ScrollTrigger.refresh()
  document.fonts?.ready.then(refresh).catch(() => {})
  window.addEventListener('load', refresh, { once: true })

  return () => {
    window.removeEventListener('load', refresh)
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
