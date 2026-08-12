'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getPlaylist } from '../../lib/vid/api-client'
import { catalogParameters, type CatalogViewKind } from '../../lib/vid/catalog-view'
import type { PublicVideo } from '../../lib/vid/contracts'
import InfiniteVideoFeed from './InfiniteVideoFeed'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'
import { useInfiniteVideoFeed } from './useInfiniteVideoFeed'
import { useLocalLibraryState } from './useLocalLibraryState'

type PlaylistState = {
  slug: string
  playlist?: { title: string; items: PublicVideo[] }
  error?: string
}

export default function CatalogView({ view }: { view: CatalogViewKind }) {
  const searchParams = useSearchParams()
  const parameters = catalogParameters(view, searchParams)
  const playlistSlug = view === 'playlist' ? searchParams.get('list') || 'all' : 'all'
  const selectedPlaylist = view === 'playlist' && playlistSlug !== 'all'
  const [playlistState, setPlaylistState] = useState<PlaylistState | null>(null)
  const feed = useInfiniteVideoFeed(parameters.filters)
  const { library, toggleLater } = useLocalLibraryState()

  useEffect(() => {
    if (!selectedPlaylist) return
    const controller = new AbortController()
    void getPlaylist(playlistSlug, { signal: controller.signal })
      .then((playlist) => setPlaylistState({ slug: playlistSlug, playlist }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setPlaylistState({ slug: playlistSlug, error: reason instanceof Error ? reason.message : 'Không tải được danh sách phát.' })
        }
      })
    return () => controller.abort()
  }, [playlistSlug, selectedPlaylist])

  const activePlaylist = playlistState?.slug === playlistSlug ? playlistState : null
  const heading = activePlaylist?.playlist?.title ?? parameters.heading

  return (
    <section className={styles.catalogPage} aria-labelledby="catalog-title">
      <header className={styles.pageHeading}><p>THÔNG PHAN SCREENING ROOM</p><h1 id="catalog-title">{heading}</h1></header>
      {selectedPlaylist
        ? activePlaylist?.playlist
          ? <VideoGrid videos={activePlaylist.playlist.items} library={library} onToggleWatchLater={toggleLater} />
          : <VideoGrid videos={[]} library={library} loading={!activePlaylist?.error} error={activePlaylist?.error} onRetry={() => window.location.reload()} />
        : <InfiniteVideoFeed feed={feed} filters={parameters.filters} library={library} emptyTitle="Chưa có video phù hợp" emptyBody="Thử một từ khóa hoặc chủ đề khác trong thư viện." onToggleWatchLater={toggleLater} />}
    </section>
  )
}
