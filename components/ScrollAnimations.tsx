'use client'

import { useEffect } from 'react'

const revealSelector = [
  '[data-motion-reveal]',
  '[data-cinema-reveal]',
  '[data-focus-pull]',
  '[data-evidence-stamp]',
].join(', ')

function revealFinalState(targets: HTMLElement[]) {
  targets.forEach((target) => {
    target.style.removeProperty('clip-path')
    target.style.removeProperty('filter')
    target.style.removeProperty('opacity')
    target.style.removeProperty('transform')
    target.classList.add('revealed')
  })
}

export default function ScrollAnimations() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const progressBar = document.querySelector<HTMLElement>('[data-scroll-progress]')
    const unifiedShell = document.querySelector<HTMLElement>('[data-site-shell="unified"]')
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector))
    const parallaxTargets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-motion-parallax]'),
    )
    let disposed = false
    let progressFrame = 0
    let setupGeneration = 0
    let disposeCinemaMotion = () => {}

    const updateScrollProgress = () => {
      progressFrame = 0
      if (!progressBar) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressBar.style.transform = `scaleX(${progress})`
    }

    const scheduleScrollProgress = () => {
      if (!progressFrame) progressFrame = window.requestAnimationFrame(updateScrollProgress)
    }

    scheduleScrollProgress()
    window.addEventListener('scroll', scheduleScrollProgress, { passive: true })
    window.addEventListener('resize', scheduleScrollProgress)

    if (!unifiedShell) {
      const legacyTargets = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger]'),
      )
      if (reducedMotion.matches) {
        legacyTargets.forEach((target) => target.classList.add('revealed'))
      } else {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const target = entry.target as HTMLElement
            target.classList.add('revealed')
            observer.unobserve(target)
          })
        }, { threshold: 0.08, rootMargin: '0px 0px 12% 0px' })
        legacyTargets.forEach((target) => observer.observe(target))
        disposeCinemaMotion = () => observer.disconnect()
      }
    }

    const setupUnifiedMotion = async () => {
      setupGeneration += 1
      const generation = setupGeneration
      disposeCinemaMotion()
      disposeCinemaMotion = () => {}

      if (!unifiedShell || reducedMotion.matches) {
        revealFinalState([...revealTargets, ...parallaxTargets])
        return
      }

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (disposed || generation !== setupGeneration || reducedMotion.matches) return

      gsap.registerPlugin(ScrollTrigger)
      const triggers: Array<{ kill: () => void }> = []
      const scrollProfile = document.querySelector<HTMLElement>('[data-scroll-motion]')
        ?.dataset.scrollMotion ?? 'medium'
      const context = gsap.context(() => {
        revealTargets.forEach((target) => {
          const explicitVariant = target.dataset.motionReveal
          const variant = explicitVariant
            ?? (target.matches('[data-focus-pull]') ? 'focus' : null)
            ?? (target.matches('[data-evidence-stamp]') ? 'stamp' : 'fade')

          if (scrollProfile === 'minimal' && !explicitVariant) return

          const from = variant === 'drift'
            ? { opacity: 0, x: 28 }
            : variant === 'mask'
              ? { opacity: 0, clipPath: 'inset(0 0 100% 0)' }
              : variant === 'focus'
                ? { filter: 'blur(6px)', opacity: 0.55, scale: 0.992 }
                : variant === 'stamp'
                  ? { opacity: 0.45, rotation: -8, scale: 0.94 }
                  : { opacity: 0.72, y: 12 }

          gsap.fromTo(target, from, {
            clipPath: 'inset(0 0 0% 0)',
            duration: variant === 'focus' ? 0.84 : 0.72,
            ease: 'power3.out',
            filter: 'blur(0px)',
            opacity: 1,
            rotation: variant === 'stamp' ? -4 : 0,
            scale: 1,
            scrollTrigger: {
              trigger: target,
              start: 'top 88%',
              once: true,
            },
            x: 0,
            y: 0,
          })
        })

        if (scrollProfile === 'full') {
          parallaxTargets.forEach((target) => {
            const requested = Number(target.dataset.parallaxMax ?? 18)
            const distance = Math.min(18, Math.max(0, Number.isFinite(requested) ? requested : 18))
            const trigger = ScrollTrigger.create({
              trigger: target,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              onUpdate: (self) => gsap.set(target, { force3D: true, y: self.progress * distance }),
            })
            triggers.push(trigger)
          })
        }
      })

      disposeCinemaMotion = () => {
        context.revert()
        triggers.forEach((trigger) => trigger.kill())
        revealFinalState([...revealTargets, ...parallaxTargets])
      }
    }

    void setupUnifiedMotion()
    reducedMotion.addEventListener('change', setupUnifiedMotion)

    return () => {
      disposed = true
      setupGeneration += 1
      reducedMotion.removeEventListener('change', setupUnifiedMotion)
      window.removeEventListener('scroll', scheduleScrollProgress)
      window.removeEventListener('resize', scheduleScrollProgress)
      if (progressFrame) window.cancelAnimationFrame(progressFrame)
      disposeCinemaMotion()
    }
  }, [])

  return null
}
