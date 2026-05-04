-- D1 Database Schema for thongphan.com
-- Deploy: wrangler d1 execute thongphan-db --file=./workers/schema.sql

-- BLOG POSTS (backup storage + metadata)
CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK(category IN ('ai','career','content','brain2','finance')),
  published_at TEXT NOT NULL,  -- ISO8601
  reading_time INTEGER,         -- minutes
  is_published INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- CHALLENGE PROGRAMS
CREATE TABLE IF NOT EXISTS challenges (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  tagline       TEXT,
  description   TEXT,
  duration_days INTEGER NOT NULL,
  is_active     INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- CHALLENGE SIGNUPS
CREATE TABLE IF NOT EXISTS challenge_signups (
  id           TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  current_day  INTEGER DEFAULT 0,
  signed_up_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  is_unsubscribed INTEGER DEFAULT 0,
  UNIQUE(challenge_id, email)
);

-- EMAIL QUEUE (for drip campaign)
CREATE TABLE IF NOT EXISTS email_queue (
  id        TEXT PRIMARY KEY,
  signup_id TEXT NOT NULL REFERENCES challenge_signups(id),
  day       INTEGER NOT NULL,
  subject   TEXT NOT NULL,
  body      TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,  -- ISO8601
  sent_at   TEXT,
  status    TEXT DEFAULT 'pending' CHECK(status IN ('pending','sent','failed','bounced')),
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(signup_id, day)
);

-- EMAIL LOGS (sent history)
CREATE TABLE IF NOT EXISTS email_logs (
  id        TEXT PRIMARY KEY,
  signup_id TEXT NOT NULL REFERENCES challenge_signups(id),
  day       INTEGER NOT NULL,
  sent_at   TEXT DEFAULT (datetime('now')),
  status    TEXT DEFAULT 'sent',  -- sent | failed | bounced
  UNIQUE(signup_id, day)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_signups_email ON challenge_signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_challenge ON challenge_signups(challenge_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_signup ON email_logs(signup_id);

-- Seed data: 21 Ngày Brain2 Challenge
INSERT OR IGNORE INTO challenges (id, slug, title, tagline, description, duration_days) VALUES (
  'brain2-21',
  '21-ngay-brain2',
  '21 Ngày Brain2',
  'Xây bộ não thứ hai trong 3 tuần',
  'Challenge 21 ngày giúp bạn xây dựng hệ thống Brain2 (bộ não thứ hai) bằng Obsidian + AI. Mỗi ngày 1 email với bài tập thực hành, template, và insight từ Thông Phan.',
  21
);
