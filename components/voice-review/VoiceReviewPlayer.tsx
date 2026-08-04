'use client'

import { useRef } from 'react'
import styles from '@/app/voice/page.module.css'

const tracks = [
  {
    id: 'MB',
    name: 'Mèo béo',
    duration: '1 phút 49 giây',
    src: '/voice/audio/meo-beo-noi-nho-nha.mp3',
  },
] as const

export default function VoiceReviewPlayer() {
  const players = useRef<Record<string, HTMLAudioElement | null>>({})

  const handlePlay = (activeId: string) => {
    for (const [id, player] of Object.entries(players.current)) {
      if (id !== activeId && player && !player.paused) player.pause()
    }
  }

  return (
    <section className={styles.playerList} aria-label="Bản voice Mèo béo cần đánh giá">
      {tracks.map((track, index) => (
        <article className={styles.track} key={track.id}>
          <div className={styles.trackIdentity} aria-hidden="true">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{track.id}</strong>
          </div>
          <div className={styles.trackBody}>
            <header>
              <h2>{track.name}</h2>
              <p>{track.duration}</p>
            </header>
            <audio
              ref={(node) => { players.current[track.id] = node }}
              controls
              preload="metadata"
              onPlay={() => handlePlay(track.id)}
              aria-label={`Phát bản voice ${track.name}`}
            >
              <source src={track.src} type="audio/mpeg" />
              Trình duyệt này không hỗ trợ âm thanh MP3.
            </audio>
          </div>
        </article>
      ))}
    </section>
  )
}
