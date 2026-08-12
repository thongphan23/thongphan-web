import { normalizeVietnamese } from './discovery'

export const VID_FEED_POLICY = 'vid-feed-v1' as const

export type CatalogCursor = {
  v: typeof VID_FEED_POLICY
  f: string
  b: 0 | 1
  r: number | null
  p: string
  s: string
}

const CURSOR_KEYS = ['v', 'f', 'b', 'r', 'p', 's'] as const
const MAX_CURSOR_BYTES = 1_024
const MAX_CURSOR_ENCODED_CHARS = Math.ceil(MAX_CURSOR_BYTES * 8 / 6)
const utf8 = new TextEncoder()
const utf8Decoder = new TextDecoder('utf-8', { fatal: true })

function invalidCursor(): never {
  throw new Error('invalid_cursor')
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromBase64Url(value: string): Uint8Array {
  if (value.length > MAX_CURSOR_ENCODED_CHARS) invalidCursor()
  if (!/^[A-Za-z0-9_-]+$/.test(value)) invalidCursor()
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)
  let binary: string
  try {
    binary = atob(base64)
  } catch {
    return invalidCursor()
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value))
}

function isCatalogCursor(value: unknown): value is CatalogCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  if (keys.length !== CURSOR_KEYS.length || keys.some((key, index) => key !== [...CURSOR_KEYS].sort()[index])) return false
  if (record.v !== VID_FEED_POLICY || typeof record.f !== 'string' || record.f.length > 512) return false
  if (record.b !== 0 && record.b !== 1) return false
  if (record.b === 0 && (typeof record.r !== 'number' || !Number.isFinite(record.r))) return false
  if (record.b === 1 && record.r !== null) return false
  return validTimestamp(record.p) && typeof record.s === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.s)
}

export function catalogFingerprint(filters: { query?: string; topic?: string }): string {
  const topic = filters.topic?.trim().normalize('NFC').toLocaleLowerCase('vi') ?? ''
  const query = normalizeVietnamese(filters.query?.trim() ?? '')
  return `topic=${encodeURIComponent(topic)}&q=${encodeURIComponent(query)}`
}

export function encodeCatalogCursor(value: CatalogCursor): string {
  if (!isCatalogCursor(value)) return invalidCursor()
  const bytes = utf8.encode(JSON.stringify(value))
  if (bytes.byteLength > MAX_CURSOR_BYTES) return invalidCursor()
  return toBase64Url(bytes)
}

export function decodeCatalogCursor(value: string, fingerprint: string): CatalogCursor {
  if (typeof value !== 'string' || value.length === 0) return invalidCursor()
  const bytes = fromBase64Url(value)
  if (bytes.byteLength > MAX_CURSOR_BYTES) return invalidCursor()
  let parsed: unknown
  try {
    parsed = JSON.parse(utf8Decoder.decode(bytes))
  } catch {
    return invalidCursor()
  }
  if (!isCatalogCursor(parsed)) return invalidCursor()
  if (parsed.f !== fingerprint) throw new Error('cursor_filter_mismatch')
  return parsed
}
