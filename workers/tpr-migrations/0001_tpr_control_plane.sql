PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tpr_runs (
  run_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('queued','running','blocked','review','complete','failed')),
  phase TEXT NOT NULL,
  duration_seconds REAL,
  progress_percent INTEGER NOT NULL CHECK(progress_percent BETWEEN 0 AND 100),
  started_at TEXT,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  source_ref TEXT,
  evidence_status TEXT NOT NULL CHECK(evidence_status IN ('missing','partial','verified')),
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_runs_status_updated ON tpr_runs(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS tpr_artifacts (
  artifact_id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES tpr_runs(run_id),
  artifact_type TEXT NOT NULL,
  title TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  media_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK(byte_size >= 0),
  source_ref TEXT,
  public_url TEXT,
  object_key TEXT,
  content_text TEXT,
  created_at TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_artifacts_run_type ON tpr_artifacts(run_id, artifact_type, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tpr_artifacts_sha_type ON tpr_artifacts(sha256, artifact_type, artifact_id);

CREATE TABLE IF NOT EXISTS tpr_videos (
  video_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES tpr_runs(run_id),
  variant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  duration_seconds REAL,
  width INTEGER,
  height INTEGER,
  status TEXT NOT NULL CHECK(status IN ('draft','review','approved','published','withdrawn')),
  public_url TEXT,
  poster_url TEXT,
  object_key TEXT,
  sha256 TEXT,
  created_at TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_videos_run_status ON tpr_videos(run_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS tpr_sources (
  source_id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  profile_version TEXT NOT NULL,
  selected_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT,
  next_eligible_ordinal INTEGER,
  status TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_sources_type_status ON tpr_sources(source_type, status, title);

CREATE TABLE IF NOT EXISTS tpr_models (
  model_id TEXT PRIMARY KEY,
  model_type TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  active INTEGER NOT NULL CHECK(active IN (0,1)),
  updated_at TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_models_type_active ON tpr_models(model_type, active DESC, updated_at DESC);

CREATE TABLE IF NOT EXISTS tpr_graph_nodes (
  node_id TEXT PRIMARY KEY,
  run_id TEXT,
  node_type TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_graph_nodes_run_type ON tpr_graph_nodes(run_id, node_type);

CREATE TABLE IF NOT EXISTS tpr_graph_edges (
  edge_id TEXT PRIMARY KEY,
  run_id TEXT,
  from_ref TEXT NOT NULL,
  to_ref TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_graph_edges_run_type ON tpr_graph_edges(run_id, edge_type);
CREATE INDEX IF NOT EXISTS idx_tpr_graph_edges_from ON tpr_graph_edges(from_ref);
CREATE INDEX IF NOT EXISTS idx_tpr_graph_edges_to ON tpr_graph_edges(to_ref);

CREATE TABLE IF NOT EXISTS tpr_events (
  event_id TEXT PRIMARY KEY,
  run_id TEXT,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  actor TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  source_ref TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_events_time_type ON tpr_events(occurred_at DESC, event_type);
CREATE INDEX IF NOT EXISTS idx_tpr_events_run_time ON tpr_events(run_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS tpr_costs (
  cost_id TEXT PRIMARY KEY,
  run_id TEXT,
  stage TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity REAL NOT NULL CHECK(quantity >= 0),
  estimated_usd REAL,
  cache_hit INTEGER NOT NULL CHECK(cache_hit IN (0,1)),
  occurred_at TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_costs_time_stage ON tpr_costs(occurred_at DESC, stage);

CREATE TABLE IF NOT EXISTS tpr_feedback (
  feedback_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  timestamp_seconds REAL,
  beat_id TEXT,
  shot_id TEXT,
  understand INTEGER NOT NULL CHECK(understand BETWEEN 1 AND 5),
  feel INTEGER NOT NULL CHECK(feel BETWEEN 1 AND 5),
  remember INTEGER NOT NULL CHECK(remember BETWEEN 1 AND 5),
  trust INTEGER NOT NULL CHECK(trust BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  desired_change TEXT,
  status TEXT NOT NULL CHECK(status IN ('candidate','applied','verified','rejected')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tpr_feedback_status_time ON tpr_feedback(status, created_at DESC);

CREATE TABLE IF NOT EXISTS tpr_taste_changes (
  change_id TEXT PRIMARY KEY,
  run_id TEXT,
  source_feedback_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('candidate','testing','promoted','rejected','rolled_back')),
  scope TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL,
  promoted_at TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_tpr_taste_status_time ON tpr_taste_changes(status, created_at DESC);

CREATE TABLE IF NOT EXISTS tpr_ingest_batches (
  batch_id TEXT PRIMARY KEY,
  generated_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  accepted_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tpr_auth_failures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_key TEXT NOT NULL,
  failed_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tpr_auth_failures_client_time ON tpr_auth_failures(client_key, failed_at DESC);
