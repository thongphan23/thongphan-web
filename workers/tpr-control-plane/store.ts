import type {
  TprActivityRecord,
  TprArtifactRecord,
  TprCostRecord,
  TprDashboardSnapshot,
  TprFeedbackInput,
  TprGraphEdgeRecord,
  TprGraphNodeRecord,
  TprIngestBatch,
  TprModelRecord,
  TprRunRecord,
  TprSourceRecord,
  TprTasteChangeRecord,
  TprVideoRecord,
} from '../../lib/tpr/contracts'
import type { D1DatabaseLike, D1PreparedStatementLike, TprStore } from './types'

const json = (value: unknown) => JSON.stringify(value ?? {})
const parse = <T>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string') return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

function rows<T>(result: { results?: T[] }): T[] {
  return result.results ?? []
}

function withPayload<T extends Record<string, unknown>>(row: T): T & { payload: Record<string, unknown> } {
  const { payload_json: payloadJson, ...rest } = row
  return { ...rest, payload: parse(payloadJson, {}) } as T & { payload: Record<string, unknown> }
}

export class D1TprStore implements TprStore {
  constructor(private readonly db: D1DatabaseLike) {}

  async reserveAuthFailure(clientKey: string, now: number): Promise<number | null> {
    const cutoff = now - 900
    const count = await this.db.prepare(
      'SELECT COUNT(*) AS failure_count FROM tpr_auth_failures WHERE client_key = ? AND failed_at >= ?',
    ).bind(clientKey, cutoff).first<{ failure_count: number }>()
    if (Number(count?.failure_count ?? 0) >= 8) return null
    const result = await this.db.prepare(
      'INSERT INTO tpr_auth_failures (client_key, failed_at) VALUES (?, ?) RETURNING id AS reservation_id',
    ).bind(clientKey, now).first<{ reservation_id: number }>()
    return result?.reservation_id ?? null
  }

  async releaseAuthFailure(reservationId: number, clientKey: string): Promise<void> {
    await this.db.prepare('DELETE FROM tpr_auth_failures WHERE id = ? AND client_key = ?')
      .bind(reservationId, clientKey).run()
  }

  async ingest(batch: TprIngestBatch): Promise<{ accepted: number; duplicates: number }> {
    const existing = await this.db.prepare('SELECT batch_id FROM tpr_ingest_batches WHERE batch_id = ?')
      .bind(batch.batch_id).first<{ batch_id: string }>()
    if (existing) return { accepted: 0, duplicates: this.itemCount(batch) }

    const statements: D1PreparedStatementLike[] = []
    for (const item of batch.runs ?? []) statements.push(this.runStatement(item))
    for (const item of batch.artifacts ?? []) statements.push(this.artifactStatement(item))
    for (const item of batch.videos ?? []) statements.push(this.videoStatement(item))
    for (const item of batch.sources ?? []) statements.push(this.sourceStatement(item))
    for (const item of batch.models ?? []) statements.push(this.modelStatement(item))
    for (const item of batch.graph_nodes ?? []) statements.push(this.nodeStatement(item))
    for (const item of batch.graph_edges ?? []) statements.push(this.edgeStatement(item))
    for (const item of batch.events ?? []) statements.push(this.eventStatement(item))
    for (const item of batch.costs ?? []) statements.push(this.costStatement(item))
    for (const item of batch.taste_changes ?? []) statements.push(this.tasteStatement(item))
    const accepted = statements.length
    statements.push(this.db.prepare(
      `INSERT INTO tpr_ingest_batches
       (batch_id, generated_at, received_at, accepted_count, duplicate_count)
       VALUES (?, ?, ?, ?, 0)`,
    ).bind(batch.batch_id, batch.generated_at, new Date().toISOString(), accepted))
    await this.db.batch(statements)
    return { accepted, duplicates: 0 }
  }

  async dashboard(nowIso: string, objectStorageReady: boolean): Promise<TprDashboardSnapshot> {
    const [runsResult, videosResult, sourcesResult, modelsResult, nodesResult, edgesResult,
      artifactsResult, eventsResult, costsResult, tasteResult, feedbackResult, counts] = await Promise.all([
      this.db.prepare('SELECT * FROM tpr_runs ORDER BY updated_at DESC LIMIT 50').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_videos ORDER BY created_at DESC LIMIT 50').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_sources ORDER BY last_used_at DESC, title LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_models ORDER BY active DESC, updated_at DESC LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_graph_nodes ORDER BY rowid DESC LIMIT 150').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_graph_edges ORDER BY rowid DESC LIMIT 200').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_artifacts ORDER BY created_at DESC LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_events ORDER BY occurred_at DESC LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_costs ORDER BY occurred_at DESC LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_taste_changes ORDER BY created_at DESC LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare('SELECT * FROM tpr_feedback ORDER BY created_at DESC LIMIT 100').all<Record<string, unknown>>(),
      this.db.prepare(`SELECT
        SUM(CASE WHEN date(updated_at) = date(?) THEN 1 ELSE 0 END) AS runs_today,
        SUM(CASE WHEN status IN ('queued','running','review') THEN 1 ELSE 0 END) AS active_runs,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_runs
        FROM tpr_runs`).bind(nowIso).first<Record<string, unknown>>(),
    ])

    const latestSync = await this.db.prepare('SELECT received_at FROM tpr_ingest_batches ORDER BY received_at DESC LIMIT 1')
      .first<{ received_at: string }>()
    const published = await this.db.prepare("SELECT COUNT(*) AS count FROM tpr_videos WHERE status = 'published'")
      .first<{ count: number }>()
    const pending = await this.db.prepare("SELECT COUNT(*) AS count FROM tpr_feedback WHERE status = 'candidate'")
      .first<{ count: number }>()
    const syncLag = latestSync ? Math.max(0, Math.floor((Date.parse(nowIso) - Date.parse(latestSync.received_at)) / 1000)) : null
    const costRows = rows(costsResult).map(withPayload) as unknown as TprCostRecord[]
    const reuseItems = costRows.filter((item) => item.unit === 'candidate' || item.unit === 'observation')
    const reuseRate = reuseItems.length ? reuseItems.filter((item) => item.cache_hit).length / reuseItems.length : null

    return {
      generated_at: nowIso,
      metrics: {
        runs_today: Number(counts?.runs_today ?? 0),
        active_runs: Number(counts?.active_runs ?? 0),
        blocked_runs: Number(counts?.blocked_runs ?? 0),
        published_videos: Number(published?.count ?? 0),
        source_profiles: rows(sourcesResult).length,
        pending_feedback: Number(pending?.count ?? 0),
        sync_lag_seconds: syncLag,
        reuse_rate: reuseRate,
      },
      runs: rows(runsResult).map(withPayload) as unknown as TprRunRecord[],
      videos: rows(videosResult).map(withPayload) as unknown as TprVideoRecord[],
      sources: rows(sourcesResult).map(withPayload) as unknown as TprSourceRecord[],
      models: rows(modelsResult).map((row) => ({ ...withPayload(row), active: Boolean(row.active) })) as unknown as TprModelRecord[],
      graph_nodes: rows(nodesResult).map(withPayload) as unknown as TprGraphNodeRecord[],
      graph_edges: rows(edgesResult).map(withPayload) as unknown as TprGraphEdgeRecord[],
      artifacts: rows(artifactsResult).map(withPayload) as unknown as TprArtifactRecord[],
      events: rows(eventsResult).map(withPayload) as unknown as TprActivityRecord[],
      costs: costRows,
      taste_changes: rows(tasteResult).map(withPayload) as unknown as TprTasteChangeRecord[],
      feedback: rows(feedbackResult) as unknown as TprDashboardSnapshot['feedback'],
      capacity: {
        mode: objectStorageReady ? 'object_storage_ready' : 'metadata_only',
        object_storage: objectStorageReady ? 'ready' : 'unavailable',
        sync_batch_limit: 100,
        max_batch_bytes: 524_288,
      },
    }
  }

  async artifact(artifactId: string): Promise<TprArtifactRecord | null> {
    const row = await this.db.prepare('SELECT * FROM tpr_artifacts WHERE artifact_id = ?')
      .bind(artifactId).first<Record<string, unknown>>()
    return row ? withPayload(row) as unknown as TprArtifactRecord : null
  }

  async feedback(input: TprFeedbackInput, nowIso: string): Promise<{ feedback_id: string; taste_change_id: string }> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json({ ...input, nowIso })))
    const suffix = [...new Uint8Array(digest)].slice(0, 10).map((value) => value.toString(16).padStart(2, '0')).join('')
    const feedbackId = `FB-${suffix}`
    const tasteId = `TC-${suffix}`
    await this.db.batch([
      this.db.prepare(`INSERT INTO tpr_feedback
        (feedback_id, run_id, variant_id, timestamp_seconds, beat_id, shot_id,
         understand, feel, remember, trust, comment, desired_change, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate', ?)`)
        .bind(feedbackId, input.run_id, input.variant_id, input.timestamp_seconds ?? null,
          input.beat_id ?? null, input.shot_id ?? null, input.understand, input.feel,
          input.remember, input.trust, input.comment, input.desired_change ?? null, nowIso),
      this.db.prepare(`INSERT INTO tpr_taste_changes
        (change_id, run_id, source_feedback_id, title, status, scope, summary, created_at, payload_json)
        VALUES (?, ?, ?, ?, 'candidate', 'editorial', ?, ?, ?)`)
        .bind(tasteId, input.run_id, feedbackId, `Ứng viên Taste từ ${input.variant_id}`,
          input.desired_change || input.comment, nowIso, json({ review_axes: {
            understand: input.understand, feel: input.feel, remember: input.remember, trust: input.trust,
          }, beat_id: input.beat_id ?? null, shot_id: input.shot_id ?? null })),
      this.db.prepare(`INSERT INTO tpr_events
        (event_id, run_id, event_type, entity_type, entity_id, title, summary, actor, occurred_at, source_ref, payload_json)
        VALUES (?, ?, 'owner_feedback_recorded', 'feedback', ?, 'Owner feedback', ?, 'owner', ?, 'tpr-console', ?)`)
        .bind(`EV-${suffix}`, input.run_id, feedbackId, input.comment, nowIso, json({ taste_change_id: tasteId })),
    ])
    return { feedback_id: feedbackId, taste_change_id: tasteId }
  }

  private itemCount(batch: TprIngestBatch): number {
    return ['runs','artifacts','videos','sources','models','graph_nodes','graph_edges','events','costs','taste_changes']
      .reduce((sum, key) => sum + ((batch[key as keyof TprIngestBatch] as unknown[] | undefined)?.length ?? 0), 0)
  }

  private runStatement(item: TprRunRecord) {
    return this.db.prepare(`INSERT INTO tpr_runs
      (run_id,title,status,phase,duration_seconds,progress_percent,started_at,updated_at,completed_at,source_ref,evidence_status,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(run_id) DO UPDATE SET
      title=excluded.title,status=excluded.status,phase=excluded.phase,duration_seconds=excluded.duration_seconds,
      progress_percent=excluded.progress_percent,updated_at=excluded.updated_at,completed_at=excluded.completed_at,
      source_ref=excluded.source_ref,evidence_status=excluded.evidence_status,payload_json=excluded.payload_json`)
      .bind(item.run_id,item.title,item.status,item.phase,item.duration_seconds ?? null,item.progress_percent,item.started_at ?? null,
        item.updated_at,item.completed_at ?? null,item.source_ref ?? null,item.evidence_status,json(item.payload))
  }

  private artifactStatement(item: TprArtifactRecord) {
    return this.db.prepare(`INSERT INTO tpr_artifacts
      (artifact_id,run_id,artifact_type,title,sha256,media_type,byte_size,source_ref,public_url,object_key,content_text,created_at,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(artifact_id) DO UPDATE SET
      title=excluded.title,public_url=excluded.public_url,object_key=excluded.object_key,content_text=excluded.content_text,payload_json=excluded.payload_json`)
      .bind(item.artifact_id,item.run_id ?? null,item.artifact_type,item.title,item.sha256,item.media_type,item.byte_size,
        item.source_ref ?? null,item.public_url ?? null,item.object_key ?? null,item.content_text ?? null,item.created_at,json(item.payload))
  }

  private videoStatement(item: TprVideoRecord) {
    return this.db.prepare(`INSERT INTO tpr_videos
      (video_id,run_id,variant_id,title,filename,duration_seconds,width,height,status,public_url,poster_url,object_key,sha256,created_at,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(video_id) DO UPDATE SET
      title=excluded.title,status=excluded.status,public_url=excluded.public_url,poster_url=excluded.poster_url,
      object_key=excluded.object_key,payload_json=excluded.payload_json`)
      .bind(item.video_id,item.run_id,item.variant_id,item.title,item.filename,item.duration_seconds ?? null,item.width ?? null,
        item.height ?? null,item.status,item.public_url ?? null,item.poster_url ?? null,item.object_key ?? null,item.sha256 ?? null,item.created_at,json(item.payload))
  }

  private sourceStatement(item: TprSourceRecord) {
    return this.db.prepare(`INSERT INTO tpr_sources
      (source_id,source_type,title,profile_version,selected_count,rejected_count,last_used_at,next_eligible_ordinal,status,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET
      title=excluded.title,profile_version=excluded.profile_version,selected_count=excluded.selected_count,
      rejected_count=excluded.rejected_count,last_used_at=excluded.last_used_at,next_eligible_ordinal=excluded.next_eligible_ordinal,
      status=excluded.status,payload_json=excluded.payload_json`)
      .bind(item.source_id,item.source_type,item.title,item.profile_version,item.selected_count,item.rejected_count,
        item.last_used_at ?? null,item.next_eligible_ordinal ?? null,item.status,json(item.payload))
  }

  private modelStatement(item: TprModelRecord) {
    return this.db.prepare(`INSERT INTO tpr_models
      (model_id,model_type,version,title,status,active,updated_at,payload_json)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(model_id) DO UPDATE SET
      version=excluded.version,title=excluded.title,status=excluded.status,active=excluded.active,updated_at=excluded.updated_at,payload_json=excluded.payload_json`)
      .bind(item.model_id,item.model_type,item.version,item.title,item.status,item.active ? 1 : 0,item.updated_at,json(item.payload))
  }

  private nodeStatement(item: TprGraphNodeRecord) {
    return this.db.prepare(`INSERT INTO tpr_graph_nodes (node_id,run_id,node_type,label,status,payload_json)
      VALUES (?,?,?,?,?,?) ON CONFLICT(node_id) DO UPDATE SET label=excluded.label,status=excluded.status,payload_json=excluded.payload_json`)
      .bind(item.node_id,item.run_id ?? null,item.node_type,item.label,item.status ?? null,json(item.payload))
  }

  private edgeStatement(item: TprGraphEdgeRecord) {
    return this.db.prepare(`INSERT INTO tpr_graph_edges (edge_id,run_id,from_ref,to_ref,edge_type,payload_json)
      VALUES (?,?,?,?,?,?) ON CONFLICT(edge_id) DO UPDATE SET payload_json=excluded.payload_json`)
      .bind(item.edge_id,item.run_id ?? null,item.from_ref,item.to_ref,item.edge_type,json(item.payload))
  }

  private eventStatement(item: TprActivityRecord) {
    return this.db.prepare(`INSERT OR IGNORE INTO tpr_events
      (event_id,run_id,event_type,entity_type,entity_id,title,summary,actor,occurred_at,source_ref,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(item.event_id,item.run_id ?? null,item.event_type,item.entity_type,item.entity_id ?? null,item.title,item.summary,
        item.actor,item.occurred_at,item.source_ref ?? null,json(item.payload))
  }

  private costStatement(item: TprCostRecord) {
    return this.db.prepare(`INSERT OR IGNORE INTO tpr_costs
      (cost_id,run_id,stage,unit,quantity,estimated_usd,cache_hit,occurred_at,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(item.cost_id,item.run_id ?? null,item.stage,item.unit,item.quantity,item.estimated_usd ?? null,item.cache_hit ? 1 : 0,
        item.occurred_at,json(item.payload))
  }

  private tasteStatement(item: TprTasteChangeRecord) {
    return this.db.prepare(`INSERT INTO tpr_taste_changes
      (change_id,run_id,source_feedback_id,title,status,scope,summary,created_at,promoted_at,payload_json)
      VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(change_id) DO UPDATE SET
      status=excluded.status,summary=excluded.summary,promoted_at=excluded.promoted_at,payload_json=excluded.payload_json`)
      .bind(item.change_id,item.run_id ?? null,item.source_feedback_id ?? null,item.title,item.status,item.scope,item.summary,
        item.created_at,item.promoted_at ?? null,json(item.payload))
  }
}
