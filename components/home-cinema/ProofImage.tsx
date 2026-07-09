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
}

export default function ProofImage({ src, alt, sizes, className, priority = false }: ProofImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`${styles.proofImageFrame} ${className ?? ''}`} data-image-failed={failed || undefined}>
      {failed ? (
        <p className={styles.imageFallback} aria-live="polite">Không tải được ảnh tư liệu</p>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.proofImage}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
