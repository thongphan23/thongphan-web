'use client'

import { Bookmark, BookmarkCheck, Play } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { PublicVideo } from '../../lib/vid/contracts'
import { compactVideoTitle } from '../../lib/vid/presentation'
import styles from './Vid.module.css'
import VidLink from './VidLink'

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = Math.floor(seconds % 60)
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`
}

export default function VideoCard({
  video,
  progress = 0,
  watchLater = false,
  onToggleWatchLater,
  priority = false,
}: {
  video: PublicVideo
  progress?: number
  watchLater?: boolean
  onToggleWatchLater?: (slug: string) => void
  priority?: boolean
}) {
  const displayTitle = compactVideoTitle(video)
  const [previewing, setPreviewing] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  useEffect(() => {
    const stopWhenHidden = () => { if (document.hidden) stopPreview() }
    document.addEventListener('visibilitychange', stopWhenHidden)
    return () => document.removeEventListener('visibilitychange', stopWhenHidden)
  })

  function startPreview() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !video.previewUrl) return
    timer.current = setTimeout(() => setPreviewing(true), 650)
  }

  function stopPreview() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setPreviewing(false)
  }

  return (
    <article className={styles.videoCard} onMouseEnter={startPreview} onMouseLeave={stopPreview} onFocus={startPreview} onBlur={stopPreview}>
      <VidLink className={styles.thumbnailLink} href={`/watch?v=${encodeURIComponent(video.slug)}`} aria-label={`Xem ${displayTitle}`}>
        <span className={`${styles.thumbnail} ${imageFailed ? styles.thumbnailFallback : ''}`}>
          {!imageFailed && (
            <Image
              src={video.thumbnailUrl}
              alt=""
              fill
              unoptimized
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
              onError={() => setImageFailed(true)}
            />
          )}
          {previewing && <Image src={video.previewUrl} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 25vw" aria-hidden="true" />}
          <span className={styles.playGlyph} aria-hidden="true"><Play fill="currentColor" /></span>
          <time className={styles.duration}>{formatDuration(video.durationSeconds)}</time>
          {progress > 0 && (
            <span className={styles.cardProgress} aria-label={`Đã xem ${Math.round(progress)}%`}>
              <span style={{ width: `${Math.min(100, progress)}%` }} />
            </span>
          )}
        </span>
      </VidLink>
      <div className={styles.cardBody}>
        <div>
          <VidLink className={styles.cardTitle} href={`/watch?v=${encodeURIComponent(video.slug)}`} title={video.title}>{displayTitle}</VidLink>
          <p>{video.sourceCreator}</p>
        </div>
        {onToggleWatchLater && (
          <button
            type="button"
            className={styles.saveButton}
            aria-label={watchLater ? `Bỏ ${displayTitle} khỏi Xem sau` : `Lưu ${displayTitle} để xem sau`}
            aria-pressed={watchLater}
            onClick={() => onToggleWatchLater(video.slug)}
          >
            {watchLater ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
          </button>
        )}
      </div>
      <span className={styles.translationBadge}>{video.translationLabel}</span>
    </article>
  )
}
