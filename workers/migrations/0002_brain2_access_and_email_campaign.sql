-- Brain2 21-day protected access and versioned email campaign.
-- Applied once through Wrangler's D1 migration ledger.

CREATE TABLE IF NOT EXISTS brain2_access_failures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_key TEXT NOT NULL CHECK(length(client_key) = 22),
  failed_at INTEGER NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_brain2_access_failures_client_time
  ON brain2_access_failures(client_key, failed_at);

ALTER TABLE email_queue
  ADD COLUMN campaign_version TEXT NOT NULL DEFAULT 'legacy-v0';

ALTER TABLE email_queue
  ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE email_queue
  ADD COLUMN last_attempt_at TEXT;

CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_status_schedule
  ON email_queue(campaign_version, status, scheduled_at);

UPDATE challenges
SET title = '21 ngày Brain2 — Biến trải nghiệm thành hệ thống',
    tagline = 'Mỗi ngày một đầu ra quan sát được',
    description = 'Một lộ trình 21 ngày để đưa trải nghiệm, dự án và bài học vào hệ thống có thể tìm lại và dùng cho công việc. Thời lượng thay đổi theo độ sâu của từng bài.',
    duration_days = 21
WHERE slug = 'brain2-21-ngay';
