const encoder = new TextEncoder()

type TimingSafeSubtleCrypto = SubtleCrypto & {
  timingSafeEqual?: (left: ArrayBufferView, right: ArrayBufferView) => boolean
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function base64UrlDecode(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return base64UrlEncode(bytes) === value ? bytes : null
  } catch {
    return null
  }
}

export async function sha256Bytes(value: string | Uint8Array): Promise<Uint8Array> {
  const input = typeof value === 'string' ? encoder.encode(value) : value
  return new Uint8Array(await crypto.subtle.digest('SHA-256', Uint8Array.from(input)))
}

export async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  assertSessionSecret(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)))
}

export function timingSafeEqualBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false
  const subtle = crypto.subtle as TimingSafeSubtleCrypto
  if (typeof subtle.timingSafeEqual === 'function') return subtle.timingSafeEqual(left, right)
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

export function assertSessionSecret(secret: unknown): asserts secret is string {
  if (typeof secret !== 'string' || encoder.encode(secret).byteLength < 32) {
    throw new Error('Brain2 session secret is unavailable')
  }
}

export function parseAccessCodeHash(value: unknown): Uint8Array {
  if (typeof value !== 'string') throw new Error('Brain2 access hash is unavailable')
  const match = /^sha256:([A-Za-z0-9_-]{43})$/.exec(value)
  const decoded = match ? base64UrlDecode(match[1]) : null
  if (!decoded || decoded.byteLength !== 32) throw new Error('Brain2 access hash is malformed')
  return decoded
}

export async function formatAccessCodeHash(code: string): Promise<string> {
  if (typeof code !== 'string' || code.length === 0) throw new Error('Access code is required')
  return `sha256:${base64UrlEncode(await sha256Bytes(code))}`
}

export async function verifyAccessCode(code: string, expectedHash: string): Promise<boolean> {
  const expected = parseAccessCodeHash(expectedHash)
  const actual = await sha256Bytes(code)
  return timingSafeEqualBytes(actual, expected)
}
