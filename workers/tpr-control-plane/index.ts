import type { TprFeedbackInput, TprIngestBatch } from '../../lib/tpr/contracts'
import {
  clearSession,
  createSession,
  hasValidSession,
  verifyAccessCode,
  verifySyncSecret,
} from './auth'
import { D1TprStore } from './store'
import type { TprControlPlaneEnv, TprControlPlaneWorker, TprStore } from './types'

const MAX_BATCH_BYTES = 524_288
const ALLOWED_ORIGINS = new Set(['https://thongphan.com', 'https://www.thongphan.com'])
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  Vary: 'Cookie',
}

function response(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { ...PRIVATE_HEADERS, ...(body === null ? {} : { 'Content-Type': 'application/json; charset=utf-8' }), ...headers },
  })
}

function pathParts(request: Request): string[] {
  return new URL(request.url).pathname.replace(/^\/api\/tpr\/?/, '').split('/').filter(Boolean)
}

function clientKey(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown'
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')
  return Boolean(origin && ALLOWED_ORIGINS.has(origin))
}

function bearer(request: Request): string | null {
  const match = /^Bearer ([^\s]{32,})$/.exec(request.headers.get('Authorization') ?? '')
  return match?.[1] ?? null
}

function exactKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key))
}

function validateBatch(value: unknown): value is TprIngestBatch {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  if (!exactKeys(item, ['schema_version','batch_id','generated_at','runs','artifacts','videos','sources','models','graph_nodes','graph_edges','events','costs','taste_changes'])) return false
  if (item.schema_version !== '1.0.0' || typeof item.batch_id !== 'string' || !/^BATCH-[A-Za-z0-9._:-]{6,160}$/.test(item.batch_id)) return false
  if (typeof item.generated_at !== 'string' || !Number.isFinite(Date.parse(item.generated_at))) return false
  const arrays = ['runs','artifacts','videos','sources','models','graph_nodes','graph_edges','events','costs','taste_changes']
  return arrays.every((key) => item[key] === undefined || (Array.isArray(item[key]) && (item[key] as unknown[]).length <= 100))
}

function validateFeedback(value: unknown): value is TprFeedbackInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  if (!exactKeys(item, ['run_id','variant_id','timestamp_seconds','beat_id','shot_id','understand','feel','remember','trust','comment','desired_change'])) return false
  if (typeof item.run_id !== 'string' || typeof item.variant_id !== 'string' || typeof item.comment !== 'string') return false
  if (item.comment.trim().length < 3 || item.comment.length > 4000) return false
  if (item.timestamp_seconds !== undefined && item.timestamp_seconds !== null && (typeof item.timestamp_seconds !== 'number' || item.timestamp_seconds < 0)) return false
  return ['understand','feel','remember','trust'].every((key) => Number.isInteger(item[key]) && Number(item[key]) >= 1 && Number(item[key]) <= 5)
}

async function bodyBytes(request: Request): Promise<Uint8Array | null> {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (contentLength > MAX_BATCH_BYTES) return null
  const bytes = new Uint8Array(await request.arrayBuffer())
  return bytes.byteLength <= MAX_BATCH_BYTES ? bytes : null
}

export function createTprControlPlaneWorker({
  now = () => Math.floor(Date.now() / 1000),
  storeFactory = (env: TprControlPlaneEnv) => new D1TprStore(env.TPR_DB),
}: {
  now?: () => number
  storeFactory?: (env: TprControlPlaneEnv) => TprStore
} = {}): TprControlPlaneWorker {
  return {
    async fetch(request, env) {
      const parts = pathParts(request)
      const store = storeFactory(env)
      const nowSeconds = now()

      try {
        if (parts[0] === 'session') {
          if (request.method === 'GET') {
            const authenticated = await hasValidSession(request, nowSeconds, env.TPR_SESSION_SECRET, env.TPR_OWNER_ACCESS_CODE_HASH)
            return response({ authenticated })
          }
          if (request.method === 'DELETE') {
            if (!validOrigin(request)) return response({ error: 'ORIGIN_REQUIRED' }, 403)
            return response(null, 204, { 'Set-Cookie': clearSession() })
          }
          if (request.method !== 'POST') return response({ error: 'METHOD_NOT_ALLOWED' }, 405, { Allow: 'GET, POST, DELETE' })
          if (!validOrigin(request)) return response({ error: 'ORIGIN_REQUIRED' }, 403)
          const bytes = await bodyBytes(request)
          if (!bytes) return response({ error: 'REQUEST_TOO_LARGE' }, 413)
          let body: unknown
          try { body = JSON.parse(new TextDecoder().decode(bytes)) } catch { return response({ error: 'INVALID_JSON' }, 400) }
          const code = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>).code : null
          if (typeof code !== 'string' || code.length > 256) return response({ error: 'INVALID_CREDENTIAL' }, 401)
          const reservation = await store.reserveAuthFailure(clientKey(request), nowSeconds)
          if (reservation === null) return response({ error: 'RATE_LIMITED' }, 429, { 'Retry-After': '900' })
          if (!await verifyAccessCode(code, env.TPR_OWNER_ACCESS_CODE_HASH)) return response({ error: 'INVALID_CREDENTIAL' }, 401)
          await store.releaseAuthFailure(reservation, clientKey(request))
          return response(null, 204, { 'Set-Cookie': await createSession(nowSeconds, env.TPR_SESSION_SECRET, env.TPR_OWNER_ACCESS_CODE_HASH) })
        }

        if (parts[0] === 'ingest') {
          if (request.method !== 'POST') return response({ error: 'METHOD_NOT_ALLOWED' }, 405, { Allow: 'POST' })
          const token = bearer(request)
          if (!token || !await verifySyncSecret(token, env.TPR_SYNC_SECRET)) return response({ error: 'UNAUTHORIZED' }, 401)
          const bytes = await bodyBytes(request)
          if (!bytes) return response({ error: 'BATCH_TOO_LARGE' }, 413)
          let body: unknown
          try { body = JSON.parse(new TextDecoder().decode(bytes)) } catch { return response({ error: 'INVALID_JSON' }, 400) }
          if (!validateBatch(body)) return response({ error: 'INVALID_BATCH' }, 422)
          const result = await store.ingest(body)
          return response({ ok: true, ...result }, 202)
        }

        if (parts[0] === 'objects') {
          if (!env.TPR_OBJECTS) return response({ error: 'OBJECT_STORAGE_UNAVAILABLE' }, 503)
          return response({ error: 'OBJECT_NOT_FOUND' }, 404)
        }

        if (!await hasValidSession(request, nowSeconds, env.TPR_SESSION_SECRET, env.TPR_OWNER_ACCESS_CODE_HASH)) {
          return response({ error: 'UNAUTHORIZED' }, 401)
        }

        if (parts[0] === 'dashboard' && request.method === 'GET') {
          return response(await store.dashboard(new Date(nowSeconds * 1000).toISOString(), Boolean(env.TPR_OBJECTS)))
        }

        if (parts[0] === 'artifacts' && parts[1] && request.method === 'GET') {
          const artifact = await store.artifact(parts[1])
          if (!artifact) return response({ error: 'ARTIFACT_NOT_FOUND' }, 404)
          return response(artifact)
        }

        if (parts[0] === 'feedback') {
          if (request.method !== 'POST') return response({ error: 'METHOD_NOT_ALLOWED' }, 405, { Allow: 'POST' })
          if (!validOrigin(request)) return response({ error: 'ORIGIN_REQUIRED' }, 403)
          const bytes = await bodyBytes(request)
          if (!bytes) return response({ error: 'REQUEST_TOO_LARGE' }, 413)
          let body: unknown
          try { body = JSON.parse(new TextDecoder().decode(bytes)) } catch { return response({ error: 'INVALID_JSON' }, 400) }
          if (!validateFeedback(body)) return response({ error: 'INVALID_FEEDBACK' }, 422)
          return response(await store.feedback(body, new Date(nowSeconds * 1000).toISOString()), 201)
        }

        return response({ error: 'NOT_FOUND' }, 404)
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (/secret|hash/i.test(message)) return response({ error: 'SECURITY_CONFIGURATION_UNAVAILABLE' }, 503)
        return response({ error: 'CONTROL_PLANE_UNAVAILABLE' }, 503)
      }
    },
  }
}

const worker = createTprControlPlaneWorker()
export default worker
