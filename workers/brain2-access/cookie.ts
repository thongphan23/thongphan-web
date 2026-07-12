import {
  assertSessionSecret,
  base64UrlDecode,
  base64UrlEncode,
  hmacSha256,
  parseAccessCodeHash,
  timingSafeEqualBytes,
} from './auth'

export const SESSION_COOKIE_NAME = '__Secure-tp_b2_session'
export const SESSION_MAX_AGE_SECONDS = 2_592_000
const SESSION_AUDIENCE = 'brain2-21'
const SESSION_PATH = '/brain2/21-ngay'

export interface SessionPayload {
  v: 1
  aud: string
  iat: number
  exp: number
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function exactPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return keys.length === 4 &&
    keys.join(',') === 'aud,exp,iat,v' &&
    record.v === 1 &&
    typeof record.aud === 'string' &&
    Number.isInteger(record.iat) &&
    Number.isInteger(record.exp)
}

export async function signSessionValue({
  payload,
  sessionSecret,
  accessCodeHash,
}: {
  payload: SessionPayload
  sessionSecret: string
  accessCodeHash: string
}): Promise<string> {
  assertSessionSecret(sessionSecret)
  parseAccessCodeHash(accessCodeHash)
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const signature = await hmacSha256(
    sessionSecret,
    `brain2-session:v1:${accessCodeHash}:${payloadPart}`,
  )
  return `${payloadPart}.${base64UrlEncode(signature)}`
}

export async function verifySessionValue({
  value,
  sessionSecret,
  accessCodeHash,
  now,
}: {
  value: string
  sessionSecret: string
  accessCodeHash: string
  now: number
}): Promise<SessionPayload | null> {
  assertSessionSecret(sessionSecret)
  parseAccessCodeHash(accessCodeHash)
  const parts = value.split('.')
  if (parts.length !== 2) return null
  const payloadBytes = base64UrlDecode(parts[0])
  const signature = base64UrlDecode(parts[1])
  if (!payloadBytes || !signature || signature.byteLength !== 32) return null
  const expected = await hmacSha256(
    sessionSecret,
    `brain2-session:v1:${accessCodeHash}:${parts[0]}`,
  )
  if (!timingSafeEqualBytes(signature, expected)) return null
  try {
    const payload: unknown = JSON.parse(decoder.decode(payloadBytes))
    if (!exactPayload(payload)) return null
    if (payload.aud !== SESSION_AUDIENCE) return null
    if (payload.iat > now + 60 || payload.exp <= now || payload.exp <= payload.iat) return null
    if (payload.exp - payload.iat > SESSION_MAX_AGE_SECONDS) return null
    return payload
  } catch {
    return null
  }
}

export function readSessionValue(request: Request): string | null {
  const header = request.headers.get('Cookie')
  if (!header) return null
  const matches = header.split(';').map((part) => part.trim()).filter(
    (part) => part.startsWith(`${SESSION_COOKIE_NAME}=`),
  )
  if (matches.length !== 1) return null
  return matches[0].slice(SESSION_COOKIE_NAME.length + 1) || null
}

export async function createSessionCookie({
  now,
  sessionSecret,
  accessCodeHash,
}: {
  now: number
  sessionSecret: string
  accessCodeHash: string
}): Promise<string> {
  const value = await signSessionValue({
    payload: { v: 1, aud: SESSION_AUDIENCE, iat: now, exp: now + SESSION_MAX_AGE_SECONDS },
    sessionSecret,
    accessCodeHash,
  })
  return `${SESSION_COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Lax; Path=${SESSION_PATH}; Max-Age=${SESSION_MAX_AGE_SECONDS}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=${SESSION_PATH}; Max-Age=0`
}
