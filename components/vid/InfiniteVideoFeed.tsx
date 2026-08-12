'use client'

import { useEffect, useRef } from 'react'
import type { LocalLibrary } from '../../lib/vid/local-library'
import type { FeedFilters, InfiniteVideoFeedState } from './useInfiniteVideoFeed'
import VirtualVideoGrid from './VirtualVideoGrid'
import styles from './Vid.module.css'

export type InfiniteVideoFeedProps = {
  feed: InfiniteVideoFeedState
  filters: FeedFilters
  library: LocalLibrary
  hiddenSlugs?: Iterable<string>
  emptyTitle?: string
  emptyBody?: string
  onToggleWatchLater?: (slug: string) => void
}

export default function InfiniteVideoFeed({
  feed,
  filters: _filters,
  library,
  hiddenSlugs,
  emptyTitle,
  emptyBody,
  onToggleWatchLater,
}: InfiniteVideoFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMore = feed.loadMore
  const hidden = new Set(hiddenSlugs)
  const visibleItems = feed.items.filter(({ slug }) => !hidden.has(slug))

  useEffect(() => {
    if (!sentinelRef.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(({ isIntersecting }) => isIntersecting)) loadMore()
    }, { rootMargin: '800px 0px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  const initialError = feed.status === 'error' && feed.items.length === 0 ? feed.error : null
  const message = feed.status === 'loading'
    ? 'Đang tải thư viện video.'
    : feed.status === 'loading-more'
      ? 'Đang tải thêm video.'
      : feed.status === 'error'
        ? `Không tải thêm được video. ${feed.error ?? ''}`
        : feed.status === 'exhausted'
          ? 'Bạn đã xem hết video hiện có.'
          : `${visibleItems.length} video đã sẵn sàng.`

  return (
    <div className={styles.infiniteFeed}>
      <VirtualVideoGrid
        videos={visibleItems}
        library={library}
        loading={feed.status === 'loading'}
        error={initialError}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
        onRetry={feed.retry}
        onToggleWatchLater={onToggleWatchLater}
      />
      <div ref={sentinelRef} className={styles.feedSentinel} data-vid-feed-sentinel aria-hidden="true" />
      <div className={styles.feedControls}>
        <p aria-live="polite">{message}</p>
        {feed.status === 'error' && feed.items.length > 0 && <button type="button" onClick={feed.retry}>Thử lại</button>}
        {feed.hasMore && feed.status !== 'error' && <button type="button" onClick={feed.loadMore}>Tải thêm video</button>}
      </div>
    </div>
  )
}
