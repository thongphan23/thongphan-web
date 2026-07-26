import assert from 'node:assert/strict'
import { chmod, lstat, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { main, runProductionSmoke } from './r0-1-production-smoke.mjs'
import { handleBrain2SignupRequest } from '../workers/brain2-campaign.ts'

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

function controlledSignupFixture({
  queueRows = 0,
  createdSignupCount = 1,
  signupCountDrift = 0,
  legacyAggregateDrift = false,
} = {}) {
  const state = {
    signups: [],
    queueRows,
    postRequests: 0,
    snapshotCalls: 0,
    legacyEmailAggregate: [{
      campaign_version: 'legacy-v0',
      status: 'pending',
      audience_state: 'quarantined_legacy',
      sendable: 0,
      row_count: 210,
    }],
  }
  const fetchAdapter = async (input, init = {}) => {
    assert.equal(new URL(input).pathname, '/api/signup')
    assert.equal(init.method, 'POST')
    assert.equal(init.headers['content-type'], 'application/json')
    state.postRequests += 1
    const identity = JSON.parse(init.body)
    for (let index = 0; index < createdSignupCount; index += 1) {
      const id = createdSignupCount === 1 ? 'fixture-signup-id' : `fixture-signup-id-${index + 1}`
      state.signups.push({ id, ...identity })
    }
    return response('{"success":true,"signup_id":"fixture-signup-id"}', {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
  const databaseAdapter = {
    async snapshotGlobalInvariants() {
      state.snapshotCalls += 1
      const afterCleanup = state.snapshotCalls > 1
      const legacyEmailAggregate = structuredClone(state.legacyEmailAggregate)
      if (afterCleanup && legacyAggregateDrift) legacyEmailAggregate[0].row_count += 1
      return {
        challengeSignupCount: state.signups.length + (afterCleanup ? signupCountDrift : 0),
        legacyEmailAggregate,
      }
    },
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

function actualSignupWorkerFixture() {
  const state = { signups: [], queueRows: 0 }
  const statement = (query) => {
    const entry = {
      query,
      values: [],
      bind(...values) {
        this.values = values
        return this
      },
      async first() {
        if (query.includes('SELECT id, duration_days FROM challenges')) {
          return { id: 'brain2-21', duration_days: 21 }
        }
        if (query.includes('SELECT id FROM challenge_signups')) {
          const [, email] = this.values
          return state.signups.find((row) => row.email.toLowerCase() === String(email).toLowerCase()) ?? null
        }
        throw new Error('unexpected Worker query')
      },
    }
    return entry
  }
  const env = {
    DB: {
      prepare: statement,
      async batch(statements) {
        assert.equal(statements.length, 1)
        const [signup] = statements
        assert.match(signup.query, /INSERT INTO challenge_signups/)
        const [id, challengeId, name, email, signedUpAt] = signup.values
        state.signups.push({ id, challengeId, name, email, signedUpAt })
        return []
      },
    },
    KV: { async delete() {} },
    SIGNUP_IP_RATE_LIMITER: { async limit() { return { success: true } } },
    SIGNUP_EMAIL_RATE_LIMITER: { async limit() { return { success: true } } },
  }
  const fetchAdapter = async (input, init = {}) => {
    const headers = new Headers(init.headers)
    headers.set('CF-Connecting-IP', '203.0.113.10')
    return handleBrain2SignupRequest(
      new Request(input, { ...init, headers }),
      env,
      {
        now: () => new Date('2026-07-27T00:00:00.000Z'),
        randomUUID: () => 'actual-worker-signup-id',
      },
    )
  }
  const databaseAdapter = {
    async snapshotGlobalInvariants() {
      return {
        challengeSignupCount: state.signups.length,
        legacyEmailAggregate: [{
          campaign_version: 'legacy-v0',
          status: 'pending',
          audience_state: 'quarantined_legacy',
          sendable: 0,
          row_count: 210,
        }],
      }
    },
    async findSyntheticSignup(identity) {
      return state.signups
        .filter((row) => row.name === identity.name && row.email === identity.email)
        .map((row) => ({ id: row.id }))
    },
    async countQueueRows() {
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
    database_calls: 7,
    signup_rows_before: 0,
    signup_rows_created: 1,
    queue_rows: 0,
    signup_rows_removed: 1,
    signup_rows_remaining: 0,
    signup_rows_total_before: 0,
    signup_rows_total_after_cleanup: 0,
    signup_rows_total_restored: true,
    legacy_email_aggregate_unchanged: true,
  })
  assert.equal(fixture.state.postRequests, 1)
  assert.deepEqual(fixture.state.signups, [])
})

test('controlled POST is accepted by the actual signup Worker contract', async () => {
  const fixture = actualSignupWorkerFixture()

  const result = await runProductionSmoke({
    origin: 'https://thongphan.com',
    mode: 'controlled-signup',
    fetchAdapter: fixture.fetchAdapter,
    databaseAdapter: fixture.databaseAdapter,
    syntheticIdentity: SYNTHETIC_IDENTITY,
  })

  assert.equal(result.pass, true)
  assert.equal(result.routes[0].status, 200)
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
  assert.doesNotMatch(lines[0], /fixture-signup-id|response|body/i)
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

test('controlled signup fails closed when the global signup total drifts after cleanup', async () => {
  const fixture = controlledSignupFixture({ signupCountDrift: 1 })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_GLOBAL_INVARIANT_DRIFT' },
  )
  assert.deepEqual(fixture.state.signups, [])
})

test('controlled signup rejects an unbounded global snapshot before POST', async () => {
  const fixture = controlledSignupFixture()
  fixture.state.legacyEmailAggregate = Array.from({ length: 65 }, (_, index) => ({
    campaign_version: `legacy-v${index}`,
    status: 'pending',
    audience_state: 'quarantined_legacy',
    sendable: 0,
    row_count: 1,
  }))

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_DATABASE_CONTRACT' },
  )
  assert.equal(fixture.state.postRequests, 0)
})

test('controlled signup fails closed when the legacy email aggregate changes', async () => {
  const fixture = controlledSignupFixture({ legacyAggregateDrift: true })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_GLOBAL_INVARIANT_DRIFT' },
  )
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

test('controlled signup cleans every matching row when one POST creates multiple rows', async () => {
  const fixture = controlledSignupFixture({ createdSignupCount: 2 })
  const unrelated = { id: 'unrelated-id', name: 'Other Fixture', email: 'other@fixture.invalid' }
  fixture.state.signups.push(unrelated)

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SIGNUP_ROW_CONTRACT' },
  )
  const matching = fixture.state.signups.filter((row) => (
    row.name === SYNTHETIC_IDENTITY.name && row.email === SYNTHETIC_IDENTITY.email
  ))
  assert.deepEqual(matching, [])
  assert.deepEqual(fixture.state.signups, [unrelated])
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
    code: 'SMOKE_SECURE_INPUT_REQUIRED',
  })
})

test('controlled CLI loads secure identity and uses only remote Wrangler file commands', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-cli-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })

  const state = {
    signups: [],
    legacy: [{
      campaign_version: 'legacy-v0',
      status: 'pending',
      audience_state: 'quarantined_legacy',
      sendable: 0,
      row_count: 210,
    }],
  }
  const sqlPaths = []
  const subprocessArgs = []
  const subprocessAdapter = async ({ executable, args }) => {
    subprocessArgs.push([executable, ...args])
    assert.match(executable, /node_modules\/\.bin\/wrangler$/)
    assert.equal(args.includes('--remote'), true)
    assert.equal(args.includes('--command'), false)
    assert.equal(args.includes('--json'), true)
    assert.equal(args.includes('--yes'), true)
    assert.equal(args[0], 'd1')
    assert.equal(args[1], 'execute')
    assert.equal(args[2], 'thongphan-db')
    assert.doesNotMatch(args.join(' '), new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
    assert.doesNotMatch(args.join(' '), new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
    const sqlPath = args[args.indexOf('--file') + 1]
    sqlPaths.push(sqlPath)
    const sqlStat = await lstat(sqlPath)
    assert.equal(sqlStat.isFile(), true)
    assert.equal(sqlStat.isSymbolicLink(), false)
    assert.equal(sqlStat.mode & 0o077, 0)
    const sql = await readFile(sqlPath, 'utf8')

    let results
    if (sql.includes('r0-1-smoke:snapshot')) {
      results = [
        { success: true, results: [{ challenge_signup_count: state.signups.length }] },
        { success: true, results: structuredClone(state.legacy) },
      ]
    } else if (sql.includes('r0-1-smoke:find-signup')) {
      results = [{
        success: true,
        results: state.signups
          .filter((row) => row.name === SYNTHETIC_IDENTITY.name && row.email === SYNTHETIC_IDENTITY.email)
          .map((row) => ({ id: row.id })),
      }]
    } else if (sql.includes('r0-1-smoke:count-queue')) {
      results = [{ success: true, results: [{ queue_count: 0 }] }]
    } else if (sql.includes('r0-1-smoke:delete-signup')) {
      const signupId = sql.match(/\bid = '([^']+)'/)?.[1]
      const before = state.signups.length
      state.signups = state.signups.filter((row) => row.id !== signupId)
      results = [{ success: true, results: [{ deleted_count: before - state.signups.length }] }]
    } else {
      throw new Error('unexpected SQL fixture')
    }
    return { exitCode: 0, stdout: JSON.stringify(results), stderr: '' }
  }
  const fetchAdapter = async (input, init) => {
    assert.equal(new URL(input).pathname, '/api/signup')
    assert.equal(init.headers.Origin, ORIGIN)
    assert.deepEqual(JSON.parse(init.body), {
      challenge_slug: 'brain2-21-ngay',
      name: SYNTHETIC_IDENTITY.name,
      email: SYNTHETIC_IDENTITY.email,
    })
    state.signups.push({ id: 'secure-cli-signup-id', ...SYNTHETIC_IDENTITY })
    return response('{"success":true}', { status: 200 })
  }
  const lines = []

  const exitCode = await main(
    ['--origin', ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      fetchAdapter,
      subprocessAdapter,
      tempRoot: fixtureRoot,
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 0)
  assert.equal(subprocessArgs.length, 7)
  assert.deepEqual(state.signups, [])
  assert.equal(JSON.parse(lines[0]).aggregate.legacy_email_aggregate_unchanged, true)
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
  for (const sqlPath of sqlPaths) {
    await assert.rejects(lstat(sqlPath), { code: 'ENOENT' })
  }
})

test('controlled CLI rejects group-readable and symlink identity files before side effects', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-input-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const targetPath = join(fixtureRoot, 'identity.json')
  const symlinkPath = join(fixtureRoot, 'identity-link.json')
  await writeFile(targetPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  await symlink(targetPath, symlinkPath)

  for (const [name, inputPath, prepare] of [
    ['group readable', targetPath, () => chmod(targetPath, 0o640)],
    ['symlink', symlinkPath, () => chmod(targetPath, 0o600)],
  ]) {
    await t.test(name, async () => {
      await prepare()
      let subprocessCalls = 0
      let fetchCalls = 0
      const lines = []
      const exitCode = await main(
        ['--origin', ORIGIN, '--controlled-signup'],
        {
          env: { R0_1_SMOKE_INPUT_FILE: inputPath },
          subprocessAdapter: async () => {
            subprocessCalls += 1
            throw new Error('must not run')
          },
          fetchAdapter: async () => {
            fetchCalls += 1
            throw new Error('must not fetch')
          },
          writeLine: (line) => lines.push(line),
        },
      )
      assert.equal(exitCode, 1)
      assert.equal(subprocessCalls, 0)
      assert.equal(fetchCalls, 0)
      assert.equal(JSON.parse(lines[0]).code, 'SMOKE_SECURE_INPUT_INVALID')
    })
  }
})

test('controlled CLI removes its owner-only SQL artifact when Wrangler fails', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-cleanup-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  const sqlPaths = []
  const lines = []

  const exitCode = await main(
    ['--origin', ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      tempRoot: fixtureRoot,
      subprocessAdapter: async ({ args }) => {
        const sqlPath = args[args.indexOf('--file') + 1]
        sqlPaths.push(sqlPath)
        const sqlStat = await lstat(sqlPath)
        assert.equal(sqlStat.mode & 0o077, 0)
        throw new Error('synthetic Wrangler failure')
      },
      fetchAdapter: async () => {
        throw new Error('must not fetch')
      },
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 1)
  assert.equal(JSON.parse(lines[0]).code, 'SMOKE_DATABASE_COMMAND_FAILED')
  assert.equal(sqlPaths.length, 1)
  await assert.rejects(lstat(sqlPaths[0]), { code: 'ENOENT' })
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
