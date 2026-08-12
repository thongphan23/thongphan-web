'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { columnCountForWidth, visibleRowRange } from '../../lib/vid/virtual-grid'
import type { VideoGridProps } from './VideoGrid'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'

export type VirtualVideoGridProps = VideoGridProps & {
  overscanRows?: number
  virtualizationThreshold?: number
}

export { columnCountForWidth, visibleRowRange }

export default function VirtualVideoGrid({
  videos,
  library,
  loading,
  error,
  emptyTitle,
  emptyBody,
  onRetry,
  onToggleWatchLater,
  overscanRows = 3,
  virtualizationThreshold = 48,
}: VirtualVideoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ columns: 4, rowHeight: 320, rowGap: 24, scrollTop: 0, viewportHeight: 900 })
  const virtual = !loading && !error && videos.length >= virtualizationThreshold

  useEffect(() => {
    if (!virtual || !containerRef.current || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const container = containerRef.current
      if (!container) return
      const card = container.querySelector('article')
      const grid = container.querySelector(`.${styles.videoGrid}`)
      const computed = grid ? window.getComputedStyle(grid) : null
      setLayout({
        columns: columnCountForWidth(window.innerWidth),
        rowHeight: card?.getBoundingClientRect().height || 320,
        rowGap: Number.parseFloat(computed?.rowGap || '') || 24,
        scrollTop: Math.max(0, window.scrollY - (container.getBoundingClientRect().top + window.scrollY)),
        viewportHeight: window.innerHeight,
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(containerRef.current)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [virtual, videos.length])

  if (!virtual) return <VideoGrid {...{ videos, library, loading, error, emptyTitle, emptyBody, onRetry, onToggleWatchLater }} />

  const range = visibleRowRange({
    itemCount: videos.length,
    columns: layout.columns,
    rowHeight: layout.rowHeight,
    rowGap: layout.rowGap,
    scrollTop: layout.scrollTop,
    viewportHeight: layout.viewportHeight,
    overscanRows,
  })
  const startIndex = range.start * layout.columns
  const endIndex = Math.min(videos.length, range.end * layout.columns)
  const rowSize = layout.rowHeight + layout.rowGap
  const spacerStyle = (height: number) => ({ height, display: 'block' } as CSSProperties)

  return (
    <div ref={containerRef} className={styles.virtualGrid} data-visible-row-range={`${range.start}-${range.end}`}>
      <span aria-hidden="true" style={spacerStyle(range.start * rowSize)} />
      <VideoGrid videos={videos.slice(startIndex, endIndex)} library={library} onToggleWatchLater={onToggleWatchLater} />
      <span aria-hidden="true" style={spacerStyle(Math.max(0, range.total - range.end) * rowSize)} />
    </div>
  )
}
