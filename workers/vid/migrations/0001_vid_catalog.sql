PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vid_videos (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  bunny_video_id TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_creator TEXT NOT NULL,
  source_creator_url TEXT NOT NULL,
  source_video_url TEXT NOT NULL,
  translation_label TEXT NOT NULL,
  rights_status TEXT NOT NULL CHECK (rights_status IN ('owner-reviewed', 'owned', 'licensed', 'permission')),
  rights_note TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  search_text TEXT NOT NULL DEFAULT '',
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  thumbnail_url TEXT NOT NULL DEFAULT '',
  preview_url TEXT NOT NULL DEFAULT '',
  player_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('draft', 'uploading', 'processing', 'ready', 'published', 'failed', 'archived')),
  media_status TEXT NOT NULL CHECK (media_status IN ('pending', 'uploading', 'processing', 'ready', 'failed')),
  featured_rank INTEGER,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vid_topics (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vid_video_topics (
  video_id TEXT NOT NULL REFERENCES vid_videos(id) ON DELETE CASCADE,
  topic_slug TEXT NOT NULL REFERENCES vid_topics(slug) ON DELETE CASCADE,
  PRIMARY KEY (video_id, topic_slug)
);

CREATE TABLE IF NOT EXISTS vid_playlists (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vid_playlist_videos (
  playlist_slug TEXT NOT NULL REFERENCES vid_playlists(slug) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES vid_videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0),
  PRIMARY KEY (playlist_slug, video_id),
  UNIQUE (playlist_slug, position)
);

CREATE TABLE IF NOT EXISTS vid_admin_nonces (
  nonce TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vid_videos_public
  ON vid_videos(status, media_status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_vid_video_topics_topic
  ON vid_video_topics(topic_slug, video_id);
CREATE INDEX IF NOT EXISTS idx_vid_playlist_videos_position
  ON vid_playlist_videos(playlist_slug, position);
CREATE INDEX IF NOT EXISTS idx_vid_admin_nonces_expiry
  ON vid_admin_nonces(expires_at);
