// Signature interactions: one per showcase page, each built on markup hooks in that page.
// Called from mountMotion inside its gsap.context, so tweens and ScrollTriggers created here
// are reverted with the page; listeners and ticker callbacks are removed by the returned cleanup.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Cleanup = () => void

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

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
export function curtains(root: HTMLElement): Cleanup {
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
  }
  return () => {}
}

// Tensai stage ([data-device-stage]): the real app screen ([data-device]) starts turned away like a
// device on a desk and squares up to the reader as the hero scrolls out. Explicit from/to values,
// because GSAP cannot reliably read a 3D rotation back out of the CSS matrix it starts from.
export function deviceStage(root: HTMLElement): Cleanup {
  const stage = root.querySelector<HTMLElement>('[data-device-stage]')
  const device = stage?.querySelector<HTMLElement>('[data-device]')
  if (!stage || !device) return () => {}

  const narrow = window.matchMedia('(max-width: 959px)').matches
  gsap.fromTo(
    device,
    { rotationY: narrow ? -7 : -16, rotationX: narrow ? 5 : 8, transformPerspective: 1600, scale: 1, yPercent: 0 },
    {
      rotationY: 0,
      rotationX: 0,
      scale: narrow ? 1.02 : 1.06,
      yPercent: narrow ? -2 : -6,
      ease: 'none',
      scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom 20%', scrub: true },
    },
  )
  return () => {}
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
