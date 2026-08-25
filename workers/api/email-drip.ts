import {
  BRAIN2_CAMPAIGN_VERSION,
  personalizeBrain2Email,
} from '../brain2-campaign'

export const ADMIN_PATH = '/brain2/21-ngay/api/email-admin'
export const UNSUBSCRIBE_PATH = '/brain2/21-ngay/api/unsubscribe'
const PUBLIC_ORIGINS = new Set(['https://thongphan.com', 'https://www.thongphan.com'])
const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account'
const MAX_BATCH = 10
const MAX_ATTEMPTS = 3
const LEASE_MS = 4 * 60 * 1000
const RETRY_HORIZON_MS = 25 * 60 * 1000
const PROVIDER_TIMEOUT_MS = 20_000
const HEALTH_TIMEOUT_MS = 8_000
const encoder = new TextEncoder()

interface StatementLike {
  bind(...values: unknown[]): StatementLike
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<unknown>
}

interface DatabaseLike {
  prepare(query: string): StatementLike
  batch(statements: StatementLike[]): Promise<unknown>
}

export interface EmailEnv {
  DB: DatabaseLike
  BREVO_API_KEY: string
  BRAIN2_EMAIL_ADMIN_SECRET: string
  BRAIN2_EMAIL_UNSUBSCRIBE_SECRET: string
}

interface QueueItem {
  id: string
  signup_id: string
  day: number
  subject: string
  body: string
  attempt_count: number
}

interface Recipient {
  name: string
  email: string
  is_unsubscribed: number
}

const assertSecret: (value: unknown, label: string) => asserts value is string = (value, label) => {
  if (typeof value !== 'string' || encoder.encode(value).byteLength < 32) {
    throw new Error(`${label} is unavailable`)
  }
}

const base64Url = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const hmac = async (secret: string, value: string) => {
  assertSecret(secret, 'Email token secret')
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))
}

const timingSafeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) return false
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (a: ArrayBufferView, b: ArrayBufferView) => boolean
  }
  if (typeof subtle.timingSafeEqual === 'function') return subtle.timingSafeEqual(left, right)
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

const decodeBase64Url = (value: string) => {
  if (!/^[A-Za-z0-9_-]{43}$/.test(value)) return null
  try {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '=')
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return base64Url(bytes) === value ? bytes : null
  } catch {
    return null
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function createUnsubscribeToken(signupId: string, secret: string): Promise<string> {
  if (!UUID.test(signupId)) throw new Error('Signup identifier is invalid')
  const signature = await hmac(secret, `brain2-unsubscribe:v1:${signupId}`)
  return `v1.${signupId}.${base64Url(signature)}`
}

export async function verifyUnsubscribeToken(token: string, secret: string): Promise<string | null> {
  assertSecret(secret, 'Email token secret')
  const match = /^v1\.([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/i.exec(token)
  if (!match || !UUID.test(match[1])) return null
  const actual = decodeBase64Url(match[2])
  if (!actual) return null
  const expected = await hmac(secret, `brain2-unsubscribe:v1:${match[1]}`)
  return timingSafeEqual(actual, expected) ? match[1] : null
}

export function buildBrevoPayload(
  item: Pick<QueueItem, 'id' | 'day' | 'subject'>,
  recipient: Pick<Recipient, 'name' | 'email'>,
  htmlContent: string,
) {
  if (!UUID.test(item.id)) throw new Error('Queue idempotency key is invalid')
  return {
    sender: { name: 'Thông Phan', email: 'hi@thongphan.com' },
    to: [{ name: recipient.name, email: recipient.email }],
    replyTo: { name: 'Thông Phan', email: 'hi@thongphan.com' },
    subject: item.subject,
    htmlContent,
    headers: { idempotencyKey: item.id },
    tags: [BRAIN2_CAMPAIGN_VERSION, `day-${String(item.day).padStart(2, '0')}`],
  }
}

const CLAIM_SQL = `UPDATE email_queue
SET attempt_count = attempt_count + 1,
    first_attempt_at = COALESCE(first_attempt_at, ?),
    last_attempt_at = ?,
    error_message = NULL
WHERE id = (
  SELECT q.id
  FROM email_queue q
  JOIN challenge_signups s ON s.id = q.signup_id
  WHERE q.campaign_version = 'brain2-2026-v1'
    AND q.audience_state = 'sendable'
    AND q.sendable = 1
    AND q.status = 'pending'
    AND q.scheduled_at <= ?
    AND q.attempt_count < 3
    AND s.is_unsubscribed = 0
    AND (q.last_attempt_at IS NULL OR q.last_attempt_at <= ?)
    AND (q.first_attempt_at IS NULL OR q.first_attempt_at >= ?)
  ORDER BY q.scheduled_at ASC, q.id ASC
  LIMIT 1
)
AND campaign_version = 'brain2-2026-v1'
AND audience_state = 'sendable'
AND sendable = 1
AND status = 'pending'
AND attempt_count < 3
AND (last_attempt_at IS NULL OR last_attempt_at <= ?)
AND (first_attempt_at IS NULL OR first_attempt_at >= ?)
RETURNING id, signup_id, day, subject, body, attempt_count`

export const EMAIL_OWNED_UPDATE_SQL = `UPDATE email_queue
SET status = ?, error_message = ?
WHERE id = ?
  AND campaign_version = 'brain2-2026-v1'
  AND audience_state = 'sendable'
  AND sendable = 1
  AND status = 'pending'
  AND attempt_count = ?
  AND last_attempt_at = ?`

export const EMAIL_EXPIRE_SQL = `UPDATE email_queue
SET status = 'failed', error_message = 'delivery_unknown'
WHERE campaign_version = 'brain2-2026-v1'
  AND audience_state = 'sendable'
  AND sendable = 1
  AND status = 'pending'
  AND attempt_count > 0
  AND last_attempt_at <= ?
  AND (attempt_count >= ? OR first_attempt_at < ?)`

const safeQueueUpdate = async (
  DB: DatabaseLike,
  item: Pick<QueueItem, 'id' | 'attempt_count'>,
  claimedAt: string,
  status: 'sent' | 'failed' | 'pending',
  error: string | null,
) => DB.prepare(EMAIL_OWNED_UPDATE_SQL)
  .bind(status, error, item.id, item.attempt_count, claimedAt)
  .run()

const acceptedDuplicate = async (response: Response) => {
  if (response.status !== 400) return false
  try {
    const value: unknown = await response.json()
    return Boolean(value && typeof value === 'object' && (value as Record<string, unknown>).code === 'duplicate_parameter')
  } catch {
    return false
  }
}

export async function processPendingEmails(
  env: EmailEnv,
  {
    fetcher = fetch,
    now = () => new Date(),
    limit = MAX_BATCH,
  }: {
    fetcher?: typeof fetch
    now?: () => Date
    limit?: number
  } = {},
) {
  assertSecret(env.BREVO_API_KEY, 'Brevo API key')
  assertSecret(env.BRAIN2_EMAIL_UNSUBSCRIBE_SECRET, 'Email unsubscribe secret')
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_BATCH) throw new Error('Email batch limit is invalid')
  const clock = now()
  if (!(clock instanceof Date) || !Number.isFinite(clock.getTime())) throw new Error('Email clock is invalid')
  const nowIso = clock.toISOString()
  const leaseCutoff = new Date(clock.getTime() - LEASE_MS).toISOString()
  const retryHorizon = new Date(clock.getTime() - RETRY_HORIZON_MS).toISOString()

  await env.DB.prepare(EMAIL_EXPIRE_SQL)
    .bind(leaseCutoff, MAX_ATTEMPTS, retryHorizon)
    .run()

  const report = { selected: 0, sent: 0, failed: 0, retry: 0 }
  for (let index = 0; index < limit; index += 1) {
    const item = await env.DB.prepare(CLAIM_SQL).bind(
      nowIso,
      nowIso,
      nowIso,
      leaseCutoff,
      retryHorizon,
      leaseCutoff,
      retryHorizon,
    ).first<QueueItem>()
    if (!item) break
    report.selected += 1

    const recipient = await env.DB.prepare(
      'SELECT name, email, is_unsubscribed FROM challenge_signups WHERE id = ?',
    ).bind(item.signup_id).first<Recipient>()
    if (!recipient || recipient.is_unsubscribed !== 0) {
      await safeQueueUpdate(env.DB, item, nowIso, 'failed', 'unsubscribed')
      report.failed += 1
      continue
    }

    let token: string
    let htmlContent: string
    let payload: ReturnType<typeof buildBrevoPayload>
    try {
      token = await createUnsubscribeToken(item.signup_id, env.BRAIN2_EMAIL_UNSUBSCRIBE_SECRET)
      const unsubscribeUrl = `https://thongphan.com${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(token)}`
      htmlContent = personalizeBrain2Email(item.body, { name: recipient.name, unsubscribeUrl })
      payload = buildBrevoPayload(item, recipient, htmlContent)
    } catch {
      await safeQueueUpdate(env.DB, item, nowIso, 'failed', 'invalid_queue_contract')
      report.failed += 1
      continue
    }

    let response: Response
    try {
      response = await fetcher(BREVO_SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'api-key': env.BREVO_API_KEY },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      })
    } catch {
      await safeQueueUpdate(env.DB, item, nowIso, 'pending', 'provider_retry')
      report.retry += 1
      continue
    }

    const duplicate = await acceptedDuplicate(response)
    if (response.ok || duplicate) {
      await env.DB.batch([
        env.DB.prepare(
          `UPDATE email_queue
              SET status = 'sent', sent_at = ?, error_message = NULL
            WHERE id = ?
              AND campaign_version = 'brain2-2026-v1'
              AND audience_state = 'sendable'
              AND sendable = 1
              AND status = 'pending'
              AND attempt_count = ?
              AND last_attempt_at = ?`,
        ).bind(nowIso, item.id, item.attempt_count, nowIso),
        env.DB.prepare(
          `INSERT OR IGNORE INTO email_logs (id, signup_id, day, sent_at, status)
           SELECT ?, ?, ?, ?, 'sent'
            WHERE EXISTS (
              SELECT 1 FROM email_queue
               WHERE id = ?
                 AND campaign_version = 'brain2-2026-v1'
                 AND audience_state = 'sendable'
                 AND sendable = 1
                 AND status = 'sent'
                 AND attempt_count = ?
                 AND last_attempt_at = ?
                 AND sent_at = ?
            )`,
        ).bind(item.id, item.signup_id, item.day, nowIso, item.id, item.attempt_count, nowIso, nowIso),
        env.DB.prepare(
          `UPDATE challenge_signups
              SET current_day = CASE WHEN current_day < ? THEN ? ELSE current_day END
            WHERE id = ?
              AND is_unsubscribed = 0
              AND EXISTS (
                SELECT 1 FROM email_queue
                 WHERE id = ?
                   AND campaign_version = 'brain2-2026-v1'
                   AND audience_state = 'sendable'
                   AND sendable = 1
                   AND status = 'sent'
                   AND attempt_count = ?
                   AND last_attempt_at = ?
                   AND sent_at = ?
              )`,
        ).bind(item.day, item.day, item.signup_id, item.id, item.attempt_count, nowIso, nowIso),
      ])
      report.sent += 1
      continue
    }

    if (response.status === 429 || response.status >= 500) {
      await safeQueueUpdate(env.DB, item, nowIso, 'pending', `provider_${response.status}`)
      report.retry += 1
      continue
    }
    await safeQueueUpdate(env.DB, item, nowIso, 'failed', `provider_${response.status}`)
    report.failed += 1
    if (response.status === 401 || response.status === 403) break
  }
  return report
}

const privateHeaders = (contentType = 'application/json; charset=utf-8') => ({
  'Cache-Control': 'private, no-store, max-age=0',
  'Content-Type': contentType,
  'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; style-src 'unsafe-inline'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
})

const jsonResponse = (status: number, value: unknown) => new Response(JSON.stringify(value), {
  status,
  headers: privateHeaders(),
})

const adminAuthorized = async (request: Request, secret: string) => {
  assertSecret(secret, 'Email admin secret')
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return false
  const supplied = await crypto.subtle.digest('SHA-256', encoder.encode(header.slice(7)))
  const expected = await crypto.subtle.digest('SHA-256', encoder.encode(secret))
  return timingSafeEqual(new Uint8Array(supplied), new Uint8Array(expected))
}

const healthCheck = async (env: EmailEnv, fetcher: typeof fetch) => {
  assertSecret(env.BREVO_API_KEY, 'Brevo API key')
  try {
    const response = await fetcher(BREVO_ACCOUNT_URL, {
      method: 'GET',
      headers: { Accept: 'application/json', 'api-key': env.BREVO_API_KEY },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    })
    return response.ok
  } catch {
    return false
  }
}

const unsubscribePage = ({
  title,
  copy,
  token,
}: {
  title: string
  copy: string
  token?: string
}) => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title></head><body style="margin:0;background:#171210;color:#f1eadc;font-family:Arial,sans-serif;line-height:1.6"><main style="max-width:620px;margin:0 auto;padding:72px 24px"><p style="color:#c94b3f;font-size:12px;letter-spacing:.12em;text-transform:uppercase">21 ngày Brain2</p><h1 style="font-size:clamp(32px,7vw,56px);line-height:1.05;margin:12px 0 20px">${title}</h1><p style="color:#c9beb1">${copy}</p>${token ? `<form method="post" action="${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(token)}" style="margin-top:28px"><button type="submit" style="min-height:48px;padding:12px 18px;background:#b52f24;color:white;border:1px solid #dc665b;cursor:pointer">Xác nhận hủy đăng ký</button></form>` : '<p style="margin-top:28px"><a href="/brain2/21-ngay" style="color:#f1eadc">Trở lại lộ trình 21 ngày</a></p>'}</main></body></html>`

export function createBrain2EmailWorker({
  fetcher = fetch,
  now = () => new Date(),
}: { fetcher?: typeof fetch; now?: () => Date } = {}) {
  return {
    async scheduled(_event: unknown, env: EmailEnv): Promise<void> {
      try {
        const report = await processPendingEmails(env, { fetcher, now })
        console.log(JSON.stringify({ event: 'brain2_batch', status: 'complete', ...report }))
      } catch {
        console.error(JSON.stringify({ event: 'brain2_batch', status: 'failed' }))
      }
    },

    async fetch(request: Request, env: EmailEnv): Promise<Response> {
      const url = new URL(request.url)
      if (!PUBLIC_ORIGINS.has(url.origin)) return jsonResponse(404, { error: 'not_found' })

      if (url.pathname === UNSUBSCRIBE_PATH) {
        let signupId: string | null
        try {
          signupId = await verifyUnsubscribeToken(url.searchParams.get('token') ?? '', env.BRAIN2_EMAIL_UNSUBSCRIBE_SECRET)
        } catch {
          return jsonResponse(503, { error: 'temporarily_unavailable' })
        }
        if (!signupId) return jsonResponse(400, { error: 'invalid_token' })
        if (request.method === 'GET') {
          return new Response(unsubscribePage({
            title: 'Dừng email 21 ngày Brain2?',
            copy: 'Nhấn xác nhận để không nhận các email tiếp theo.',
            token: url.searchParams.get('token') ?? '',
          }), {
            status: 200,
            headers: privateHeaders('text/html; charset=utf-8'),
          })
        }
        if (request.method !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' })
        try {
          await env.DB.batch([
            env.DB.prepare('UPDATE challenge_signups SET is_unsubscribed = 1 WHERE id = ?').bind(signupId),
            env.DB.prepare(
              `UPDATE email_queue
                  SET status = 'failed', error_message = 'unsubscribed'
                WHERE signup_id = ? AND campaign_version = 'brain2-2026-v1' AND status = 'pending'`,
            ).bind(signupId),
          ])
        } catch {
          return new Response(unsubscribePage({
            title: 'Chưa thể lưu yêu cầu',
            copy: 'Hệ thống đang tạm gián đoạn. Email chưa được hủy; vui lòng thử lại sau.',
          }), { status: 503, headers: privateHeaders('text/html; charset=utf-8') })
        }
        return new Response(unsubscribePage({
          title: 'Đã dừng email',
          copy: 'Yêu cầu đã được lưu. Bạn sẽ không nhận các email 21 ngày tiếp theo.',
        }), { status: 200, headers: privateHeaders('text/html; charset=utf-8') })
      }

      if (url.pathname !== ADMIN_PATH) return jsonResponse(404, { error: 'not_found' })
      if (!['GET', 'POST'].includes(request.method)) return jsonResponse(405, { error: 'method_not_allowed' })
      let authorized = false
      try {
        authorized = await adminAuthorized(request, env.BRAIN2_EMAIL_ADMIN_SECRET)
      } catch {
        return jsonResponse(503, { error: 'temporarily_unavailable' })
      }
      if (!authorized) return jsonResponse(401, { error: 'unauthorized' })
      if (request.method === 'GET') {
        return await healthCheck(env, fetcher)
          ? new Response(null, { status: 204, headers: privateHeaders() })
          : jsonResponse(503, { error: 'provider_unavailable' })
      }
      try {
        return jsonResponse(200, await processPendingEmails(env, { fetcher, now, limit: 1 }))
      } catch {
        return jsonResponse(503, { error: 'temporarily_unavailable' })
      }
    },
  }
}

export default createBrain2EmailWorker()
