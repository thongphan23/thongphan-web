'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { listVideos } from '../../lib/vid/api-client'
import type { PublicVideo } from '../../lib/vid/contracts'

export type FeedFilters = { query?: string; topic?: string; limit?: number }
export type FeedStatus = 'loading' | 'ready' | 'loading-more' | 'error' | 'exhausted'
export type InfiniteVideoFeedState = {
  items: PublicVideo[]
  status: FeedStatus
  hasMore: boolean
  error: string | null
  loadMore: () => void
  retry: () => void
}

function normalizedFilters(filters: FeedFilters) {
  return {
    query: filters.query?.trim() || undefined,
    topic: filters.topic?.trim().normalize('NFC').toLocaleLowerCase('vi') || undefined,
    limit: Math.max(1, Math.min(48, Math.trunc(filters.limit ?? 24))),
  }
}

export function stableFeedFilterKey(filters: FeedFilters) {
  const normalized = normalizedFilters(filters)
  return JSON.stringify([normalized.limit, normalized.query, normalized.topic])
}

function filtersForKey(filterKey: string) {
  const [limit, query, topic] = JSON.parse(filterKey) as [number, string | undefined, string | undefined]
  return { limit, query, topic }
}

export function mergeVideos(existing: PublicVideo[], incoming: PublicVideo[]) {
  const seen = new Set(existing.map(({ slug }) => slug))
  return [...existing, ...incoming.filter(({ slug }) => !seen.has(slug) && (seen.add(slug), true))]
}

export function useInfiniteVideoFeed(filters: FeedFilters): InfiniteVideoFeedState {
  const filterKey = stableFeedFilterKey(filters)
  const inFlightRef = useRef<{ controller: AbortController; id: number } | null>(null)
  const cursorRef = useRef<string | undefined>(undefined)
  const failedCursorRef = useRef<string | undefined>(undefined)
  const requestIdRef = useRef(0)
  const [items, setItems] = useState<PublicVideo[]>([])
  const [status, setStatus] = useState<FeedStatus>('loading')
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPage = useCallback((cursor: string | undefined, replace: boolean) => {
    if (inFlightRef.current) return
    const controller = new AbortController()
    const inFlight = { controller, id: ++requestIdRef.current }
    inFlightRef.current = inFlight
    if (replace) {
      setItems([])
      setHasMore(true)
    }
    setError(null)
    setStatus(replace ? 'loading' : 'loading-more')

    void listVideos({ ...filtersForKey(filterKey), cursor }, { signal: controller.signal })
      .then((slice) => {
        if (inFlightRef.current !== inFlight || controller.signal.aborted) return
        cursorRef.current = slice.nextCursor ?? undefined
        failedCursorRef.current = undefined
        setItems((current) => replace ? mergeVideos([], slice.items) : mergeVideos(current, slice.items))
        const more = slice.hasMore && Boolean(slice.nextCursor)
        setHasMore(more)
        setStatus(more ? 'ready' : 'exhausted')
      })
      .catch((reason: unknown) => {
        if (inFlightRef.current !== inFlight || controller.signal.aborted) return
        failedCursorRef.current = cursor
        setError(reason instanceof Error ? reason.message : 'Kết nối bị gián đoạn.')
        setStatus('error')
      })
      .finally(() => {
        if (inFlightRef.current === inFlight) inFlightRef.current = null
      })
  }, [filterKey])

  useEffect(() => {
    inFlightRef.current?.controller.abort()
    inFlightRef.current = null
    cursorRef.current = undefined
    failedCursorRef.current = undefined
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) loadPage(undefined, true) })
    return () => {
      cancelled = true
      inFlightRef.current?.controller.abort()
    }
  }, [filterKey, loadPage])

  const loadMore = useCallback(() => {
    if (!hasMore || !cursorRef.current || inFlightRef.current) return
    loadPage(cursorRef.current, false)
  }, [hasMore, loadPage])

  const retry = useCallback(() => {
    if (inFlightRef.current) return
    const cursor = failedCursorRef.current
    loadPage(cursor, cursor === undefined)
  }, [loadPage])

  return { items, status, hasMore, error, loadMore, retry }
}
