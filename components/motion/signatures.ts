// Signature interactions: one per showcase page, each built on markup hooks in that page.
// Called from mountMotion inside its gsap.context, so tweens and ScrollTriggers created here
// are reverted with the page; listeners and ticker callbacks are removed by the returned cleanup.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

// Curtains ([data-curtain]): a section that follows a dark stage opens like a sheet of paper
// being laid down, from an inset rounded card to the full bleed as its top reaches the upper third.
// data-curtain="sheet" goes further on wide screens: the stage before it holds still and dims while
// the sheet slides up over it, so the page turns instead of cutting from ink to paper.
export function curtains(root: HTMLElement): Cleanup {
  const mm = gsap.matchMedia()
  for (const el of root.querySelectorAll<HTMLElement>('[data-curtain]')) {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0% 6% 0% 6% round 28px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: true },
      },
    )
    const under = el.dataset.curtain === 'sheet' ? el.previousElementSibling : null
    if (!(under instanceof HTMLElement)) continue
    mm.add(WIDE, () => {
      ScrollTrigger.create({ trigger: under, start: 'top top', end: 'bottom top', pin: true, pinSpacing: false })
      gsap.fromTo(
        under,
        { opacity: 1 },
        { opacity: 0.28, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true } },
      )
    })
  }
  return () => mm.revert()
}

// Tensai stage ([data-device-stage]): the real app screen ([data-device]) starts turned away like a
// device on a desk. Explicit from/to values, because GSAP cannot reliably read a 3D rotation back
// out of the CSS matrix it starts from.
// - Wide screens pin the hero. The words step back to the left; the screen squares up, grows and
//   settles right of centre; then the lesson question ([data-device-card]) rises out of it into the
//   space on the left, where it can be answered. The chips only move on x, because their y belongs to
//   the scroll parallax (data-speed).
// - Phones keep the plain turn while the hero scrolls away, with the words fading out above it.
export function deviceStage(root: HTMLElement): Cleanup {
  const stage = root.querySelector<HTMLElement>('[data-device-stage]')
  const device = stage?.querySelector<HTMLElement>('[data-device]')
  if (!stage || !device) return () => {}

  const words = stage.querySelector<HTMLElement>('[data-device-words]')
  const figure = stage.querySelector<HTMLElement>('[data-device-figure]')
  const card = stage.querySelector<HTMLElement>('[data-device-card]')
  const aside = stage.querySelectorAll<HTMLElement>('[data-device-aside] > *')
  const drift = Array.from(stage.querySelectorAll<HTMLElement>('[data-device-drift]'))
  const mm = gsap.matchMedia()

  mm.add('(min-width: 960px)', () => {
    if (!figure) return
    // The stage sits just under the fixed header; pinning from where it rests starts the sequence with
    // the first scroll.
    const restTop = Math.max(0, stage.getBoundingClientRect().top + window.scrollY)
    // Offsets inside the stage, from layout boxes, so they ignore this timeline's own transforms and
    // read the same whether or not the stage is pinned.
    const within = (el: HTMLElement) => {
      let left = 0
      let top = 0
      for (let node: HTMLElement | null = el; node && node !== stage; node = node.offsetParent as HTMLElement | null) {
        left += node.offsetLeft
        top += node.offsetTop
      }
      return { left, top }
    }
    const stageLeft = () => (window.innerWidth - stage.offsetWidth) / 2
    const room = () => window.innerHeight - restTop
    const grow = () =>
      gsap.utils.clamp(
        1,
        1.36,
        Math.min((window.innerWidth * 0.56) / device.offsetWidth, (room() - 96) / device.offsetHeight),
      )
    const deviceShift = () => {
      const at = within(device)
      return {
        x: window.innerWidth * 0.62 - (stageLeft() + at.left + device.offsetWidth / 2),
        y: room() / 2 - (at.top + device.offsetHeight / 2),
      }
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: () => `top ${restTop}px`,
        end: '+=130%',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    if (words) timeline.to(words, { x: () => -window.innerWidth * 0.08, opacity: 0, duration: 0.4 }, 0)
    if (aside.length) timeline.to(aside, { x: () => window.innerWidth * 0.06, opacity: 0, duration: 0.4 }, 0)
    timeline
      .to(figure, { x: () => deviceShift().x, y: () => deviceShift().y, duration: 0.65, ease: 'power1.inOut' }, 0)
      .fromTo(
        device,
        { rotationY: -16, rotationX: 8, transformPerspective: 1600, scale: 1 },
        { rotationY: 0, rotationX: 0, scale: grow, duration: 0.65, ease: 'power1.inOut' },
        0,
      )
    drift.forEach((el) => {
      const toward = Number(el.dataset.deviceDrift ?? 0)
      timeline.to(el, { x: () => toward * window.innerWidth, duration: 0.65 }, 0)
    })
    if (card) {
      // The card lives inside the figure, so its target is measured from the figure's own move.
      // Short screens shrink the card to fit under the header (scaled from its top-left corner).
      const fit = () => Math.min(1, (room() - 40) / card.offsetHeight)
      const cardShift = () => {
        const at = within(card)
        const figureMove = deviceShift()
        return {
          x: window.innerWidth * 0.07 - (stageLeft() + at.left) - figureMove.x,
          y: (room() - card.offsetHeight * fit()) / 2 - at.top - figureMove.y,
        }
      }
      gsap.set(card, { transformOrigin: '0 0' })
      timeline.fromTo(
        card,
        {
          x: () => cardShift().x + window.innerWidth * 0.04,
          y: () => cardShift().y + window.innerHeight * 0.4,
          rotation: 4,
          scale: fit,
          opacity: 0,
        },
        { x: () => cardShift().x, y: () => cardShift().y, rotation: 0, scale: fit, opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.45,
      )
      timeline.to({}, { duration: 0.15 })
    }
  })

  mm.add('(max-width: 959px)', () => {
    const scroll = { trigger: stage, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    gsap.fromTo(
      device,
      { rotationY: -7, rotationX: 5, transformPerspective: 1600, scale: 1, yPercent: 0 },
      { rotationY: 0, rotationX: 0, scale: 1.02, yPercent: -2, ease: 'none', scrollTrigger: { ...scroll, end: 'bottom 20%' } },
    )
    if (words) gsap.to(words, { y: () => -window.innerHeight * 0.12, opacity: 0.12, ease: 'none', scrollTrigger: scroll })
  })

  return () => mm.revert()
}

// Chapter rail ([data-chapters]): a reading-progress pill for the about page's five acts.
// - Each act ([data-chapter]) that crosses the reading line becomes the rail's --active row, so
//   the number and title roll to it, and its link ([data-chapter-link]) gets aria-current.
// - Each link's --progress tracks how far its act has been read.
// - Each act's numeral ([data-chapter-numeral]) fills with lacquer (--fill) as the act arrives.
// - The rail shows only while the acts fill the screen (data-visible).
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

  return () => {
    delete rail.dataset.visible
    rail.style.removeProperty('--active')
    links.forEach((link) => {
      link.removeAttribute('aria-current')
      link.style.removeProperty('--progress')
    })
  }
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
