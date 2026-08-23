import manifest from '../content/brain2/manifest.json'
import { BRAIN2_SIGNUP_SUCCESS_MESSAGE } from '../lib/brain2/signup-contract'

export const BRAIN2_CAMPAIGN_VERSION = 'brain2-2026-v1'
export const BRAIN2_CHALLENGE_SLUG = 'brain2-21-ngay'
const PUBLIC_ORIGIN = 'https://thongphan.com'
const TOTAL_DAYS = 21
const MAX_SIGNUP_BYTES = 2_048

export interface EmailTemplate {
  day: number
  url: string
  subject: string
  body: string
}

interface StatementLike {
  bind(...values: unknown[]): StatementLike
  first<T = Record<string, unknown>>(): Promise<T | null>
}

interface DatabaseLike {
  prepare(query: string): StatementLike
  batch(statements: StatementLike[]): Promise<unknown>
}

interface SignupEnv {
  DB?: DatabaseLike
  KV?: { delete(key: string): Promise<unknown> }
  SIGNUP_IP_RATE_LIMITER: { limit(input: { key: string }): Promise<{ success: boolean }> }
  SIGNUP_EMAIL_RATE_LIMITER: { limit(input: { key: string }): Promise<{ success: boolean }> }
  DATA_PLATFORM_URL?: string
  DATA_PLATFORM_AUDIENCE_TOKEN?: string
}

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const exactLessonMetadata = () => {
  if (!Array.isArray(manifest.lessons) || manifest.lessons.length !== TOTAL_DAYS) {
    throw new Error('Brain2 email campaign requires exactly 21 safe lesson descriptors')
  }
  return manifest.lessons.map((lesson, index) => {
    const day = index + 1
    const dayText = String(day).padStart(2, '0')
    if (
      lesson.day !== day ||
      lesson.slug !== `ngay-${dayText}` ||
      (lesson.access !== 'public' && lesson.access !== 'conan-maker') ||
      !lesson.title?.trim() ||
      !lesson.objective?.trim() ||
      !Number.isInteger(lesson.estimatedMinutes?.min) ||
      !Number.isInteger(lesson.estimatedMinutes?.max)
    ) {
      throw new Error('Brain2 email metadata is not canonical')
    }
    return lesson
  })
}

const wrapEmail = (lesson: ReturnType<typeof exactLessonMetadata>[number]): EmailTemplate => {
  const dayText = String(lesson.day).padStart(2, '0')
  const url = `${PUBLIC_ORIGIN}/brain2/21-ngay/${lesson.slug}`
  const accessCopy = lesson.access === 'public'
    ? 'Bài này mở công khai. Bạn có thể đọc và làm ngay trên website.'
    : 'Bài này dành cho thành viên Conan Maker. Đường dẫn sẽ mở trang bài học có khóa truy cập.'
  const title = escapeHtml(lesson.title)
  const objective = escapeHtml(lesson.objective)
  const estimate = `${lesson.estimatedMinutes.min}–${lesson.estimatedMinutes.max} phút`
  return {
    day: lesson.day,
    url,
    subject: `[Brain2] Ngày ${dayText}/21 — ${lesson.title}`,
    body: `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f1eadc;color:#211d19;font-family:Arial,sans-serif;line-height:1.65">
  <main style="max-width:620px;margin:0 auto;padding:32px 20px">
    <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8f3028">Ngày ${dayText}/21 · ${estimate}</p>
    <h1 style="font-size:30px;line-height:1.12;margin:12px 0 18px">${title}</h1>
    <p>Chào {{name}},</p>
    <p>${objective}</p>
    <p>${accessCopy}</p>
    <p style="margin:28px 0"><a href="${url}" style="background:#8f3028;color:#fff;padding:13px 18px;text-decoration:none">Mở bài Ngày ${dayText}</a></p>
    <p style="font-size:14px;color:#6d655c">Email chỉ nhắc nhịp và dẫn về bài chính thức; nội dung làm việc luôn nằm trên thongphan.com.</p>
    <hr style="border:0;border-top:1px solid #cfc3b1;margin:32px 0 18px">
    <p style="font-size:12px;color:#786f65">Bạn nhận email vì đã đăng ký 21 ngày Brain2. <a href="{{unsubscribe_url}}" style="color:#786f65">Hủy đăng ký</a>.</p>
  </main>
</body></html>`,
  }
}

export const BRAIN2_EMAIL_TEMPLATES: readonly EmailTemplate[] = Object.freeze(
  exactLessonMetadata().map(wrapEmail),
)

export function getBrain2EmailContent(day: number, totalDays = TOTAL_DAYS): EmailTemplate {
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS || totalDays !== TOTAL_DAYS) {
    throw new Error('Brain2 email day is outside the canonical campaign')
  }
  return BRAIN2_EMAIL_TEMPLATES[day - 1]
}

export function personalizeBrain2Email(
  body: string,
  { name, unsubscribeUrl }: { name: string; unsubscribeUrl: string },
): string {
  return body
    .replaceAll('{{name}}', escapeHtml(name))
    .replaceAll('{{unsubscribe_url}}', escapeHtml(unsubscribeUrl))
}

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
} as const

const jsonResponse = (status: number, value: unknown, headers?: HeadersInit) => new Response(JSON.stringify(value), {
  status,
  headers: { ...RESPONSE_HEADERS, ...Object.fromEntries(new Headers(headers)) },
})

const allowedOrigins = new Set([PUBLIC_ORIGIN, 'https://www.thongphan.com'])
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/u

const exactSignup = (value: unknown): value is { challenge_slug: string; name: string; email: string } => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.keys(record).sort().join(',') === 'challenge_slug,email,name' &&
    record.challenge_slug === BRAIN2_CHALLENGE_SLUG &&
    typeof record.name === 'string' && record.name.trim().length >= 2 && record.name.trim().length <= 100 &&
    !CONTROL_CHARACTERS.test(record.name) &&
    typeof record.email === 'string' && record.email.trim().length <= 254 &&
    !CONTROL_CHARACTERS.test(record.email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email.trim())
}

type BoundedBody = { ok: true; text: string } | { ok: false; status: 400 | 413 | 503 }

const readBoundedBody = async (request: Request): Promise<BoundedBody> => {
  const contentLength = request.headers.get('Content-Length')
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength)
    if (!Number.isInteger(declaredBytes) || declaredBytes < 0) return { ok: false, status: 400 }
    if (declaredBytes > MAX_SIGNUP_BYTES) return { ok: false, status: 413 }
  }

  const reader = request.body?.getReader()
  if (!reader) return { ok: true, text: '' }
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_SIGNUP_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // The size limit remains authoritative if the peer already disconnected.
        }
        return { ok: false, status: 413 }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, status: 503 }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return { ok: true, text: new TextDecoder().decode(bytes) }
}

const opaqueRateLimitKey = async (label: string, value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${label}:v1:${value}`))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const enforceSignupRateLimit = async (request: Request, env: SignupEnv, email: string) => {
  const ip = request.headers.get('CF-Connecting-IP')?.trim() ?? ''
  if (!ip || ip.length > 64 || !env.SIGNUP_IP_RATE_LIMITER || !env.SIGNUP_EMAIL_RATE_LIMITER) {
    throw new Error('Signup abuse protection is unavailable')
  }
  const [ipKey, emailKey] = await Promise.all([
    opaqueRateLimitKey('brain2-signup-ip', ip),
    opaqueRateLimitKey('brain2-signup-email', email),
  ])
  const [ipLimit, emailLimit] = await Promise.all([
    env.SIGNUP_IP_RATE_LIMITER.limit({ key: ipKey }),
    env.SIGNUP_EMAIL_RATE_LIMITER.limit({ key: emailKey }),
  ])
  if (typeof ipLimit?.success !== 'boolean' || typeof emailLimit?.success !== 'boolean') {
    throw new Error('Signup abuse protection returned an invalid result')
  }
  return ipLimit.success && emailLimit.success
}

const gatewayEndpoint = (value: string) => {
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    !['api.thongphan.com', 'api-staging.thongphan.com'].includes(url.hostname) ||
    url.username ||
    url.password ||
    (url.pathname !== '/' && url.pathname !== '') ||
    url.search ||
    url.hash
  ) {
    throw new Error('Audience gateway URL is invalid')
  }
  return new URL('/v1/audience/challenge-signups', url).toString()
}

const registerThroughDataPlatform = async (
  request: Request,
  env: SignupEnv,
  signup: { challengeSlug: string; name: string; email: string },
  dependencies: { randomUUID?: () => string; fetch?: typeof fetch },
) => {
  const gatewayUrl = env.DATA_PLATFORM_URL?.trim() ?? ''
  const token = env.DATA_PLATFORM_AUDIENCE_TOKEN?.trim() ?? ''
  if (!gatewayUrl || token.length < 32) {
    throw new Error('Audience gateway configuration is incomplete')
  }
  const providedIdempotencyKey = request.headers.get('Idempotency-Key')?.trim()
  if (providedIdempotencyKey && providedIdempotencyKey.length > 128) {
    return jsonResponse(400, { success: false, message: 'Yêu cầu đăng ký không hợp lệ' })
  }
  const randomUUID = dependencies.randomUUID ?? crypto.randomUUID.bind(crypto)
  const idempotencyKey = providedIdempotencyKey || randomUUID()
  const requestId = randomUUID()
  const fetchImpl = dependencies.fetch ?? fetch
  const response = await fetchImpl(gatewayEndpoint(gatewayUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'X-Request-Id': requestId,
    },
    body: JSON.stringify({
      challengeSlug: signup.challengeSlug,
      name: signup.name,
      email: signup.email,
      source: 'thongphan.com',
    }),
  })
  const responseBody = await response.json().catch(() => null) as {
    data?: { signupId?: unknown; challengeSlug?: unknown; status?: unknown }
    error?: { code?: unknown }
  } | null
  if (
    response.ok &&
    typeof responseBody?.data?.signupId === 'string' &&
    responseBody.data.challengeSlug === signup.challengeSlug &&
    responseBody.data.status === 'registered'
  ) {
    try {
      await env.KV?.delete(`challenge:${signup.challengeSlug}`)
    } catch {
      // The canonical signup is committed; stale public counts are best-effort.
    }
    return jsonResponse(200, {
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: responseBody.data.signupId,
    })
  }
  if (response.status === 409 && responseBody?.error?.code === 'already_registered') {
    return jsonResponse(409, { success: false, message: 'Email này đã đăng ký lộ trình rồi' })
  }
  if (response.status === 429) {
    return jsonResponse(
      429,
      { success: false, message: 'Có quá nhiều yêu cầu. Vui lòng thử lại sau một phút.' },
      { 'Retry-After': response.headers.get('Retry-After') ?? '60' },
    )
  }
  return jsonResponse(503, { success: false, message: 'Đăng ký chưa được lưu. Vui lòng thử lại.' })
}

export async function handleBrain2SignupRequest(
  request: Request,
  env: SignupEnv,
  dependencies: { now?: () => Date; randomUUID?: () => string; fetch?: typeof fetch } = {},
): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...RESPONSE_HEADERS, Allow: 'POST, OPTIONS' } })
  if (request.method !== 'POST') return jsonResponse(405, { success: false, message: 'Phương thức không được hỗ trợ' })
  const url = new URL(request.url)
  if (!allowedOrigins.has(url.origin) || request.headers.get('Origin') !== url.origin) {
    return jsonResponse(403, { success: false, message: 'Yêu cầu không hợp lệ' })
  }
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'application/json') return jsonResponse(415, { success: false, message: 'Dữ liệu gửi lên không hợp lệ' })
  const boundedBody = await readBoundedBody(request)
  if (!boundedBody.ok) {
    const message = boundedBody.status === 413
      ? 'Dữ liệu gửi lên quá lớn'
      : boundedBody.status === 503
        ? 'Không thể đọc dữ liệu lúc này'
        : 'Dữ liệu gửi lên không hợp lệ'
    return jsonResponse(boundedBody.status, { success: false, message })
  }
  let body: unknown
  try {
    body = JSON.parse(boundedBody.text)
  } catch {
    return jsonResponse(400, { success: false, message: 'Dữ liệu gửi lên không hợp lệ' })
  }
  if (!exactSignup(body)) return jsonResponse(400, { success: false, message: 'Tên hoặc email không hợp lệ' })

  const name = body.name.trim()
  const email = body.email.trim().toLowerCase()
  try {
    if (!await enforceSignupRateLimit(request, env, email)) {
      return jsonResponse(
        429,
        { success: false, message: 'Có quá nhiều yêu cầu. Vui lòng thử lại sau một phút.' },
        { 'Retry-After': '60' },
      )
    }

    if (env.DATA_PLATFORM_URL || env.DATA_PLATFORM_AUDIENCE_TOKEN) {
      return await registerThroughDataPlatform(
        request,
        env,
        { challengeSlug: BRAIN2_CHALLENGE_SLUG, name, email },
        dependencies,
      )
    }

    if (!env.DB) {
      return jsonResponse(503, { success: false, message: 'Hệ thống đăng ký đang tạm gián đoạn. Vui lòng thử lại.' })
    }
    const db = env.DB

    const challenge = await db.prepare(
      'SELECT id, duration_days FROM challenges WHERE slug = ? AND is_active = 1',
    ).bind(BRAIN2_CHALLENGE_SLUG).first<{ id: string; duration_days: number }>()
    if (!challenge || challenge.duration_days !== TOTAL_DAYS) {
      return jsonResponse(503, { success: false, message: 'Lộ trình hiện chưa nhận đăng ký' })
    }
    const duplicateQuery = () => db.prepare(
      'SELECT id FROM challenge_signups WHERE challenge_id = ? AND lower(email) = lower(?)',
    ).bind(challenge.id, email).first<{ id: string }>()
    if (await duplicateQuery()) {
      return jsonResponse(409, { success: false, message: 'Email này đã đăng ký lộ trình rồi' })
    }

    const now = (dependencies.now ?? (() => new Date()))()
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
      return jsonResponse(503, {
        success: false,
        message: 'Không thể xác định thời điểm đăng ký lúc này. Vui lòng thử lại.',
      })
    }
    const signupAt = now.toISOString()
    const randomUUID = dependencies.randomUUID ?? crypto.randomUUID.bind(crypto)
    const signupId = randomUUID()
    const signupStatement = db.prepare(
      `INSERT INTO challenge_signups (id, challenge_id, name, email, current_day, signed_up_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
    ).bind(signupId, challenge.id, name, email, signupAt)
    try {
      await db.batch([signupStatement])
    } catch {
      try {
        if (await duplicateQuery()) {
          return jsonResponse(409, { success: false, message: 'Email này đã đăng ký lộ trình rồi' })
        }
      } catch {
        // The stable 503 below covers both the failed transaction and failed recheck.
      }
      return jsonResponse(503, { success: false, message: 'Đăng ký chưa được lưu. Vui lòng thử lại.' })
    }
    try {
      await env.KV?.delete(`challenge:${BRAIN2_CHALLENGE_SLUG}`)
    } catch {
      // Cache invalidation is best-effort after the D1 transaction has committed.
    }
    return jsonResponse(200, {
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: signupId,
    })
  } catch {
    return jsonResponse(503, { success: false, message: 'Hệ thống đăng ký đang tạm gián đoạn. Vui lòng thử lại.' })
  }
}
