'use client'

import { useEffect, useState } from 'react'
import { getPlaylist, listVideos } from '../../lib/vid/api-client'
import type { PublicVideo } from '../../lib/vid/contracts'
import { filterVideos } from '../../lib/vid/discovery'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'
import { useLocalLibraryState } from './useLocalLibraryState'

async function fetchCatalogView(view: 'results' | 'topic' | 'playlist', signal: AbortSignal) {
  const params = new URLSearchParams(window.location.search)
  if (view === 'playlist') {
    const slug = params.get('list') || 'all'
    if (slug !== 'all') {
      const playlist = await getPlaylist(slug, { signal })
      return { videos: playlist.items, heading: playlist.title }
    }
    const catalog = await listVideos({ pageSize: 48 }, { signal })
    return { videos: catalog.items, heading: 'Danh sách phát' }
  }
  const query = view === 'results' ? params.get('search_query')?.trim() ?? '' : ''
  const topic = view === 'topic' ? params.get('slug') ?? 'all' : undefined
  const selectedTopic = topic === 'all' ? undefined : topic
  const catalog = await listVideos({ pageSize: 48, query, topic: selectedTopic }, { signal })
  return {
    videos: filterVideos(catalog.items, query, selectedTopic),
    heading: view === 'results'
      ? (query ? `Kết quả cho “${query}”` : 'Tìm trong thư viện')
      : topic === 'all' ? 'Tất cả chủ đề' : `Chủ đề: ${topic}`,
  }
}

export default function CatalogView({ view }: { view: 'results' | 'topic' | 'playlist' }) {
  const [videos, setVideos] = useState<PublicVideo[]>([])
  const [heading, setHeading] = useState('Tất cả video')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { library, toggleLater } = useLocalLibraryState()

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
      setError('Kết nối mất quá nhiều thời gian. Hãy thử lại.')
      setLoading(false)
    }, 8_000)
    void fetchCatalogView(view, controller.signal)
      .then((result) => {
        setVideos(result.videos)
        setHeading(result.heading)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Kết nối bị gián đoạn.')
      })
      .finally(() => {
        window.clearTimeout(timeout)
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [view])

  return (
    <section className={styles.catalogPage} aria-labelledby="catalog-title">
      <header className={styles.pageHeading}><p>THÔNG PHAN SCREENING ROOM</p><h1 id="catalog-title">{heading}</h1></header>
      <VideoGrid videos={videos} library={library} loading={loading} error={error} emptyTitle="Chưa có video phù hợp" emptyBody="Thử một từ khóa hoặc chủ đề khác trong thư viện." onRetry={() => window.location.reload()} onToggleWatchLater={toggleLater} />
    </section>
  )
}
