import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createReaderLoopApi,
  type ReaderLoopStore,
  type ReaderRecord,
  type RecommendationRecord,
  type ReadingSessionRecord,
  type EvidenceSummary,
  type CompletionRecord,
} from '../workers/reader-loop-preview'

class MemoryStore implements ReaderLoopStore {
  readers = new Map<string, ReaderRecord>()
  recommendations = new Map<string, RecommendationRecord>()
  sessions = new Map<string, ReadingSessionRecord>()
  evidence = new Map<string, EvidenceSummary>()
  completions = new Map<string, CompletionRecord>()

  async createReader(record: ReaderRecord) { this.readers.set(record.id, record) }
  async findReaderByTokenHash(tokenHash: string) {
    return [...this.readers.values()].find((reader) => reader.tokenHash === tokenHash) ?? null
  }
  async createRecommendation(record: RecommendationRecord) { this.recommendations.set(record.id, record) }
  async findRecommendation(readerId: string, decisionId: string) {
    const record = this.recommendations.get(decisionId)
    return record?.readerId === readerId ? record : null
  }
  async createSession(record: ReadingSessionRecord, summary: EvidenceSummary) {
    this.sessions.set(record.id, record)
    this.evidence.set(record.id, summary)
  }
  async findSession(readerId: string, sessionId: string) {
    const record = this.sessions.get(sessionId)
    return record?.readerId === readerId ? { ...record, evidence: this.evidence.get(sessionId)! } : null
  }
  async updateEvidence(readerId: string, sessionId: string, next: EvidenceSummary) {
    const session = await this.findSession(readerId, sessionId)
    if (!session) return null
    this.evidence.set(sessionId, next)
    this.sessions.set(sessionId, { ...session, status: 'in_progress', updatedAt: next.updatedAt })
    return next
  }
  async completeSession(readerId: string, sessionId: string, record: CompletionRecord) {
    const session = await this.findSession(readerId, sessionId)
    if (!session) return null
    const existing = this.completions.get(sessionId)
    if (existing) return existing
    this.completions.set(sessionId, record)
    this.sessions.set(sessionId, { ...session, status: 'completed', updatedAt: record.createdAt })
    return record
  }
  async getState(readerId: string) {
    const sessions = [...this.sessions.values()].filter((item) => item.readerId === readerId)
    const active = sessions.find((item) => item.status !== 'completed') ?? null
    const activeSession = active ? await this.findSession(readerId, active.id) : null
    const latestCompletion = [...this.completions.values()].find((item) => item.readerId === readerId) ?? null
    return { activeSession, latestCompletion }
  }
  async getInspector(readerId: string) {
    const recommendation = [...this.recommendations.values()].find((item) => item.readerId === readerId) ?? null
    const session = [...this.sessions.values()].find((item) => item.readerId === readerId) ?? null
    return {
      question: recommendation?.questionText ?? null,
      recommendation,
      session: session ? { ...session, evidence: this.evidence.get(session.id) } : null,
      completion: session ? this.completions.get(session.id) ?? null : null,
    }
  }
}

async function json(response: Response) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.json() as Promise<Record<string, any>>
}

test('anonymous reader completes the evidence-to-next-action flow and can resume', async () => {
  const store = new MemoryStore()
  let sequence = 0
  const api = createReaderLoopApi(store, {
    now: () => '2026-07-28T02:00:00.000Z',
    randomId: (prefix) => `${prefix}_${++sequence}`,
    randomToken: () => 'reader-token-for-test',
  })

  const readerResponse = await api(new Request('https://preview.test/v1/readers', { method: 'POST' }))
  assert.equal(readerResponse.status, 201)
  const reader = await json(readerResponse)
  assert.match(reader.reader_id, /^rdr_/)
  assert.equal(reader.reader_token, 'reader-token-for-test')

  const auth = { Authorization: `Reader ${reader.reader_token}`, 'content-type': 'application/json' }
  const recommendationResponse = await api(new Request('https://preview.test/v1/recommendations', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ question_id: 'ai_overload', question_text: 'Tôi muốn dùng AI nhưng đang quá tải công cụ và kiến thức.' }),
  }))
  assert.equal(recommendationResponse.status, 201)
  const recommendation = await json(recommendationResponse)
  assert.equal(recommendation.primary.id, 'ai-overload-map')
  assert.equal(recommendation.alternatives.length, 2)
  assert.match(recommendation.decision_id, /^dec_/)

  const sessionResponse = await api(new Request('https://preview.test/v1/reading-sessions', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ decision_id: recommendation.decision_id }),
  }))
  assert.equal(sessionResponse.status, 201)
  const session = await json(sessionResponse)
  assert.match(session.session_id, /^rs_/)
  assert.equal(session.content_url, recommendation.primary.url)

  for (const evidence of [
    { visible_ms: 1200, active_ms: 900, max_scroll_percent: 30, sections_seen: ['intro'], meaningful_interaction_count: 1 },
    { visible_ms: 2500, active_ms: 1800, max_scroll_percent: 76, sections_seen: ['intro', 'body'], meaningful_interaction_count: 2 },
  ]) {
    const response = await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}/evidence`, {
      method: 'POST', headers: auth, body: JSON.stringify(evidence),
    }))
    assert.equal(response.status, 200)
  }

  const resumed = await json(await api(new Request('https://preview.test/v1/state', { headers: auth })))
  assert.equal(resumed.active_session.id, session.session_id)
  assert.equal(resumed.active_session.evidence.max_scroll_percent, 76)
  assert.deepEqual(resumed.active_session.evidence.sections_seen, ['body', 'intro'])

  const completionResponse = await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}/complete`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      key_takeaway: 'Tôi cần bắt đầu từ một việc thật thay vì học thêm công cụ.',
      next_step: 'Tôi sẽ chọn một việc lặp lại để thử AI hỗ trợ.',
    }),
  }))
  assert.equal(completionResponse.status, 201)
  const completion = await json(completionResponse)
  assert.equal(completion.next_action.type, 'do_action')
  assert.ok(completion.next_action.evidence_used.includes('manual_completion'))

  const repeated = await json(await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}/complete`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ key_takeaway: 'Nội dung khác không được ghi đè.', next_step: 'Bước khác không được ghi đè.' }),
  })))
  assert.equal(repeated.manual_completion.id, completion.manual_completion.id)
  assert.equal(repeated.reflection.id, completion.reflection.id)
  assert.equal(repeated.next_action.id, completion.next_action.id)
  assert.equal(repeated.reflection.key_takeaway, completion.reflection.key_takeaway)

  const postCompletionEvidence = await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}/evidence`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ visible_ms: 9999, active_ms: 9999, max_scroll_percent: 100, sections_seen: ['after'], meaningful_interaction_count: 99 }),
  }))
  assert.equal(postCompletionEvidence.status, 409)

  const inspector = await json(await api(new Request('https://preview.test/v1/inspector', { headers: auth })))
  assert.equal(inspector.question, 'Tôi muốn dùng AI nhưng đang quá tải công cụ và kiến thức.')
  assert.equal(inspector.recommendation.policy_version, 'reader-loop-rules-v0.1.0')
  assert.equal(inspector.session.evidence.active_ms, 1800)
  assert.equal(inspector.completion.reflection.key_takeaway, 'Tôi cần bắt đầu từ một việc thật thay vì học thêm công cụ.')
  assert.equal(inspector.completion.next_action.type, 'do_action')
})

test('reflection is required and a different anonymous token cannot inspect the session', async () => {
  const store = new MemoryStore()
  let sequence = 0
  const api = createReaderLoopApi(store, {
    now: () => '2026-07-28T02:00:00.000Z',
    randomId: (prefix) => `${prefix}_${++sequence}`,
    randomToken: () => `reader-token-long-${sequence}`,
  })

  const first = await json(await api(new Request('https://preview.test/v1/readers', { method: 'POST' })))
  const firstHeaders = { Authorization: `Reader ${first.reader_token}`, 'content-type': 'application/json' }
  const recommendation = await json(await api(new Request('https://preview.test/v1/recommendations', {
    method: 'POST', headers: firstHeaders, body: JSON.stringify({ question_id: 'expertise_asset', question_text: 'Tôi có chuyên môn.' }),
  })))
  const session = await json(await api(new Request('https://preview.test/v1/reading-sessions', {
    method: 'POST', headers: firstHeaders, body: JSON.stringify({ decision_id: recommendation.decision_id }),
  })))

  const invalid = await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}/complete`, {
    method: 'POST', headers: firstHeaders, body: JSON.stringify({ key_takeaway: '', next_step: '' }),
  }))
  assert.equal(invalid.status, 400)

  const second = await json(await api(new Request('https://preview.test/v1/readers', { method: 'POST' })))
  const forbidden = await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}`, {
    headers: { Authorization: `Reader ${second.reader_token}` },
  }))
  assert.equal(forbidden.status, 404)
})

test('free-text inputs reject likely email addresses and phone numbers', async () => {
  const store = new MemoryStore()
  let sequence = 0
  const api = createReaderLoopApi(store, {
    now: () => '2026-07-28T02:00:00.000Z',
    randomId: (prefix) => `${prefix}_${++sequence}`,
    randomToken: () => 'reader-token-pii-test',
  })
  const reader = await json(await api(new Request('https://preview.test/v1/readers', { method: 'POST' })))
  const headers = { Authorization: `Reader ${reader.reader_token}`, 'content-type': 'application/json' }

  const emailQuestion = await api(new Request('https://preview.test/v1/recommendations', {
    method: 'POST', headers, body: JSON.stringify({ question_id: 'custom', question_text: 'Liên hệ tôi tại reader@example.com' }),
  }))
  assert.equal(emailQuestion.status, 400)

  const recommendation = await json(await api(new Request('https://preview.test/v1/recommendations', {
    method: 'POST', headers, body: JSON.stringify({ question_id: 'expertise_asset', question_text: 'Tôi có chuyên môn.' }),
  })))
  const session = await json(await api(new Request('https://preview.test/v1/reading-sessions', {
    method: 'POST', headers, body: JSON.stringify({ decision_id: recommendation.decision_id }),
  })))
  const phoneReflection = await api(new Request(`https://preview.test/v1/reading-sessions/${session.session_id}/complete`, {
    method: 'POST', headers, body: JSON.stringify({ key_takeaway: 'Gọi tôi ở 0912 345 678', next_step: 'Viết một phác thảo.' }),
  }))
  assert.equal(phoneReflection.status, 400)
})
