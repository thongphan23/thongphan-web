CREATE TABLE reader_creation_rate_limits (
  bucket_start TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  updated_at TEXT NOT NULL
);
