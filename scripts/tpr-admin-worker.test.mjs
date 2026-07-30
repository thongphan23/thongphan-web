import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const TEST_ACCESS_CODE = 'test-access-code'

function kv() {
  const data = new Map()
  return {
    async get(key) {
      return data.get(key) ?? null
    },
    async put(key, value) {
      data.set(key, value)
    },
    keys() {
      return [...data.keys()]
    },
  }
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function setup() {
  const { createTprAdminWorker } = await import('../workers/tpr-admin.mjs')
  const store = kv()
  await store.put('snapshot:current', JSON.stringify({ schema_version: '1.0.0', summary: { run_count: 3 } }))
  const env = {
    TPR_ACCESS_CODE_HASH: await sha256Hex(TEST_ACCESS_CODE),
    TPR_SESSION_SECRET: 'test-session-secret-with-more-than-32-bytes',
    TPR_ADMIN_DATA: store,
  }
  let proxyCount = 0
  const worker = createTprAdminWorker({
    fetchImpl: async () => {
      proxyCount += 1
      return new Response('<main>TPR shell</main>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    },
    now: () => 1_800_000_000_000,
  })
  return { worker, env, store, proxyCount: () => proxyCount }
}

test('unauthorized TPR page returns the login boundary without touching Pages', async () => {
  const { worker, env, proxyCount } = await setup()

  const response = await worker.fetch(new Request('https://thongphan.com/tpr'), env)
  const body = await response.text()

  assert.equal(response.status, 401)
  assert.match(body, /Mã truy cập/)
  assert.equal(proxyCount(), 0)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive')
})

test('correct code creates a signed strict cookie and unlocks snapshot plus shell', async () => {
  const { worker, env, proxyCount } = await setup()
  const login = await worker.fetch(
    new Request('https://thongphan.com/tpr/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://thongphan.com' },
      body: JSON.stringify({ code: TEST_ACCESS_CODE }),
    }),
    env,
  )

  assert.equal(login.status, 204)
  const cookie = login.headers.get('set-cookie')
  assert.match(cookie, /^tpr_session=/)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /SameSite=Strict/)
  assert.match(cookie, /Path=\/tpr/)

  const sessionCookie = cookie.split(';', 1)[0]
  const snapshot = await worker.fetch(
    new Request('https://thongphan.com/tpr/api/snapshot', {
      headers: { Cookie: sessionCookie },
    }),
    env,
  )
  assert.equal(snapshot.status, 200)
  assert.equal((await snapshot.json()).summary.run_count, 3)
  assert.equal(snapshot.headers.get('cache-control'), 'private, no-store')

  const shell = await worker.fetch(
    new Request('https://thongphan.com/tpr', { headers: { Cookie: sessionCookie } }),
    env,
  )
  assert.equal(shell.status, 200)
  assert.equal(proxyCount(), 1)
})

test('wrong code is rejected and repeated failures are rate limited', async () => {
  const { worker, env, store } = await setup()
  const request = () =>
    new Request('https://thongphan.com/tpr/api/access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://thongphan.com',
        'CF-Connecting-IP': '203.0.113.7',
      },
      body: JSON.stringify({ code: 'wrong' }),
    })

  for (let index = 0; index < 5; index += 1) {
    const response = await worker.fetch(request(), env)
    assert.equal(response.status, 401)
  }
  const blocked = await worker.fetch(request(), env)
  assert.equal(blocked.status, 429)
  assert.equal(store.keys().some((key) => key.includes('203.0.113.7')), false)
})

test('tampered session cannot read the admin snapshot', async () => {
  const { worker, env } = await setup()
  const response = await worker.fetch(
    new Request('https://thongphan.com/tpr/api/snapshot', {
      headers: { Cookie: 'tpr_session=forged.token' },
    }),
    env,
  )

  assert.equal(response.status, 401)
})

test('login rejects oversized bodies, cross-origin calls, and missing secrets', async () => {
  const { worker, env } = await setup()
  const oversized = await worker.fetch(
    new Request('https://thongphan.com/tpr/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://thongphan.com' },
      body: JSON.stringify({ code: 'x'.repeat(500) }),
    }),
    env,
  )
  assert.equal(oversized.status, 413)

  const crossOrigin = await worker.fetch(
    new Request('https://thongphan.com/tpr/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
      body: JSON.stringify({ code: TEST_ACCESS_CODE }),
    }),
    env,
  )
  assert.equal(crossOrigin.status, 403)

  const missingSecret = await worker.fetch(
    new Request('https://thongphan.com/tpr/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://thongphan.com' },
      body: JSON.stringify({ code: TEST_ACCESS_CODE }),
    }),
    { ...env, TPR_SESSION_SECRET: '' },
  )
  assert.equal(missingSecret.status, 503)
})

test('TPR worker owns only the specific protected routes and binds KV', async () => {
  const { worker, env, proxyCount } = await setup()
  const unrelated = await worker.fetch(new Request('https://thongphan.com/tpr-public'), env)
  assert.equal(unrelated.status, 404)
  assert.equal(proxyCount(), 0)

  const config = await readFile(new URL('../wrangler.tpr.toml', import.meta.url), 'utf8')

  assert.match(config, /^name = "thongphan-tpr-admin"$/m)
  assert.match(config, /^main = "workers\/tpr-admin\.mjs"$/m)
  assert.match(config, /pattern = "thongphan\.com\/tpr\*"/)
  assert.match(config, /pattern = "www\.thongphan\.com\/tpr\*"/)
  assert.match(config, /binding = "TPR_ADMIN_DATA"/)
  assert.doesNotMatch(config, /\b\d{8}\b/)
})
