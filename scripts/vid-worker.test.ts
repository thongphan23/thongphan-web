import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import test from 'node:test'
import { handleVidRequest } from '../workers/vid/index'
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

function env(rows: Record<string, unknown>[] = []): VidEnv {
  return {
    VID_DB: new FakeDatabase(rows) as unknown as D1Database,
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
    ['/', '/vid/index.html'],
    ['/watch?v=tu-duy-ai', '/vid/watch.html?v=tu-duy-ai'],
    ['/results?search_query=ai', '/vid/results.html?search_query=ai'],
    ['/topic?slug=ai', '/vid/topic.html?slug=ai'],
    ['/playlist?list=foundation', '/vid/playlist.html?list=foundation'],
    ['/library', '/vid/library.html'],
    ['/_next/static/app.js', '/_next/static/app.js'],
  ] as const) {
    const response = await handleVidRequest(new Request(`https://vid.thongphan.com${path}`), env(), { fetch: fetcher })
    assert.equal(response.status, 200)
    assert.equal(seen.at(-1), expected)
  }
})

test('public API returns only exact published ready DTOs with bounded caching', async () => {
  const draft = { ...publishedRow, slug: 'draft', status: 'draft' }
  const response = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/videos?page=1&pageSize=12'),
    env([publishedRow, draft]),
  )
  assert.equal(response.status, 200)
  assert.match(response.headers.get('cache-control') ?? '', /max-age=60/)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://vid.thongphan.com')
  const body = await response.json() as { items: Array<{ slug: string }> }
  assert.deepEqual(body.items.map(({ slug }) => slug), ['tu-duy-ai'])
})

test('rejects invalid pagination and returns JSON 404 for unknown videos', async () => {
  const invalid = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/videos?pageSize=49'),
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
    VID_DB: database as unknown as D1Database,
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
    VID_DB: new AdminDatabase() as unknown as D1Database,
    BUNNY_WEBHOOK_SECRET: 'bunny-read-key',
  }
  const signature = createHmac('sha256', 'bunny-read-key').update(rawBody).digest('hex')
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
  )
  assert.equal(response.status, 204)

  const rejected = await handleVidRequest(
    new Request('https://vid.thongphan.com/api/webhooks/bunny', { method: 'POST', body: rawBody }),
    webhookEnv,
  )
  assert.equal(rejected.status, 401)
})
