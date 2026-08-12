'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import styles from './Vid.module.css'

type TimeUpdate = { seconds: number; duration: number }
export type PlaybackProgressReason = 'timeupdate' | 'pause' | 'ended' | 'pagehide'
export type PlaybackProgressEvent = TimeUpdate & { reason: PlaybackProgressReason }
type PlayerCallback = (data?: TimeUpdate) => void
type PlayerInstance = {
  on(event: string, callback: PlayerCallback): void
  off(event: string, callback?: PlayerCallback): void
  setCurrentTime(seconds: number): void
}

const PLAYER_ERROR_MESSAGE = 'Không thể phát video lúc này. Hãy thử lại sau.'

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
  onTimeUpdate: (data: PlaybackProgressEvent) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const latestTime = useRef<TimeUpdate | null>(null)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const startSnapshotRef = useRef({ playerUrl, seconds: startSeconds })
  const [scriptReady, setScriptReady] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const embedUrl = safeEmbedUrl(playerUrl)

  useEffect(() => {
    startSnapshotRef.current = { playerUrl, seconds: startSeconds }
  }, [playerUrl, startSeconds])

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
  }, [onTimeUpdate])

  useEffect(() => {
    const frame = iframeRef.current
    const Player = window.playerjs?.Player
    if (!safeEmbedUrl(playerUrl) || !scriptReady || !frame || !Player) return
    let active = true
    let player: PlayerInstance
    try {
      player = new Player(frame)
    } catch {
      queueMicrotask(() => { if (active) setPlayerError(PLAYER_ERROR_MESSAGE) })
      return () => { active = false }
    }
    latestTime.current = null
    const emitProgress = (data: TimeUpdate, reason: PlaybackProgressReason) => {
      if (active) onTimeUpdateRef.current({ ...data, reason })
    }
    const update = (data?: TimeUpdate) => {
      if (data && Number.isFinite(data.seconds) && Number.isFinite(data.duration) && data.duration > 0) {
        latestTime.current = data
        emitProgress(data, 'timeupdate')
      }
    }
    const flush = (reason: Exclude<PlaybackProgressReason, 'timeupdate'>) => {
      if (latestTime.current) emitProgress(latestTime.current, reason)
    }
    const pause = () => flush('pause')
    const ended = () => flush('ended')
    const pagehide = () => flush('pagehide')
    const ready = () => {
      const initialStart = startSnapshotRef.current.seconds
      if (initialStart >= 10) player.setCurrentTime(initialStart)
      player.on('timeupdate', update)
      player.on('pause', pause)
      player.on('ended', ended)
    }
    const playerFailed = () => {
      if (active) setPlayerError(PLAYER_ERROR_MESSAGE)
    }
    player.on('ready', ready)
    player.on('error', playerFailed)
    window.addEventListener('pagehide', pagehide)
    return () => {
      active = false
      window.removeEventListener('pagehide', pagehide)
      player.off('ready', ready)
      player.off('error', playerFailed)
      player.off('timeupdate', update)
      player.off('pause', pause)
      player.off('ended', ended)
    }
  }, [playerUrl, scriptReady])

  if (!embedUrl) return <div className={styles.playerError} role="alert">Nguồn phát video không hợp lệ.</div>
  if (playerError) return <div className={styles.playerError} role="alert">{playerError}</div>

  return (
    <div className={styles.playerFrame}>
      <Script
        src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setPlayerError(PLAYER_ERROR_MESSAGE)}
      />
      {scriptReady && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          loading="eager"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}
