import assert from 'node:assert/strict'
import test from 'node:test'

import type { TprDashboardSnapshot, TprFeedbackInput, TprIngestBatch } from '../lib/tpr/contracts'
import { formatAccessCodeHash } from '../workers/tpr-control-plane/auth'
import { createTprControlPlaneWorker } from '../workers/tpr-control-plane/index'
import type { TprControlPlaneEnv, TprStore } from '../workers/tpr-control-plane/types'

const ORIGIN = 'https://thongphan.com'
const NOW = 1_785_364_800
const ACCESS_CODE = 'owner-test-code-with-at-least-thirty-two-bytes'
const SESSION_SECRET = 'owner-test-session-secret-with-at-least-thirty-two-bytes'
const SYNC_SECRET = 'sync-test-secret-with-at-least-thirty-two-bytes'

class MemoryStore implements TprStore {
  failures = 0
  batches = new Map<string, TprIngestBatch>()
  feedbackItems: TprFeedbackInput[] = []
  fail = false

  async reserveAuthFailure() { if (this.fail) throw new Error('db'); this.failures += 1; return this.failures <= 8 ? this.failures : null }
  async releaseAuthFailure() { if (this.fail) throw new Error('db') }
  async ingest(batch: TprIngestBatch) {
    if (this.fail) throw new Error('db')
    const count = Object.values(batch).filter(Array.isArray).reduce((sum, items) => sum + items.length, 0)
    if (this.batches.has(batch.batch_id)) return { accepted: 0, duplicates: count }
    this.batches.set(batch.batch_id, batch)
    return { accepted: count, duplicates: 0 }
  }
  async dashboard(nowIso: string, objectReady: boolean): Promise<TprDashboardSnapshot> {
    if (this.fail) throw new Error('db')
    return {
      generated_at: nowIso,
      metrics: { runs_today: 1, active_runs: 0, blocked_runs: 0, published_videos: 3, source_profiles: 6, pending_feedback: 0, sync_lag_seconds: 10, reuse_rate: 0.76 },
      runs: [], videos: [], sources: [], models: [], graph_nodes: [], graph_edges: [], artifacts: [], events: [], costs: [], taste_changes: [], feedback: [],
      capacity: { mode: objectReady ? 'object_storage_ready' : 'metadata_only', object_storage: objectReady ? 'ready' : 'unavailable', sync_batch_limit: 100, max_batch_bytes: 524288 },
    }
  }
  async artifact() { return null }
  async feedback(input: TprFeedbackInput) { this.feedbackItems.push(input); return { feedback_id: 'FB-1', taste_change_id: 'TC-1' } }
}

async function fixture() {
  const store = new MemoryStore()
  const env = {
    TPR_DB: {} as TprControlPlaneEnv['TPR_DB'],
    TPR_OWNER_ACCESS_CODE_HASH: await formatAccessCodeHash(ACCESS_CODE),
    TPR_SESSION_SECRET: SESSION_SECRET,
    TPR_SYNC_SECRET: SYNC_SECRET,
  }
  const worker = createTprControlPlaneWorker({ now: () => NOW, storeFactory: () => store })
  return { store, env, worker }
}

function request(path: string, method = 'GET', options: { body?: unknown; cookie?: string; origin?: string; bearer?: string } = {}) {
  const headers = new Headers({ Accept: 'application/json', 'CF-Connecting-IP': '203.0.113.8' })
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (options.cookie) headers.set('Cookie', options.cookie)
  if (options.origin) headers.set('Origin', options.origin)
  if (options.bearer) headers.set('Authorization', `Bearer ${options.bearer}`)
  return new Request(`${ORIGIN}/api/tpr/${path}`, { method, headers, ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}) })
}

function cookie(response: Response) {
  const value = response.headers.get('Set-Cookie')
  assert.ok(value)
  return value.split(';')[0]
}

async function login(f: Awaited<ReturnType<typeof fixture>>) {
  const response = await f.worker.fetch(request('session', 'POST', { body: { code: ACCESS_CODE }, origin: ORIGIN }), f.env)
  assert.equal(response.status, 204)
  return cookie(response)
}

test('owner session is same-origin, signed, private and fail-closed', async () => {
  const f = await fixture()
  assert.equal((await f.worker.fetch(request('dashboard'), f.env)).status, 401)
  assert.equal((await f.worker.fetch(request('session', 'POST', { body: { code: ACCESS_CODE } }), f.env)).status, 403)
  assert.equal((await f.worker.fetch(request('session', 'POST', { body: { code: 'wrong' }, origin: ORIGIN }), f.env)).status, 401)
  const session = await login(f)
  assert.match(session, /^__Secure-tp_tpr_session=/)
  const response = await f.worker.fetch(request('dashboard', 'GET', { cookie: session }), f.env)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0')
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.equal((await response.json() as TprDashboardSnapshot).metrics.published_videos, 3)
  const tampered = `${session}x`
  assert.equal((await f.worker.fetch(request('dashboard', 'GET', { cookie: tampered }), f.env)).status, 401)
})

test('ingest requires a strong secret, bounds batches and is idempotent', async () => {
  const f = await fixture()
  const batch: TprIngestBatch = {
    schema_version: '1.0.0', batch_id: 'BATCH-test-0001', generated_at: new Date(NOW * 1000).toISOString(),
    events: [{ event_id: 'EV-1', event_type: 'codex_message', entity_type: 'codex', title: 'Feedback', summary: 'Nhịp cần nhanh hơn', actor: 'owner', occurred_at: new Date(NOW * 1000).toISOString() }],
  }
  assert.equal((await f.worker.fetch(request('ingest', 'POST', { body: batch }), f.env)).status, 401)
  assert.equal((await f.worker.fetch(request('ingest', 'POST', { body: batch, bearer: 'x'.repeat(32) }), f.env)).status, 401)
  const first = await f.worker.fetch(request('ingest', 'POST', { body: batch, bearer: SYNC_SECRET }), f.env)
  assert.equal(first.status, 202)
  assert.deepEqual(await first.json(), { ok: true, accepted: 1, duplicates: 0 })
  const second = await f.worker.fetch(request('ingest', 'POST', { body: batch, bearer: SYNC_SECRET }), f.env)
  assert.deepEqual(await second.json(), { ok: true, accepted: 0, duplicates: 1 })
  const oversized = request('ingest', 'POST', { body: { ...batch, padding: 'x'.repeat(530_000) }, bearer: SYNC_SECRET })
  assert.equal((await f.worker.fetch(oversized, f.env)).status, 413)
})

test('feedback is exact-target evidence and only creates a Taste candidate', async () => {
  const f = await fixture()
  const session = await login(f)
  const input: TprFeedbackInput = {
    run_id: 'RUN-1', variant_id: 'prada', timestamp_seconds: 38.5, beat_id: 'B05', shot_id: 'S21',
    understand: 4, feel: 2, remember: 3, trust: 4,
    comment: 'Đoạn áp lực chưa đủ dồn dập.', desired_change: 'Tăng nhịp cắt trong beat B05.',
  }
  const response = await f.worker.fetch(request('feedback', 'POST', { body: input, origin: ORIGIN, cookie: session }), f.env)
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { feedback_id: 'FB-1', taste_change_id: 'TC-1' })
  assert.deepEqual(f.store.feedbackItems, [input])
  assert.equal((await f.worker.fetch(request('feedback', 'POST', { body: { ...input, understand: 9 }, origin: ORIGIN, cookie: session }), f.env)).status, 422)
})

test('missing object storage and D1 failures are explicit', async () => {
  const f = await fixture()
  assert.equal((await f.worker.fetch(request('objects/sha256-test'), f.env)).status, 503)
  f.store.fail = true
  const response = await f.worker.fetch(request('session', 'POST', { body: { code: ACCESS_CODE }, origin: ORIGIN }), f.env)
  assert.equal(response.status, 503)
})
