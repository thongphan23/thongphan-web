import type { MediaStatus } from '../../lib/vid/contracts'
import type { VidEnv } from './types'

const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('')
}

function requireBunny(env: VidEnv): { libraryId: string; apiKey: string } {
  if (!env.BUNNY_LIBRARY_ID || !env.BUNNY_STREAM_API_KEY) throw new Error('bunny_not_configured')
  return { libraryId: env.BUNNY_LIBRARY_ID, apiKey: env.BUNNY_STREAM_API_KEY }
}

export async function createBunnyVideo(
  input: { title: string },
  env: VidEnv,
  fetcher: typeof fetch = fetch,
): Promise<{ videoId: string }> {
  const { libraryId, apiKey } = requireBunny(env)
  const response = await fetcher(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      AccessKey: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: input.title }),
  })
  if (!response.ok) throw new Error('bunny_create_failed')
  const payload = await response.json() as { guid?: unknown }
  if (typeof payload.guid !== 'string' || !payload.guid) throw new Error('bunny_create_invalid_response')
  return { videoId: payload.guid }
}

export async function buildTusAuthorization(videoId: string, expirationTime: number, env: VidEnv) {
  const { libraryId, apiKey } = requireBunny(env)
  const signatureInput = `${libraryId}${apiKey}${expirationTime}${videoId}`
  const signature = toHex(await crypto.subtle.digest('SHA-256', encoder.encode(signatureInput)))
  return {
    endpoint: 'https://video.bunnycdn.com/tusupload',
    videoId,
    libraryId,
    expirationTime,
    signature,
  }
}

export async function verifyBunnyWebhook(rawBody: string, headers: Headers, env: VidEnv): Promise<boolean> {
  const secret = env.BUNNY_WEBHOOK_SECRET
  const signature = headers.get('X-BunnyStream-Signature')
  if (!secret || headers.get('X-BunnyStream-Signature-Version') !== 'v1') return false
  if (headers.get('X-BunnyStream-Signature-Algorithm') !== 'hmac-sha256') return false
  if (!signature || !/^[0-9a-f]{64}$/.test(signature)) return false
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const expected = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody)))
  let difference = 0
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index)
  }
  return difference === 0
}

export function mapBunnyStatus(status: number): MediaStatus {
  if (status === 3 || status === 4 || status === 9 || status === 10) return 'ready'
  if (status === 5 || status === 8) return 'failed'
  if (status === 6 || status === 7) return 'uploading'
  return 'processing'
}

export async function getBunnyVideoDetails(videoId: string, env: VidEnv, fetcher: typeof fetch = fetch) {
  const { libraryId, apiKey } = requireBunny(env)
  const response = await fetcher(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
    headers: { Accept: 'application/json', AccessKey: apiKey },
  })
  if (!response.ok) throw new Error('bunny_status_failed')
  const payload = await response.json() as { length?: unknown; thumbnailFileName?: unknown }
  const durationSeconds = Number.isFinite(payload.length) ? Math.round(Number(payload.length)) : 0
  const thumbnailFileName = typeof payload.thumbnailFileName === 'string' && /^[a-zA-Z0-9._-]+$/.test(payload.thumbnailFileName)
    ? payload.thumbnailFileName
    : 'thumbnail.jpg'
  if (durationSeconds <= 0 || !env.BUNNY_CDN_HOST || !/^[a-z0-9.-]+$/i.test(env.BUNNY_CDN_HOST)) {
    throw new Error('bunny_status_invalid_response')
  }
  return {
    durationSeconds,
    thumbnailUrl: `https://${env.BUNNY_CDN_HOST}/${videoId}/${thumbnailFileName}`,
    previewUrl: `https://${env.BUNNY_CDN_HOST}/${videoId}/preview.webp`,
    playerUrl: `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`,
  }
}
