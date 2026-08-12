'use client'

import { Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Clock3, ExternalLink, Link2, Share2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPlaylist, getVideo, listVideos } from '../../lib/vid/api-client'
import type { PublicVideo } from '../../lib/vid/contracts'
import { rankRelated } from '../../lib/vid/discovery'
import BunnyPlayer from './BunnyPlayer'
import VideoCard from './VideoCard'
import styles from './Vid.module.css'
import { useLocalLibraryState } from './useLocalLibraryState'
import VidLink from './VidLink'

async function fetchWatchData(slug: string, playlistSlug: string | null, signal: AbortSignal) {
  const [video, catalog, playlist] = await Promise.all([
    getVideo(slug, { signal }),
    listVideos({ pageSize: 48 }, { signal }),
    playlistSlug ? getPlaylist(playlistSlug, { signal }) : Promise.resolve(null),
  ])
  const ranked = rankRelated(video, catalog.items)
  const related = [...ranked, ...catalog.items.filter((item) => item.slug !== slug && !ranked.some((rankedItem) => rankedItem.slug === item.slug))].slice(0, 10)
  const position = playlist?.items.findIndex((item) => item.slug === slug) ?? -1
  return {
    video,
    related,
    playlistSlug,
    previous: position > 0 ? playlist?.items[position - 1] ?? null : null,
    next: position >= 0 ? playlist?.items[position + 1] ?? null : null,
  }
}

function sharedStart(value: string | null) {
  const match = value?.match(/^(\d+)s?$/)
  return match ? Number(match[1]) : 0
}

export default function WatchView() {
  const [video, setVideo] = useState<PublicVideo | null>(null)
  const [related, setRelated] = useState<PublicVideo[]>([])
  const [playlistSlug, setPlaylistSlug] = useState<string | null>(null)
  const [previous, setPrevious] = useState<PublicVideo | null>(null)
  const [next, setNext] = useState<PublicVideo | null>(null)
  const [requestedStart, setRequestedStart] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [copied, setCopied] = useState<'link' | 'time' | null>(null)
  const lastSavedSecond = useRef(0)
  const { library, toggleLater, recordVideoProgress } = useLocalLibraryState()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('v') ?? ''
    const list = params.get('list')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
      setError('Kết nối mất quá nhiều thời gian. Hãy thử lại.')
      setLoading(false)
    }, 8_000)
    if (!slug) {
      queueMicrotask(() => {
        setError('Liên kết video chưa có mã nhận diện.')
        setLoading(false)
      })
      return () => { window.clearTimeout(timeout); controller.abort() }
    }
    void fetchWatchData(slug, list, controller.signal)
      .then((result) => {
        setVideo(result.video)
        setRelated(result.related)
        setPlaylistSlug(result.playlistSlug)
        setPrevious(result.previous)
        setNext(result.next)
        setRequestedStart(sharedStart(params.get('t')))
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Không tải được video.')
      })
      .finally(() => {
        window.clearTimeout(timeout)
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [])

  const handleTimeUpdate = useCallback(({ seconds, duration }: { seconds: number; duration: number }) => {
    setCurrentTime(seconds)
    if (!video || Math.abs(seconds - lastSavedSecond.current) < 5) return
    lastSavedSecond.current = seconds
    recordVideoProgress(video.slug, seconds, duration)
  }, [recordVideoProgress, video])

  async function copyUrl(kind: 'link' | 'time') {
    const url = new URL(window.location.href)
    if (kind === 'time') url.searchParams.set('t', `${Math.floor(currentTime)}s`)
    else url.searchParams.delete('t')
    await navigator.clipboard.writeText(url.toString())
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1800)
  }

  async function shareVideo() {
    if (navigator.share) {
      await navigator.share({ title: video?.title, url: window.location.href })
      return
    }
    await copyUrl('link')
  }

  if (loading) return <div className={styles.playerLoading} aria-live="polite"><span /></div>
  if (error || !video) return <div className={styles.statePanel} role="alert"><h1>Không mở được video</h1><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Thử lại</button></div>

  const saved = library.watchLater.includes(video.slug)
  const prior = Math.max(library.progress.find(({ slug }) => slug === video.slug)?.seconds ?? 0, requestedStart)

  return (
    <div className={styles.watchLayout}>
      <article className={styles.watchPrimary}>
        <BunnyPlayer playerUrl={video.playerUrl} title={video.title} startSeconds={prior} onTimeUpdate={handleTimeUpdate} />
        <header className={styles.watchHeader}>
          <p>{video.topics.map((topic) => <VidLink key={topic} href={`/topic?slug=${encodeURIComponent(topic)}`}>{topic}</VidLink>)}</p>
          <h1>{video.title}</h1>
          <div className={styles.watchActions}>
            <button type="button" onClick={() => toggleLater(video.slug)} aria-pressed={saved}>{saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}{saved ? 'Đã lưu' : 'Xem sau'}</button>
            <button type="button" onClick={() => void copyUrl('link')}>{copied === 'link' ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}Sao chép liên kết</button>
            <button type="button" onClick={() => void shareVideo()}><Share2 aria-hidden="true" />Chia sẻ</button>
            <button type="button" onClick={() => void copyUrl('time')}>{copied === 'time' ? <Check aria-hidden="true" /> : <Clock3 aria-hidden="true" />}Sao chép tại thời điểm này</button>
          </div>
          {(previous || next) && <nav className={styles.episodeNav} aria-label="Điều hướng danh sách phát">
            {previous ? <VidLink href={`/watch?v=${encodeURIComponent(previous.slug)}&list=${encodeURIComponent(playlistSlug ?? '')}`}><ChevronLeft aria-hidden="true" /><span>Video trước<strong>{previous.title}</strong></span></VidLink> : <span />}
            {next && <VidLink href={`/watch?v=${encodeURIComponent(next.slug)}&list=${encodeURIComponent(playlistSlug ?? '')}`}><span>Video tiếp<strong>{next.title}</strong></span><ChevronRight aria-hidden="true" /></VidLink>}
          </nav>}
        </header>

        <section className={styles.provenance} aria-labelledby="source-title">
          <div><span>NGUỒN GỐC</span><h2 id="source-title"><a href={video.sourceCreatorUrl} target="_blank" rel="noopener noreferrer">{video.sourceCreator}</a></h2><p>{video.sourceTitle}</p></div>
          <a href={video.sourceVideoUrl} target="_blank" rel="noopener noreferrer">Xem video gốc <ExternalLink aria-hidden="true" /></a>
          <strong>{video.translationLabel || 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn'}</strong>
        </section>

        <details className={styles.description}>
          <summary>Mô tả và thông tin video</summary>
          <p>{video.description}</p>
          <div>{video.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </details>
      </article>

      <aside className={styles.relatedRail} aria-labelledby="related-title">
        <h2 id="related-title">Video liên quan</h2>
        {related.length ? related.map((item) => <VideoCard key={item.slug} video={item} watchLater={library.watchLater.includes(item.slug)} onToggleWatchLater={toggleLater} />) : <p>Chưa có video liên quan trong cùng chủ đề.</p>}
      </aside>
    </div>
  )
}
