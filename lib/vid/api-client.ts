import type { CatalogSlice, PublicVideo } from './contracts'

export type PublicTopic = { slug: string; label: string; videoCount: number }
export type PublicPlaylist = { slug: string; title: string; description: string; items: PublicVideo[] }

type ClientOptions = { fetcher?: typeof fetch; signal?: AbortSignal }
export type CatalogQuery = { cursor?: string; limit?: number; query?: string; topic?: string }

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${label} payload`)
  return value as Record<string, unknown>
}

function stringValue(record: Record<string, unknown>, key: string, label: string): string {
  if (typeof record[key] !== 'string' || !record[key]) throw new Error(`Invalid ${label} payload`)
  return record[key]
}

function stringList(record: Record<string, unknown>, key: string, label: string): string[] {
  const value = record[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new Error(`Invalid ${label} payload`)
  return value
}

function focalPercentage(record: Record<string, unknown>, key: string, fallback: number): number {
  if (record[key] === undefined) return fallback
  const value = record[key]
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100) throw new Error('Invalid video payload')
  return value
}

function publicVideo(value: unknown): PublicVideo {
  const record = objectValue(value, 'video')
  const durationSeconds = Number(record.durationSeconds)
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) throw new Error('Invalid video payload')
  const featuredRank = record.featuredRank === null ? null : Number(record.featuredRank)
  if (featuredRank !== null && !Number.isFinite(featuredRank)) throw new Error('Invalid video payload')
  return {
    slug: stringValue(record, 'slug', 'video'),
    title: stringValue(record, 'title', 'video'),
    description: stringValue(record, 'description', 'video'),
    sourceTitle: stringValue(record, 'sourceTitle', 'video'),
    sourceCreator: stringValue(record, 'sourceCreator', 'video'),
    sourceCreatorUrl: stringValue(record, 'sourceCreatorUrl', 'video'),
    sourceVideoUrl: stringValue(record, 'sourceVideoUrl', 'video'),
    translationLabel: stringValue(record, 'translationLabel', 'video'),
    topics: stringList(record, 'topics', 'video'),
    tags: stringList(record, 'tags', 'video'),
    playlists: stringList(record, 'playlists', 'video'),
    durationSeconds,
    thumbnailUrl: stringValue(record, 'thumbnailUrl', 'video'),
    previewUrl: stringValue(record, 'previewUrl', 'video'),
    playerUrl: stringValue(record, 'playerUrl', 'video'),
    featuredRank,
    thumbnailFocalX: focalPercentage(record, 'thumbnailFocalX', 50),
    thumbnailFocalY: focalPercentage(record, 'thumbnailFocalY', 24),
    publishedAt: stringValue(record, 'publishedAt', 'video'),
  }
}

async function request(path: string, options: ClientOptions): Promise<unknown> {
  const response = await (options.fetcher ?? fetch)(path, { cache: 'no-store', signal: options.signal })
  if (!response.ok) throw new Error(`Vid API request failed (${response.status})`)
  return response.json()
}

export async function listVideos(query: CatalogQuery = {}, options: ClientOptions = {}): Promise<CatalogSlice> {
  const params = new URLSearchParams()
  if (query.limit) params.set('limit', String(query.limit))
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.query?.trim()) params.set('q', query.query.trim())
  if (query.topic?.trim()) params.set('topic', query.topic.trim())
  const payload = objectValue(await request(`/api/videos${params.size ? `?${params}` : ''}`, options), 'catalog')
  if (!Array.isArray(payload.items)) throw new Error('Invalid catalog payload')
  const active = payload.hasMore === true && typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0
  const exhausted = payload.hasMore === false && payload.nextCursor === null
  if ((!active && !exhausted) || payload.policyVersion !== 'vid-feed-v1') throw new Error('Invalid catalog payload')
  const nextCursor = active ? payload.nextCursor as string : null
  const hasMore = active
  return {
    items: payload.items.map(publicVideo),
    nextCursor,
    hasMore,
    policyVersion: payload.policyVersion,
  }
}

export async function getVideo(slug: string, options: ClientOptions = {}): Promise<PublicVideo> {
  return publicVideo(await request(`/api/videos/${encodeURIComponent(slug)}`, options))
}

export async function listTopics(options: ClientOptions = {}): Promise<PublicTopic[]> {
  const response = objectValue(await request('/api/topics', options), 'topics')
  if (!Array.isArray(response.items)) throw new Error('Invalid topics payload')
  return response.items.map((value) => {
    const record = objectValue(value, 'topic')
    const videoCount = Number(record.video_count ?? record.videoCount)
    if (!Number.isFinite(videoCount) || videoCount < 0) throw new Error('Invalid topic payload')
    return {
      slug: stringValue(record, 'slug', 'topic'),
      label: stringValue(record, 'label', 'topic'),
      videoCount,
    }
  })
}

export async function getPlaylist(slug: string, options: ClientOptions = {}): Promise<PublicPlaylist> {
  const payload = objectValue(await request(`/api/playlists/${encodeURIComponent(slug)}`, options), 'playlist')
  if (!Array.isArray(payload.items)) throw new Error('Invalid playlist payload')
  return {
    slug: stringValue(payload, 'slug', 'playlist'),
    title: stringValue(payload, 'title', 'playlist'),
    description: stringValue(payload, 'description', 'playlist'),
    items: payload.items.map(publicVideo),
  }
}
