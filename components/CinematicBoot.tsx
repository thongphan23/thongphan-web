'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import styles from './CinematicBoot.module.css'

const bootSteps = [
  'Nạp bản đồ Brain2',
  'Kết nối kinh nghiệm thật',
  'Dựng hệ thống AI cá nhân',
  'Mở cổng tài sản số',
]

export default function CinematicBoot() {
  const [hidden, setHidden] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDismissed(true)
      setHidden(true)
      return
    }

    const hideTimer = window.setTimeout(() => setHidden(true), 2380)
    const removeTimer = window.setTimeout(() => setDismissed(true), 2980)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  if (dismissed) return null

  return (
    <div className={`${styles.boot} ${hidden ? styles.bootExit : ''}`} role="status" aria-live="polite" aria-label="Đang mở trải nghiệm Thông Phan">
      <div className={styles.frame} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className={styles.portal}>
        <div className={styles.kicker}>THÔNG PHAN OS / CINEMATIC ENTRY</div>
        <div className={styles.core}>
          <span className={styles.orbit} />
          <span className={styles.orbit} />
          <span className={styles.orbit} />
          <strong>TP</strong>
        </div>
        <div className={styles.bootTitle}>Mở hệ thống AI cá nhân</div>
        <p>Brain2 → tài sản số → dòng tiền thứ hai</p>

        <div className={styles.sequence}>
          {bootSteps.map((step, index) => (
            <span key={step} style={{ '--step': index } as CSSProperties}>{step}</span>
          ))}
        </div>

        <div className={styles.progress} aria-hidden="true"><span /></div>
      </div>

      <button className={styles.skip} type="button" onClick={() => { setHidden(true); window.setTimeout(() => setDismissed(true), 360) }}>
        Vào ngay
      </button>
    </div>
  )
}
