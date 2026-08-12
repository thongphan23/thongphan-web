'use client'

import { useEffect, useState } from 'react'
import { getPlaylist } from '../../lib/vid/api-client'
import type { PublicVideo } from '../../lib/vid/contracts'
import InfiniteVideoFeed from './InfiniteVideoFeed'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'
import { type FeedFilters, useInfiniteVideoFeed } from './useInfiniteVideoFeed'
import { useLocalLibraryState } from './useLocalLibraryState'

function catalogParameters(view: 'results' | 'topic' | 'playlist') {
  const params = new URLSearchParams(window.location.search)
  const query = view === 'results' ? params.get('search_query')?.trim() ?? '' : ''
  const topic = view === 'topic' ? params.get('slug') ?? 'all' : undefined
  return {
    filters: { limit: 24, query, topic: topic === 'all' ? undefined : topic } satisfies FeedFilters,
    heading: view === 'results'
      ? (query ? `Kết quả cho “${query}”` : 'Tìm trong thư viện')
      : topic === 'all' ? 'Tất cả chủ đề' : `Chủ đề: ${topic}`,
  }
}

export default function CatalogView({ view }: { view: 'results' | 'topic' | 'playlist' }) {
  const [filters, setFilters] = useState<FeedFilters>({ limit: 24 })
  const [heading, setHeading] = useState('Tất cả video')
  const [playlist, setPlaylist] = useState<{ title: string; items: PublicVideo[] } | null>(null)
  const [playlistError, setPlaylistError] = useState<string | null>(null)
  const feed = useInfiniteVideoFeed(filters)
  const { library, toggleLater } = useLocalLibraryState()

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => {
      if (controller.signal.aborted) return
      if (view !== 'playlist') {
        const next = catalogParameters(view)
        setFilters(next.filters)
        setHeading(next.heading)
        setPlaylist(null)
        return
      }
      const slug = new URLSearchParams(window.location.search).get('list') || 'all'
      if (slug === 'all') {
        setFilters({ limit: 24 })
        setHeading('Danh sách phát')
        setPlaylist(null)
        return
      }
      setPlaylist(null)
      setPlaylistError(null)
      void getPlaylist(slug, { signal: controller.signal })
        .then((result) => {
          setHeading(result.title)
          setPlaylist(result)
        })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) setPlaylistError(reason instanceof Error ? reason.message : 'Không tải được danh sách phát.')
        })
    })
    return () => controller.abort()
  }, [view])

  return (
    <section className={styles.catalogPage} aria-labelledby="catalog-title">
      <header className={styles.pageHeading}><p>THÔNG PHAN SCREENING ROOM</p><h1 id="catalog-title">{heading}</h1></header>
      {view === 'playlist' && playlist
        ? <VideoGrid videos={playlist.items} library={library} onToggleWatchLater={toggleLater} />
        : playlistError
          ? <VideoGrid videos={[]} library={library} error={playlistError} onRetry={() => window.location.reload()} />
          : <InfiniteVideoFeed feed={feed} filters={filters} library={library} emptyTitle="Chưa có video phù hợp" emptyBody="Thử một từ khóa hoặc chủ đề khác trong thư viện." onToggleWatchLater={toggleLater} />}
    </section>
  )
}
