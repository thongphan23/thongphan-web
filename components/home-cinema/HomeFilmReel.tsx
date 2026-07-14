'use client'

import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import ProofImage from './ProofImage'
import styles from './HomeCinema.module.css'

export type FilmFrame = {
  heroFrame: string
  slug: string
  image: string
  alt: string
  label: string
  caption: string
  focalPoint?: { x: number; y: number }
}

function FilmTrack({ items, duplicate = false }: { items: readonly FilmFrame[]; duplicate?: boolean }) {
  return (
    <div
      className={`${styles.reelTrack} ${duplicate ? styles.reelTrackDuplicate : ''}`}
      aria-hidden={duplicate ? 'true' : undefined}
      data-reel-duplicate={duplicate || undefined}
    >
      {items.map((item, index) => (
        <article key={`${duplicate ? 'duplicate-' : ''}${item.slug}`} className={styles.heroFrame} data-frame={item.heroFrame}>
          <ProofImage
            src={item.image}
            alt={duplicate ? '' : item.alt}
            sizes="(max-width: 767px) 86vw, 31vw"
            priority={!duplicate && index < 3}
            focalPoint={item.focalPoint}
          />
          <div className={styles.heroFrameCaption}>
            <span>{item.label}</span>
            <strong>{item.caption}</strong>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function HomeFilmReel({ items, canRun }: { items: readonly FilmFrame[]; canRun: boolean }) {
  const isRunning = canRun && items.length >= 6
  const [paused, setPaused] = useState(false)

  return (
    <div
      className={styles.heroFilm}
      data-frame-count={items.length}
      data-reel-running={isRunning || undefined}
      data-reel-paused={isRunning && paused || undefined}
      aria-label={isRunning ? 'Thước phim bằng chứng tự chuyển động' : 'Ba khung bằng chứng mở đầu'}
    >
      <FilmTrack items={items} />
      {isRunning ? <FilmTrack items={items} duplicate /> : null}
      {isRunning ? (
        <button
          type="button"
          className={styles.reelControl}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          <span>{paused ? 'Phát thước phim' : 'Tạm dừng thước phim'}</span>
        </button>
      ) : null}
    </div>
  )
}
