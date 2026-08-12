import { lstatSync } from 'node:fs'
import path from 'node:path'
import { validateDraftInput, type VideoDraftInput } from './contracts'
import type { VidUploadOptions } from '../../scripts/vid-upload'

export type VidUploadManifestVideo = VidUploadOptions & Required<Pick<VideoDraftInput, 'thumbnailFocalX' | 'thumbnailFocalY'>>

export type VidUploadManifest = {
  version: 1
  videos: VidUploadManifestVideo[]
}

const ROOT_KEYS = new Set(['version', 'videos'])
const VIDEO_KEYS = new Set([
  'baseUrl',
  'filePath',
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
  'publish',
  'dryRun',
])

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  return value as Record<string, unknown>
}

function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${field} must be a boolean`)
  return value
}

function httpsBaseUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('baseUrl is required')
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error('baseUrl must be an HTTPS URL')
  }
  if (parsed.protocol !== 'https:') throw new Error('baseUrl must be an HTTPS URL')
  return parsed.origin
}

function regularMp4Path(value: unknown): string {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error('Video path must be absolute')
  if (path.extname(value).toLowerCase() !== '.mp4') throw new Error('Video file must end in .mp4')
  let details: ReturnType<typeof lstatSync>
  try {
    details = lstatSync(value)
  } catch {
    throw new Error('Video file does not exist')
  }
  if (details.isSymbolicLink()) throw new Error('Video file must not be a symlink')
  if (!details.isFile()) throw new Error('Video path must be a file')
  if (details.size <= 0) throw new Error('Video file is empty')
  return value
}

function validateVideo(value: unknown): VidUploadManifestVideo {
  const input = record(value, 'Manifest video')
  for (const key of Object.keys(input)) {
    if (!VIDEO_KEYS.has(key)) throw new Error(`Unknown manifest video field: ${key}`)
  }
  const draft = validateDraftInput({
    slug: input.slug,
    title: input.title,
    description: input.description,
    sourceTitle: input.sourceTitle,
    sourceCreator: input.sourceCreator,
    sourceCreatorUrl: input.sourceCreatorUrl,
    sourceVideoUrl: input.sourceVideoUrl,
    translationLabel: input.translationLabel,
    rightsStatus: input.rightsStatus,
    rightsNote: input.rightsNote,
    topics: input.topics,
    tags: input.tags,
    playlists: input.playlists,
    thumbnailFocalX: input.thumbnailFocalX,
    thumbnailFocalY: input.thumbnailFocalY,
  })
  return {
    baseUrl: httpsBaseUrl(input.baseUrl),
    filePath: regularMp4Path(input.filePath),
    ...draft,
    thumbnailFocalX: draft.thumbnailFocalX ?? 50,
    thumbnailFocalY: draft.thumbnailFocalY ?? 24,
    publish: requiredBoolean(input.publish, 'publish'),
    dryRun: requiredBoolean(input.dryRun, 'dryRun'),
  }
}

export function validateUploadManifest(value: unknown): VidUploadManifest {
  const input = record(value, 'Manifest')
  for (const key of Object.keys(input)) {
    if (!ROOT_KEYS.has(key)) throw new Error(`Unknown manifest field: ${key}`)
  }
  if (input.version !== 1) throw new Error('Manifest version must be 1')
  if (!Array.isArray(input.videos)) throw new Error('Manifest videos must be an array')
  if (input.videos.length === 0) throw new Error('Manifest must contain at least one video')
  if (input.videos.length > 100) throw new Error('Manifest must contain at most 100 videos')

  const videos = input.videos.map(validateVideo)
  const slugs = new Set<string>()
  for (const video of videos) {
    if (slugs.has(video.slug)) throw new Error(`Duplicate video slug: ${video.slug}`)
    slugs.add(video.slug)
  }
  return { version: 1, videos }
}
