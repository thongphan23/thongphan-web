import type { VidEnv } from './types'

const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
}

async function hmacSha256(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))
}

export async function verifyAdminRequest(
  request: Request,
  rawBody: string,
  env: VidEnv,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const secret = env.VID_ADMIN_HMAC_SECRET
  const timestampText = request.headers.get('X-Vid-Timestamp')
  const nonce = request.headers.get('X-Vid-Nonce')
  const idempotencyKey = request.headers.get('X-Vid-Idempotency-Key')
  const signature = request.headers.get('X-Vid-Signature')
  if (!secret || !timestampText || !nonce || !idempotencyKey || !signature) return false
  if (!/^\d{10}$/.test(timestampText) || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce)) return false
  if (!/^[A-Za-z0-9._:-]{8,160}$/.test(idempotencyKey) || !/^[0-9a-f]{64}$/.test(signature)) return false
  const timestamp = Number(timestampText)
  if (Math.abs(nowSeconds - timestamp) > 300) return false

  const url = new URL(request.url)
  const canonical = [
    request.method.toUpperCase(),
    `${url.pathname}${url.search}`,
    timestampText,
    nonce,
    idempotencyKey,
    await sha256(rawBody),
  ].join('\n')
  const expected = await hmacSha256(canonical, secret)
  if (!constantTimeEqual(expected, signature)) return false

  const consumed = await env.VID_DB.prepare(
    'INSERT INTO vid_admin_nonces (nonce, expires_at) VALUES (?, ?) ON CONFLICT(nonce) DO NOTHING',
  ).bind(nonce, timestamp + 600).run()
  return Number(consumed.meta.changes ?? 0) === 1
}
