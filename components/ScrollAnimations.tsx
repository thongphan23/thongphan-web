'use client'

import { useEffect } from 'react'

const revealTiming: KeyframeAnimationOptions = {
  duration: 720,
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  fill: 'none',
}

export default function ScrollAnimations() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cinemaRoot = document.querySelector<HTMLElement>('[data-cinema-root]')
    const progressBar = document.querySelector<HTMLElement>('[data-scroll-progress]')
    const animations: Animation[] = []
    let progressFrame = 0

    const updateScrollProgress = () => {
      progressFrame = 0
      if (!progressBar) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressBar.style.transform = `scaleX(${progress})`
    }

    const scheduleScrollProgress = () => {
      if (progressFrame) return
      progressFrame = window.requestAnimationFrame(updateScrollProgress)
    }

    scheduleScrollProgress()
    window.addEventListener('scroll', scheduleScrollProgress, { passive: true })
    window.addEventListener('resize', scheduleScrollProgress)

    const legacyTargets = cinemaRoot
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger]'))

    if (reducedMotion.matches) {
      legacyTargets.forEach((target) => target.classList.add('revealed'))
      return () => {
        window.removeEventListener('scroll', scheduleScrollProgress)
        window.removeEventListener('resize', scheduleScrollProgress)
        if (progressFrame) window.cancelAnimationFrame(progressFrame)
      }
    }

    const cinemaTargets = cinemaRoot
      ? Array.from(cinemaRoot.querySelectorAll<HTMLElement>('[data-cinema-reveal], [data-focus-pull], [data-evidence-stamp]'))
      : []

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        observer.unobserve(target)

        if (!cinemaRoot) {
          target.classList.add('revealed')
          return
        }

        if (target.matches('[data-focus-pull]')) {
          animations.push(target.animate([
            { filter: 'blur(6px)', opacity: 0.55, transform: 'scale(0.992)' },
            { filter: 'blur(0)', opacity: 1, transform: 'scale(1)' },
          ], { ...revealTiming, duration: 820 }))
          return
        }

        if (target.matches('[data-evidence-stamp]')) {
          animations.push(target.animate([
            { opacity: 0.45, transform: 'rotate(-8deg) scale(0.94)' },
            { opacity: 1, transform: 'rotate(-8deg) scale(1)' },
          ], { ...revealTiming, duration: 480 }))
          return
        }

        animations.push(target.animate([
          { opacity: 0.48, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], revealTiming))
      })
    }, { threshold: 0.08, rootMargin: '0px 0px 12% 0px' })

    ;[...legacyTargets, ...cinemaTargets].forEach((target) => observer.observe(target))

    return () => {
      window.removeEventListener('scroll', scheduleScrollProgress)
      window.removeEventListener('resize', scheduleScrollProgress)
      if (progressFrame) window.cancelAnimationFrame(progressFrame)
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
    }
  }, [])

  return null
}
