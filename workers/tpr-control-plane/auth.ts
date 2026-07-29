const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const SESSION_COOKIE = '__Secure-tp_tpr_session'
export const SESSION_MAX_AGE = 43_200
const AUDIENCE = 'tpr-owner'

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
    return Uint8Array.from(atob(padded), (item) => item.charCodeAt(0))
  } catch {
    return null
  }
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  if (encoder.encode(secret).byteLength < 32) throw new Error('TPR session secret unavailable')
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)))
}

export function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

function parseHash(value: string): Uint8Array {
  const match = /^sha256:([A-Za-z0-9_-]{43})$/.exec(value)
  const bytes = match ? base64UrlDecode(match[1]) : null
  if (!bytes || bytes.byteLength !== 32) throw new Error('TPR access hash malformed')
  return bytes
}

export async function formatAccessCodeHash(code: string): Promise<string> {
  return `sha256:${base64UrlEncode(await sha256(code))}`
}

export async function verifyAccessCode(code: string, expected: string): Promise<boolean> {
  return timingSafeEqual(await sha256(code), parseHash(expected))
}

export async function verifySyncSecret(value: string, expected: string): Promise<boolean> {
  if (encoder.encode(expected).byteLength < 32) throw new Error('TPR sync secret unavailable')
  return timingSafeEqual(await sha256(value), await sha256(expected))
}

export async function createSession(now: number, secret: string, accessHash: string): Promise<string> {
  parseHash(accessHash)
  const payload = base64UrlEncode(encoder.encode(JSON.stringify({
    v: 1, aud: AUDIENCE, iat: now, exp: now + SESSION_MAX_AGE,
  })))
  const signature = base64UrlEncode(await hmac(secret, `tpr-session:v1:${accessHash}:${payload}`))
  return `${SESSION_COOKIE}=${payload}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`
}

export function clearSession(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

function cookieValue(request: Request): string | null {
  const header = request.headers.get('Cookie')
  if (!header) return null
  const matches = header.split(';').map((part) => part.trim()).filter((part) => part.startsWith(`${SESSION_COOKIE}=`))
  return matches.length === 1 ? matches[0].slice(SESSION_COOKIE.length + 1) : null
}

export async function hasValidSession(request: Request, now: number, secret: string, accessHash: string): Promise<boolean> {
  parseHash(accessHash)
  const value = cookieValue(request)
  if (!value) return false
  const parts = value.split('.')
  if (parts.length !== 2) return false
  const payloadBytes = base64UrlDecode(parts[0])
  const signature = base64UrlDecode(parts[1])
  if (!payloadBytes || !signature) return false
  const expected = await hmac(secret, `tpr-session:v1:${accessHash}:${parts[0]}`)
  if (!timingSafeEqual(signature, expected)) return false
  try {
    const payload = JSON.parse(decoder.decode(payloadBytes)) as Record<string, unknown>
    return payload.v === 1 && payload.aud === AUDIENCE && Number.isInteger(payload.iat) &&
      Number.isInteger(payload.exp) && Number(payload.exp) > now && Number(payload.iat) <= now + 60 &&
      Number(payload.exp) - Number(payload.iat) <= SESSION_MAX_AGE
  } catch {
    return false
  }
}
