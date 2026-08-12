import type { MediaStatus, VideoRecord } from '../../lib/vid/contracts'
import type { D1Database } from '@cloudflare/workers-types'

export type VidEnv = {
  VID_DB: D1Database
  PAGES_ORIGIN: string
  BUNNY_LIBRARY_ID: string
  BUNNY_CDN_HOST: string
  BUNNY_STREAM_API_KEY?: string
  BUNNY_WEBHOOK_SECRET?: string
  VID_ADMIN_HMAC_SECRET?: string
}

export type VidRow = Omit<VideoRecord, 'topics' | 'tags'> & {
  topicsJson: string
  tagsJson: string
}

export type BunnyStatusUpdate = {
  bunnyVideoId: string
  mediaStatus: MediaStatus
}
