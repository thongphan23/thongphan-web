'use client'

import { useEffect } from 'react'

export default function ScrollAnimations() {
  useEffect(() => {
    let disposed = false
    let gsapContext: { revert: () => void } | undefined
    let mediaContext: any

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const progressBar = document.querySelector<HTMLElement>('[data-scroll-progress]')
    const cinematicTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-cinematic-mouse]'))

    const updateScrollProgress = () => {
      if (!progressBar) return

      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressBar.style.transform = `scaleX(${progress})`
    }

    updateScrollProgress()
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('resize', updateScrollProgress)

    const updateCinematicPointer = (event: PointerEvent) => {
      if (prefersReducedMotion.matches) return

      const pageX = (event.clientX / Math.max(1, window.innerWidth)) * 100
      const pageY = (event.clientY / Math.max(1, window.innerHeight)) * 100
      document.documentElement.style.setProperty('--cursor-x', `${pageX.toFixed(2)}%`)
      document.documentElement.style.setProperty('--cursor-y', `${pageY.toFixed(2)}%`)

      cinematicTargets.forEach((target) => {
        const rect = target.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return

        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2

        target.style.setProperty('--pointer-x', x.toFixed(3))
        target.style.setProperty('--pointer-y', y.toFixed(3))
      })
    }

    if (!prefersReducedMotion.matches) {
      window.addEventListener('pointermove', updateCinematicPointer, { passive: true })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          entry.target.classList.add('revealed')

          const children = entry.target.querySelectorAll('[data-stagger]')
          children.forEach((child, i) => {
            window.setTimeout(() => {
              ;(child as HTMLElement).classList.add('revealed')
            }, i * 120)
          })
        })
      },
      { threshold: 0.04, rootMargin: '0px 0px 160px 0px' }
    )

    document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => {
      observer.observe(el)
    })

    const setupScrollTrigger = async () => {
      if (prefersReducedMotion.matches || !document.querySelector('[data-cinematic-hero]')) return

      const gsapModule = await import('gsap')
      const scrollTriggerModule = await import('gsap/ScrollTrigger')

      if (disposed) return

      const gsap = gsapModule.gsap
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger

      gsap.registerPlugin(ScrollTrigger)

      gsapContext = gsap.context(() => {
        const heroCard = document.querySelector('[data-hero-card]')
        const heroFragments = document.querySelectorAll('[data-hero-fragment]')
        const heroTimeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
        })

        if (heroCard) {
          heroTimeline.fromTo('[data-hero-card]', {
            y: 34,
            rotateY: -8,
            rotateX: 3,
            scale: 0.96,
            opacity: 0,
          }, {
            y: 0,
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            opacity: 1,
            duration: 1.05,
          }, 0)
        }

        if (heroFragments.length) {
          heroTimeline.fromTo('[data-hero-fragment]', {
            y: 28,
            scale: 0.72,
            opacity: 0,
            filter: 'blur(10px)',
          }, {
            y: 0,
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.82,
            stagger: 0.08,
          }, 0.18)
        }

        heroTimeline.fromTo('[data-depth-layer]', {
          y: 26,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.1,
        }, 0.05)

        const heroScrub = gsap.timeline({
          scrollTrigger: {
            trigger: '[data-cinematic-hero]',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })

        if (heroFragments.length) {
          heroScrub.to('[data-hero-fragment]', {
            y: -110,
            scale: 0.84,
            opacity: 0.34,
            stagger: 0.04,
            ease: 'none',
          }, 0)
        }

        if (heroCard) {
          heroScrub.to('[data-hero-card]', {
            y: 34,
            scale: 1.04,
            ease: 'none',
          }, 0)
        }

        heroScrub
          .to('[data-depth-layer="back"]', {
            y: -24,
            ease: 'none',
          }, 0)
          .to('[data-depth-layer="mid"]', {
            y: -54,
            ease: 'none',
          }, 0)
          .to('[data-depth-layer="front"]', {
            y: -88,
            ease: 'none',
          }, 0)

        mediaContext = gsap.matchMedia()
        mediaContext.add('(min-width: 961px)', () => {
          const scenes = gsap.utils.toArray<HTMLElement>('[data-cinematic-scene]')

          scenes.forEach((scene) => {
            const inner = scene.querySelector<HTMLElement>('[data-stage-inner]')
            const items = scene.querySelectorAll<HTMLElement>('[data-scrub-item]')
            const depthLayers = scene.querySelectorAll<HTMLElement>('[data-scene-depth]')

            if (!inner) return

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: scene,
                start: 'top 72%',
                end: 'bottom 28%',
                scrub: 0.7,
              },
            })

            timeline.fromTo(inner, {
              y: 32,
              scale: 0.985,
            }, {
              y: 0,
              scale: 1,
              ease: 'none',
            }, 0)

            if (items.length) {
              timeline.fromTo(items, {
                y: 12,
                opacity: 0.9,
              }, {
                y: 0,
                opacity: 1,
                stagger: 0.08,
                ease: 'none',
              }, 0)
            }

            if (depthLayers.length) {
              timeline.fromTo(depthLayers, {
                y: 46,
                opacity: 0.55,
                filter: 'blur(5px)',
              }, {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                stagger: 0.12,
                ease: 'none',
              }, 0)
            }
          })

          return undefined
        })
      }, document.body)
    }

    void setupScrollTrigger()

    return () => {
      disposed = true
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
      window.removeEventListener('pointermove', updateCinematicPointer)
      observer.disconnect()
      mediaContext?.revert()
      gsapContext?.revert()
    }
  }, [])

  return null
}
