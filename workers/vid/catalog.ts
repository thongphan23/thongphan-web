import { toPublicVideo, type CatalogPage, type MediaStatus, type RightsStatus, type VideoDraftInput, type VideoRecord, type VideoStatus } from '../../lib/vid/contracts'
import { normalizeVietnamese } from '../../lib/vid/discovery'
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
    thumbnailFocalX: row.thumbnail_focal_x === undefined || row.thumbnail_focal_x === null ? 50 : Number(row.thumbnail_focal_x),
    thumbnailFocalY: row.thumbnail_focal_y === undefined || row.thumbnail_focal_y === null ? 24 : Number(row.thumbnail_focal_y),
    publishedAt: row.published_at === null ? null : stringValue(row, 'published_at'),
    createdAt: stringValue(row, 'created_at'),
    updatedAt: stringValue(row, 'updated_at'),
  }
}

export async function listPublicVideos(
  env: VidEnv,
  page: number,
  pageSize: number,
  filters: { query?: string; topic?: string } = {},
): Promise<CatalogPage> {
  const offset = (page - 1) * pageSize
  const clauses = ["v.status = 'published'", "v.media_status = 'ready'"]
  const bindings: unknown[] = []
  if (filters.query) {
    clauses.push('v.search_text LIKE ?')
    bindings.push(`%${normalizeVietnamese(filters.query)}%`)
  }
  if (filters.topic) {
    clauses.push('EXISTS (SELECT 1 FROM vid_video_topics fvt WHERE fvt.video_id = v.id AND fvt.topic_slug = ?)')
    bindings.push(filters.topic)
  }
  const result = await env.VID_DB.prepare(
    `${BASE_SELECT.replace('SELECT v.*', 'SELECT v.*, COUNT(*) OVER() AS total_count')}
     WHERE ${clauses.join(' AND ')}
     ORDER BY v.featured_rank IS NULL, v.featured_rank, v.published_at DESC LIMIT ? OFFSET ?`,
  ).bind(...bindings, pageSize, offset).all<Record<string, unknown>>()
  const items = ((result.results ?? []) as Record<string, unknown>[]).flatMap((row) => {
    try {
      const video = toPublicVideo(rowToVideoRecord(row))
      return video ? [video] : []
    } catch {
      return []
    }
  })
  const total = Number((result.results?.[0] as Record<string, unknown> | undefined)?.total_count ?? items.length)
  return { items, page, pageSize, total: Number.isFinite(total) ? total : items.length }
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

export async function listPublicVideoSlugs(env: VidEnv) {
  const result = await env.VID_DB.prepare(
    `SELECT slug, updated_at FROM vid_videos
     WHERE status = 'published' AND media_status = 'ready'
       AND duration_seconds > 0 AND thumbnail_url != '' AND player_url != ''
     ORDER BY published_at DESC`,
  ).all<Record<string, unknown>>()
  return (result.results ?? []).flatMap((row) => typeof row.slug === 'string' && typeof row.updated_at === 'string'
    ? [{ slug: row.slug, updatedAt: row.updated_at }]
    : [])
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
  const items = ((result.results ?? []) as Record<string, unknown>[]).flatMap((row) => {
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
        rights_status, rights_note, tags_json, search_text, thumbnail_focal_x, thumbnail_focal_y, status, media_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploading', 'pending', ?, ?)`,
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
      normalizeVietnamese([input.title, input.description, input.sourceTitle, input.sourceCreator, ...input.topics, ...input.tags, ...input.playlists].join(' ')),
      input.thumbnailFocalX ?? 50,
      input.thumbnailFocalY ?? 24,
      values.now,
      values.now,
    ),
    ...input.topics.flatMap((topic) => [
      env.VID_DB.prepare('INSERT OR IGNORE INTO vid_topics (slug, label) VALUES (?, ?)').bind(topic, topic),
      env.VID_DB.prepare('INSERT INTO vid_video_topics (video_id, topic_slug) VALUES (?, ?)').bind(values.id, topic),
    ]),
    ...input.playlists.flatMap((playlist) => [
      env.VID_DB.prepare(
        'INSERT OR IGNORE INTO vid_playlists (slug, title, description, published, updated_at) VALUES (?, ?, ?, 1, ?)',
      ).bind(playlist, playlist.replaceAll('-', ' '), '', values.now),
      env.VID_DB.prepare(
        `INSERT INTO vid_playlist_videos (playlist_slug, video_id, position)
         SELECT ?, ?, COALESCE(MAX(position), -1) + 1 FROM vid_playlist_videos WHERE playlist_slug = ?`,
      ).bind(playlist, values.id, playlist),
    ]),
  ]
  await env.VID_DB.batch(statements)
}

export async function updateVideoMediaStatus(
  env: VidEnv,
  bunnyVideoId: string,
  mediaStatus: MediaStatus,
  media?: { durationSeconds: number; thumbnailUrl: string; previewUrl: string; playerUrl: string },
): Promise<void> {
  const status = mediaStatus === 'failed' ? 'failed' : mediaStatus === 'ready' ? 'ready' : 'processing'
  await env.VID_DB.prepare(
    `UPDATE vid_videos
     SET media_status = ?, status = CASE WHEN status = 'published' THEN status ELSE ? END,
       duration_seconds = COALESCE(?, duration_seconds), thumbnail_url = COALESCE(?, thumbnail_url),
       preview_url = COALESCE(?, preview_url), player_url = COALESCE(?, player_url), updated_at = ?
     WHERE bunny_video_id = ? AND status != 'archived'`,
  ).bind(
    mediaStatus,
    status,
    media?.durationSeconds ?? null,
    media?.thumbnailUrl ?? null,
    media?.previewUrl ?? null,
    media?.playerUrl ?? null,
    new Date().toISOString(),
    bunnyVideoId,
  ).run()
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
       AND source_creator != '' AND source_video_url != '' AND rights_status != ''
       AND duration_seconds > 0 AND thumbnail_url != '' AND preview_url != '' AND player_url != ''`,
  ).bind(new Date().toISOString(), new Date().toISOString(), id).run()
  return Number(result.meta.changes ?? 0) === 1
}

export async function archiveAdminVideo(env: VidEnv, id: string): Promise<boolean> {
  const result = await env.VID_DB.prepare(
    `UPDATE vid_videos SET status = 'archived', updated_at = ? WHERE id = ? AND status != 'archived'`,
  ).bind(new Date().toISOString(), id).run()
  return Number(result.meta.changes ?? 0) === 1
}
