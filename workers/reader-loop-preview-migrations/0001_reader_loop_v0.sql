PRAGMA foreign_keys = ON;

CREATE TABLE anonymous_readers (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE reader_questions (
  id TEXT PRIMARY KEY,
  reader_id TEXT NOT NULL REFERENCES anonymous_readers(id),
  source TEXT NOT NULL CHECK (source IN ('sample', 'custom')),
  sample_id TEXT,
  question_text TEXT NOT NULL CHECK (length(question_text) BETWEEN 1 AND 500),
  created_at TEXT NOT NULL
);

CREATE TABLE recommendation_decisions (
  id TEXT PRIMARY KEY,
  reader_id TEXT NOT NULL REFERENCES anonymous_readers(id),
  question_id TEXT NOT NULL REFERENCES reader_questions(id),
  policy_version TEXT NOT NULL,
  candidates_json TEXT NOT NULL,
  selected_content_id TEXT NOT NULL,
  selected_content_url TEXT NOT NULL,
  reason_codes_json TEXT NOT NULL,
  rationale TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  unknowns_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE reading_sessions (
  id TEXT PRIMARY KEY,
  reader_id TEXT NOT NULL REFERENCES anonymous_readers(id),
  decision_id TEXT NOT NULL REFERENCES recommendation_decisions(id),
  content_id TEXT NOT NULL,
  content_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('opened', 'in_progress', 'completed')),
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE reading_evidence_summaries (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES reading_sessions(id),
  visible_ms INTEGER NOT NULL DEFAULT 0 CHECK (visible_ms >= 0),
  active_ms INTEGER NOT NULL DEFAULT 0 CHECK (active_ms >= 0),
  max_scroll_percent INTEGER NOT NULL DEFAULT 0 CHECK (max_scroll_percent BETWEEN 0 AND 100),
  sections_seen_json TEXT NOT NULL DEFAULT '[]',
  meaningful_interaction_count INTEGER NOT NULL DEFAULT 0 CHECK (meaningful_interaction_count >= 0),
  opened_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE manual_completions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES reading_sessions(id),
  confirmed_at TEXT NOT NULL
);

CREATE TABLE reflections (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES reading_sessions(id),
  key_takeaway TEXT NOT NULL CHECK (length(key_takeaway) BETWEEN 1 AND 1200),
  next_step TEXT NOT NULL CHECK (length(next_step) BETWEEN 1 AND 1200),
  created_at TEXT NOT NULL
);

CREATE TABLE next_action_decisions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES reading_sessions(id),
  policy_version TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_label TEXT NOT NULL,
  action_url TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_used_json TEXT NOT NULL,
  unknowns_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX reader_questions_reader_created_idx ON reader_questions(reader_id, created_at DESC);
CREATE INDEX recommendation_reader_created_idx ON recommendation_decisions(reader_id, created_at DESC);
CREATE INDEX reading_sessions_reader_updated_idx ON reading_sessions(reader_id, updated_at DESC);
