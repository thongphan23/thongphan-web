'use client'

export const READER_LOOP_CREDENTIALS_KEY = 'tp:reader-loop:credentials:v0'
export const READER_LOOP_API_ORIGIN = (process.env.NEXT_PUBLIC_READER_LOOP_API_ORIGIN || 'http://127.0.0.1:8787').replace(/\/$/, '')

export interface ReaderCredentials {
  readerId: string
  readerToken: string
}

export function readCredentials(): ReaderCredentials | null {
  try {
    const raw = window.localStorage.getItem(READER_LOOP_CREDENTIALS_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return null
    const candidate = value as Record<string, unknown>
    return typeof candidate.readerId === 'string' && typeof candidate.readerToken === 'string'
      ? { readerId: candidate.readerId, readerToken: candidate.readerToken }
      : null
  } catch {
    return null
  }
}

export async function ensureCredentials(): Promise<ReaderCredentials> {
  const existing = readCredentials()
  if (existing) return existing

  const response = await fetch(`${READER_LOOP_API_ORIGIN}/v1/readers`, { method: 'POST' })
  if (!response.ok) throw new Error('READER_CREATE_FAILED')
  const payload = await response.json() as { reader_id: string; reader_token: string }
  const credentials = { readerId: payload.reader_id, readerToken: payload.reader_token }
  window.localStorage.setItem(READER_LOOP_CREDENTIALS_KEY, JSON.stringify(credentials))
  return credentials
}

export async function readerApi<T>(path: string, init: RequestInit = {}, credentials?: ReaderCredentials): Promise<T> {
  const reader = credentials ?? await ensureCredentials()
  const headers = new Headers(init.headers)
  headers.set('authorization', `Reader ${reader.readerToken}`)
  if (init.body) headers.set('content-type', 'application/json')
  const response = await fetch(`${READER_LOOP_API_ORIGIN}${path}`, { ...init, headers })
  if (!response.ok) {
    const error = new Error(`READER_API_${response.status}`)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }
  return response.json() as Promise<T>
}
