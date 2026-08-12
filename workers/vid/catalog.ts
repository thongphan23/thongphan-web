import { toPublicVideo, type CatalogPage, type MediaStatus, type RightsStatus, type VideoDraftInput, type VideoRecord, type VideoStatus } from '../../lib/vid/contracts'
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

export async function findVideoByIdempotency(env: VidEnv, idempotencyKey: string) {
  return env.VID_DB.prepare(
    'SELECT id, bunny_video_id, status, media_status FROM vid_videos WHERE idempotency_key = ? LIMIT 1',
  ).bind(idempotencyKey).first<Record<string, unknown>>()
}

export async function createVideoDraft(
  env: VidEnv,
  input: VideoDraftInput,
  values: { id: string; bunnyVideoId: string; idempotencyKey: string; now: string },
): Promise<void> {
  const statements = [
    env.VID_DB.prepare(
      `INSERT INTO vid_videos (
        id, slug, bunny_video_id, idempotency_key, title, description, source_title,
        source_creator, source_creator_url, source_video_url, translation_label,
        rights_status, rights_note, tags_json, status, media_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploading', 'pending', ?, ?)`,
    ).bind(
      values.id,
      input.slug,
      values.bunnyVideoId,
      values.idempotencyKey,
      input.title,
      input.description,
      input.sourceTitle,
      input.sourceCreator,
      input.sourceCreatorUrl,
      input.sourceVideoUrl,
      input.translationLabel,
      input.rightsStatus,
      input.rightsNote,
      JSON.stringify(input.tags),
      values.now,
      values.now,
    ),
    ...input.topics.flatMap((topic) => [
      env.VID_DB.prepare('INSERT OR IGNORE INTO vid_topics (slug, label) VALUES (?, ?)').bind(topic, topic),
      env.VID_DB.prepare('INSERT INTO vid_video_topics (video_id, topic_slug) VALUES (?, ?)').bind(values.id, topic),
    ]),
    ...input.playlists.map((playlist) => env.VID_DB.prepare(
      `INSERT INTO vid_playlist_videos (playlist_slug, video_id, position)
       SELECT ?, ?, COALESCE(MAX(position), -1) + 1 FROM vid_playlist_videos WHERE playlist_slug = ?`,
    ).bind(playlist, values.id, playlist)),
  ]
  await env.VID_DB.batch(statements)
}

export async function updateVideoMediaStatus(
  env: VidEnv,
  bunnyVideoId: string,
  mediaStatus: MediaStatus,
): Promise<void> {
  const status = mediaStatus === 'failed' ? 'failed' : mediaStatus === 'ready' ? 'ready' : 'processing'
  await env.VID_DB.prepare(
    `UPDATE vid_videos
     SET media_status = ?, status = CASE WHEN status = 'published' THEN status ELSE ? END, updated_at = ?
     WHERE bunny_video_id = ? AND status != 'archived'`,
  ).bind(mediaStatus, status, new Date().toISOString(), bunnyVideoId).run()
}

export async function getAdminVideoStatus(env: VidEnv, id: string) {
  return env.VID_DB.prepare(
    'SELECT id, slug, bunny_video_id, status, media_status, updated_at FROM vid_videos WHERE id = ? LIMIT 1',
  ).bind(id).first<Record<string, unknown>>()
}

export async function publishAdminVideo(env: VidEnv, id: string): Promise<boolean> {
  const result = await env.VID_DB.prepare(
    `UPDATE vid_videos SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ?
     WHERE id = ? AND media_status = 'ready' AND status IN ('ready', 'published')
       AND source_creator != '' AND source_video_url != '' AND rights_status != ''`,
  ).bind(new Date().toISOString(), new Date().toISOString(), id).run()
  return Number(result.meta.changes ?? 0) === 1
}

export async function archiveAdminVideo(env: VidEnv, id: string): Promise<boolean> {
  const result = await env.VID_DB.prepare(
    `UPDATE vid_videos SET status = 'archived', updated_at = ? WHERE id = ? AND status != 'archived'`,
  ).bind(new Date().toISOString(), id).run()
  return Number(result.meta.changes ?? 0) === 1
}
