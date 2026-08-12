export const VIDEO_STATUSES = [
  'draft',
  'uploading',
  'processing',
  'ready',
  'published',
  'failed',
  'archived',
] as const

export const MEDIA_STATUSES = ['pending', 'uploading', 'processing', 'ready', 'failed'] as const
export const RIGHTS_STATUSES = ['owner-reviewed', 'owned', 'licensed', 'permission'] as const

export type VideoStatus = (typeof VIDEO_STATUSES)[number]
export type MediaStatus = (typeof MEDIA_STATUSES)[number]
export type RightsStatus = (typeof RIGHTS_STATUSES)[number]

export type VideoDraftInput = {
  slug: string
  title: string
  description: string
  sourceTitle: string
  sourceCreator: string
  sourceCreatorUrl: string
  sourceVideoUrl: string
  translationLabel: string
  rightsStatus: RightsStatus
  rightsNote: string
  topics: string[]
  tags: string[]
  playlists: string[]
  thumbnailFocalX?: number
  thumbnailFocalY?: number
}

export type VideoRecord = VideoDraftInput & {
  id: string
  bunnyVideoId: string
  idempotencyKey: string
  durationSeconds: number
  thumbnailUrl: string
  previewUrl: string
  playerUrl: string
  status: VideoStatus
  mediaStatus: MediaStatus
  featuredRank: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PublicVideo = Omit<
  VideoRecord,
  'id' | 'bunnyVideoId' | 'idempotencyKey' | 'rightsNote' | 'rightsStatus' | 'status' | 'mediaStatus' | 'createdAt' | 'updatedAt' | 'publishedAt'
> & { publishedAt: string }

export type CatalogPage = {
  items: PublicVideo[]
  page: number
  pageSize: number
  total: number
}

export type CatalogSlice = {
  items: PublicVideo[]
  nextCursor: string | null
  hasMore: boolean
  policyVersion: 'vid-feed-v1'
}

export const PUBLIC_VIDEO_KEYS = [
  'slug',
  'title',
  'description',
  'sourceTitle',
  'sourceCreator',
  'sourceCreatorUrl',
  'sourceVideoUrl',
  'translationLabel',
  'topics',
  'tags',
  'playlists',
  'thumbnailFocalX',
  'thumbnailFocalY',
  'durationSeconds',
  'thumbnailUrl',
  'previewUrl',
  'playerUrl',
  'featuredRank',
  'publishedAt',
] as const satisfies ReadonlyArray<keyof PublicVideo>

const DRAFT_KEYS = new Set<keyof VideoDraftInput>([
  'slug',
  'title',
  'description',
  'sourceTitle',
  'sourceCreator',
  'sourceCreatorUrl',
  'sourceVideoUrl',
  'translationLabel',
  'rightsStatus',
  'rightsNote',
  'topics',
  'tags',
  'playlists',
  'thumbnailFocalX',
  'thumbnailFocalY',
])

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`)
  if (value.length > maxLength) throw new Error(`${field} must be at most ${maxLength} characters`)
  return value
}

function httpsUrl(value: unknown, field: string): string {
  const text = requiredString(value, field, 2_048)
  let parsed: URL
  try {
    parsed = new URL(text)
  } catch {
    throw new Error(`${field} must be an HTTPS URL`)
  }
  if (parsed.protocol !== 'https:') throw new Error(`${field} must be an HTTPS URL`)
  return text
}

function stringList(value: unknown, field: string, maximum: number, required: boolean): string[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`)
  if (required && value.length === 0) throw new Error(`${field} requires at least one value`)
  if (value.length > maximum) throw new Error(`${field} must contain at most ${maximum} values`)
  const result = value.map((entry) => requiredString(entry, field, 64))
  if (new Set(result).size !== result.length) throw new Error(`${field} must be unique`)
  return result
}

function focalPercentage(value: unknown, field: string, fallback: number): number {
  if (value === undefined) return fallback
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${field} must be an integer between 0 and 100`)
  }
  return value
}

export function validateDraftInput(input: unknown): VideoDraftInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Draft must be an object')
  const record = input as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!DRAFT_KEYS.has(key as keyof VideoDraftInput)) throw new Error(`Unknown field: ${key}`)
  }

  const slug = requiredString(record.slug, 'slug', 120)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('slug must use lowercase kebab-case')
  const rightsStatus = requiredString(record.rightsStatus, 'rightsStatus', 32)
  if (!RIGHTS_STATUSES.includes(rightsStatus as RightsStatus)) throw new Error('rightsStatus is invalid')

  return {
    slug,
    title: requiredString(record.title, 'title', 180),
    description: requiredString(record.description, 'description', 8_000),
    sourceTitle: requiredString(record.sourceTitle, 'sourceTitle', 240),
    sourceCreator: requiredString(record.sourceCreator, 'sourceCreator', 160),
    sourceCreatorUrl: httpsUrl(record.sourceCreatorUrl, 'sourceCreatorUrl'),
    sourceVideoUrl: httpsUrl(record.sourceVideoUrl, 'sourceVideoUrl'),
    translationLabel: requiredString(record.translationLabel, 'translationLabel', 180),
    rightsStatus: rightsStatus as RightsStatus,
    rightsNote: requiredString(record.rightsNote, 'rightsNote', 2_000),
    topics: stringList(record.topics, 'topics', 8, true),
    tags: stringList(record.tags, 'tags', 16, false),
    playlists: stringList(record.playlists, 'playlists', 12, false),
    thumbnailFocalX: focalPercentage(record.thumbnailFocalX, 'thumbnailFocalX', 50),
    thumbnailFocalY: focalPercentage(record.thumbnailFocalY, 'thumbnailFocalY', 24),
  }
}

export function toPublicVideo(record: VideoRecord): PublicVideo | null {
  if (record.status !== 'published' || record.mediaStatus !== 'ready' || !record.publishedAt) return null
  if (record.durationSeconds <= 0) return null
  try {
    const thumbnail = new URL(record.thumbnailUrl)
    const preview = new URL(record.previewUrl)
    const player = new URL(record.playerUrl)
    if (thumbnail.protocol !== 'https:' || preview.protocol !== 'https:') return null
    if (player.protocol !== 'https:' || player.hostname !== 'player.mediadelivery.net' || !player.pathname.startsWith('/embed/')) return null
  } catch {
    return null
  }
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    sourceTitle: record.sourceTitle,
    sourceCreator: record.sourceCreator,
    sourceCreatorUrl: record.sourceCreatorUrl,
    sourceVideoUrl: record.sourceVideoUrl,
    translationLabel: record.translationLabel,
    topics: [...record.topics],
    tags: [...record.tags],
    playlists: [...record.playlists],
    durationSeconds: record.durationSeconds,
    thumbnailUrl: record.thumbnailUrl,
    previewUrl: record.previewUrl,
    playerUrl: record.playerUrl,
    featuredRank: record.featuredRank,
    thumbnailFocalX: focalPercentage(record.thumbnailFocalX, 'thumbnailFocalX', 50),
    thumbnailFocalY: focalPercentage(record.thumbnailFocalY, 'thumbnailFocalY', 24),
    publishedAt: record.publishedAt,
  }
}
