'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './HomeCinema.module.css'

type ProofImageProps = {
  src: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  focalPoint?: { x: number; y: number }
}

export default function ProofImage({ src, alt, sizes, className, priority = false, focalPoint }: ProofImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <span className={`${styles.proofImageFrame} ${className ?? ''}`} data-image-failed={failed || undefined}>
      {failed ? (
        <span className={styles.imageFallback} aria-live="polite">Không tải được ảnh tư liệu</span>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.proofImage}
          style={focalPoint ? { objectPosition: `${focalPoint.x}% ${focalPoint.y}%` } : undefined}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}
