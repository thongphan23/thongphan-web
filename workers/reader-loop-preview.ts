import {
  READER_LOOP_POLICY_VERSION,
  nextActionFor,
  recommendReading,
  type ReaderLoopContent,
  type SampleQuestionId,
} from '../lib/reader-loop/recommendation'
import { ATOMIC_EVIDENCE_UPDATE_SQL } from '../lib/reader-loop/evidence'

export interface ReaderRecord {
  id: string
  tokenHash: string
  createdAt: string
}

export interface RecommendationRecord {
  id: string
  readerId: string
  questionId: string
  questionText: string
  questionSource: 'sample' | 'custom'
  sampleId: string | null
  policyVersion: string
  primary: ReaderLoopContent
  alternatives: ReaderLoopContent[]
  reason: string
  reasonCodes: string[]
  expectedOutcome: string
  unknowns: string[]
  createdAt: string
}

export interface EvidenceSummary {
  id: string
  sessionId: string
  visibleMs: number
  activeMs: number
  maxScrollPercent: number
  sectionsSeen: string[]
  meaningfulInteractionCount: number
  openedAt: string
  updatedAt: string
}

export interface ReadingSessionRecord {
  id: string
  readerId: string
  decisionId: string
  contentId: string
  contentUrl: string
  status: 'opened' | 'in_progress' | 'completed'
  startedAt: string
  updatedAt: string
}

export type EvidenceUpdateResult =
  | { state: 'updated'; evidence: EvidenceSummary }
  | { state: 'closed' }
  | null

export interface CompletionRecord {
  readerId: string
  sessionId: string
  manualCompletionId: string
  reflection: {
    id: string
    keyTakeaway: string
    nextStep: string
    createdAt: string
  }
  nextAction: {
    id: string
    policyVersion: string
    type: 'do_action' | 'clarify_question'
    label: string
    url: string
    reason: string
    evidenceUsed: string[]
    unknowns: string[]
  }
  createdAt: string
}

export interface ReaderLoopStore {
  reserveReaderCreation(bucketStart: string, retainAfter: string, limit: number): Promise<boolean>
  createReader(record: ReaderRecord, totalLimit: number): Promise<boolean>
  findReaderByTokenHash(tokenHash: string): Promise<ReaderRecord | null>
  createRecommendation(record: RecommendationRecord): Promise<void>
  findRecommendation(readerId: string, decisionId: string): Promise<RecommendationRecord | null>
  createSession(record: ReadingSessionRecord, summary: EvidenceSummary): Promise<void>
  findSession(readerId: string, sessionId: string): Promise<(ReadingSessionRecord & { evidence: EvidenceSummary }) | null>
  updateEvidence(readerId: string, sessionId: string, next: EvidenceSummary): Promise<EvidenceUpdateResult>
  completeSession(readerId: string, sessionId: string, record: CompletionRecord): Promise<CompletionRecord | null>
  getState(readerId: string): Promise<{ activeSession: (ReadingSessionRecord & { evidence?: EvidenceSummary }) | null; latestCompletion: CompletionRecord | null }>
  getInspector(readerId: string): Promise<{
    question: string | null
    recommendation: RecommendationRecord | null
    session: (ReadingSessionRecord & { evidence?: EvidenceSummary }) | null
    completion: CompletionRecord | null
  }>
}

interface RuntimeOptions {
  now: () => string
  randomId: (prefix: string) => string
  randomToken: () => string
}

const defaultRuntime: RuntimeOptions = {
  now: () => new Date().toISOString(),
  randomId: (prefix) => `${prefix}_${crypto.randomUUID()}`,
  randomToken: () => {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  },
}

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
const READER_CREATION_LIMIT_PER_HOUR = 60
const READER_TOTAL_LIMIT = 1000
const READER_CREATION_RETENTION_MS = 24 * 60 * 60 * 1000

function respond(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, ...extraHeaders } })
}

function error(code: string, message: string, status: number, traceId: string) {
  return respond({ error: { code, message, trace_id: traceId } }, status)
}

function traceId() {
  return `trc_${crypto.randomUUID()}`
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const raw = await request.text()
  if (raw.length > 4096) return null
  try {
    const parsed: unknown = JSON.parse(raw || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

function boundedText(value: unknown, max: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max
    ? value.trim()
    : null
}

function containsLikelyPii(value: string) {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  const phone = /(?:\+?84|0)(?:[\s.-]*\d){9,10}\b/
  return email.test(value) || phone.test(value)
}

function safeInt(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(min, Math.min(max, Math.round(value)))
    : null
}

function publicEvidence(summary: EvidenceSummary) {
  return {
    visible_ms: summary.visibleMs,
    active_ms: summary.activeMs,
    max_scroll_percent: summary.maxScrollPercent,
    sections_seen: summary.sectionsSeen,
    meaningful_interaction_count: summary.meaningfulInteractionCount,
    opened_at: summary.openedAt,
    updated_at: summary.updatedAt,
  }
}

function publicSession(session: ReadingSessionRecord & { evidence?: EvidenceSummary }) {
  return {
    id: session.id,
    decision_id: session.decisionId,
    content_id: session.contentId,
    content_url: session.contentUrl,
    status: session.status,
    started_at: session.startedAt,
    updated_at: session.updatedAt,
    evidence: session.evidence ? publicEvidence(session.evidence) : undefined,
  }
}

function publicRecommendation(record: RecommendationRecord) {
  return {
    decision_id: record.id,
    question_id: record.questionId,
    policy_version: record.policyVersion,
    primary: record.primary,
    alternatives: record.alternatives,
    reason: record.reason,
    reason_codes: record.reasonCodes,
    expected_outcome: record.expectedOutcome,
    unknowns: record.unknowns,
    created_at: record.createdAt,
  }
}

function publicCompletion(record: CompletionRecord) {
  return {
    manual_completion: { id: record.manualCompletionId, confirmed_at: record.createdAt },
    reflection: {
      id: record.reflection.id,
      key_takeaway: record.reflection.keyTakeaway,
      next_step: record.reflection.nextStep,
      created_at: record.reflection.createdAt,
    },
    next_action: {
      id: record.nextAction.id,
      policy_version: record.nextAction.policyVersion,
      type: record.nextAction.type,
      label: record.nextAction.label,
      url: record.nextAction.url,
      reason: record.nextAction.reason,
      evidence_used: record.nextAction.evidenceUsed,
      unknowns: record.nextAction.unknowns,
    },
  }
}

async function authenticate(request: Request, store: ReaderLoopStore) {
  const header = request.headers.get('authorization') ?? ''
  const match = /^Reader ([A-Za-z0-9_-]{16,128})$/.exec(header)
  return match ? store.findReaderByTokenHash(await hashToken(match[1])) : null
}

export function createReaderLoopApi(store: ReaderLoopStore, runtime: RuntimeOptions = defaultRuntime) {
  return async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const trace = traceId()

    if (!isAllowedReaderLoopOrigin(request.headers.get('origin'))) {
      return error('ORIGIN_NOT_ALLOWED', 'Origin không được phép.', 403, trace)
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return respond({ ok: true, environment: 'preview', policy_version: READER_LOOP_POLICY_VERSION })
    }

    if (request.method === 'POST' && url.pathname === '/v1/readers') {
      const now = runtime.now()
      const timestamp = Date.parse(now)
      if (!Number.isFinite(timestamp)) return error('CLOCK_ERROR', 'Không thể tạo reader lúc này.', 503, trace)
      const bucketStart = new Date(Math.floor(timestamp / 3_600_000) * 3_600_000).toISOString()
      const retainAfter = new Date(timestamp - READER_CREATION_RETENTION_MS).toISOString()
      let reserved = false
      try {
        reserved = await store.reserveReaderCreation(bucketStart, retainAfter, READER_CREATION_LIMIT_PER_HOUR)
      } catch {
        return error('RATE_LIMIT_UNAVAILABLE', 'Không thể tạo reader lúc này.', 503, trace)
      }
      if (!reserved) return error('RATE_LIMITED', 'Preview đã đạt giới hạn tạo reader trong giờ này.', 429, trace)
      const token = runtime.randomToken()
      const record = { id: runtime.randomId('rdr'), tokenHash: await hashToken(token), createdAt: now }
      let created = false
      try {
        created = await store.createReader(record, READER_TOTAL_LIMIT)
      } catch {
        return error('READER_STORE_UNAVAILABLE', 'Không thể tạo reader lúc này.', 503, trace)
      }
      if (!created) return error('PREVIEW_CAP_REACHED', 'Preview đã đạt giới hạn reader.', 429, trace)
      return respond({ reader_id: record.id, reader_token: token, created_at: record.createdAt }, 201)
    }

    const reader = await authenticate(request, store)
    if (!reader) return error('UNAUTHORIZED', 'Reader token không hợp lệ.', 401, trace)

    if (request.method === 'POST' && url.pathname === '/v1/recommendations') {
      const body = await readBody(request)
      const questionText = boundedText(body?.question_text, 500)
      const questionId = body?.question_id
      const allowed = ['expertise_asset', 'learning_output', 'content_customers', 'ai_overload', 'second_income', 'custom']
      if (!questionText || typeof questionId !== 'string' || !allowed.includes(questionId)) {
        return error('VALIDATION_ERROR', 'Câu hỏi hoặc lựa chọn không hợp lệ.', 400, trace)
      }
      if (containsLikelyPii(questionText)) {
        return error('PII_NOT_ALLOWED', 'Không nhập email hoặc số điện thoại vào Reader Loop.', 400, trace)
      }

      const result = recommendReading(questionId as SampleQuestionId | 'custom', questionText)
      const now = runtime.now()
      const record: RecommendationRecord = {
        id: runtime.randomId('dec'),
        readerId: reader.id,
        questionId: runtime.randomId('q'),
        questionText,
        questionSource: questionId === 'custom' ? 'custom' : 'sample',
        sampleId: questionId === 'custom' ? null : questionId,
        createdAt: now,
        ...result,
      }
      await store.createRecommendation(record)
      return respond(publicRecommendation(record), 201)
    }

    if (request.method === 'POST' && url.pathname === '/v1/reading-sessions') {
      const body = await readBody(request)
      const decisionId = boundedText(body?.decision_id, 80)
      const decision = decisionId ? await store.findRecommendation(reader.id, decisionId) : null
      if (!decision) return error('NOT_FOUND', 'Không tìm thấy recommendation phù hợp.', 404, trace)
      const now = runtime.now()
      const session: ReadingSessionRecord = {
        id: runtime.randomId('rs'), readerId: reader.id, decisionId: decision.id,
        contentId: decision.primary.id, contentUrl: decision.primary.url, status: 'opened', startedAt: now, updatedAt: now,
      }
      const summary: EvidenceSummary = {
        id: runtime.randomId('evs'), sessionId: session.id, visibleMs: 0, activeMs: 0,
        maxScrollPercent: 0, sectionsSeen: [], meaningfulInteractionCount: 0, openedAt: now, updatedAt: now,
      }
      await store.createSession(session, summary)
      return respond({ session_id: session.id, content_id: session.contentId, content_url: session.contentUrl, status: session.status }, 201)
    }

    if (request.method === 'GET' && url.pathname === '/v1/state') {
      const state = await store.getState(reader.id)
      return respond({
        active_session: state.activeSession ? publicSession(state.activeSession) : null,
        latest_completion: state.latestCompletion ? publicCompletion(state.latestCompletion) : null,
      })
    }

    if (request.method === 'GET' && url.pathname === '/v1/inspector') {
      const data = await store.getInspector(reader.id)
      return respond({
        question: data.question,
        recommendation: data.recommendation ? publicRecommendation(data.recommendation) : null,
        session: data.session ? publicSession(data.session) : null,
        completion: data.completion ? publicCompletion(data.completion) : null,
      })
    }

    const sessionMatch = /^\/v1\/reading-sessions\/([^/]+)(?:\/(evidence|complete))?$/.exec(url.pathname)
    if (sessionMatch) {
      const sessionId = sessionMatch[1]
      const action = sessionMatch[2]
      const current = await store.findSession(reader.id, sessionId)
      if (!current) return error('NOT_FOUND', 'Không tìm thấy reading session.', 404, trace)

      if (request.method === 'GET' && !action) return respond({ session: publicSession(current) })

      if (request.method === 'POST' && action === 'evidence') {
        if (current.status === 'completed') {
          return error('CONFLICT', 'Reading session đã hoàn thành; evidence summary đã được đóng.', 409, trace)
        }
        const body = await readBody(request)
        const contentUrl = boundedText(body?.content_url, 300)
        if (!contentUrl) return error('VALIDATION_ERROR', 'content_url là bắt buộc.', 400, trace)
        if (contentUrl !== current.contentUrl) {
          return error('CONTENT_MISMATCH', 'Reading session không thuộc bài viết này.', 409, trace)
        }
        const visibleMs = safeInt(body?.visible_ms, 0, 86_400_000)
        const activeMs = safeInt(body?.active_ms, 0, 86_400_000)
        const maxScrollPercent = safeInt(body?.max_scroll_percent, 0, 100)
        const interactions = safeInt(body?.meaningful_interaction_count, 0, 1000)
        const rawSections = Array.isArray(body?.sections_seen) ? body.sections_seen : null
        const sections = rawSections?.filter((item): item is string => typeof item === 'string' && /^[a-z0-9_-]{1,80}$/.test(item)).slice(0, 100)
        if (visibleMs === null || activeMs === null || maxScrollPercent === null || interactions === null || !sections) {
          return error('VALIDATION_ERROR', 'Reading evidence summary không hợp lệ.', 400, trace)
        }
        const next: EvidenceSummary = {
          ...current.evidence,
          visibleMs,
          activeMs,
          maxScrollPercent,
          sectionsSeen: sections,
          meaningfulInteractionCount: interactions,
          updatedAt: runtime.now(),
        }
        const update = await store.updateEvidence(reader.id, sessionId, next)
        if (!update) return error('NOT_FOUND', 'Không tìm thấy reading session.', 404, trace)
        if (update.state === 'closed') return error('CONFLICT', 'Reading session đã hoàn thành; evidence summary đã được đóng.', 409, trace)
        return respond({ evidence: publicEvidence(update.evidence) })
      }

      if (request.method === 'POST' && action === 'complete') {
        const body = await readBody(request)
        const contentUrl = boundedText(body?.content_url, 300)
        if (!contentUrl) return error('VALIDATION_ERROR', 'content_url là bắt buộc.', 400, trace)
        if (contentUrl !== current.contentUrl) {
          return error('CONTENT_MISMATCH', 'Reading session không thuộc bài viết này.', 409, trace)
        }
        const keyTakeaway = boundedText(body?.key_takeaway, 1200)
        const nextStep = boundedText(body?.next_step, 1200)
        if (!keyTakeaway || !nextStep) return error('VALIDATION_ERROR', 'Hai trường phản tư đều bắt buộc.', 400, trace)
        if (containsLikelyPii(keyTakeaway) || containsLikelyPii(nextStep)) {
          return error('PII_NOT_ALLOWED', 'Không nhập email hoặc số điện thoại vào phần phản tư.', 400, trace)
        }
        const nextAction = nextActionFor(current.contentId, nextStep)
        const now = runtime.now()
        const record: CompletionRecord = {
          readerId: reader.id,
          sessionId,
          manualCompletionId: runtime.randomId('cmp'),
          reflection: { id: runtime.randomId('ref'), keyTakeaway, nextStep, createdAt: now },
          nextAction: { id: runtime.randomId('nba'), policyVersion: 'reader-loop-next-action-v0.1.0', ...nextAction },
          createdAt: now,
        }
        const saved = await store.completeSession(reader.id, sessionId, record)
        return saved ? respond(publicCompletion(saved), 201) : error('NOT_FOUND', 'Không tìm thấy reading session.', 404, trace)
      }
    }

    return error('NOT_FOUND', 'Route không tồn tại.', 404, trace)
  }
}

type D1Row = Record<string, unknown>

interface ReaderLoopD1Statement {
  bind(...values: unknown[]): ReaderLoopD1Statement
  run(): Promise<unknown>
  first<T>(): Promise<T | null>
}

interface ReaderLoopD1 {
  prepare(query: string): ReaderLoopD1Statement
  batch(statements: ReaderLoopD1Statement[]): Promise<unknown>
}

class D1ReaderLoopStore implements ReaderLoopStore {
  constructor(private readonly db: ReaderLoopD1) {}

  async reserveReaderCreation(bucketStart: string, retainAfter: string, limit: number) {
    await this.db.prepare('DELETE FROM reader_creation_rate_limits WHERE bucket_start < ?').bind(retainAfter).run()
    const row = await this.db.prepare(`INSERT INTO reader_creation_rate_limits (bucket_start, request_count, updated_at)
      VALUES (?, 1, ?)
      ON CONFLICT(bucket_start) DO UPDATE SET
        request_count = request_count + 1,
        updated_at = excluded.updated_at
      WHERE request_count < ?
      RETURNING request_count`).bind(bucketStart, bucketStart, limit).first<{ request_count: number }>()
    return Boolean(row)
  }

  async createReader(record: ReaderRecord, totalLimit: number) {
    const row = await this.db.prepare(`INSERT INTO anonymous_readers (id, token_hash, created_at)
      SELECT ?, ?, ?
      WHERE (SELECT COUNT(*) FROM anonymous_readers) < ?
      RETURNING id`).bind(record.id, record.tokenHash, record.createdAt, totalLimit).first<{ id: string }>()
    return Boolean(row)
  }

  async findReaderByTokenHash(tokenHash: string) {
    const row = await this.db.prepare('SELECT id, token_hash, created_at FROM anonymous_readers WHERE token_hash = ? LIMIT 1')
      .bind(tokenHash).first<D1Row>()
    return row ? { id: String(row.id), tokenHash: String(row.token_hash), createdAt: String(row.created_at) } : null
  }

  async createRecommendation(record: RecommendationRecord) {
    const candidates = [record.primary, ...record.alternatives]
    await this.db.batch([
      this.db.prepare('INSERT INTO reader_questions (id, reader_id, source, sample_id, question_text, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(record.questionId, record.readerId, record.questionSource, record.sampleId, record.questionText, record.createdAt),
      this.db.prepare('INSERT INTO recommendation_decisions (id, reader_id, question_id, policy_version, candidates_json, selected_content_id, selected_content_url, reason_codes_json, rationale, expected_outcome, unknowns_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(record.id, record.readerId, record.questionId, record.policyVersion, JSON.stringify(candidates), record.primary.id, record.primary.url, JSON.stringify(record.reasonCodes), record.reason, record.expectedOutcome, JSON.stringify(record.unknowns), record.createdAt),
    ])
  }

  private mapRecommendation(row: D1Row): RecommendationRecord {
    const candidates = JSON.parse(String(row.candidates_json)) as ReaderLoopContent[]
    const primary = candidates.find((item) => item.id === row.selected_content_id) ?? candidates[0]
    return {
      id: String(row.id), readerId: String(row.reader_id), questionId: String(row.question_id),
      questionText: String(row.question_text), questionSource: String(row.source) as 'sample' | 'custom',
      sampleId: row.sample_id ? String(row.sample_id) : null, policyVersion: String(row.policy_version),
      primary, alternatives: candidates.filter((item) => item.id !== primary.id), reason: String(row.rationale),
      reasonCodes: JSON.parse(String(row.reason_codes_json)), expectedOutcome: String(row.expected_outcome),
      unknowns: JSON.parse(String(row.unknowns_json)), createdAt: String(row.created_at),
    }
  }

  async findRecommendation(readerId: string, decisionId: string) {
    const row = await this.db.prepare(`SELECT d.*, q.question_text, q.source, q.sample_id
      FROM recommendation_decisions d JOIN reader_questions q ON q.id = d.question_id
      WHERE d.reader_id = ? AND d.id = ? LIMIT 1`).bind(readerId, decisionId).first<D1Row>()
    return row ? this.mapRecommendation(row) : null
  }

  async createSession(record: ReadingSessionRecord, summary: EvidenceSummary) {
    await this.db.batch([
      this.db.prepare('INSERT INTO reading_sessions (id, reader_id, decision_id, content_id, content_url, status, started_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(record.id, record.readerId, record.decisionId, record.contentId, record.contentUrl, record.status, record.startedAt, record.updatedAt),
      this.db.prepare('INSERT INTO reading_evidence_summaries (id, session_id, visible_ms, active_ms, max_scroll_percent, sections_seen_json, meaningful_interaction_count, opened_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(summary.id, summary.sessionId, summary.visibleMs, summary.activeMs, summary.maxScrollPercent, JSON.stringify(summary.sectionsSeen), summary.meaningfulInteractionCount, summary.openedAt, summary.updatedAt),
    ])
  }

  private mapSession(row: D1Row): ReadingSessionRecord & { evidence: EvidenceSummary } {
    return {
      id: String(row.id), readerId: String(row.reader_id), decisionId: String(row.decision_id),
      contentId: String(row.content_id), contentUrl: String(row.content_url),
      status: String(row.status) as ReadingSessionRecord['status'], startedAt: String(row.started_at), updatedAt: String(row.updated_at),
      evidence: {
        id: String(row.evidence_id), sessionId: String(row.id), visibleMs: Number(row.visible_ms), activeMs: Number(row.active_ms),
        maxScrollPercent: Number(row.max_scroll_percent), sectionsSeen: JSON.parse(String(row.sections_seen_json)),
        meaningfulInteractionCount: Number(row.meaningful_interaction_count), openedAt: String(row.opened_at),
        updatedAt: String(row.evidence_updated_at),
      },
    }
  }

  async findSession(readerId: string, sessionId: string) {
    const row = await this.db.prepare(`SELECT s.*, e.id AS evidence_id, e.visible_ms, e.active_ms, e.max_scroll_percent,
      e.sections_seen_json, e.meaningful_interaction_count, e.opened_at, e.updated_at AS evidence_updated_at
      FROM reading_sessions s JOIN reading_evidence_summaries e ON e.session_id = s.id
      WHERE s.reader_id = ? AND s.id = ? LIMIT 1`).bind(readerId, sessionId).first<D1Row>()
    return row ? this.mapSession(row) : null
  }

  async updateEvidence(readerId: string, sessionId: string, next: EvidenceSummary): Promise<EvidenceUpdateResult> {
    const results = await this.db.batch([
      this.db.prepare(ATOMIC_EVIDENCE_UPDATE_SQL).bind(
        next.visibleMs,
        next.activeMs,
        next.visibleMs,
        next.maxScrollPercent,
        JSON.stringify(next.sectionsSeen),
        next.meaningfulInteractionCount,
        next.updatedAt,
        sessionId,
        sessionId,
        readerId,
      ),
      this.db.prepare("UPDATE reading_sessions SET status = 'in_progress', updated_at = MAX(updated_at, ?) WHERE id = ? AND reader_id = ? AND status != 'completed'")
        .bind(next.updatedAt, sessionId, readerId),
    ])
    const first = Array.isArray(results) ? results[0] as Record<string, unknown> | undefined : undefined
    const meta = first?.meta as Record<string, unknown> | undefined
    if (typeof meta?.changes !== 'number') throw new Error('D1_EVIDENCE_CHANGE_COUNT_MISSING')
    if (meta.changes === 0) {
      const session = await this.findSession(readerId, sessionId)
      return session?.status === 'completed' ? { state: 'closed' } : null
    }
    const session = await this.findSession(readerId, sessionId)
    return session ? { state: 'updated', evidence: session.evidence } : null
  }

  private mapCompletion(row: D1Row): CompletionRecord {
    return {
      readerId: String(row.reader_id), sessionId: String(row.session_id), manualCompletionId: String(row.manual_completion_id),
      reflection: { id: String(row.reflection_id), keyTakeaway: String(row.key_takeaway), nextStep: String(row.next_step), createdAt: String(row.reflection_created_at) },
      nextAction: {
        id: String(row.next_action_id), policyVersion: String(row.policy_version), type: String(row.action_type) as CompletionRecord['nextAction']['type'],
        label: String(row.action_label), url: String(row.action_url), reason: String(row.reason),
        evidenceUsed: JSON.parse(String(row.evidence_used_json)), unknowns: JSON.parse(String(row.unknowns_json)),
      },
      createdAt: String(row.confirmed_at),
    }
  }

  async completeSession(readerId: string, sessionId: string, record: CompletionRecord) {
    if (!await this.findSession(readerId, sessionId)) return null
    await this.db.batch([
      this.db.prepare('INSERT INTO manual_completions (id, session_id, confirmed_at) VALUES (?, ?, ?) ON CONFLICT(session_id) DO NOTHING')
        .bind(record.manualCompletionId, sessionId, record.createdAt),
      this.db.prepare('INSERT INTO reflections (id, session_id, key_takeaway, next_step, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(session_id) DO NOTHING')
        .bind(record.reflection.id, sessionId, record.reflection.keyTakeaway, record.reflection.nextStep, record.reflection.createdAt),
      this.db.prepare('INSERT INTO next_action_decisions (id, session_id, policy_version, action_type, action_label, action_url, reason, evidence_used_json, unknowns_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(session_id) DO NOTHING')
        .bind(record.nextAction.id, sessionId, record.nextAction.policyVersion, record.nextAction.type, record.nextAction.label, record.nextAction.url, record.nextAction.reason, JSON.stringify(record.nextAction.evidenceUsed), JSON.stringify(record.nextAction.unknowns), record.createdAt),
      this.db.prepare("UPDATE reading_sessions SET status = 'completed', updated_at = ? WHERE id = ? AND reader_id = ?")
        .bind(record.createdAt, sessionId, readerId),
    ])
    return this.findCompletion(readerId, sessionId)
  }

  private async findCompletion(readerId: string, sessionId?: string) {
    const row = await this.db.prepare(`SELECT s.reader_id, s.id AS session_id, c.id AS manual_completion_id, c.confirmed_at,
      r.id AS reflection_id, r.key_takeaway, r.next_step, r.created_at AS reflection_created_at,
      n.id AS next_action_id, n.policy_version, n.action_type, n.action_label, n.action_url, n.reason, n.evidence_used_json, n.unknowns_json
      FROM reading_sessions s JOIN manual_completions c ON c.session_id = s.id
      JOIN reflections r ON r.session_id = s.id JOIN next_action_decisions n ON n.session_id = s.id
      WHERE s.reader_id = ? ${sessionId ? 'AND s.id = ?' : ''} ORDER BY c.confirmed_at DESC LIMIT 1`)
      .bind(...(sessionId ? [readerId, sessionId] : [readerId])).first<D1Row>()
    return row ? this.mapCompletion(row) : null
  }

  async getState(readerId: string) {
    const row = await this.db.prepare("SELECT id FROM reading_sessions WHERE reader_id = ? AND status != 'completed' ORDER BY updated_at DESC LIMIT 1")
      .bind(readerId).first<{ id: string }>()
    const activeSession = row ? await this.findSession(readerId, row.id) : null
    return { activeSession, latestCompletion: await this.findCompletion(readerId) }
  }

  async getInspector(readerId: string) {
    const row = await this.db.prepare('SELECT id FROM recommendation_decisions WHERE reader_id = ? ORDER BY created_at DESC LIMIT 1')
      .bind(readerId).first<{ id: string }>()
    const recommendation = row ? await this.findRecommendation(readerId, row.id) : null
    const sessionRow = recommendation ? await this.db.prepare('SELECT id FROM reading_sessions WHERE reader_id = ? AND decision_id = ? ORDER BY updated_at DESC LIMIT 1')
      .bind(readerId, recommendation.id).first<{ id: string }>() : null
    const session = sessionRow ? await this.findSession(readerId, sessionRow.id) : null
    return {
      question: recommendation?.questionText ?? null,
      recommendation,
      session,
      completion: session ? await this.findCompletion(readerId, session.id) : null,
    }
  }
}

export function isAllowedReaderLoopOrigin(origin: string | null): origin is string {
  return Boolean(origin && (
    /^http:\/\/(?:127\.0\.0\.1|localhost):\d{2,5}$/.test(origin)
    || /^https:\/\/(?:[a-z0-9-]+\.)?thongphan-reader-loop-preview\.pages\.dev$/i.test(origin)
  ))
}

function corsHeaders(origin: string | null) {
  if (isAllowedReaderLoopOrigin(origin)) {
    return {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'Authorization,Content-Type',
      'access-control-max-age': '86400',
      vary: 'Origin',
    }
  }
  return null
}

const worker = {
  async fetch(request: Request, env: { DB: ReaderLoopD1 }) {
    const cors = corsHeaders(request.headers.get('origin'))
    if (!cors) return respond({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin không được phép.' } }, 403)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    const response = await createReaderLoopApi(new D1ReaderLoopStore(env.DB))(request)
    const headers = new Headers(response.headers)
    Object.entries(cors).forEach(([key, value]) => headers.set(key, value))
    return new Response(response.body, { status: response.status, headers })
  },
}

export default worker
