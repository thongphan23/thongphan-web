import { validateDraftInput } from '../../lib/vid/contracts'
import { verifyAdminRequest } from './auth'
import { buildTusAuthorization, createBunnyVideo, mapBunnyStatus, verifyBunnyWebhook } from './bunny'
import {
  archiveAdminVideo,
  createVideoDraft,
  findVideoByIdempotency,
  getAdminVideoStatus,
  getPublicPlaylist,
  getPublicVideo,
  listPublicVideos,
  listTopics,
  publishAdminVideo,
  updateVideoMediaStatus,
} from './catalog'
import { error, json } from './http'
import type { VidEnv } from './types'

type VidDependencies = {
  fetch: typeof fetch
}

const SHELLS: Readonly<Record<string, string>> = {
  '/': '/vid/index.html',
  '/watch': '/vid/watch.html',
  '/results': '/vid/results.html',
  '/topic': '/vid/topic.html',
  '/playlist': '/vid/playlist.html',
  '/library': '/vid/library.html',
}

function boundedInteger(value: string | null, fallback: number, minimum: number, maximum: number): number | null {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed >= minimum && parsed <= maximum ? parsed : null
}

async function handlePublicApi(request: Request, env: VidEnv, url: URL): Promise<Response> {
  if (request.method !== 'GET') return error('method_not_allowed', 405)
  if (url.pathname === '/api/health') return json({ ok: true }, 200, 'public, max-age=30')
  if (url.pathname === '/api/topics') return json({ items: await listTopics(env) }, 200, 'public, max-age=300')
  if (url.pathname === '/api/videos') {
    const page = boundedInteger(url.searchParams.get('page'), 1, 1, 10_000)
    const pageSize = boundedInteger(url.searchParams.get('pageSize'), 24, 1, 48)
    if (page === null || pageSize === null) return error('invalid_pagination', 400)
    return json(await listPublicVideos(env, page, pageSize), 200, 'public, max-age=60, stale-while-revalidate=300')
  }
  if (url.pathname.startsWith('/api/videos/')) {
    const slug = decodeURIComponent(url.pathname.slice('/api/videos/'.length))
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return error('video_not_found', 404)
    const video = await getPublicVideo(env, slug)
    return video ? json(video, 200, 'public, max-age=60, stale-while-revalidate=300') : error('video_not_found', 404)
  }
  if (url.pathname.startsWith('/api/playlists/')) {
    const slug = decodeURIComponent(url.pathname.slice('/api/playlists/'.length))
    const playlist = await getPublicPlaylist(env, slug)
    return playlist ? json(playlist, 200, 'public, max-age=120') : error('playlist_not_found', 404)
  }
  return error('api_not_found', 404)
}

async function handleAdminApi(
  request: Request,
  env: VidEnv,
  url: URL,
  dependencies: VidDependencies,
): Promise<Response> {
  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).byteLength > 64 * 1024) return error('body_too_large', 413)
  if (!await verifyAdminRequest(request, rawBody, env)) return error('unauthorized', 401)

  if (url.pathname === '/api/admin/uploads' && request.method === 'POST') {
    let input: ReturnType<typeof validateDraftInput>
    try {
      input = validateDraftInput(JSON.parse(rawBody))
    } catch {
      return error('invalid_upload_metadata', 400)
    }
    const idempotencyKey = request.headers.get('X-Vid-Idempotency-Key')!
    const existing = await findVideoByIdempotency(env, idempotencyKey)
    const videoId = typeof existing?.bunny_video_id === 'string'
      ? existing.bunny_video_id
      : (await createBunnyVideo({ title: input.title }, env, dependencies.fetch)).videoId
    const operationId = typeof existing?.id === 'string' ? existing.id : crypto.randomUUID()
    if (!existing) {
      await createVideoDraft(env, input, {
        id: operationId,
        bunnyVideoId: videoId,
        idempotencyKey,
        now: new Date().toISOString(),
      })
    }
    const expirationTime = Math.floor(Date.now() / 1000) + 86_400
    return json(
      { operationId, ...(await buildTusAuthorization(videoId, expirationTime, env)) },
      existing ? 200 : 201,
    )
  }

  const match = url.pathname.match(/^\/api\/admin\/videos\/([^/]+)\/(status|publish|archive)$/)
  if (!match) return error('admin_not_found', 404)
  const [, id, action] = match
  if (action === 'status' && request.method === 'GET') {
    const status = await getAdminVideoStatus(env, id)
    return status ? json(status) : error('video_not_found', 404)
  }
  if (action === 'publish' && request.method === 'POST') {
    return await publishAdminVideo(env, id) ? json({ ok: true }) : error('video_not_ready', 409)
  }
  if (action === 'archive' && request.method === 'POST') {
    return await archiveAdminVideo(env, id) ? json({ ok: true }) : error('video_not_found', 404)
  }
  return error('method_not_allowed', 405)
}

async function handleBunnyWebhook(request: Request, env: VidEnv): Promise<Response> {
  if (request.method !== 'POST') return error('method_not_allowed', 405)
  const rawBody = await request.text()
  if (!await verifyBunnyWebhook(rawBody, request.headers, env)) return error('unauthorized', 401)
  let payload: { VideoLibraryId?: unknown; VideoGuid?: unknown; Status?: unknown }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return error('invalid_json', 400)
  }
  if (String(payload.VideoLibraryId) !== env.BUNNY_LIBRARY_ID) return error('wrong_library', 400)
  if (typeof payload.VideoGuid !== 'string' || !Number.isInteger(payload.Status)) return error('invalid_webhook', 400)
  await updateVideoMediaStatus(env, payload.VideoGuid, mapBunnyStatus(Number(payload.Status)))
  return new Response(null, { status: 204 })
}

function pagesOrigin(requestUrl: URL, value: string): URL | null {
  try {
    const origin = new URL(value)
    if (origin.protocol !== 'https:' || origin.host === requestUrl.host) return null
    return origin
  } catch {
    return null
  }
}

async function proxyStatic(request: Request, env: VidEnv, url: URL, fetcher: typeof fetch): Promise<Response> {
  const origin = pagesOrigin(url, env.PAGES_ORIGIN)
  if (!origin) return error('static_origin_unavailable', 503)
  const mappedPath = SHELLS[url.pathname] ?? url.pathname
  const target = new URL(`${mappedPath}${url.search}`, origin)
  return fetcher(new Request(target, request))
}

export async function handleVidRequest(
  request: Request,
  env: VidEnv,
  dependencies: VidDependencies = { fetch },
): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname === '/api/webhooks/bunny') return handleBunnyWebhook(request, env)
  if (url.pathname.startsWith('/api/admin/')) return handleAdminApi(request, env, url, dependencies)
  if (url.pathname.startsWith('/api/')) return handlePublicApi(request, env, url)
  return proxyStatic(request, env, url, dependencies.fetch)
}

export default {
  fetch: handleVidRequest,
}
