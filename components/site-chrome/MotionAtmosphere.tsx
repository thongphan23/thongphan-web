'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { SiteRouteMode } from '@/lib/site-route-mode'
import { motionProfileForPath } from './motion-profile'
import styles from './SiteChrome.module.css'

type MotionAtmosphereProps = {
  pathname: string
  mode: SiteRouteMode
}

type PointerStyle = CSSProperties & {
  '--pointer-x': string
  '--pointer-y': string
}

export default function MotionAtmosphere({ pathname, mode }: MotionAtmosphereProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const profile = motionProfileForPath(pathname, mode)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0
    let listening = false
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2

    const paintPointer = () => {
      frame = 0
      root.style.setProperty('--pointer-x', `${pointerX}px`)
      root.style.setProperty('--pointer-y', `${pointerY}px`)
    }

    const handlePointer = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(paintPointer)
    }

    const syncPointer = () => {
      const active =
        !reducedMotion.matches &&
        finePointer.matches &&
        profile.pointer !== 'none'

      root.dataset.motionActive = String(active)
      if (active && !listening) {
        window.addEventListener('pointermove', handlePointer, { passive: true })
        listening = true
      } else if (!active && listening) {
        window.removeEventListener('pointermove', handlePointer)
        listening = false
      }
    }

    const syncVisibility = () => {
      root.dataset.pageVisible = String(!document.hidden)
    }

    syncPointer()
    syncVisibility()
    reducedMotion.addEventListener('change', syncPointer)
    finePointer.addEventListener('change', syncPointer)
    document.addEventListener('visibilitychange', syncVisibility)

    return () => {
      if (listening) window.removeEventListener('pointermove', handlePointer)
      reducedMotion.removeEventListener('change', syncPointer)
      finePointer.removeEventListener('change', syncPointer)
      document.removeEventListener('visibilitychange', syncVisibility)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [profile.pointer])

  return (
    <div
      ref={rootRef}
      className={styles.motionAtmosphere}
      data-ambient={profile.ambient}
      data-pointer={profile.pointer}
      data-scroll-motion={profile.scroll}
      data-motion-active="false"
      data-page-visible="true"
      style={{ '--pointer-x': '50vw', '--pointer-y': '45vh' } as PointerStyle}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </div>
  )
}
