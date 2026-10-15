'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './SiteChrome.module.css'

const NAME = 'THÔNG PHAN'

// The footer sits outside the motion stage, so it carries its own small reveal:
// letters rise into the mask once the footer is in view. Without JS (or with
// reduced motion) the boot script never hides them, so the name always reads.
export default function FooterWordmark() {
  const ref = useRef<HTMLParagraphElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <p ref={ref} className={styles.footerName} data-in={inView ? 'true' : 'false'}>
      <span className={styles.srOnly}>{NAME}</span>
      <span className={styles.footerNameLetters} aria-hidden="true">
        {Array.from(NAME).map((letter, index) =>
          letter === ' ' ? (
            <span key={index} className={styles.footerNameGap} />
          ) : (
            <span key={index} className={styles.footerNameLetter} style={{ '--i': index } as CSSProperties}>
              {letter}
            </span>
          ),
        )}
      </span>
    </p>
  )
}
