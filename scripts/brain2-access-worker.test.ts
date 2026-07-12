import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import type { Brain2LessonMeta, Brain2LessonPackage } from '../lib/brain2/lesson-contract'
import { brain2LessonContentSha256 } from '../lib/brain2/lesson-validation'
import { formatAccessCodeHash } from '../workers/brain2-access/auth'
import { signSessionValue } from '../workers/brain2-access/cookie'
import { PROTECTED_CONTENT_INDEX } from '../workers/brain2-access/content'
import { createBrain2AccessWorker } from '../workers/brain2-access/index'
import type {
  Brain2AccessEnv,
  D1DatabaseLike,
  D1PreparedStatementLike,
  KVNamespaceLike,
  ProtectedContentDescriptor,
} from '../workers/brain2-access/types'

const ORIGIN = 'https://thongphan.com'
const ACCESS_URL = `${ORIGIN}/brain2/21-ngay/api/access`
const LESSONS_URL = `${ORIGIN}/brain2/21-ngay/api/lessons`
const NOW_SECONDS = 1_752_316_800
const ACCESS_CODE = 'task6-test-code-with-public-fixture-only'
const SESSION_SECRET = 'task6-session-secret-that-is-at-least-thirty-two-bytes'
const PRIVATE_HEADER_EXPECTATIONS = {
  'cache-control': 'private, no-store, max-age=0',
  pragma: 'no-cache',
  vary: 'Cookie',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
} as const

type FailureRow = { id: number; clientKey: string; failedAt: number }

class MockStatement implements D1PreparedStatementLike {
  private values: unknown[] = []

  constructor(private readonly db: MockD1, private readonly query: string) {}

  bind(...values: unknown[]) {
    this.values = values
    return this
  }

  async first<T>() {
    if (this.db.fail) throw new Error('synthetic D1 failure')
    if (/DELETE FROM brain2_access_failures/i.test(this.query)) {
      if (this.db.failRelease) throw new Error('synthetic D1 release failure')
      const [reservationId, clientKey] = this.values as [number, string]
      const row = this.db.failures.find(
        (candidate) => candidate.id === reservationId && candidate.clientKey === clientKey,
      )
      if (!row) return null
      this.db.failures = this.db.failures.filter((candidate) => candidate !== row)
      return { released_id: reservationId } as T
    }
    if (/INSERT INTO brain2_access_failures/i.test(this.query)) {
      const [clientKey, failedAt, repeatedClientKey, cutoff, limit] = this.values as [string, number, string, number, number]
      assert.equal(repeatedClientKey, clientKey)
      const recentFailures = this.db.failures.filter(
        (row) => row.clientKey === clientKey && row.failedAt >= cutoff,
      ).length
      if (recentFailures >= limit) return null
      const id = this.db.nextId
      this.db.nextId += 1
      this.db.failures.push({ id, clientKey, failedAt })
      return { reservation_id: id } as T
    }
    if (/COUNT\(\*\)[\s\S]*brain2_access_failures/i.test(this.query)) {
      const [clientKey, cutoff] = this.values as [string, number]
      const failure_count = this.db.failures.filter(
        (row) => row.clientKey === clientKey && row.failedAt >= cutoff,
      ).length
      return { failure_count } as T
    }
    throw new Error(`Unexpected first query: ${this.query}`)
  }

  async run() {
    if (this.db.fail) throw new Error('synthetic D1 failure')
    throw new Error(`Unexpected run query: ${this.query}`)
  }
}

class MockD1 implements D1DatabaseLike {
  failures: FailureRow[] = []
  fail = false
  failRelease = false
  nextId = 1

  prepare(query: string) {
    return new MockStatement(this, query)
  }
}

class MockKV implements KVNamespaceLike {
  values = new Map<string, string>()
  fail = false

  async get(key: string) {
    if (this.fail) throw new Error('synthetic KV failure')
    return this.values.get(key) ?? null
  }
}

function protectedMeta(day: 8 | 21, checksum: string): Brain2LessonMeta {
  return {
    schemaVersion: 1,
    day,
    slug: `ngay-${String(day).padStart(2, '0')}`,
    week: day === 8 ? 2 : 3,
    access: 'conan-maker',
    title: day === 8 ? 'Bài kiểm thử ngày 08' : 'Bài kiểm thử ngày 21',
    promise: 'Đây là metadata kiểm thử công khai, không phải nội dung bài bảo vệ.',
    objective: 'Xác minh Worker chỉ trả gói đã ký đúng contract.',
    estimatedMinutes: { min: 20, max: 30 },
    preview: 'Preview kiểm thử công khai.',
    sourceFragmentSha256: 'a'.repeat(64),
    contentSha256: checksum,
    migratedAt: '2026-07-12T00:00:00.000Z',
    editorialState: 'reviewed',
  }
}

async function syntheticLesson(day: 8 | 21) {
  const body = {
    reason: 'SYNTHETIC_CANARY public test fixture.',
    blocks: [{
      id: `ngay-${day}-block-01`,
      kind: 'prose' as const,
      children: [{ type: 'text' as const, value: 'Nội dung kiểm thử công khai.' }],
    }],
    deliverable: {
      title: 'Đầu ra kiểm thử',
      body: [{ type: 'text' as const, value: 'Một đầu ra giả lập.' }],
    },
    checklist: [{ id: `ngay-${day}-check-01`, label: 'Đã kiểm thử.' }],
  }
  const checksum = await brain2LessonContentSha256(body as Brain2LessonPackage)
  assert.ok(checksum)
  const meta = protectedMeta(day, checksum)
  return { meta, lesson: { meta, ...body } satisfies Brain2LessonPackage }
}

async function fixture() {
  const day08 = await syntheticLesson(8)
  const day21 = await syntheticLesson(21)
  const contentIndex: Record<string, ProtectedContentDescriptor> = {
    'ngay-08': {
      slug: 'ngay-08',
      key: 'brain2:21:test:day:08',
      contentSha256: day08.meta.contentSha256,
      meta: day08.meta,
      maxBytes: 64 * 1024,
    },
    'ngay-21': {
      slug: 'ngay-21',
      key: 'brain2:21:test:day:21',
      contentSha256: day21.meta.contentSha256,
      meta: day21.meta,
      maxBytes: 64 * 1024,
    },
  }
  const DB = new MockD1()
  const BRAIN2_CONTENT = new MockKV()
  BRAIN2_CONTENT.values.set(contentIndex['ngay-08'].key, JSON.stringify(day08.lesson))
  BRAIN2_CONTENT.values.set(contentIndex['ngay-21'].key, JSON.stringify(day21.lesson))
  const env: Brain2AccessEnv = {
    DB,
    BRAIN2_CONTENT,
    BRAIN2_ACCESS_CODE_HASH: await formatAccessCodeHash(ACCESS_CODE),
    BRAIN2_SESSION_SECRET: SESSION_SECRET,
  }
  const worker = createBrain2AccessWorker({ contentIndex, now: () => NOW_SECONDS })
  return { worker, env, DB, BRAIN2_CONTENT, day08, day21, contentIndex }
}

function accessRequest(
  method: string,
  options: { body?: unknown; cookie?: string; origin?: string | null; contentType?: string; url?: string } = {},
) {
  const headers = new Headers({ Accept: 'application/json', 'CF-Connecting-IP': '203.0.113.9' })
  if (options.origin !== null) headers.set('Origin', options.origin ?? ORIGIN)
  if (options.cookie) headers.set('Cookie', options.cookie)
  if (options.body !== undefined) headers.set('Content-Type', options.contentType ?? 'application/json')
  return new Request(options.url ?? ACCESS_URL, {
    method,
    headers,
    ...(options.body !== undefined ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {}),
  })
}

function lessonRequest(slug: string, cookie?: string, method = 'GET') {
  return new Request(`${LESSONS_URL}/${slug}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
  })
}

function cookieFrom(response: Response) {
  const header = response.headers.get('set-cookie')
  assert.ok(header, 'expected Set-Cookie')
  return header.split(';', 1)[0]
}

async function grant(f: Awaited<ReturnType<typeof fixture>>) {
  const response = await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE } }), f.env)
  assert.equal(response.status, 204)
  return cookieFrom(response)
}

function assertPrivateHeaders(response: Response) {
  for (const [name, expected] of Object.entries(PRIVATE_HEADER_EXPECTATIONS)) {
    assert.equal(response.headers.get(name), expected, `header ${name}`)
  }
  assert.equal(response.headers.get('x-tp-router'), null)
}

test('access hash, secret, method, origin and body boundaries fail closed', async (t) => {
  const f = await fixture()

  await t.test('correct code grants only a signed secure cookie', async () => {
    const response = await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE } }), f.env)
    assert.equal(response.status, 204)
    assert.equal(f.DB.failures.length, 0)
    assertPrivateHeaders(response)
    const cookie = response.headers.get('set-cookie') ?? ''
    assert.match(cookie, /^__Secure-tp_b2_session=/)
    assert.match(cookie, /HttpOnly/)
    assert.match(cookie, /Secure/)
    assert.match(cookie, /SameSite=Lax/)
    assert.match(cookie, /Path=\/brain2\/21-ngay/)
    assert.match(cookie, /Max-Age=2592000/)
    assert.doesNotMatch(cookie, new RegExp(ACCESS_CODE))
  })

  await t.test('incorrect and malformed hashes do not grant', async () => {
    const wrong = await f.worker.fetch(accessRequest('POST', { body: { code: 'wrong' } }), f.env)
    assert.equal(wrong.status, 401)
    assert.doesNotMatch(await wrong.text(), /SYNTHETIC_CANARY|reason|blocks/)
    for (const hash of ['sha256:short', 'md5:abc', 'sha256:********************************']) {
      const response = await f.worker.fetch(
        accessRequest('POST', { body: { code: ACCESS_CODE } }),
        { ...f.env, BRAIN2_ACCESS_CODE_HASH: hash },
      )
      assert.equal(response.status, 503)
    }
  })

  await t.test('missing secrets fail closed', async () => {
    for (const key of ['BRAIN2_ACCESS_CODE_HASH', 'BRAIN2_SESSION_SECRET'] as const) {
      const env = { ...f.env, [key]: '' }
      const response = await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE } }), env)
      assert.equal(response.status, 503)
    }
  })

  await t.test('wrong methods, origins, content types and oversized bodies are rejected', async () => {
    assert.equal((await f.worker.fetch(accessRequest('PUT'), f.env)).status, 405)
    assert.equal((await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE }, origin: 'https://evil.example' }), f.env)).status, 403)
    assert.equal((await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE }, origin: null }), f.env)).status, 403)
    assert.equal((await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE }, contentType: 'text/plain' }), f.env)).status, 415)
    assert.equal((await f.worker.fetch(accessRequest('POST', { body: { code: 'x'.repeat(1100) } }), f.env)).status, 413)

    const chunkedBody = new Request(ACCESS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        'CF-Connecting-IP': '203.0.113.9',
      },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"code":"'))
          controller.enqueue(new Uint8Array(1100).fill(120))
          controller.enqueue(new TextEncoder().encode('"}'))
          controller.close()
        },
      }),
      // Node's Request implementation requires this for streaming request bodies.
      duplex: 'half',
    } as RequestInit & { duplex: 'half' })
    Object.defineProperty(chunkedBody, 'text', {
      value: async () => { throw new Error('must not buffer an unbounded request body') },
    })
    assert.equal((await f.worker.fetch(chunkedBody, f.env)).status, 413)

    const brokenBody = new Request(ACCESS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        'CF-Connecting-IP': '203.0.113.9',
      },
      body: new ReadableStream({
        start(controller) {
          controller.error(new Error('synthetic request stream failure'))
        },
      }),
      duplex: 'half',
    } as RequestInit & { duplex: 'half' })
    const brokenBodyResponse = await f.worker.fetch(brokenBody, f.env)
    assert.equal(brokenBodyResponse.status, 503)
    assertPrivateHeaders(brokenBodyResponse)
    assert.equal((await f.worker.fetch(accessRequest('POST', { body: { code: ACCESS_CODE, email: 'x@example.com' } }), f.env)).status, 400)
  })
})

test('five failed attempts rate-limit without storing a raw IP and D1 failure returns 503', async () => {
  const f = await fixture()
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await f.worker.fetch(accessRequest('POST', { body: { code: 'wrong' } }), f.env)
    assert.equal(response.status, 401, `attempt ${attempt}`)
  }
  const limited = await f.worker.fetch(accessRequest('POST', { body: { code: 'wrong' } }), f.env)
  assert.equal(limited.status, 429)
  assert.equal(f.DB.failures.length, 5)
  assert.ok(f.DB.failures.every((row) => !row.clientKey.includes('203.0.113.9')))
  assert.ok(f.DB.failures.every((row) => /^[A-Za-z0-9_-]{22}$/.test(row.clientKey)))

  const broken = await fixture()
  broken.DB.fail = true
  const unavailable = await broken.worker.fetch(accessRequest('POST', { body: { code: 'wrong' } }), broken.env)
  assert.equal(unavailable.status, 503)
  assert.doesNotMatch(await unavailable.text(), /SYNTHETIC_CANARY|reason|blocks/)

  const releaseBroken = await fixture()
  releaseBroken.DB.failRelease = true
  const noCookie = await releaseBroken.worker.fetch(
    accessRequest('POST', { body: { code: ACCESS_CODE } }),
    releaseBroken.env,
  )
  assert.equal(noCookie.status, 503)
  assert.equal(noCookie.headers.get('set-cookie'), null)
  assert.equal(releaseBroken.DB.failures.length, 1)
})

test('parallel invalid submissions cannot race past the five-failure limit', async () => {
  const f = await fixture()
  const responses = await Promise.all(
    Array.from({ length: 12 }, () => f.worker.fetch(
      accessRequest('POST', { body: { code: 'wrong-in-parallel' } }),
      f.env,
    )),
  )
  assert.equal(responses.filter((response) => response.status === 401).length, 5)
  assert.equal(responses.filter((response) => response.status === 429).length, 7)
  assert.equal(f.DB.failures.length, 5)
})

test('a valid candidate queued behind parallel failures is not evaluated after the limit is reserved', async () => {
  const f = await fixture()
  const candidates = [
    ...Array.from({ length: 19 }, () => 'wrong-in-parallel'),
    ACCESS_CODE,
  ]
  const responses = await Promise.all(candidates.map((code) => f.worker.fetch(
    accessRequest('POST', { body: { code } }),
    f.env,
  )))
  assert.equal(responses.at(-1)?.status, 429)
  assert.equal(responses.filter((response) => response.status === 204).length, 0)
  assert.equal(responses.filter((response) => response.status === 401).length, 5)
  assert.equal(responses.filter((response) => response.status === 429).length, 15)
  assert.equal(f.DB.failures.length, 5)
})

test('session cookies reject expiry, audience and tampering and rotate with the access hash', async () => {
  const f = await fixture()
  const validCookie = await grant(f)
  assert.equal((await f.worker.fetch(accessRequest('GET', { cookie: validCookie, origin: null }), f.env)).status, 200)

  const parts = validCookie.split('=')[1].split('.')
  const tamperedCookie = `__Secure-tp_b2_session=${parts[0]}.${parts[1].slice(0, -1)}x`
  assert.equal((await f.worker.fetch(accessRequest('GET', { cookie: tamperedCookie, origin: null }), f.env)).status, 401)

  const expired = await signSessionValue({
    payload: { v: 1, aud: 'brain2-21', iat: NOW_SECONDS - 200, exp: NOW_SECONDS - 1 },
    sessionSecret: SESSION_SECRET,
    accessCodeHash: f.env.BRAIN2_ACCESS_CODE_HASH,
  })
  assert.equal((await f.worker.fetch(accessRequest('GET', { cookie: `__Secure-tp_b2_session=${expired}`, origin: null }), f.env)).status, 401)

  const wrongAudience = await signSessionValue({
    payload: { v: 1, aud: 'wrong-audience', iat: NOW_SECONDS, exp: NOW_SECONDS + 60 },
    sessionSecret: SESSION_SECRET,
    accessCodeHash: f.env.BRAIN2_ACCESS_CODE_HASH,
  })
  assert.equal((await f.worker.fetch(accessRequest('GET', { cookie: `__Secure-tp_b2_session=${wrongAudience}`, origin: null }), f.env)).status, 401)

  const rotatedEnv = { ...f.env, BRAIN2_ACCESS_CODE_HASH: await formatAccessCodeHash('rotated-code') }
  assert.equal((await f.worker.fetch(accessRequest('GET', { cookie: validCookie, origin: null }), rotatedEnv)).status, 401)

  const cleared = await f.worker.fetch(accessRequest('DELETE', { cookie: validCookie }), f.env)
  assert.equal(cleared.status, 204)
  assert.match(cleared.headers.get('set-cookie') ?? '', /Max-Age=0/)
})

test('protected lesson routing and KV validation expose only authorized canonical packages', async () => {
  const f = await fixture()
  const cookie = await grant(f)

  for (const slug of ['ngay-07', 'ngay-22', '..', '%2e%2e', 'ngay-08/extra']) {
    const response = await f.worker.fetch(lessonRequest(slug, cookie), f.env)
    assert.equal(response.status, 404, slug)
    assertPrivateHeaders(response)
  }
  assert.equal((await f.worker.fetch(lessonRequest('ngay-08', cookie, 'POST'), f.env)).status, 405)
  assert.equal((await f.worker.fetch(lessonRequest('ngay-08'), f.env)).status, 401)

  for (const [slug, expected] of [['ngay-08', f.day08.lesson], ['ngay-21', f.day21.lesson]] as const) {
    const response = await f.worker.fetch(lessonRequest(slug, cookie), f.env)
    assert.equal(response.status, 200)
    assertPrivateHeaders(response)
    assert.deepEqual(await response.json(), expected)
  }

  f.BRAIN2_CONTENT.values.delete(f.contentIndex['ngay-08'].key)
  const missing = await f.worker.fetch(lessonRequest('ngay-08', cookie), f.env)
  assert.equal(missing.status, 503)
  assert.doesNotMatch(await missing.text(), /SYNTHETIC_CANARY|reason|blocks/)

  f.BRAIN2_CONTENT.values.set(f.contentIndex['ngay-08'].key, JSON.stringify({ ...f.day08.lesson, reason: 'tampered' }))
  const tampered = await f.worker.fetch(lessonRequest('ngay-08', cookie), f.env)
  assert.equal(tampered.status, 503)
  assert.doesNotMatch(await tampered.text(), /tampered|reason|blocks/)

  f.BRAIN2_CONTENT.fail = true
  const failed = await f.worker.fetch(lessonRequest('ngay-21', cookie), f.env)
  assert.equal(failed.status, 503)
})

test('protected packages fail closed before parsing when they exceed the descriptor size ceiling', async () => {
  const f = await fixture()
  const cookie = await grant(f)
  const contentIndex = {
    ...f.contentIndex,
    'ngay-08': { ...f.contentIndex['ngay-08'], maxBytes: 10 },
  }
  const worker = createBrain2AccessWorker({ contentIndex, now: () => NOW_SECONDS })
  const response = await worker.fetch(lessonRequest('ngay-08', cookie), f.env)
  assert.equal(response.status, 503)
  assert.doesNotMatch(await response.text(), /SYNTHETIC_CANARY|reason|blocks/)
})

test('tracked Worker config and migration preserve isolated production boundaries', () => {
  const root = new URL('../', import.meta.url)
  const config = readFileSync(new URL('wrangler.brain2-access.jsonc', root), 'utf8')
  const migration = readFileSync(new URL('workers/migrations/0002_brain2_access_and_email_campaign.sql', root), 'utf8')
  const packageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))

  assert.match(config, /"name"\s*:\s*"thongphan-brain2-access-api"/)
  assert.match(config, /"workers_dev"\s*:\s*false/)
  assert.match(config, /"preview_urls"\s*:\s*false/)
  assert.match(config, /thongphan\.com\/brain2\/21-ngay\/api\/\*/)
  assert.match(config, /www\.thongphan\.com\/brain2\/21-ngay\/api\/\*/)
  assert.match(config, /"binding"\s*:\s*"BRAIN2_CONTENT"/)
  assert.doesNotMatch(config, /"binding"\s*:\s*"KV"/)
  assert.match(config, /"migrations_dir"\s*:\s*"workers\/migrations"/)

  assert.match(migration, /CREATE TABLE IF NOT EXISTS brain2_access_failures[\s\S]*STRICT/i)
  assert.match(migration, /CREATE INDEX IF NOT EXISTS[\s\S]*client_key[\s\S]*failed_at/i)
  assert.match(migration, /campaign_version[\s\S]*legacy-v0/i)
  assert.match(migration, /attempt_count/i)
  assert.match(migration, /last_attempt_at/i)
  assert.match(migration, /UPDATE challenges[\s\S]*brain2-21-ngay/i)
  assert.doesNotMatch(migration, /15 phút/i)
  assert.match(packageJson.devDependencies.wrangler, /^4\.\d+\.\d+$/)
})

test('production content index contains only the 14 immutable public-manifest descriptors', () => {
  const entries = Object.values(PROTECTED_CONTENT_INDEX)
  assert.equal(entries.length, 14)
  assert.deepEqual(entries.map((entry) => entry.slug), Array.from({ length: 14 }, (_, index) => `ngay-${String(index + 8).padStart(2, '0')}`))
  assert.ok(entries.every((entry) => entry.key.startsWith('brain2:21:2026-07-12.1:day:')))
  assert.ok(entries.every((entry) => entry.meta.access === 'conan-maker'))
  assert.ok(entries.every((entry) => entry.meta.contentSha256 === entry.contentSha256))
  assert.doesNotMatch(JSON.stringify(entries), /"reason"|"blocks"|"deliverable"|"checklist"/)

  const root = new URL('../', import.meta.url)
  for (const file of ['auth.ts', 'cookie.ts', 'rate-limit.ts', 'content.ts', 'http.ts', 'index.ts']) {
    const source = readFileSync(new URL(`workers/brain2-access/${file}`, root), 'utf8')
    assert.doesNotMatch(source, /console\.|request\.headers\.entries|BRAIN2_ACCESS_CODE_HASH\s*=|203\.0\.113\.9/)
  }
})
