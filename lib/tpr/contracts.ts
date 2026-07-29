export type TprRunStatus = 'queued' | 'running' | 'blocked' | 'review' | 'complete' | 'failed'

export interface TprRunRecord {
  run_id: string
  title: string
  status: TprRunStatus
  phase: string
  duration_seconds?: number | null
  progress_percent: number
  started_at?: string | null
  updated_at: string
  completed_at?: string | null
  source_ref?: string | null
  evidence_status: 'missing' | 'partial' | 'verified'
  payload?: Record<string, unknown>
}

export interface TprArtifactRecord {
  artifact_id: string
  run_id?: string | null
  artifact_type: string
  title: string
  sha256: string
  media_type: string
  byte_size: number
  source_ref?: string | null
  public_url?: string | null
  object_key?: string | null
  content_text?: string | null
  created_at: string
  payload?: Record<string, unknown>
}

export interface TprVideoRecord {
  video_id: string
  run_id: string
  variant_id: string
  title: string
  filename: string
  duration_seconds?: number | null
  width?: number | null
  height?: number | null
  status: 'draft' | 'review' | 'approved' | 'published' | 'withdrawn'
  public_url?: string | null
  poster_url?: string | null
  object_key?: string | null
  sha256?: string | null
  created_at: string
  payload?: Record<string, unknown>
}

export interface TprSourceRecord {
  source_id: string
  source_type: string
  title: string
  profile_version: string
  selected_count: number
  rejected_count: number
  last_used_at?: string | null
  next_eligible_ordinal?: number | null
  status: string
  payload?: Record<string, unknown>
}

export interface TprModelRecord {
  model_id: string
  model_type: string
  version: string
  title: string
  status: string
  active: boolean
  updated_at: string
  payload?: Record<string, unknown>
}

export interface TprGraphNodeRecord {
  node_id: string
  run_id?: string | null
  node_type: string
  label: string
  status?: string | null
  payload?: Record<string, unknown>
}

export interface TprGraphEdgeRecord {
  edge_id: string
  run_id?: string | null
  from_ref: string
  to_ref: string
  edge_type: string
  payload?: Record<string, unknown>
}

export interface TprActivityRecord {
  event_id: string
  run_id?: string | null
  event_type: string
  entity_type: string
  entity_id?: string | null
  title: string
  summary: string
  actor: string
  occurred_at: string
  source_ref?: string | null
  payload?: Record<string, unknown>
}

export interface TprCostRecord {
  cost_id: string
  run_id?: string | null
  stage: string
  unit: string
  quantity: number
  estimated_usd?: number | null
  cache_hit: boolean
  occurred_at: string
  payload?: Record<string, unknown>
}

export interface TprTasteChangeRecord {
  change_id: string
  run_id?: string | null
  source_feedback_id?: string | null
  title: string
  status: 'candidate' | 'testing' | 'promoted' | 'rejected' | 'rolled_back'
  scope: string
  summary: string
  created_at: string
  promoted_at?: string | null
  payload?: Record<string, unknown>
}

export interface TprIngestBatch {
  schema_version: '1.0.0'
  batch_id: string
  generated_at: string
  runs?: TprRunRecord[]
  artifacts?: TprArtifactRecord[]
  videos?: TprVideoRecord[]
  sources?: TprSourceRecord[]
  models?: TprModelRecord[]
  graph_nodes?: TprGraphNodeRecord[]
  graph_edges?: TprGraphEdgeRecord[]
  events?: TprActivityRecord[]
  costs?: TprCostRecord[]
  taste_changes?: TprTasteChangeRecord[]
}

export interface TprFeedbackInput {
  run_id: string
  variant_id: string
  timestamp_seconds?: number | null
  beat_id?: string | null
  shot_id?: string | null
  understand: number
  feel: number
  remember: number
  trust: number
  comment: string
  desired_change?: string | null
}

export interface TprDashboardSnapshot {
  generated_at: string
  metrics: {
    runs_today: number
    active_runs: number
    blocked_runs: number
    published_videos: number
    source_profiles: number
    pending_feedback: number
    sync_lag_seconds: number | null
    reuse_rate: number | null
  }
  runs: TprRunRecord[]
  videos: TprVideoRecord[]
  sources: TprSourceRecord[]
  models: TprModelRecord[]
  graph_nodes: TprGraphNodeRecord[]
  graph_edges: TprGraphEdgeRecord[]
  artifacts: TprArtifactRecord[]
  events: TprActivityRecord[]
  costs: TprCostRecord[]
  taste_changes: TprTasteChangeRecord[]
  feedback: Array<TprFeedbackInput & {
    feedback_id: string
    status: string
    created_at: string
  }>
  capacity: {
    mode: 'metadata_only' | 'object_storage_ready'
    object_storage: 'unavailable' | 'ready'
    sync_batch_limit: number
    max_batch_bytes: number
  }
}
