'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import styles from './Vid.module.css'

type TimeUpdate = { seconds: number; duration: number }
type PlayerInstance = {
  on(event: string, callback: (data: TimeUpdate) => void): void
  off(event: string, callback?: (data: TimeUpdate) => void): void
  setCurrentTime(seconds: number): void
}

declare global {
  interface Window {
    playerjs?: { Player: new (element: HTMLIFrameElement) => PlayerInstance }
  }
}

function safeEmbedUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'player.mediadelivery.net' || !url.pathname.startsWith('/embed/')) return null
    url.searchParams.set('autoplay', 'false')
    url.searchParams.set('preload', 'true')
    url.searchParams.set('playsinline', 'true')
    url.searchParams.set('showSpeed', 'true')
    url.searchParams.set('rememberPosition', 'false')
    return url.toString()
  } catch {
    return null
  }
}

export default function BunnyPlayer({
  playerUrl,
  title,
  startSeconds = 0,
  onTimeUpdate,
}: {
  playerUrl: string
  title: string
  startSeconds?: number
  onTimeUpdate: (data: TimeUpdate) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const latestTime = useRef<TimeUpdate | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const embedUrl = safeEmbedUrl(playerUrl)

  useEffect(() => {
    const frame = iframeRef.current
    const Player = window.playerjs?.Player
    if (!scriptReady || !frame || !Player) return
    const player = new Player(frame)
    const update = (data: TimeUpdate) => {
      if (Number.isFinite(data.seconds) && Number.isFinite(data.duration) && data.duration > 0) {
        latestTime.current = data
        onTimeUpdate(data)
      }
    }
    const flush = () => { if (latestTime.current) onTimeUpdate(latestTime.current) }
    const ready = () => {
      if (startSeconds >= 10) player.setCurrentTime(startSeconds)
      player.on('timeupdate', update)
      player.on('pause', flush)
      player.on('ended', flush)
    }
    player.on('ready', ready)
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      player.off('ready', ready)
      player.off('timeupdate', update)
      player.off('pause', flush)
      player.off('ended', flush)
    }
  }, [onTimeUpdate, scriptReady, startSeconds])

  if (!embedUrl) return <div className={styles.playerError} role="alert">Nguồn phát video không hợp lệ.</div>

  return (
    <div className={styles.playerFrame}>
      <Script src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        loading="eager"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
