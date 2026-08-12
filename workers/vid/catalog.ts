import { toPublicVideo, type CatalogPage, type MediaStatus, type RightsStatus, type VideoRecord, type VideoStatus } from '../../lib/vid/contracts'
import type { VidEnv } from './types'

const BASE_SELECT = `
  SELECT v.*,
    COALESCE((SELECT json_group_array(topic_slug) FROM vid_video_topics WHERE video_id = v.id), '[]') AS topics_json,
    COALESCE((SELECT json_group_array(playlist_slug) FROM vid_playlist_videos WHERE video_id = v.id), '[]') AS playlists_json
  FROM vid_videos v`

function stringValue(row: Record<string, unknown>, key: string): string {
  if (typeof row[key] !== 'string') throw new Error(`invalid_${key}`)
  return row[key]
}

function listValue(row: Record<string, unknown>, key: string): string[] {
  const value = JSON.parse(stringValue(row, key)) as unknown
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) throw new Error(`invalid_${key}`)
  return value
}

export function rowToVideoRecord(row: Record<string, unknown>): VideoRecord {
  return {
    id: stringValue(row, 'id'),
    slug: stringValue(row, 'slug'),
    bunnyVideoId: stringValue(row, 'bunny_video_id'),
    idempotencyKey: stringValue(row, 'idempotency_key'),
    title: stringValue(row, 'title'),
    description: stringValue(row, 'description'),
    sourceTitle: stringValue(row, 'source_title'),
    sourceCreator: stringValue(row, 'source_creator'),
    sourceCreatorUrl: stringValue(row, 'source_creator_url'),
    sourceVideoUrl: stringValue(row, 'source_video_url'),
    translationLabel: stringValue(row, 'translation_label'),
    rightsStatus: stringValue(row, 'rights_status') as RightsStatus,
    rightsNote: stringValue(row, 'rights_note'),
    topics: listValue(row, 'topics_json'),
    tags: listValue(row, 'tags_json'),
    playlists: listValue(row, 'playlists_json'),
    durationSeconds: Number(row.duration_seconds),
    thumbnailUrl: stringValue(row, 'thumbnail_url'),
    previewUrl: stringValue(row, 'preview_url'),
    playerUrl: stringValue(row, 'player_url'),
    status: stringValue(row, 'status') as VideoStatus,
    mediaStatus: stringValue(row, 'media_status') as MediaStatus,
    featuredRank: row.featured_rank === null ? null : Number(row.featured_rank),
    publishedAt: row.published_at === null ? null : stringValue(row, 'published_at'),
    createdAt: stringValue(row, 'created_at'),
    updatedAt: stringValue(row, 'updated_at'),
  }
}

export async function listPublicVideos(env: VidEnv, page: number, pageSize: number): Promise<CatalogPage> {
  const offset = (page - 1) * pageSize
  const result = await env.VID_DB.prepare(
    `${BASE_SELECT} WHERE v.status = 'published' AND v.media_status = 'ready' ORDER BY v.featured_rank IS NULL, v.featured_rank, v.published_at DESC LIMIT ? OFFSET ?`,
  ).bind(pageSize, offset).all<Record<string, unknown>>()
  const items = (result.results ?? []).flatMap((row) => {
    try {
      const video = toPublicVideo(rowToVideoRecord(row))
      return video ? [video] : []
    } catch {
      return []
    }
  })
  return { items, page, pageSize, total: items.length }
}

export async function getPublicVideo(env: VidEnv, slug: string) {
  const row = await env.VID_DB.prepare(
    `${BASE_SELECT} WHERE v.slug = ? AND v.status = 'published' AND v.media_status = 'ready' LIMIT 1`,
  ).bind(slug).first<Record<string, unknown>>()
  if (!row) return null
  try {
    return toPublicVideo(rowToVideoRecord(row))
  } catch {
    return null
  }
}

export async function listTopics(env: VidEnv) {
  const result = await env.VID_DB.prepare(
    `SELECT t.slug, t.label, COUNT(vt.video_id) AS video_count
     FROM vid_topics t
     LEFT JOIN vid_video_topics vt ON vt.topic_slug = t.slug
     LEFT JOIN vid_videos v ON v.id = vt.video_id AND v.status = 'published' AND v.media_status = 'ready'
     GROUP BY t.slug, t.label, t.sort_order ORDER BY t.sort_order, t.label`,
  ).all<Record<string, unknown>>()
  return result.results ?? []
}

export async function getPublicPlaylist(env: VidEnv, slug: string) {
  const playlist = await env.VID_DB.prepare(
    'SELECT slug, title, description FROM vid_playlists WHERE slug = ? AND published = 1 LIMIT 1',
  ).bind(slug).first<Record<string, unknown>>()
  if (!playlist) return null
  const result = await env.VID_DB.prepare(
    `${BASE_SELECT}
     JOIN vid_playlist_videos pv ON pv.video_id = v.id
     WHERE pv.playlist_slug = ? AND v.status = 'published' AND v.media_status = 'ready'
     ORDER BY pv.position`,
  ).bind(slug).all<Record<string, unknown>>()
  const items = (result.results ?? []).flatMap((row) => {
    try {
      const video = toPublicVideo(rowToVideoRecord(row))
      return video ? [video] : []
    } catch {
      return []
    }
  })
  return { ...playlist, items }
}
