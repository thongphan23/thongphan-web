// Motion engine for the showcase pages (/, /tensai, /conan, /about).
// Loaded with a dynamic import from MotionKernel so none of this counts toward the
// first-load JS budget. Every effect is driven by data attributes in the page markup,
// so pages stay server components and work without JavaScript.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { glPhotos } from './gl-photo'
import { chapterRail, curtains, deviceStage, stageHero, stickySwap } from './signatures'

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
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 42%', scrub: true },
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
    mm.add({ wide: DESKTOP, narrow: '(max-width: 899px)' }, (context) => {
      const wide = Boolean(context.conditions?.wide)
      section.dataset.zoomActive = 'true'
      const fromSlot = () => {
        const box = stage.getBoundingClientRect()
        const hole = slot.getBoundingClientRect()
        return `inset(${hole.top - box.top}px ${box.right - hole.right}px ${box.bottom - hole.bottom}px ${hole.left - box.left}px round 6px)`
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
            end: '+=170%',
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(media, { clipPath: fromSlot }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'power3.inOut', duration: 1 }, 0)
        .fromTo(image, { scale: 1.5 }, { scale: 1, ease: 'power2.inOut', duration: 1.1 }, 0)
        .to(left, { ...part(-1), autoAlpha: 0, ease: 'power2.in', duration: 0.75 }, 0.05)
        .to(right, { ...part(1), autoAlpha: 0, ease: 'power2.in', duration: 0.75 }, 0.05)
        .fromTo(after, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.3, stagger: 0.06 }, 0.95)
        .to({}, { duration: 0.35 })
      return () => {
        delete section.dataset.zoomActive
      }
    })
  })
}

// Pinned sections whose content travels sideways while the page scrolls down.
function horizontalScroll(root: HTMLElement, mm: gsap.MatchMedia) {
  root.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
    const track = section.querySelector<HTMLElement>('[data-hscroll-track]')
    if (!track) return
    mm.add(DESKTOP, () => {
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
      section.dataset.hscrollActive = 'true'
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => section.style.setProperty('--hscroll-progress', self.progress.toFixed(4)),
        },
      })
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
      // The item crossing the middle of the screen is marked current, so CSS can light it up.
      const items = Array.from(track.querySelectorAll<HTMLElement>('[data-hscroll-item]'))
      items.forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          containerAnimation: tween,
          start: 'left 62%',
          end: 'right 62%',
          onToggle: (self) => item.toggleAttribute('data-current', self.isActive),
        })
      })
      return () => {
        delete section.dataset.hscrollActive
        section.style.removeProperty('--hscroll-progress')
        items.forEach((item) => item.removeAttribute('data-current'))
      }
    })
  })
}

// Stacked cards: each card pins under the header while the next one slides over it.
function stackCards(root: HTMLElement, mm: gsap.MatchMedia) {
  root.querySelectorAll<HTMLElement>('[data-stack]').forEach((stack) => {
    const cards = Array.from(stack.querySelectorAll<HTMLElement>('[data-stack-card]'))
    mm.add(DESKTOP, () => {
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return
        gsap.to(card, {
          scale: 0.92 + index * 0.015,
          opacity: 0.45,
          filter: 'brightness(0.7)',
          ease: 'none',
          scrollTrigger: {
            trigger: cards[index + 1],
            start: 'top bottom',
            end: 'top 20%',
            scrub: true,
          },
        })
      })
    })
  })
}

// Section colour handoffs: the page background eases between themes as sections arrive.
function themeShifts(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-theme-shift]').forEach((section) => {
    const target = section.closest<HTMLElement>('[data-motion-stage]')
    if (!target) return
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) target.dataset.stageTheme = section.dataset.themeShift
      },
    })
  })
}

// Real numbers count up when they arrive. Markup carries the final value for no-JS and SEO.
function counters(root: HTMLElement) {
  const formatter = new Intl.NumberFormat('vi-VN')
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = numberAttr(el, 'count', 0)
    const state = { value: 0 }
    el.textContent = formatter.format(0)
    gsap.to(state, {
      value: target,
      duration: 2.2,
      ease: 'expo.out',
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
  const hx = gsap.quickTo(halo, 'x', { duration: 0.42, ease: 'power3.out' })
  const hy = gsap.quickTo(halo, 'y', { duration: 0.42, ease: 'power3.out' })
  document.documentElement.dataset.cursorMode = 'custom'

  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    ring.dataset.visible = 'true'
    dx(event.clientX)
    dy(event.clientY)
    hx(event.clientX)
    hy(event.clientY)
  }
  const over = (event: PointerEvent) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], summary')
    if (!target) {
      ring.dataset.state = 'idle'
      label.textContent = ''
      return
    }
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
  document.addEventListener('pointerover', over, { passive: true })
  document.documentElement.addEventListener('pointerleave', leaveWindow)
  window.addEventListener('pointerdown', press, { passive: true })
  window.addEventListener('pointerup', release, { passive: true })
  cursorCleanup = () => {
    window.removeEventListener('pointermove', move)
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
    themeShifts(root)
    counters(root)
    extra.push(marquees(root), velocitySkew(root), stageHero(root), deviceStage(root), stickySwap(root), chapterRail(root), curtains(root))
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
