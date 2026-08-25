import assert from 'node:assert/strict'
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'

import * as productionSmoke from './r0-1-production-smoke.mjs'
import { BRAIN2_SIGNUP_SUCCESS_MESSAGE } from '../lib/brain2/signup-contract.ts'
import { handleBrain2SignupRequest } from '../workers/brain2-campaign.ts'

const { main, nativeSubprocessAdapter, runProductionSmoke } = productionSmoke

const ORIGIN = 'https://fixture.invalid'
const PRODUCTION_ORIGIN = 'https://thongphan.com'
const READING_PATH = '/library/read/steve-jobs-2005-stanford-commencement-address'
const SIGNUP_IDS = Object.freeze({
  primary: '00000000-0000-4000-8000-000000000001',
  secondary: '00000000-0000-4000-8000-000000000002',
  tertiary: '00000000-0000-4000-8000-000000000003',
  worker: '00000000-0000-4000-8000-000000000004',
  preMigration: '00000000-0000-4000-8000-000000000005',
  mismatch: '00000000-0000-4000-8000-000000000006',
  apostrophe: '00000000-0000-4000-8000-000000000007',
  private: '00000000-0000-4000-8000-000000000008',
  validatedD1: '00000000-0000-4000-8000-000000000009',
  unrelated: '00000000-0000-4000-8000-00000000000a',
})
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
  preMigrationAggregateDrift = false,
  responseBody,
  responseContentType = 'application/json; charset=utf-8',
  responseStatus = 200,
} = {}) {
  const state = {
    signups: [],
    queueRows,
    postRequests: 0,
    queueCountCalls: 0,
    snapshotCalls: 0,
    preMigrationEmailAggregate: [{
      campaign_version: 'legacy-v0',
      status: 'pending',
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
      const id = [SIGNUP_IDS.primary, SIGNUP_IDS.secondary, SIGNUP_IDS.tertiary][index]
      state.signups.push({ id, ...identity })
    }
    return response(responseBody ?? JSON.stringify({
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: SIGNUP_IDS.primary,
    }), {
      status: responseStatus,
      headers: { 'content-type': responseContentType },
    })
  }
  const databaseAdapter = {
    async snapshotPreMigrationInvariants() {
      state.snapshotCalls += 1
      const afterCleanup = state.snapshotCalls > 1
      const preMigrationEmailAggregate = structuredClone(state.preMigrationEmailAggregate)
      if (afterCleanup && preMigrationAggregateDrift) preMigrationEmailAggregate[0].row_count += 1
      return {
        challengeSignupCount: state.signups.length + (afterCleanup ? signupCountDrift : 0),
        preMigrationEmailAggregate,
      }
    },
    async findSyntheticSignup() {
      return state.signups
        .filter((row) => row.email.toLowerCase().endsWith('.invalid'))
        .map((row) => ({ id: row.id }))
    },
    async countQueueRows({ signupId }) {
      assert.equal(signupId, SIGNUP_IDS.primary)
      state.queueCountCalls += 1
      return state.queueRows
    },
    async deleteSyntheticSignup({ signupId }) {
      const before = state.signups.length
      state.signups = state.signups.filter((row) => !(row.id === signupId
        && row.email.toLowerCase().endsWith('.invalid')))
      return before - state.signups.length
    },
  }
  return { state, fetchAdapter, databaseAdapter }
}

function actualSignupWorkerFixture() {
  const state = { signups: [], queueRows: 0 }
  const env = {
    DATA_PLATFORM_URL: 'https://api.thongphan.com',
    DATA_PLATFORM_AUDIENCE_TOKEN: 'audience-gateway-production-smoke-fixture-token',
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
        randomUUID: () => SIGNUP_IDS.worker,
        fetch: async (_gatewayUrl, gatewayInit) => {
          const body = JSON.parse(String(gatewayInit?.body))
          assert.equal(body.consentVersion, 'audience-challenge-registration-v1')
          state.signups.push({
            id: SIGNUP_IDS.worker,
            challengeId: 'brain2-21',
            name: body.name,
            email: body.email,
            signedUpAt: '2026-08-23T10:00:00.000Z',
          })
          return Response.json({
            data: {
              signupId: SIGNUP_IDS.worker,
              challengeSlug: 'brain2-21-ngay',
              status: 'registered',
              signedUpAt: '2026-08-23T10:00:00.000Z',
            },
            replay: false,
            traceId: 'production-smoke-trace',
          }, { status: 201 })
        },
      },
    )
  }
  const databaseAdapter = {
    async snapshotPreMigrationInvariants() {
      return {
        challengeSignupCount: state.signups.length,
        preMigrationEmailAggregate: [{
          campaign_version: 'legacy-v0',
          status: 'pending',
          row_count: 210,
        }],
      }
    },
    async findSyntheticSignup() {
      return state.signups
        .filter((row) => row.email.toLowerCase().endsWith('.invalid'))
        .map((row) => ({ id: row.id }))
    },
    async countQueueRows() {
      return state.queueRows
    },
    async deleteSyntheticSignup({ signupId }) {
      const before = state.signups.length
      state.signups = state.signups.filter((row) => !(row.id === signupId
        && row.email.toLowerCase().endsWith('.invalid')))
      return before - state.signups.length
    },
  }
  return { state, fetchAdapter, databaseAdapter }
}

async function preMigrationSqliteFixture(fixtureRoot) {
  const database = new DatabaseSync(':memory:')
  database.exec('PRAGMA foreign_keys = ON;')
  database.exec(await readFile(new URL('../workers/schema.sql', import.meta.url), 'utf8'))

  const signupInsert = database.prepare(`
    INSERT INTO challenge_signups (id, challenge_id, name, email, current_day, signed_up_at)
    VALUES (?, 'brain2-21', ?, ?, 0, '2026-07-26T00:00:00.000Z')
  `)
  const queueInsert = database.prepare(`
    INSERT INTO email_queue (id, signup_id, day, subject, body, scheduled_at, status)
    VALUES (?, ?, ?, 'Historical fixture', 'Historical fixture', ?, 'pending')
  `)
  database.exec('BEGIN')
  try {
    for (let signupIndex = 1; signupIndex <= 10; signupIndex += 1) {
      const signupId = `10000000-0000-4000-8000-${String(signupIndex).padStart(12, '0')}`
      signupInsert.run(
        signupId,
        `Historical Fixture ${signupIndex}`,
        `historical-${signupIndex}@fixture.test`,
      )
      for (let day = 1; day <= 21; day += 1) {
        queueInsert.run(
          `historical-queue-${signupIndex}-${day}`,
          signupId,
          day,
          `2026-07-${String(day).padStart(2, '0')}T02:00:00.000Z`,
        )
      }
    }
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }

  database.exec(await readFile(
    new URL('../workers/migrations/0002_brain2_access_and_email_campaign.sql', import.meta.url),
    'utf8',
  ))

  const initialAggregate = database.prepare(`
    SELECT campaign_version, status, COUNT(*) AS row_count
    FROM email_queue
    GROUP BY campaign_version, status
    ORDER BY campaign_version, status
  `).all().map((row) => ({ ...row }))
  const sqlErrors = []

  const environment = {
    DATA_PLATFORM_URL: 'https://api.thongphan.com',
    DATA_PLATFORM_AUDIENCE_TOKEN: 'audience-gateway-sqlite-smoke-fixture-token',
    KV: { async delete() {} },
    SIGNUP_IP_RATE_LIMITER: { async limit() { return { success: true } } },
    SIGNUP_EMAIL_RATE_LIMITER: { async limit() { return { success: true } } },
  }
  const fetchAdapter = async (input, init = {}) => {
    const headers = new Headers(init.headers)
    headers.set('CF-Connecting-IP', '203.0.113.10')
    return handleBrain2SignupRequest(
      new Request(input, { ...init, headers }),
      environment,
      {
        randomUUID: () => SIGNUP_IDS.preMigration,
        fetch: async (_gatewayUrl, gatewayInit) => {
          const body = JSON.parse(String(gatewayInit?.body))
          database.prepare(
            `INSERT INTO challenge_signups
               (id, challenge_id, name, email, current_day, signed_up_at)
             VALUES (?, 'brain2-21', ?, ?, 0, ?)`,
          ).run(
            SIGNUP_IDS.preMigration,
            body.name,
            body.email,
            '2026-08-23T10:00:00.000Z',
          )
          return Response.json({
            data: {
              signupId: SIGNUP_IDS.preMigration,
              challengeSlug: 'brain2-21-ngay',
              status: 'registered',
              signedUpAt: '2026-08-23T10:00:00.000Z',
            },
            replay: false,
            traceId: 'sqlite-smoke-trace',
          }, { status: 201 })
        },
      },
    )
  }
  const subprocessAdapter = async ({ args }) => {
    assert.equal(args.includes('--file'), false)
    const commandArgument = args.find((argument) => argument.startsWith('--command='))
    assert.equal(typeof commandArgument, 'string')
    const sql = commandArgument.slice('--command='.length)
    const statements = sql
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('--'))
      .join('\n')
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean)
    try {
      const results = statements.map((statement) => ({
        success: true,
        results: database.prepare(statement).all(),
      }))
      return { exitCode: 0, stdout: JSON.stringify(results), stderr: '' }
    } catch (error) {
      sqlErrors.push(error instanceof Error ? error.message : String(error))
      return { exitCode: 1, stdout: '', stderr: '' }
    }
  }

  return { database, fetchAdapter, initialAggregate, sqlErrors, subprocessAdapter, fixtureRoot }
}

function d1SubprocessFixture({ state, identity, subprocessArgs, inspectSql = () => {} }) {
  return async ({ executable, args }) => {
    subprocessArgs.push([executable, ...args])
    assert.match(executable, /node_modules\/\.bin\/wrangler$/)
    assert.equal(args.includes('--remote'), true)
    assert.equal(args.includes('--command'), false)
    assert.equal(args.includes('--file'), false)
    assert.equal(args.includes('--json'), true)
    assert.equal(args.includes('--yes'), true)
    assert.deepEqual(args.slice(0, 3), ['d1', 'execute', 'thongphan-db'])
    assert.doesNotMatch(args.join(' '), new RegExp(identity.name, 'i'))
    assert.doesNotMatch(args.join(' '), new RegExp(identity.email, 'i'))
    const commandArgument = args.find((argument) => argument.startsWith('--command='))
    assert.equal(typeof commandArgument, 'string')
    const sql = commandArgument.slice('--command='.length)
    assert.equal(typeof sql, 'string')
    if (sql.includes('r0-1-smoke:find-signup') || sql.includes('r0-1-smoke:delete-signup')) {
      assert.match(sql, /brain2-21-ngay/)
      assert.match(sql, /\.invalid/)
    }
    inspectSql(sql)

    let results
    if (sql.includes('r0-1-smoke:pre-migration-snapshot')) {
      results = [
        { success: true, results: [{ challenge_signup_count: state.signups.length }] },
        { success: true, results: structuredClone(state.preMigrationEmailAggregate) },
      ]
    } else if (sql.includes('r0-1-smoke:find-signup')) {
      results = [{
        success: true,
        results: state.signups
          .filter((row) => row.email.toLowerCase().endsWith('.invalid'))
          .map((row) => ({ id: row.id })),
      }]
    } else if (sql.includes('r0-1-smoke:count-queue')) {
      results = [{ success: true, results: [{ queue_count: 0 }] }]
    } else if (sql.includes('r0-1-smoke:delete-signup')) {
      const signupId = sql.match(/\bid = '([^']+)'/)?.[1]
      const before = state.signups.length
      state.signups = state.signups.filter((row) => !(row.id === signupId
        && row.email.toLowerCase().endsWith('.invalid')))
      results = [{ success: true, results: [{ deleted_count: before - state.signups.length }] }]
    } else {
      throw new Error('unexpected SQL fixture')
    }
    return { exitCode: 0, stdout: JSON.stringify(results), stderr: '' }
  }
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
    pre_migration_email_aggregate_unchanged: true,
  })
  assert.equal(fixture.state.postRequests, 1)
  assert.deepEqual(fixture.state.signups, [])
})

test('production smoke success message remains equal to the shared application contract', () => {
  assert.equal(
    productionSmoke.CONTROLLED_SIGNUP_SUCCESS_MESSAGE,
    BRAIN2_SIGNUP_SUCCESS_MESSAGE,
  )
})

test('controlled signup rejects success:false and still restores every invariant', async () => {
  const fixture = controlledSignupFixture({
    responseBody: JSON.stringify({
      success: false,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: SIGNUP_IDS.primary,
    }),
  })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT' },
  )
  assert.deepEqual(fixture.state.signups, [])
  assert.equal(fixture.state.queueRows, 0)
  assert.equal(fixture.state.queueCountCalls, 1)
  assert.equal(fixture.state.snapshotCalls, 2)
})

test('controlled signup fails closed without deleting when malformed JSON has no response ID', async () => {
  const fixture = controlledSignupFixture({ responseBody: '{not-json' })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT' },
  )
  assert.equal(fixture.state.signups.length, 1)
  assert.equal(fixture.state.queueCountCalls, 1)
})

test('controlled signup rejects every invalid JSON response shape', async (t) => {
  const cases = [
    ['array', []],
    ['missing success', { message: BRAIN2_SIGNUP_SUCCESS_MESSAGE, signup_id: SIGNUP_IDS.primary }],
    ['truthy numeric success', { success: 1, message: BRAIN2_SIGNUP_SUCCESS_MESSAGE, signup_id: SIGNUP_IDS.primary }],
    ['wrong message', { success: true, message: 'Đăng ký thành công', signup_id: SIGNUP_IDS.primary }],
    ['missing signup ID', { success: true, message: BRAIN2_SIGNUP_SUCCESS_MESSAGE }],
    ['empty signup ID', { success: true, message: BRAIN2_SIGNUP_SUCCESS_MESSAGE, signup_id: '' }],
  ]

  for (const [name, body] of cases) {
    await t.test(name, async () => {
      const fixture = controlledSignupFixture({ responseBody: JSON.stringify(body) })
      await assert.rejects(
        runProductionSmoke({
          origin: ORIGIN,
          mode: 'controlled-signup',
          fetchAdapter: fixture.fetchAdapter,
          databaseAdapter: fixture.databaseAdapter,
          syntheticIdentity: SYNTHETIC_IDENTITY,
        }),
        { code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT' },
      )
      const hasResponseId = body && typeof body === 'object' && !Array.isArray(body)
        && typeof body.signup_id === 'string' && body.signup_id.length > 0
      assert.equal(fixture.state.signups.length, hasResponseId ? 0 : 1)
    })
  }
})

test('controlled signup rejects a response ID that differs from the created D1 row', async () => {
  const fixture = controlledSignupFixture({
    responseBody: JSON.stringify({
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: SIGNUP_IDS.mismatch,
    }),
  })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT' },
  )
  assert.equal(fixture.state.signups.length, 1)
})

test('controlled signup rejects non-opaque IDs returned by D1', async (t) => {
  for (const invalidId of [SYNTHETIC_IDENTITY.name, SYNTHETIC_IDENTITY.email]) {
    await t.test(invalidId === SYNTHETIC_IDENTITY.name ? 'synthetic name' : 'synthetic email', async () => {
      const fixture = controlledSignupFixture()
      let lookupCalls = 0
      let deleteCalls = 0
      fixture.databaseAdapter.findSyntheticSignup = async () => {
        lookupCalls += 1
        return lookupCalls === 1 ? [] : [{ id: invalidId }]
      }
      fixture.databaseAdapter.deleteSyntheticSignup = async () => {
        deleteCalls += 1
        return 0
      }

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
      assert.equal(deleteCalls, 0)
    })
  }
})

test('controlled signup response accepts only canonical lowercase UUID v4 IDs', async (t) => {
  const invalidIds = [
    '00000000-0000-1000-8000-000000000001',
    '00000000-0000-4000-7000-000000000001',
    '00000000-0000-4000-8000-00000000000A',
  ]

  for (const invalidId of invalidIds) {
    await t.test(invalidId, async () => {
      const fixture = controlledSignupFixture({
        responseBody: JSON.stringify({
          success: true,
          message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
          signup_id: invalidId,
        }),
      })
      let lookupCalls = 0
      let deleteCalls = 0
      fixture.databaseAdapter.findSyntheticSignup = async () => {
        lookupCalls += 1
        return lookupCalls === 1 ? [] : [{ id: invalidId }]
      }
      fixture.databaseAdapter.deleteSyntheticSignup = async () => {
        deleteCalls += 1
        return 0
      }

      await assert.rejects(
        runProductionSmoke({
          origin: ORIGIN,
          mode: 'controlled-signup',
          fetchAdapter: fixture.fetchAdapter,
          databaseAdapter: fixture.databaseAdapter,
          syntheticIdentity: SYNTHETIC_IDENTITY,
        }),
        { code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT' },
      )
      assert.equal(fixture.state.queueCountCalls, 0)
      assert.equal(deleteCalls, 0)
    })
  }
})

test('controlled signup D1 rows accept only canonical lowercase UUID v4 IDs', async (t) => {
  const invalidIds = [
    '00000000-0000-1000-8000-000000000001',
    '00000000-0000-4000-7000-000000000001',
    '00000000-0000-4000-8000-00000000000A',
  ]

  for (const invalidId of invalidIds) {
    await t.test(invalidId, async () => {
      const fixture = controlledSignupFixture()
      let lookupCalls = 0
      let deleteCalls = 0
      fixture.databaseAdapter.findSyntheticSignup = async () => {
        lookupCalls += 1
        return lookupCalls === 1 ? [] : [{ id: invalidId }]
      }
      fixture.databaseAdapter.deleteSyntheticSignup = async () => {
        deleteCalls += 1
        return 0
      }

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
      assert.equal(fixture.state.queueCountCalls, 0)
      assert.equal(deleteCalls, 0)
    })
  }
})

test('controlled signup rejects a non-JSON media type with an otherwise valid body', async () => {
  const fixture = controlledSignupFixture({ responseContentType: 'text/plain' })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT' },
  )
  assert.deepEqual(fixture.state.signups, [])
})

test('controlled signup classifies a non-200 response separately and still cleans its row', async () => {
  const fixture = controlledSignupFixture({ responseStatus: 503 })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
    }),
    { code: 'SMOKE_SIGNUP_HTTP_CONTRACT' },
  )
  assert.deepEqual(fixture.state.signups, [])
  assert.equal(fixture.state.queueCountCalls, 1)
})

test('controlled signup preserves the non-200 classification when its body is oversized', async () => {
  const fixture = controlledSignupFixture({
    responseStatus: 503,
    responseBody: 'x'.repeat(65),
  })

  await assert.rejects(
    runProductionSmoke({
      origin: ORIGIN,
      mode: 'controlled-signup',
      fetchAdapter: fixture.fetchAdapter,
      databaseAdapter: fixture.databaseAdapter,
      syntheticIdentity: SYNTHETIC_IDENTITY,
      limits: { timeoutMs: 100, maxResponseBytes: 64 },
    }),
    { code: 'SMOKE_SIGNUP_HTTP_CONTRACT' },
  )
  assert.equal(fixture.state.signups.length, 1)
})

test('controlled signup accepts canonical JSON with case-insensitive media type and extra fields', async () => {
  const fixture = controlledSignupFixture({
    responseContentType: ' Application/JSON ; Charset=UTF-8 ',
    responseBody: JSON.stringify({
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: SIGNUP_IDS.primary,
      release: 'r0.1b',
    }),
  })

  const result = await runProductionSmoke({
    origin: ORIGIN,
    mode: 'controlled-signup',
    fetchAdapter: fixture.fetchAdapter,
    databaseAdapter: fixture.databaseAdapter,
    syntheticIdentity: SYNTHETIC_IDENTITY,
  })

  assert.equal(result.pass, true)
  assert.equal(result.aggregate.signup_rows_created, 1)
  assert.equal(result.aggregate.queue_rows, 0)
  assert.equal(result.aggregate.signup_rows_removed, 1)
  assert.equal(result.aggregate.signup_rows_remaining, 0)
  assert.equal(result.aggregate.signup_rows_total_restored, true)
  assert.equal(result.aggregate.pre_migration_email_aggregate_unchanged, true)
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

test('native controlled signup works before migration 0003 against the actual SQLite SQL contract', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-pre-migration-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  const fixture = await preMigrationSqliteFixture(fixtureRoot)
  t.after(() => fixture.database.close())
  const lines = []

  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM challenge_signups').get().count, 10)
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM email_queue').get().count, 210)
  assert.deepEqual(fixture.initialAggregate, [{
    campaign_version: 'legacy-v0',
    status: 'pending',
    row_count: 210,
  }])
  const preMigrationColumns = fixture.database.prepare('PRAGMA table_info(email_queue)').all()
    .map((column) => column.name)
  assert.equal(preMigrationColumns.includes('audience_state'), false)
  assert.equal(preMigrationColumns.includes('sendable'), false)

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      tempRoot: fixtureRoot,
      fetchAdapter: fixture.fetchAdapter,
      subprocessAdapter: fixture.subprocessAdapter,
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 0, `${lines[0]} ${fixture.sqlErrors.join('; ')}`)
  const output = JSON.parse(lines[0])
  assert.equal(output.aggregate.signup_rows_created, 1)
  assert.equal(output.aggregate.queue_rows, 0)
  assert.equal(output.aggregate.signup_rows_removed, 1)
  assert.equal(output.aggregate.signup_rows_remaining, 0)
  assert.equal(output.aggregate.signup_rows_total_restored, true)
  assert.equal(output.aggregate.pre_migration_email_aggregate_unchanged, true)
  assert.deepEqual(fixture.sqlErrors, [])
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM challenge_signups').get().count, 10)
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM email_queue').get().count, 210)
  assert.deepEqual(fixture.database.prepare(`
    SELECT campaign_version, status, COUNT(*) AS row_count
    FROM email_queue
    GROUP BY campaign_version, status
    ORDER BY campaign_version, status
  `).all().map((row) => ({ ...row })), fixture.initialAggregate)
  assert.equal(fixture.database.prepare(
    'SELECT COUNT(*) AS count FROM challenge_signups WHERE id = ?',
  ).get(SIGNUP_IDS.preMigration).count, 0)
  const postSmokeColumns = fixture.database.prepare('PRAGMA table_info(email_queue)').all()
    .map((column) => column.name)
  assert.equal(postSmokeColumns.includes('audience_state'), false)
  assert.equal(postSmokeColumns.includes('sendable'), false)
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
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
  assert.doesNotMatch(lines[0], new RegExp(`${SIGNUP_IDS.primary}|response|body`, 'i'))
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
  fixture.state.preMigrationEmailAggregate = Array.from({ length: 65 }, (_, index) => ({
    campaign_version: `legacy-v${index}`,
    status: 'pending',
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

test('controlled signup fails closed when the pre-migration email aggregate changes', async () => {
  const fixture = controlledSignupFixture({ preMigrationAggregateDrift: true })

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

test('controlled signup preserves unrelated non-synthetic rows during targeted cleanup', async () => {
  const fixture = controlledSignupFixture()
  fixture.state.signups.push({ id: SIGNUP_IDS.unrelated, name: 'Other Fixture', email: 'other@fixture.test' })

  await runProductionSmoke({
    origin: ORIGIN,
    mode: 'controlled-signup',
    fetchAdapter: fixture.fetchAdapter,
    databaseAdapter: fixture.databaseAdapter,
    syntheticIdentity: SYNTHETIC_IDENTITY,
  })

  assert.deepEqual(fixture.state.signups, [
    { id: SIGNUP_IDS.unrelated, name: 'Other Fixture', email: 'other@fixture.test' },
  ])
})

test('controlled signup refuses to POST when its synthetic identity already exists', async () => {
  const fixture = controlledSignupFixture()
  fixture.state.signups.push({ id: SIGNUP_IDS.primary, ...SYNTHETIC_IDENTITY })

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

test('controlled signup refuses to POST when any synthetic invalid-domain signup exists for the challenge', async () => {
  const fixture = controlledSignupFixture()
  fixture.state.signups.push({
    id: SIGNUP_IDS.secondary,
    name: 'Other Fixture',
    email: 'other-synthetic@fixture.invalid',
  })

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

test('controlled signup issues no cleanup when one POST creates multiple rows', async () => {
  const fixture = controlledSignupFixture({
    createdSignupCount: 2,
    responseBody: JSON.stringify({
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: SIGNUP_IDS.primary,
    }),
  })
  const unrelated = { id: SIGNUP_IDS.unrelated, name: 'Other Fixture', email: 'other@fixture.test' }
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
  assert.deepEqual(matching.map((row) => row.id), [SIGNUP_IDS.primary, SIGNUP_IDS.secondary])
  assert.deepEqual(fixture.state.signups, [unrelated, ...matching])
})

test('controlled command fails closed without injected identity and database adapter', async () => {
  let fetchCalls = 0
  const lines = []
  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
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

test('native controlled CLI rejects every non-apex origin before secure input or side effects', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-origin-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'group-readable-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o640 })
  let subprocessCalls = 0
  let fetchCalls = 0
  const lines = []

  const exitCode = await main(
    ['--origin', 'https://attacker.invalid', '--controlled-signup'],
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
  assert.deepEqual(JSON.parse(lines[0]), {
    pass: false,
    mode: 'controlled-signup',
    code: 'SMOKE_CONTROLLED_ORIGIN_REQUIRED',
  })
})

test('controlled CLI issues no cleanup command when D1 reports multiple synthetic rows', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-cli-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })

  const state = {
    signups: [{ id: SIGNUP_IDS.unrelated, name: 'Other Fixture', email: 'other@fixture.test' }],
    preMigrationEmailAggregate: [{
      campaign_version: 'legacy-v0',
      status: 'pending',
      row_count: 210,
    }],
  }
  const subprocessArgs = []
  const subprocessAdapter = d1SubprocessFixture({
    state,
    identity: SYNTHETIC_IDENTITY,
    subprocessArgs,
  })
  const fetchAdapter = async (input, init) => {
    assert.equal(new URL(input).pathname, '/api/signup')
    assert.equal(init.headers.Origin, PRODUCTION_ORIGIN)
    assert.deepEqual(JSON.parse(init.body), {
      challenge_slug: 'brain2-21-ngay',
      name: SYNTHETIC_IDENTITY.name,
      email: SYNTHETIC_IDENTITY.email,
    })
    for (const id of [SIGNUP_IDS.primary, SIGNUP_IDS.secondary, SIGNUP_IDS.tertiary]) {
      state.signups.push({ id, ...SYNTHETIC_IDENTITY })
    }
    return response(JSON.stringify({
      success: true,
      message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
      signup_id: SIGNUP_IDS.primary,
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  const lines = []

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      fetchAdapter,
      subprocessAdapter,
      tempRoot: fixtureRoot,
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 1)
  assert.equal(JSON.parse(lines[0]).code, 'SMOKE_SIGNUP_ROW_CONTRACT')
  assert.equal(subprocessArgs.length, 5)
  assert.deepEqual(state.signups, [
    { id: SIGNUP_IDS.unrelated, name: 'Other Fixture', email: 'other@fixture.test' },
    { id: SIGNUP_IDS.primary, ...SYNTHETIC_IDENTITY },
    { id: SIGNUP_IDS.secondary, ...SYNTHETIC_IDENTITY },
    { id: SIGNUP_IDS.tertiary, ...SYNTHETIC_IDENTITY },
  ])
  assert.equal(
    subprocessArgs.filter((args) => args.join(' ').includes('r0-1-smoke:delete-signup')).length,
    0,
  )
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
})

test('controlled CLI rejects a free-form Alice ID before queue lookup or cleanup', async (t) => {
  const identity = { synthetic: true, name: 'Alice', email: 'alice@fixture.invalid' }
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-alice-id-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(identity), { mode: 0o600 })
  const state = {
    signups: [],
    preMigrationEmailAggregate: [{
      campaign_version: 'legacy-v0',
      status: 'pending',
      row_count: 210,
    }],
  }
  const subprocessArgs = []
  const lines = []

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      subprocessAdapter: d1SubprocessFixture({ state, identity, subprocessArgs }),
      fetchAdapter: async () => {
        state.signups.push({ id: 'Alice', ...identity })
        return response(JSON.stringify({
          success: true,
          message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
          signup_id: 'Alice',
        }), { status: 200, headers: { 'content-type': 'application/json' } })
      },
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 1)
  assert.equal(JSON.parse(lines[0]).code, 'SMOKE_SIGNUP_RESPONSE_CONTRACT')
  assert.equal(
    subprocessArgs.filter((args) => args.join(' ').includes('r0-1-smoke:count-queue')).length,
    0,
  )
  assert.equal(
    subprocessArgs.filter((args) => args.join(' ').includes('r0-1-smoke:delete-signup')).length,
    0,
  )
  assert.equal(state.signups.length, 1)
  for (const args of subprocessArgs) {
    assert.doesNotMatch(args.join(' '), /Alice/i)
    assert.doesNotMatch(args.join(' '), /alice@fixture\.invalid/i)
  }
})

test('controlled CLI never sends an untrusted response ID to D1 cleanup', async (t) => {
  const cases = [
    ['synthetic email', SYNTHETIC_IDENTITY.email],
    ['synthetic name', SYNTHETIC_IDENTITY.name],
    ['mismatched UUID v4', SIGNUP_IDS.mismatch],
  ]

  for (const [name, responseSignupId] of cases) {
    await t.test(name, async (subtest) => {
      const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-untrusted-id-test-'))
      subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }))
      const inputPath = join(fixtureRoot, 'controlled-input.json')
      await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
      const state = {
        signups: [],
        preMigrationEmailAggregate: [{
          campaign_version: 'legacy-v0',
          status: 'pending',
          row_count: 210,
        }],
      }
      const subprocessArgs = []
      const subprocessAdapter = d1SubprocessFixture({
        state,
        identity: SYNTHETIC_IDENTITY,
        subprocessArgs,
      })
      const lines = []

      const exitCode = await main(
        ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
        {
          env: { R0_1_SMOKE_INPUT_FILE: inputPath },
          subprocessAdapter,
          fetchAdapter: async () => {
            state.signups.push({ id: SIGNUP_IDS.validatedD1, ...SYNTHETIC_IDENTITY })
            return response(JSON.stringify({
              success: true,
              message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
              signup_id: responseSignupId,
            }), { status: 200, headers: { 'content-type': 'application/json' } })
          },
          writeLine: (line) => lines.push(line),
        },
      )

      assert.equal(exitCode, 1)
      assert.equal(JSON.parse(lines[0]).code, 'SMOKE_SIGNUP_RESPONSE_CONTRACT')
      assert.equal(
        subprocessArgs.filter((args) => args.join(' ').includes('r0-1-smoke:delete-signup')).length,
        0,
      )
      assert.equal(state.signups.length, 1)
      for (const args of subprocessArgs) {
        assert.doesNotMatch(args.join(' '), new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
        assert.doesNotMatch(args.join(' '), new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
      }
    })
  }
})

test('controlled CLI never places an apostrophe name or email in a D1 command', async (t) => {
  const identity = { synthetic: true, name: "Ada O'Brien", email: 'ada-obrien@fixture.invalid' }
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-apostrophe-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(identity), { mode: 0o600 })
  const unrelated = { id: SIGNUP_IDS.unrelated, name: 'Other Fixture', email: 'other@fixture.test' }
  const state = {
    signups: [unrelated],
    preMigrationEmailAggregate: [{
      campaign_version: 'legacy-v0',
      status: 'pending',
      row_count: 210,
    }],
  }
  const subprocessArgs = []
  let identityFreeStatements = 0
  const subprocessAdapter = d1SubprocessFixture({
    state,
    identity,
    subprocessArgs,
    inspectSql(sql) {
      if (!sql.includes('r0-1-smoke:find-signup') && !sql.includes('r0-1-smoke:delete-signup')) return
      identityFreeStatements += 1
      assert.doesNotMatch(sql, /Ada O'Brien/)
      assert.doesNotMatch(sql, /ada-obrien@fixture\.invalid/i)
    },
  })
  const lines = []

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      tempRoot: fixtureRoot,
      subprocessAdapter,
      fetchAdapter: async () => {
        state.signups.push({ id: SIGNUP_IDS.apostrophe, ...identity })
        return response(JSON.stringify({
          success: true,
          message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
          signup_id: SIGNUP_IDS.apostrophe,
        }), { status: 200, headers: { 'content-type': 'application/json' } })
      },
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 0)
  assert.equal(subprocessArgs.length, 7)
  assert.equal(identityFreeStatements, 4)
  assert.deepEqual(state.signups, [unrelated])
  assert.doesNotMatch(lines[0], new RegExp(identity.name, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(identity.email, 'i'))
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
        ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
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

test('controlled CLI fails before POST when the command-mode Wrangler invocation fails', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-cleanup-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  const lines = []

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      subprocessAdapter: async ({ args }) => {
        assert.equal(args.includes('--file'), false)
        assert.equal(args.includes('--command'), false)
        assert.equal(args.some((argument) => argument.startsWith('--command=')), true)
        throw new Error('synthetic Wrangler failure')
      },
      fetchAdapter: async () => {
        throw new Error('must not fetch')
      },
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 1)
  assert.deepEqual(JSON.parse(lines[0]), {
    pass: false,
    mode: 'controlled-signup',
    code: 'SMOKE_DATABASE_COMMAND_FAILED',
    phase: 'find-synthetic-signup',
    classification: 'D1_UNKNOWN',
  })
})

test('controlled CLI binds a leading SQL comment inside the Wrangler command argument', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-command-argument-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  const lines = []

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      subprocessAdapter: async ({ args }) => {
        assert.equal(args.includes('--command'), false)
        const commandArgument = args.find((argument) => argument.startsWith('--command='))
        assert.match(commandArgument, /^--command=-- r0-1-smoke:find-signup\n/)
        return {
          exitCode: 0,
          stdout: JSON.stringify([{ success: true, results: [{ id: SIGNUP_IDS.primary }] }]),
          stderr: '',
        }
      },
      fetchAdapter: async () => { throw new Error('must not fetch') },
      writeLine: (line) => lines.push(line),
    },
  )

  assert.equal(exitCode, 1)
  assert.equal(JSON.parse(lines[0]).code, 'SMOKE_SYNTHETIC_PREEXISTS')
})

test('native Wrangler failure reports only the D1 phase and stable redacted classification', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-native-failure-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const binRoot = join(fixtureRoot, 'node_modules', '.bin')
  const executable = join(binRoot, 'wrangler')
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await mkdir(binRoot, { recursive: true })
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  await writeFile(executable, `#!/usr/bin/env node
process.stdout.write('partial stdout for private resource 11111111-1111-4111-8111-111111111111')
process.stderr.write('Authentication error for ${SYNTHETIC_IDENTITY.email}; Authorization: Bearer fixture-sensitive-token; /Users/private/account/config.toml')
process.exit(1)
`, { mode: 0o700 })
  const lines = []
  let fetchCalls = 0

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      projectRoot: fixtureRoot,
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
    code: 'SMOKE_DATABASE_COMMAND_FAILED',
    phase: 'find-synthetic-signup',
    classification: 'D1_AUTH_OR_PERMISSION',
  })
  assert.doesNotMatch(lines[0], /fixture-sensitive-token|fixture\.invalid|11111111|\/Users\/private/i)
})

test('native subprocess diagnostics cap stdout and stderr independently', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-native-bounds-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const exactExecutable = join(fixtureRoot, 'exact-output')
  const overflowExecutable = join(fixtureRoot, 'overflow-output')
  await writeFile(exactExecutable, `#!/usr/bin/env node
process.stdout.write('o'.repeat(64 * 1024))
process.stderr.write('e'.repeat(64 * 1024))
process.exitCode = 1
`, { mode: 0o700 })
  await writeFile(overflowExecutable, `#!/usr/bin/env node
process.stdout.write('o'.repeat((64 * 1024) + 1))
process.stderr.write('e'.repeat((64 * 1024) + 1))
process.exitCode = 1
`, { mode: 0o700 })

  const exact = await nativeSubprocessAdapter({
    executable: exactExecutable,
    args: [],
    cwd: fixtureRoot,
    timeoutMs: 5_000,
    maxOutputBytes: 64 * 1024,
  })
  const overflow = await nativeSubprocessAdapter({
    executable: overflowExecutable,
    args: [],
    cwd: fixtureRoot,
    timeoutMs: 5_000,
    maxOutputBytes: 64 * 1024,
  })

  assert.equal(exact.exitCode, 1)
  assert.equal(Buffer.byteLength(exact.stdout, 'utf8'), 64 * 1024)
  assert.equal(Buffer.byteLength(exact.stderr, 'utf8'), 64 * 1024)
  assert.equal(exact.outputTruncated, false)
  assert.equal(overflow.exitCode, 1)
  assert.ok(Buffer.byteLength(overflow.stdout, 'utf8') <= 64 * 1024)
  assert.ok(Buffer.byteLength(overflow.stderr, 'utf8') <= 64 * 1024)
  assert.equal(overflow.outputTruncated || overflow.failureCode === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER', true)
})

test('D1 command failures use only evidence-backed stable classifications', async (t) => {
  const cases = [
    ['auth', 'Authentication error [code: 10000]', 'D1_AUTH_OR_PERMISSION'],
    ['config', 'Could not read config file at /Users/private/config.toml', 'D1_CONFIG_OR_RESOURCE'],
    ['database', 'D1 database 11111111-1111-4111-8111-111111111111 not found', 'D1_DATABASE_NOT_FOUND'],
    ['schema', 'D1_ERROR: no such column: audience_state', 'D1_SCHEMA_MISMATCH'],
    ['sql', 'SQLITE_ERROR: syntax error near statement', 'D1_SQL_REJECTED'],
    ['network', 'Network error: connection reset', 'D1_NETWORK_OR_TIMEOUT'],
    ['unknown', 'unexpected provider failure', 'D1_UNKNOWN'],
  ]

  for (const [name, stderr, classification] of cases) {
    await t.test(name, async (subtest) => {
      const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-classification-test-'))
      subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }))
      const inputPath = join(fixtureRoot, 'controlled-input.json')
      await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
      const lines = []
      const exitCode = await main(
        ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
        {
          env: { R0_1_SMOKE_INPUT_FILE: inputPath },
          subprocessAdapter: async () => ({ exitCode: 1, stdout: '', stderr }),
          fetchAdapter: async () => { throw new Error('must not fetch') },
          writeLine: (line) => lines.push(line),
        },
      )
      assert.equal(exitCode, 1)
      assert.deepEqual(JSON.parse(lines[0]), {
        pass: false,
        mode: 'controlled-signup',
        code: 'SMOKE_DATABASE_COMMAND_FAILED',
        phase: 'find-synthetic-signup',
        classification,
      })
      assert.doesNotMatch(lines[0], /audience_state|provider failure|\/Users\/private|11111111/i)
    })
  }
})

test('parsed D1 row contract failures retain their command phase', async (t) => {
  const cases = [
    ['find row type', 'find-synthetic-signup', 'find-synthetic-signup'],
    ['snapshot row cardinality', 'pre-migration-snapshot', 'pre-migration-snapshot'],
    ['queue count type', 'count-queue-rows', 'count-queue-rows'],
    ['delete count type', 'delete-synthetic-signup', 'delete-synthetic-signup'],
  ]

  for (const [name, malformedPhase, expectedPhase] of cases) {
    await t.test(name, async (subtest) => {
      const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-row-contract-test-'))
      subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }))
      const inputPath = join(fixtureRoot, 'controlled-input.json')
      await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
      let findCalls = 0
      const lines = []
      const subprocessAdapter = async ({ args }) => {
        const sql = args.find((argument) => argument.startsWith('--command='))
          .slice('--command='.length)
        if (sql.includes('r0-1-smoke:find-signup')) {
          findCalls += 1
          const results = malformedPhase === 'find-synthetic-signup'
            ? [{ id: 'not-an-opaque-id' }]
            : findCalls === 1 ? [] : findCalls === 2 ? [{ id: SIGNUP_IDS.primary }] : []
          return { exitCode: 0, stdout: JSON.stringify([{ success: true, results }]), stderr: '' }
        }
        if (sql.includes('r0-1-smoke:pre-migration-snapshot')) {
          const signupRows = malformedPhase === 'pre-migration-snapshot'
            ? []
            : [{ challenge_signup_count: 0 }]
          return {
            exitCode: 0,
            stdout: JSON.stringify([
              { success: true, results: signupRows },
              { success: true, results: [{ campaign_version: 'legacy-v0', status: 'pending', row_count: 210 }] },
            ]),
            stderr: '',
          }
        }
        if (sql.includes('r0-1-smoke:count-queue')) {
          const queueCount = malformedPhase === 'count-queue-rows' ? '0' : 0
          return { exitCode: 0, stdout: JSON.stringify([{ success: true, results: [{ queue_count: queueCount }] }]), stderr: '' }
        }
        if (sql.includes('r0-1-smoke:delete-signup')) {
          const deletedCount = malformedPhase === 'delete-synthetic-signup' ? '1' : 1
          return { exitCode: 0, stdout: JSON.stringify([{ success: true, results: [{ deleted_count: deletedCount }] }]), stderr: '' }
        }
        throw new Error('unexpected SQL')
      }

      const exitCode = await main(
        ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
        {
          env: { R0_1_SMOKE_INPUT_FILE: inputPath },
          subprocessAdapter,
          fetchAdapter: async () => response(JSON.stringify({
            success: true,
            message: BRAIN2_SIGNUP_SUCCESS_MESSAGE,
            signup_id: SIGNUP_IDS.primary,
          }), { status: 200, headers: { 'content-type': 'application/json' } }),
          writeLine: (line) => lines.push(line),
        },
      )

      assert.equal(exitCode, 1)
      assert.deepEqual(JSON.parse(lines[0]), {
        pass: false,
        mode: 'controlled-signup',
        code: 'SMOKE_DATABASE_CONTRACT',
        phase: expectedPhase,
        classification: 'D1_OUTPUT_CONTRACT',
      })
    })
  }
})

test('controlled CLI rejects invalid JSON returned by command-mode Wrangler', async (t) => {
  const cases = [
    ['malformed', '{not-json'],
    ['oversized', 'x'.repeat((64 * 1024) + 1)],
    ['wrong cardinality', JSON.stringify([{ success: true, results: [] }])],
  ]

  for (const [name, stdout] of cases) {
    await t.test(name, async (subtest) => {
      const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-json-test-'))
      subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }))
      const inputPath = join(fixtureRoot, 'controlled-input.json')
      await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
      const lines = []
      let fetchCalls = 0

      const exitCode = await main(
        ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
        {
          env: { R0_1_SMOKE_INPUT_FILE: inputPath },
          subprocessAdapter: async ({ args }) => {
            assert.equal(args.includes('--file'), false)
            assert.equal(args.includes('--command'), false)
            assert.equal(args.some((argument) => argument.startsWith('--command=')), true)
            return { exitCode: 0, stdout, stderr: '' }
          },
          fetchAdapter: async () => {
            fetchCalls += 1
            throw new Error('must not fetch')
          },
          writeLine: (line) => lines.push(line),
        },
      )

      assert.equal(exitCode, 1)
      assert.equal(fetchCalls, 0)
      assert.equal(JSON.parse(lines[0]).code, 'SMOKE_DATABASE_CONTRACT')
      assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
      assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
    })
  }
})

test('controlled CLI rejects a standalone unsuccessful Wrangler result set with valid cardinality', async (t) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'r0-1-smoke-unsuccessful-test-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))
  const inputPath = join(fixtureRoot, 'controlled-input.json')
  await writeFile(inputPath, JSON.stringify(SYNTHETIC_IDENTITY), { mode: 0o600 })
  const lines = []
  let fetchCalls = 0

  const exitCode = await main(
    ['--origin', PRODUCTION_ORIGIN, '--controlled-signup'],
    {
      env: { R0_1_SMOKE_INPUT_FILE: inputPath },
      tempRoot: fixtureRoot,
      subprocessAdapter: async () => ({
        exitCode: 0,
        stdout: '[{"success":false,"results":[]}]',
        stderr: '',
      }),
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
    code: 'SMOKE_DATABASE_CONTRACT',
    phase: 'find-synthetic-signup',
    classification: 'D1_OUTPUT_CONTRACT',
  })
})

test('controlled CLI response failure prints only its stable classification', async () => {
  const fixture = controlledSignupFixture({
    responseBody: JSON.stringify({
      success: false,
      message: `private body for ${SYNTHETIC_IDENTITY.name}`,
      signup_id: SIGNUP_IDS.private,
      email: SYNTHETIC_IDENTITY.email,
    }),
  })
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

  assert.equal(exitCode, 1)
  assert.deepEqual(JSON.parse(lines[0]), {
    pass: false,
    mode: 'controlled-signup',
    code: 'SMOKE_SIGNUP_RESPONSE_CONTRACT',
  })
  assert.doesNotMatch(lines[0], new RegExp(`private body|${SIGNUP_IDS.private}|${SIGNUP_IDS.primary}`, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.name, 'i'))
  assert.doesNotMatch(lines[0], new RegExp(SYNTHETIC_IDENTITY.email, 'i'))
  assert.equal(fixture.state.signups.length, 1)
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
