import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import { createRequire } from 'node:module'
import type { SQLInputValue } from 'node:sqlite'
import test from 'node:test'
import vidWorker, { handleVidRequest } from '../workers/vid/index'
import { listPublicVideoFeed, publishAdminVideo } from '../workers/vid/catalog'
import type { VidEnv } from '../workers/vid/types'

const originalEmitWarning = process.emitWarning
process.emitWarning = (() => undefined) as typeof process.emitWarning
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite')
process.emitWarning = originalEmitWarning

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

class SqliteD1Database {
  readonly database = new DatabaseSync(':memory:')

  constructor() {
    this.database.exec(`
      CREATE TABLE vid_videos (
        id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, bunny_video_id TEXT NOT NULL UNIQUE,
        idempotency_key TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT NOT NULL,
        source_title TEXT NOT NULL, source_creator TEXT NOT NULL, source_creator_url TEXT NOT NULL,
        source_video_url TEXT NOT NULL, translation_label TEXT NOT NULL, rights_status TEXT NOT NULL,
        rights_note TEXT NOT NULL, tags_json TEXT NOT NULL, search_text TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL, thumbnail_url TEXT NOT NULL, preview_url TEXT NOT NULL,
        player_url TEXT NOT NULL, status TEXT NOT NULL, media_status TEXT NOT NULL,
        featured_rank INTEGER, thumbnail_focal_x INTEGER NOT NULL, thumbnail_focal_y INTEGER NOT NULL,
        published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE vid_video_topics (video_id TEXT NOT NULL, topic_slug TEXT NOT NULL);
      CREATE TABLE vid_playlist_videos (video_id TEXT NOT NULL, playlist_slug TEXT NOT NULL);
    `)
  }

  insert(slug: string, featuredRank: number | null, publishedAt: string, overrides: Record<string, unknown> = {}) {
    const row = { ...publishedRow, ...overrides, id: `id-${slug}`, slug, bunny_video_id: `bunny-${slug}`, idempotency_key: `idem-${slug}`, featured_rank: featuredRank, published_at: publishedAt }
    this.database.prepare(`
      INSERT INTO vid_videos (
        id, slug, bunny_video_id, idempotency_key, title, description, source_title,
        source_creator, source_creator_url, source_video_url, translation_label,
        rights_status, rights_note, tags_json, search_text, duration_seconds,
        thumbnail_url, preview_url, player_url, status, media_status, featured_rank,
        thumbnail_focal_x, thumbnail_focal_y, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 50, 24, ?, ?, ?)
    `).run(
      row.id, row.slug, row.bunny_video_id, row.idempotency_key, row.title, row.description,
      row.source_title, row.source_creator, row.source_creator_url, row.source_video_url,
      row.translation_label, row.rights_status, row.rights_note, row.tags_json, 'search',
      row.duration_seconds, row.thumbnail_url, row.preview_url, row.player_url, row.status,
      row.media_status, row.featured_rank, row.published_at, row.created_at, row.updated_at,
    )
  }

  prepare(sql: string) {
    const statement = this.database.prepare(sql)
    return {
      bind: (...values: unknown[]) => ({
        all: async () => ({ results: statement.all(...values as SQLInputValue[]) as Record<string, unknown>[] }),
        first: async () => statement.get(...values as SQLInputValue[]) as Record<string, unknown> | undefined,
        run: async () => statement.run(...values as SQLInputValue[]),
      }),
    }
  }

  async batch(statements: Array<{ run: () => Promise<unknown> }>) {
    return Promise.all(statements.map(async (statement) => {
      const result = await statement.run() as { changes: number | bigint }
      return { success: true, meta: { changes: Number(result.changes) } }
    }))
  }
}

function sqliteEnv(database: SqliteD1Database): VidEnv {
  return { ...env(), VID_DB: database as unknown as VidEnv['VID_DB'] }
}

function env(rows: Record<string, unknown>[] = []): VidEnv {
  return {
    VID_DB: new FakeDatabase(rows) as unknown as VidEnv['VID_DB'],
    PAGES_ORIGIN: 'https://pages.example.com',
    BUNNY_LIBRARY_ID: '123',
    BUNNY_CDN_HOST: 'media.example.com',
  }
}

test('publishing a replacement archives every older public record for the same source', async () => {
  const database = new SqliteD1Database()
  database.insert('old-copy', null, '2026-08-12T00:00:00.000Z')
  database.insert('new-copy', null, '2026-08-13T00:00:00.000Z', {
    status: 'ready',
    published_at: null,
  })

  assert.equal(await publishAdminVideo(sqliteEnv(database), 'id-new-copy'), true)
  const rows = database.database.prepare(
    'SELECT slug, status FROM vid_videos ORDER BY slug',
  ).all().map((row) => ({ slug: String(row.slug), status: String(row.status) }))
  assert.deepEqual(rows, [
    { slug: 'new-copy', status: 'published' },
    { slug: 'old-copy', status: 'archived' },
  ])
})

test('a failed replacement promotion never archives the valid public video', async () => {
  const database = new SqliteD1Database()
  database.insert('old-copy', null, '2026-08-12T00:00:00.000Z')
  database.insert('broken-copy', null, '2026-08-13T00:00:00.000Z', {
    status: 'ready',
    media_status: 'failed',
    published_at: null,
  })

  assert.equal(await publishAdminVideo(sqliteEnv(database), 'id-broken-copy'), false)
  const old = database.database.prepare(
    "SELECT status FROM vid_videos WHERE slug = 'old-copy'",
  ).get() as { status: string }
  assert.equal(old.status, 'published')
})

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
})

test('SQLite keyset preserves exact ranked and unranked order across insertions', async () => {
  const database = new SqliteD1Database()
  database.insert('ranked-a', 1, '2026-08-12T04:00:00.000Z')
  database.insert('ranked-b', 1, '2026-08-12T04:00:00.000Z')
  database.insert('ranked-c', 1, '2026-08-12T03:00:00.000Z')
  database.insert('ranked-d', 2, '2026-08-12T05:00:00.000Z')
  database.insert('unranked-a', null, '2026-08-12T05:00:00.000Z')
  database.insert('unranked-b', null, '2026-08-12T05:00:00.000Z')
  database.insert('unranked-c', null, '2026-08-12T04:00:00.000Z')

  const first = await listPublicVideoFeed(sqliteEnv(database), { limit: 3 })
  assert.deepEqual(first.items.map(({ slug }) => slug), ['ranked-a', 'ranked-b', 'ranked-c'])
  assert.equal(first.hasMore, true)

  database.insert('ranked-before', 1, '2026-08-12T06:00:00.000Z')
  database.insert('ranked-after', 1, '2026-08-12T02:00:00.000Z')
  const second = await listPublicVideoFeed(sqliteEnv(database), { limit: 3, cursor: first.nextCursor! })
  const third = await listPublicVideoFeed(sqliteEnv(database), { limit: 3, cursor: second.nextCursor! })
  const slugs = [...first.items, ...second.items, ...third.items].map(({ slug }) => slug)

  assert.deepEqual(second.items.map(({ slug }) => slug), ['ranked-after', 'ranked-d', 'unranked-a'])
  assert.deepEqual(third.items.map(({ slug }) => slug), ['unranked-b', 'unranked-c'])
  assert.equal(third.hasMore, false)
  assert.equal(third.nextCursor, null)
  assert.equal(new Set(slugs).size, slugs.length)
  assert.equal(slugs.includes('ranked-before'), false)
})

test('bounded feed scan reaches valid rows after malformed public candidates', async () => {
  const database = new SqliteD1Database()
  for (let index = 1; index <= 48; index += 1) {
    database.insert(`invalid-${String(index).padStart(2, '0')}`, index, '2026-08-12T04:00:00.000Z', { thumbnail_url: '' })
  }
  database.insert('valid-49', 49, '2026-08-12T04:00:00.000Z')
  database.insert('valid-50', 50, '2026-08-12T04:00:00.000Z')

  const first = await listPublicVideoFeed(sqliteEnv(database), { limit: 1 })
  const second = await listPublicVideoFeed(sqliteEnv(database), { limit: 1, cursor: first.nextCursor! })

  assert.deepEqual(first.items.map(({ slug }) => slug), ['valid-49'])
  assert.equal(first.hasMore, true)
  assert.ok(first.nextCursor)
  assert.deepEqual(second.items.map(({ slug }) => slug), ['valid-50'])
  assert.equal(second.hasMore, false)
  assert.equal(second.nextCursor, null)
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
  readonly calls: Array<{ sql: string; values: unknown[] }> = []
  readonly seenNonces = new Set<string>()
  prepare(sql: string) {
    this.statements.push(sql)
    return {
      bind: (...values: unknown[]) => {
        this.calls.push({ sql, values })
        return {
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
        }
      },
    }
  }
  async batch(statements: unknown[]) {
    return statements.map(() => ({ success: true, meta: { changes: 1 } }))
  }
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
    thumbnailUrl: 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg',
    thumbnailFocalX: 17,
    thumbnailFocalY: 83,
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
  const draftInsert = database.calls.find(({ sql }) => sql.includes('INSERT INTO vid_videos'))
  assert.equal(draftInsert?.values[15], 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg')
  assert.equal(draftInsert?.values[16], 17)
  assert.equal(draftInsert?.values[17], 83)
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
