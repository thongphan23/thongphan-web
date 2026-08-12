import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import test from 'node:test'
import { catalogFingerprint, encodeCatalogCursor, VID_FEED_POLICY } from '../lib/vid/feed-cursor'
import vidWorker, { handleVidRequest } from '../workers/vid/index'
import type { VidEnv } from '../workers/vid/types'

const publishedRow = {
  id: 'vid_01',
  slug: 'tu-duy-ai',
  bunny_video_id: 'bunny-01',
  idempotency_key: 'idem-01',
  title: 'Tư duy AI',
  description: 'Mô tả',
  source_title: 'Original',
  source_creator: 'Creator',
  source_creator_url: 'https://example.com/creator',
  source_video_url: 'https://example.com/video',
  translation_label: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  rights_status: 'owner-reviewed',
  rights_note: 'Owner reviewed',
  tags_json: '["tư duy"]',
  topics_json: '["ai"]',
  playlists_json: '["foundation"]',
  duration_seconds: 600,
  thumbnail_url: 'https://media.example.com/thumb.jpg',
  preview_url: 'https://media.example.com/preview.webp',
  player_url: 'https://player.mediadelivery.net/embed/123/bunny-01',
  status: 'published',
  media_status: 'ready',
  featured_rank: 1,
  published_at: '2026-08-12T00:00:00.000Z',
  created_at: '2026-08-11T00:00:00.000Z',
  updated_at: '2026-08-12T00:00:00.000Z',
}

class FakeStatement {
  bindings: unknown[] = []
  constructor(private readonly rows: Record<string, unknown>[]) {}
  bind(...values: unknown[]) { this.bindings = values; return this }
  async all() { return { results: this.rows } }
  async first() { return this.rows[0] ?? null }
  async run() { return { success: true } }
}

class FakeDatabase {
  constructor(readonly rows: Record<string, unknown>[] = []) {}
  prepare() { return new FakeStatement(this.rows) }
}

class CursorFeedDatabase {
  readonly calls: Array<{ sql: string; bindings: unknown[] }> = []
  private requests = 0

  prepare(sql: string) {
    let bindings: unknown[] = []
    return {
      bind: (...values: unknown[]) => {
        bindings = values
        return {
          all: async () => {
            this.calls.push({ sql, bindings })
            this.requests += 1
            const results = sql.includes('v.featured_rank > ?')
              ? cursorRows.slice(1)
              : this.requests === 1 ? cursorRows : [cursorRows[2]]
            return { results }
          },
          first: async () => null,
          run: async () => ({ success: true }),
        }
      },
    }
  }
}

const cursorRows = [
  { ...publishedRow, slug: 'featured-a', featured_rank: 1, published_at: '2026-08-12T03:00:00.000Z' },
  { ...publishedRow, slug: 'recent-b', featured_rank: null, published_at: '2026-08-12T02:00:00.000Z' },
  { ...publishedRow, slug: 'recent-c', featured_rank: null, published_at: '2026-08-12T01:00:00.000Z' },
]

function env(rows: Record<string, unknown>[] = []): VidEnv {
  return {
    VID_DB: new FakeDatabase(rows) as unknown as VidEnv['VID_DB'],
    PAGES_ORIGIN: 'https://pages.example.com',
    BUNNY_LIBRARY_ID: '123',
    BUNNY_CDN_HOST: 'media.example.com',
  }
}

test('maps public subdomain routes to exact static Vid shells', async () => {
  const seen: string[] = []
  const fetcher = async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : input.toString())
    seen.push(`${url.pathname}${url.search}`)
    return new Response('shell', { status: 200 })
  }

  for (const [path, expected] of [
    ['/', '/vid'],
    ['/watch?v=tu-duy-ai', '/vid/watch?v=tu-duy-ai'],
    ['/results?search_query=ai', '/vid/results?search_query=ai'],
    ['/topic?slug=ai', '/vid/topic?slug=ai'],
    ['/playlist?list=foundation', '/vid/playlist?list=foundation'],
    ['/library', '/vid/library'],
    ['/_next/static/app.js', '/_next/static/app.js'],
  ] as const) {
    const response = await handleVidRequest(new Request(`https://vid.thongphan.com${path}`), env(), { fetch: fetcher })
    assert.equal(response.status, 200)
    assert.equal(seen.at(-1), expected)
  }
})

test('static proxy forwards only cache and representation headers to Pages', async () => {
  let forwarded: Headers | undefined
  await handleVidRequest(
    new Request('https://vid.thongphan.com/', {
      headers: {
        Accept: 'text/html',
        'If-None-Match': '"asset-etag"',
        Cookie: 'private-session=must-not-leak',
        'X-Untrusted': 'must-not-leak',
      },
    }),
    env(),
    { fetch: async (input) => {
      forwarded = new Headers(input instanceof Request ? input.headers : undefined)
      return new Response('shell')
    } },
  )
  assert.equal(forwarded?.get('accept'), 'text/html')
  assert.equal(forwarded?.get('if-none-match'), '"asset-etag"')
  assert.equal(forwarded?.has('cookie'), false)
  assert.equal(forwarded?.has('x-untrusted'), false)
})

test('runtime adapter does not pass the Cloudflare execution context as fetch dependencies', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('shell', { status: 200 })
  try {
    const response = await (vidWorker.fetch as (...args: unknown[]) => Promise<Response>)(
      new Request('https://vid.thongphan.com/'),
      env(),
      { waitUntil() {} },
    )
    assert.equal(response.status, 200)
    assert.equal(await response.text(), 'shell')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('public API returns only exact published ready DTOs with bounded caching', async () => {
  const draft = { ...publishedRow, slug: 'draft', status: 'draft' }
  const response = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/videos?limit=12'),
    env([publishedRow, draft]),
  )
  assert.equal(response.status, 200)
  assert.match(response.headers.get('cache-control') ?? '', /max-age=60/)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://vid.thongphan.com')
  const body = await response.json() as { items: Array<{ slug: string }>; nextCursor: string | null; hasMore: boolean; policyVersion: string }
  assert.deepEqual(body.items.map(({ slug }) => slug), ['tu-duy-ai'])
  assert.equal(body.nextCursor, null)
  assert.equal(body.hasMore, false)
  assert.equal(body.policyVersion, 'vid-feed-v1')
  assert.equal(JSON.stringify(body).includes('Owner reviewed'), false)
})

test('cursor feed returns one extra row and advances without duplicates', async () => {
  const database = new CursorFeedDatabase()
  const cursorEnv = { ...env(), VID_DB: database as unknown as VidEnv['VID_DB'] }
  const firstResponse = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/videos?limit=2&topic=AI&q=T%C6%B0%20duy'),
    cursorEnv,
  )
  assert.equal(firstResponse.status, 200)
  const first = await firstResponse.json() as { items: Array<{ slug: string }>; nextCursor: string | null; hasMore: boolean }
  assert.deepEqual(first.items.map((item) => item.slug), ['featured-a', 'recent-b'])
  assert.equal(first.hasMore, true)
  assert.ok(first.nextCursor)

  const secondResponse = await handleVidRequest(
    new Request(`https://vid.thongphan.com/api/videos?limit=2&topic=AI&q=T%C6%B0%20duy&cursor=${encodeURIComponent(first.nextCursor)}`),
    cursorEnv,
  )
  assert.equal(secondResponse.status, 200)
  const second = await secondResponse.json() as { items: Array<{ slug: string }>; nextCursor: string | null; hasMore: boolean }
  assert.deepEqual(second.items.map((item) => item.slug), ['recent-c'])
  assert.equal(second.nextCursor, null)
  assert.equal(second.hasMore, false)
  assert.equal(new Set([...first.items, ...second.items].map((item) => item.slug)).size, 3)
  assert.equal(database.calls[0]?.bindings.at(-1), 3)
  assert.match(database.calls[0]?.sql ?? '', /ORDER BY v\.featured_rank IS NULL, v\.featured_rank, v\.published_at DESC, v\.slug ASC/)
  assert.match(database.calls[1]?.sql ?? '', /v\.featured_rank IS NULL\s+AND \(v\.published_at < \? OR \(v\.published_at = \? AND v\.slug > \?\)\)/)
})

test('non-null featured ranks advance into later ranks and unfeatured records', async () => {
  const database = new CursorFeedDatabase()
  const cursorEnv = { ...env(), VID_DB: database as unknown as VidEnv['VID_DB'] }
  const cursor = encodeCatalogCursor({
    v: VID_FEED_POLICY,
    f: catalogFingerprint({}),
    b: 0,
    r: 1,
    p: '2026-08-12T03:00:00.000Z',
    s: 'featured-a',
  })

  const response = await handleVidRequest(
    new Request(`https://vid.thongphan.com/api/videos?limit=2&cursor=${encodeURIComponent(cursor)}`),
    cursorEnv,
  )
  assert.equal(response.status, 200)
  const payload = await response.json() as { items: Array<{ slug: string }> }
  assert.deepEqual(payload.items.map((item) => item.slug), ['recent-b', 'recent-c'])
  assert.match(database.calls[0]?.sql ?? '', /v\.featured_rank IS NULL\s+OR v\.featured_rank > \?\s+OR \(v\.featured_rank = \? AND \(v\.published_at < \? OR \(v\.published_at = \? AND v\.slug > \?\)\)\)/)
  assert.deepEqual(database.calls[0]?.bindings.slice(-6), [1, 1, '2026-08-12T03:00:00.000Z', '2026-08-12T03:00:00.000Z', 'featured-a', 3])
})

test('rejects invalid cursor filters and limits before querying D1', async () => {
  const database = new CursorFeedDatabase()
  const cursorEnv = { ...env(), VID_DB: database as unknown as VidEnv['VID_DB'] }
  const first = await handleVidRequest(new Request('https://vid.thongphan.com/api/videos?limit=2&topic=ai'), cursorEnv)
  const firstPayload = await first.json() as { nextCursor: string }
  const mismatched = await handleVidRequest(
    new Request(`https://vid.thongphan.com/api/videos?limit=2&topic=content&cursor=${encodeURIComponent(firstPayload.nextCursor)}`),
    cursorEnv,
  )
  assert.equal(mismatched.status, 400)
  assert.deepEqual(await mismatched.json(), { error: 'invalid_cursor' })
  assert.equal(database.calls.length, 1)

  for (const value of ['0', '49', 'two']) {
    const invalid = await handleVidRequest(new Request(`https://vid.thongphan.com/api/videos?limit=${value}`), cursorEnv)
    assert.equal(invalid.status, 400)
  }

  for (const parameter of ['page=2', 'pageSize=12']) {
    const legacy = await handleVidRequest(new Request(`https://vid.thongphan.com/api/videos?${parameter}`), cursorEnv)
    assert.equal(legacy.status, 400)
    assert.deepEqual(await legacy.json(), { error: 'invalid_pagination' })
  }
})

test('rejects invalid cursor input and returns JSON 404 for unknown videos', async () => {
  const invalid = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/videos?cursor=not-a-valid-cursor'),
    env(),
  )
  assert.equal(invalid.status, 400)

  const missing = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/videos/khong-co'),
    env(),
  )
  assert.equal(missing.status, 404)
  assert.deepEqual(await missing.json(), { error: 'video_not_found' })
})

test('rejects proxy loops and non-HTTPS Pages origins', async () => {
  for (const origin of ['http://pages.example.com', 'https://vid.thongphan.com']) {
    const badEnv = { ...env(), PAGES_ORIGIN: origin }
    const response = await handleVidRequest(new Request('https://vid.thongphan.com/'), badEnv)
    assert.equal(response.status, 503)
  }
})

class AdminDatabase {
  readonly statements: string[] = []
  readonly seenNonces = new Set<string>()
  prepare(sql: string) {
    this.statements.push(sql)
    return {
      bind: (...values: unknown[]) => ({
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => {
          if (sql.includes('vid_admin_nonces')) {
            const nonce = String(values[0])
            if (this.seenNonces.has(nonce)) return { success: true, meta: { changes: 0 } }
            this.seenNonces.add(nonce)
          }
          return { success: true, meta: { changes: 1 } }
        },
      }),
    }
  }
  async batch(statements: unknown[]) { return statements.map(() => ({ success: true })) }
}

function signAdminBody(body: string) {
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = 'nonce-route-12345678'
  const idempotencyKey = 'upload-route-01'
  const canonical = [
    'POST',
    '/api/admin/uploads',
    String(timestamp),
    nonce,
    idempotencyKey,
    createHash('sha256').update(body).digest('hex'),
  ].join('\n')
  return {
    'Content-Type': 'application/json',
    'X-Vid-Timestamp': String(timestamp),
    'X-Vid-Nonce': nonce,
    'X-Vid-Idempotency-Key': idempotencyKey,
    'X-Vid-Signature': createHmac('sha256', 'unit-test-admin-secret-32-characters').update(canonical).digest('hex'),
  }
}

test('creates one authenticated Bunny upload without exposing provider secrets', async () => {
  const body = JSON.stringify({
    slug: 'tu-duy-ai',
    title: 'Tư duy AI',
    description: 'Mô tả',
    sourceTitle: 'Original',
    sourceCreator: 'Creator',
    sourceCreatorUrl: 'https://example.com/creator',
    sourceVideoUrl: 'https://example.com/video',
    translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
    rightsStatus: 'owner-reviewed',
    rightsNote: 'Owner reviewed',
    topics: ['ai'],
    tags: ['tư duy'],
    playlists: [],
  })
  const database = new AdminDatabase()
  const adminEnv = {
    ...env(),
    VID_DB: database as unknown as VidEnv['VID_DB'],
    VID_ADMIN_HMAC_SECRET: 'unit-test-admin-secret-32-characters',
    BUNNY_STREAM_API_KEY: 'bunny-secret',
  }
  const fetcher = async () => Response.json({ guid: 'bunny-guid' })
  const response = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/admin/uploads', {
      method: 'POST',
      headers: signAdminBody(body),
      body,
    }),
    adminEnv,
    { fetch: fetcher },
  )
  assert.equal(response.status, 201)
  const payload = await response.json() as Record<string, unknown>
  assert.equal(payload.videoId, 'bunny-guid')
  assert.equal(JSON.stringify(payload).includes('bunny-secret'), false)
  assert.equal(database.statements.some((sql) => sql.includes('INSERT INTO vid_videos')), true)
})

test('accepts only signed Bunny webhook bodies', async () => {
  const rawBody = JSON.stringify({ VideoLibraryId: 123, VideoGuid: 'bunny-guid', Status: 3 })
  const webhookEnv = {
    ...env(),
    VID_DB: new AdminDatabase() as unknown as VidEnv['VID_DB'],
    BUNNY_STREAM_API_KEY: 'bunny-api-key',
    BUNNY_WEBHOOK_SECRET: 'bunny-read-key',
  }
  const signature = createHmac('sha256', 'bunny-read-key').update(rawBody).digest('hex')
  let bunnyStatusRequests = 0
  const fetcher = async () => {
    bunnyStatusRequests += 1
    return Response.json({ length: 600, thumbnailFileName: 'thumbnail.jpg' })
  }
  const response = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/webhooks/bunny', {
      method: 'POST',
      headers: {
        'X-BunnyStream-Signature-Version': 'v1',
        'X-BunnyStream-Signature-Algorithm': 'hmac-sha256',
        'X-BunnyStream-Signature': signature,
      },
      body: rawBody,
    }),
    webhookEnv,
    { fetch: fetcher },
  )
  assert.equal(response.status, 204)
  assert.equal(bunnyStatusRequests, 1)

  const rejected = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/webhooks/bunny', { method: 'POST', body: rawBody }),
    webhookEnv,
  )
  assert.equal(rejected.status, 401)
})
