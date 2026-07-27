DROP TABLE reader_creation_rate_limits;

CREATE TABLE reader_creation_rate_limits (
  caller_hash TEXT NOT NULL,
  bucket_start TEXT NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (caller_hash, bucket_start)
);

CREATE INDEX idx_reader_creation_rate_limits_updated_at
  ON reader_creation_rate_limits(updated_at);

CREATE INDEX idx_anonymous_readers_created_at
  ON anonymous_readers(created_at);
