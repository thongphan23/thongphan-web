import { assertSessionSecret, parseAccessCodeHash, verifyAccessCode } from './auth'
import { clearSessionCookie, createSessionCookie, readSessionValue, verifySessionValue } from './cookie'
import { loadProtectedContent, PROTECTED_CONTENT_INDEX } from './content'
import { emptyResponse, jsonResponse, safeError } from './http'
import { rateLimitClientKey, releaseAccessAttempt, reserveAccessAttempt } from './rate-limit'
import type {
  Brain2AccessEnv,
  Brain2AccessWorker,
  ProtectedContentDescriptor,
} from './types'

const API_ROOT = '/brain2/21-ngay/api'
const ACCESS_PATH = `${API_ROOT}/access`
const LESSON_PREFIX = `${API_ROOT}/lessons/`
const MAX_POST_BYTES = 1024
const ALLOWED_ORIGINS = new Set(['https://thongphan.com', 'https://www.thongphan.com'])

type Dependencies = {
  contentIndex?: Readonly<Record<string, ProtectedContentDescriptor>>
  now?: () => number
}

function validSecrets(env: Brain2AccessEnv): boolean {
  try {
    parseAccessCodeHash(env.BRAIN2_ACCESS_CODE_HASH)
    assertSessionSecret(env.BRAIN2_SESSION_SECRET)
    return true
  } catch {
    return false
  }
}

function sameOriginMutation(request: Request): boolean {
  const url = new URL(request.url)
  return ALLOWED_ORIGINS.has(url.origin) && request.headers.get('Origin') === url.origin
}

async function readCode(request: Request): Promise<{ code: string } | Response> {
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'application/json') return safeError(415, 'unsupported_media_type')
  const length = Number(request.headers.get('Content-Length') ?? 0)
  if (Number.isFinite(length) && length > MAX_POST_BYTES) return safeError(413, 'payload_too_large')
  const reader = request.body?.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalBytes += value.byteLength
        if (totalBytes > MAX_POST_BYTES) {
          try {
            await reader.cancel()
          } catch {
            // The 413 response remains authoritative if the peer already disconnected.
          }
          return safeError(413, 'payload_too_large')
        }
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
  }
  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  const text = new TextDecoder().decode(bytes)
  try {
    const value: unknown = JSON.parse(text)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return safeError(400, 'invalid_request')
    const record = value as Record<string, unknown>
    if (Object.keys(record).length !== 1 || typeof record.code !== 'string' || !record.code.trim()) {
      return safeError(400, 'invalid_request')
    }
    return { code: record.code }
  } catch {
    return safeError(400, 'invalid_request')
  }
}

async function sessionAuthorized(
  request: Request,
  env: Brain2AccessEnv,
  now: number,
): Promise<boolean> {
  if (!validSecrets(env)) throw new Error('Brain2 access configuration unavailable')
  const value = readSessionValue(request)
  if (!value) return false
  return Boolean(await verifySessionValue({
    value,
    sessionSecret: env.BRAIN2_SESSION_SECRET,
    accessCodeHash: env.BRAIN2_ACCESS_CODE_HASH,
    now,
  }))
}

export function createBrain2AccessWorker(dependencies: Dependencies = {}): Brain2AccessWorker {
  const contentIndex = dependencies.contentIndex ?? PROTECTED_CONTENT_INDEX
  const now = dependencies.now ?? (() => Math.floor(Date.now() / 1000))

  return {
    async fetch(request, env) {
      const url = new URL(request.url)
      if (!ALLOWED_ORIGINS.has(url.origin) || !url.pathname.startsWith(`${API_ROOT}/`)) {
        return safeError(404, 'not_found')
      }

      if (url.pathname === ACCESS_PATH) {
        if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
          return safeError(405, 'method_not_allowed', { Allow: 'GET, POST, DELETE' })
        }

        if (request.method === 'DELETE') {
          if (!sameOriginMutation(request)) return safeError(403, 'forbidden')
          return emptyResponse(204, { 'Set-Cookie': clearSessionCookie() })
        }

        if (!validSecrets(env)) return safeError(503, 'temporarily_unavailable')

        if (request.method === 'GET') {
          try {
            return await sessionAuthorized(request, env, now())
              ? jsonResponse(200, { authorized: true })
              : safeError(401, 'unauthorized')
          } catch {
            return safeError(503, 'temporarily_unavailable')
          }
        }

        if (!sameOriginMutation(request)) return safeError(403, 'forbidden')
        try {
          const parsed = await readCode(request)
          if (parsed instanceof Response) return parsed
          const ip = request.headers.get('CF-Connecting-IP') ?? ''
          const clientKey = await rateLimitClientKey(ip, env.BRAIN2_SESSION_SECRET)
          const reservationId = await reserveAccessAttempt(env.DB, clientKey, now())
          if (reservationId === null) {
            return safeError(429, 'rate_limited', { 'Retry-After': '600' })
          }
          if (!await verifyAccessCode(parsed.code, env.BRAIN2_ACCESS_CODE_HASH)) {
            return safeError(401, 'unauthorized')
          }
          await releaseAccessAttempt(env.DB, reservationId, clientKey)
          const cookie = await createSessionCookie({
            now: now(),
            sessionSecret: env.BRAIN2_SESSION_SECRET,
            accessCodeHash: env.BRAIN2_ACCESS_CODE_HASH,
          })
          return emptyResponse(204, { 'Set-Cookie': cookie })
        } catch {
          return safeError(503, 'temporarily_unavailable')
        }
      }

      if (!url.pathname.startsWith(LESSON_PREFIX)) return safeError(404, 'not_found')
      if (request.method !== 'GET') return safeError(405, 'method_not_allowed', { Allow: 'GET' })
      const slug = url.pathname.slice(LESSON_PREFIX.length)
      if (!/^ngay-(?:0[8-9]|1\d|2[01])$/.test(slug) || !contentIndex[slug]) {
        return safeError(404, 'not_found')
      }
      try {
        if (!await sessionAuthorized(request, env, now())) return safeError(401, 'unauthorized')
        const lesson = await loadProtectedContent(env.BRAIN2_CONTENT, contentIndex[slug])
        return lesson ? jsonResponse(200, lesson) : safeError(503, 'temporarily_unavailable')
      } catch {
        return safeError(503, 'temporarily_unavailable')
      }
    },
  }
}

export default createBrain2AccessWorker()
