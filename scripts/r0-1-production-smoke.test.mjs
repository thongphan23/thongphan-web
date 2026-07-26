import assert from 'node:assert/strict'
import test from 'node:test'

import { main, runProductionSmoke } from './r0-1-production-smoke.mjs'

const ORIGIN = 'https://fixture.invalid'
const READING_PATH = '/library/read/steve-jobs-2005-stanford-commencement-address'
const SYNTHETIC_IDENTITY = Object.freeze({
  synthetic: true,
  name: 'R0.1 Fixture',
  email: 'r0-1-smoke@fixture.invalid',
})

function response(body, init = {}) {
  return new Response(body, init)
}

function readOnlyFetchFixture(overrides = new Map()) {
  const responses = new Map([
    ['/api/embed', response('{"type":"about:blank","title":"Endpoint disabled","status":410}', {
      status: 410,
      headers: {
        'cache-control': 'private, no-store, max-age=0',
        'content-type': 'application/problem+json; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'x-tp-endpoint-state': 'disabled',
      },
    })],
    ['/api/chat', response('{"type":"about:blank","title":"Endpoint disabled","status":410}', {
      status: 410,
      headers: {
        'cache-control': 'private, no-store, max-age=0',
        'content-type': 'application/problem+json; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'x-tp-endpoint-state': 'disabled',
      },
    })],
    ['/chat', response(`<link rel="canonical" href="${ORIGIN}/chat">`, { status: 200 })],
    ['/library', response(`<link rel="canonical" href="${ORIGIN}/library">`, { status: 200 })],
    [READING_PATH, response(`<link rel="canonical" href="${ORIGIN}${READING_PATH}">`, { status: 200 })],
    ['/sitemap.xml', response(`<urlset><loc>${ORIGIN}/chat</loc><loc>${ORIGIN}/library</loc><loc>${ORIGIN}${READING_PATH}</loc></urlset>`, { status: 200 })],
  ])
  for (const [route, fixture] of overrides) responses.set(route, fixture)

  return async (input, init = {}) => {
    assert.equal(init.method ?? 'GET', 'GET')
    const pathname = new URL(input).pathname
    const fixture = responses.get(pathname)
    assert.ok(fixture, `unexpected route ${pathname}`)
    return fixture.clone()
  }
}

function controlledSignupFixture({ queueRows = 0 } = {}) {
  const state = { signups: [], queueRows, postRequests: 0 }
  const fetchAdapter = async (input, init = {}) => {
    assert.equal(new URL(input).pathname, '/api/signup')
    assert.equal(init.method, 'POST')
    assert.equal(init.headers['content-type'], 'application/json')
    state.postRequests += 1
    const identity = JSON.parse(init.body)
    state.signups.push({ id: 'fixture-signup-id', ...identity })
    return response('{"success":true,"signup_id":"fixture-signup-id"}', {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
  const databaseAdapter = {
    async findSyntheticSignup(identity) {
      return state.signups
        .filter((row) => row.name === identity.name && row.email === identity.email)
        .map((row) => ({ id: row.id }))
    },
    async countQueueRows({ signupId }) {
      assert.equal(signupId, 'fixture-signup-id')
      return state.queueRows
    },
    async deleteSyntheticSignup({ signupId, identity }) {
      const before = state.signups.length
      state.signups = state.signups.filter((row) => !(
        row.id === signupId && row.name === identity.name && row.email === identity.email
      ))
      return before - state.signups.length
    },
  }
  return { state, fetchAdapter, databaseAdapter }
}

test('read-only smoke verifies the retired endpoints and canonical public routes without mutation', async () => {
  const result = await runProductionSmoke({
    origin: ORIGIN,
    mode: 'read-only',
    fetchAdapter: readOnlyFetchFixture(),
    databaseAdapter: new Proxy({}, {
      get() {
        throw new Error('read-only mode touched the database adapter')
      },
    }),
  })

  assert.equal(result.pass, true)
  assert.equal(result.mode, 'read-only')
  assert.equal(result.aggregate.post_requests, 0)
  assert.equal(result.aggregate.database_calls, 0)
})

test('read-only smoke independently enforces every exact 410 marker', async (t) => {
  const validHeaders = {
    'cache-control': 'private, no-store, max-age=0',
    'content-type': 'application/problem+json; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'x-tp-endpoint-state': 'disabled',
  }
  const cases = [
    ['status', '/api/embed', 200, validHeaders, '{"type":"about:blank","title":"Endpoint disabled","status":410}'],
    ['cache control', '/api/embed', 410, { ...validHeaders, 'cache-control': 'public' }, '{"type":"about:blank","title":"Endpoint disabled","status":410}'],
    ['content type', '/api/embed', 410, { ...validHeaders, 'content-type': 'application/json' }, '{"type":"about:blank","title":"Endpoint disabled","status":410}'],
    ['nosniff', '/api/embed', 410, { ...validHeaders, 'x-content-type-options': 'sniff' }, '{"type":"about:blank","title":"Endpoint disabled","status":410}'],
    ['disabled state', '/api/embed', 410, { ...validHeaders, 'x-tp-endpoint-state': 'active' }, '{"type":"about:blank","title":"Endpoint disabled","status":410}'],
    ['problem body', '/api/embed', 410, validHeaders, '{"status":410}'],
    ['chat tombstone', '/api/chat', 410, { ...validHeaders, 'x-tp-endpoint-state': 'active' }, '{"type":"about:blank","title":"Endpoint disabled","status":410}'],
  ]

  for (const [name, route, status, headers, body] of cases) {
    await t.test(name, async () => {
      await assert.rejects(
        runProductionSmoke({
          origin: ORIGIN,
          mode: 'read-only',
          fetchAdapter: readOnlyFetchFixture(new Map([
            [route, response(body, { status, headers })],
          ])),
        }),
        { code: 'SMOKE_HTTP_CONTRACT' },
      )
    })
  }
})

test('read-only smoke rejects a public route that is not HTTP 200', async () => {
  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'read-only',
      fetchAdapter: readOnlyFetchFixture(new Map([
        ['/library', response('not found', { status: 404 })],
      ])),
    }),
    { code: 'SMOKE_HTTP_CONTRACT' },
  )
})

test('read-only smoke rejects public HTML with the wrong canonical URL', async () => {
  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'read-only',
      fetchAdapter: readOnlyFetchFixture(new Map([
        ['/chat', response(`<link rel="canonical" href="${ORIGIN}/wrong">`, { status: 200 })],
      ])),
    }),
    { code: 'SMOKE_CANONICAL_CONTRACT' },
  )
})

test('read-only smoke rejects a sitemap missing a required public route', async () => {
  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'read-only',
      fetchAdapter: readOnlyFetchFixture(new Map([
        ['/sitemap.xml', response(`<urlset><loc>${ORIGIN}/chat</loc><loc>${ORIGIN}/library</loc></urlset>`, { status: 200 })],
      ])),
    }),
    { code: 'SMOKE_SITEMAP_CONTRACT' },
  )
})

test('every request receives a bounded native timeout', async () => {
  const neverResponds = async (_input, init) => new Promise((_resolve, reject) => {
    assert.ok(init.signal instanceof AbortSignal)
    const guard = setTimeout(() => reject(new Error('timeout signal was not delivered')), 100)
    init.signal.addEventListener('abort', () => {
      clearTimeout(guard)
      reject(init.signal.reason)
    }, { once: true })
  })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'read-only',
      fetchAdapter: neverResponds,
      limits: { timeoutMs: 10, maxResponseBytes: 1024 },
    }),
    { code: 'SMOKE_REQUEST_TIMEOUT' },
  )
})

test('response bodies are rejected as soon as the byte ceiling is exceeded', async () => {
  const oversized = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(129))
      controller.close()
    },
  })
  const fixture = response(oversized, {
    status: 410,
    headers: {
      'cache-control': 'private, no-store, max-age=0',
      'content-type': 'application/problem+json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'x-tp-endpoint-state': 'disabled',
    },
  })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'read-only',
      fetchAdapter: readOnlyFetchFixture(new Map([['/api/embed', fixture]])),
      limits: { timeoutMs: 100, maxResponseBytes: 128 },
    }),
    { code: 'SMOKE_RESPONSE_TOO_LARGE' },
  )
})

test('controlled signup creates one row, proves zero queue rows, and removes only that row', async () => {
  const fixture = controlledSignupFixture()

  const result = await runProductionSmoke({
    origin: ORIGIN,
    mode: 'controlled-signup',
    fetchAdapter: fixture.fetchAdapter,
    databaseAdapter: fixture.databaseAdapter,
    syntheticIdentity: SYNTHETIC_IDENTITY,
  })

  assert.equal(result.pass, true)
  assert.deepEqual(result.aggregate, {
    post_requests: 1,
    database_calls: 5,
    signup_rows_before: 0,
    signup_rows_created: 1,
    queue_rows: 0,
    signup_rows_removed: 1,
    signup_rows_remaining: 0,
  })
  assert.equal(fixture.state.postRequests, 1)
  assert.deepEqual(fixture.state.signups, [])
})

test('command shell emits only redacted JSON for a passing read-only run', async () => {
  const lines = []
  const exitCode = await main(
    ['--origin', ORIGIN, '--read-only'],
    { fetchAdapter: readOnlyFetchFixture(), writeLine: (line) => lines.push(line) },
  )

  assert.equal(exitCode, 0)
  assert.equal(lines.length, 1)
  const output = JSON.parse(lines[0])
  assert.equal(output.pass, true)
  assert.equal(output.aggregate.post_requests, 0)
  assert.doesNotMatch(lines[0], /(?:response|body|name|email)/i)
})

test('controlled signup output redacts both the identity and response body', async () => {
  const fixture = controlledSignupFixture()
  const lines = []
  const exitCode = await main(
    ['--origin', ORIGIN, '--controlled-signup'],
    {
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 0)
  assert.equal(lines.length, 1)
  assert.equal(JSON.parse(lines[0]).aggregate.queue_rows, 0)
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
  assert.doesNotMatch(lines[0], /fixture-signup-id|response|body|name|email/i)
})

test('controlled signup fails on a queue row but still performs targeted cleanup', async () => {
  const fixture = controlledSignupFixture({ queueRows: 1 })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_QUEUE_CONTRACT' },
  )
  assert.equal(fixture.state.postRequests, 1)
  assert.deepEqual(fixture.state.signups, [])
})

test('controlled signup preserves unrelated rows during targeted cleanup', async () => {
  const fixture = controlledSignupFixture()
  fixture.state.signups.push({ id: 'unrelated-id', name: 'Other Fixture', email: 'other@fixture.invalid' })

  await runProductionSmoke({
    origin: ORIGIN,
    mode: 'controlled-signup',
    fetchAdapter: fixture.fetchAdapter,
    databaseAdapter: fixture.databaseAdapter,
    syntheticIdentity: SYNTHETIC_IDENTITY,
  })

  assert.deepEqual(fixture.state.signups, [
    { id: 'unrelated-id', name: 'Other Fixture', email: 'other@fixture.invalid' },
  ])
})

test('controlled signup refuses to POST when its synthetic identity already exists', async () => {
  const fixture = controlledSignupFixture()
  fixture.state.signups.push({ id: 'existing-id', ...SYNTHETIC_IDENTITY })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SYNTHETIC_PREEXISTS' },
  )
  assert.equal(fixture.state.postRequests, 0)
  assert.equal(fixture.state.signups.length, 1)
})

test('controlled command fails closed without injected identity and database adapter', async () => {
  let fetchCalls = 0
  const lines = []
  const exitCode = await main(
    ['--origin', ORIGIN, '--controlled-signup'],
    {
      fetchAdapter: async () => {
        fetchCalls += 1
        throw new Error('must not fetch')
      },
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 1)
  assert.equal(fetchCalls, 0)
  assert.deepEqual(JSON.parse(lines[0]), {
    pass: false,
    mode: 'controlled-signup',
    code: 'SMOKE_CONTROLLED_INPUT_REQUIRED',
  })
})

test('command shell rejects unknown flags and non-HTTPS origins before fetching', async (t) => {
  for (const [name, argv, code] of [
    ['unknown flag', ['--origin', ORIGIN, '--surprise'], 'SMOKE_ARGUMENTS_INVALID'],
    ['insecure origin', ['--origin', 'http://fixture.invalid', '--read-only'], 'SMOKE_HTTPS_REQUIRED'],
  ]) {
    await t.test(name, async () => {
      let fetchCalls = 0
      const lines = []
      const exitCode = await main(argv, {
        fetchAdapter: async () => {
          fetchCalls += 1
          throw new Error('must not fetch')
        },
        writeLine: (line) => lines.push(line),
      })
      assert.equal(exitCode, 1)
      assert.equal(fetchCalls, 0)
      assert.equal(JSON.parse(lines[0]).code, code)
    })
  }
})
