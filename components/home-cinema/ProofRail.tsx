'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import styles from './HomeCinema.module.css'

export default function ProofRail({ children }: { children: ReactNode }) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rail = event.currentTarget
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reducedMotion ? 'auto' : 'smooth'
    const step = Math.min(rail.clientWidth * 0.82, 900)

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      rail.scrollBy({ left: event.key === 'ArrowLeft' ? -step : step, behavior })
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior })
    }
  }

  return (
    <div
      className={styles.proofRail}
      tabIndex={0}
      aria-label="Dải bằng chứng, có thể cuộn ngang"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
