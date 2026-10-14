'use client'

import { useLayoutEffect } from 'react'

type MotionKernelProps = {
  pathname: string
}

type Engine = typeof import('./engine')

let engine: Promise<Engine> | null = null

function loadEngine() {
  engine ??= import('./engine')
  return engine
}

function showFinalState() {
  document.documentElement.classList.remove('motion')
}

// Mounts the motion engine for the page on screen and remounts it after every
// client-side navigation. Pages without [data-motion-stage] never download the engine,
// and under reduced motion nothing loads, so the page stays static.
export default function MotionKernel({ pathname }: MotionKernelProps) {
  // Layout effect: with the engine already cached, the next page mounts before its first paint.
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-motion-stage]')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!root || reducedMotion.matches) {
      showFinalState()
      // Leaving a showcase page turns smooth scroll and the custom cursor off.
      void engine?.then(({ teardownMotion }) => teardownMotion())
      return
    }

    document.documentElement.classList.add('motion')
    let disposed = false
    let cleanup = () => {}
    loadEngine()
      .then(({ mountMotion }) => {
        if (disposed) return
        cleanup = mountMotion(root, { stage: true })
      })
      .catch(showFinalState)

    const stopForReducedMotion = () => {
      if (!reducedMotion.matches) return
      cleanup()
      cleanup = () => {}
      showFinalState()
      void engine?.then(({ teardownMotion }) => teardownMotion())
    }
    reducedMotion.addEventListener('change', stopForReducedMotion)

    return () => {
      disposed = true
      reducedMotion.removeEventListener('change', stopForReducedMotion)
      cleanup()
    }
  }, [pathname])

  return null
}
