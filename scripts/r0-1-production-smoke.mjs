import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const READING_PATH = '/library/read/steve-jobs-2005-stanford-commencement-address'

const READ_ONLY_ROUTES = [
  '/api/embed',
  '/api/chat',
  '/chat',
  '/library',
  READING_PATH,
  '/sitemap.xml',
]

const DISABLED_BODY = '{"type":"about:blank","title":"Endpoint disabled","status":410}'
const CANONICAL_ROUTES = new Set(['/chat', '/library', READING_PATH])
const DEFAULT_LIMITS = Object.freeze({ timeoutMs: 5_000, maxResponseBytes: 256 * 1024 })

class SmokeError extends Error {
  constructor(code) {
    super(code)
    this.name = 'SmokeError'
    this.code = code
  }
}

async function readBoundedBody(response, maxResponseBytes) {
  const contentLength = response.headers.get('content-length')
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength)
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0 || declaredBytes > maxResponseBytes) {
      throw new SmokeError('SMOKE_RESPONSE_TOO_LARGE')
    }
  }
  if (!response.body) return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > maxResponseBytes) {
        await reader.cancel()
        throw new SmokeError('SMOKE_RESPONSE_TOO_LARGE')
      }
      text += decoder.decode(value, { stream: true })
    }
    return text + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}

async function verifyDisabledEndpoint(response, maxResponseBytes) {
  const matches = response.status === 410
    && response.headers.get('cache-control') === 'private, no-store, max-age=0'
    && response.headers.get('content-type') === 'application/problem+json; charset=utf-8'
    && response.headers.get('x-content-type-options') === 'nosniff'
    && response.headers.get('x-tp-endpoint-state') === 'disabled'
    && await readBoundedBody(response, maxResponseBytes) === DISABLED_BODY
  if (!matches) throw new SmokeError('SMOKE_HTTP_CONTRACT')
}

function readCanonicalHref(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2]
    if (!rel?.split(/\s+/).some((value) => value.toLowerCase() === 'canonical')) continue
    return tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] ?? null
  }
  return null
}

function smokeLimits(limits = DEFAULT_LIMITS) {
  const timeoutMs = limits.timeoutMs ?? DEFAULT_LIMITS.timeoutMs
  const maxResponseBytes = limits.maxResponseBytes ?? DEFAULT_LIMITS.maxResponseBytes
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    throw new SmokeError('SMOKE_INVALID_LIMITS')
  }
  if (!Number.isInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > 1024 * 1024) {
    throw new SmokeError('SMOKE_INVALID_LIMITS')
  }
  return { timeoutMs, maxResponseBytes }
}

async function fetchWithTimeout(fetchAdapter, url, init, timeoutMs) {
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    return await fetchAdapter(url, { ...init, signal })
  } catch {
    if (signal.aborted) throw new SmokeError('SMOKE_REQUEST_TIMEOUT')
    throw new SmokeError('SMOKE_REQUEST_FAILED')
  }
}

function assertControlledInputs(databaseAdapter, syntheticIdentity) {
  const validIdentity = syntheticIdentity?.synthetic === true
    && typeof syntheticIdentity.name === 'string'
    && syntheticIdentity.name.length > 0
    && syntheticIdentity.name.length <= 120
    && typeof syntheticIdentity.email === 'string'
    && /^[^\s@]+@[^\s@]+\.invalid$/i.test(syntheticIdentity.email)
  const validAdapter = databaseAdapter
    && typeof databaseAdapter.findSyntheticSignup === 'function'
    && typeof databaseAdapter.countQueueRows === 'function'
    && typeof databaseAdapter.deleteSyntheticSignup === 'function'
  if (!validIdentity || !validAdapter) throw new SmokeError('SMOKE_CONTROLLED_INPUT_REQUIRED')
}

function assertSignupRows(rows) {
  if (!Array.isArray(rows) || rows.some((row) => (
    !row || typeof row.id !== 'string' || row.id.length === 0
  ))) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  return rows
}

async function runControlledSignup({
  parsedOrigin,
  fetchAdapter,
  databaseAdapter,
  syntheticIdentity,
  timeoutMs,
  maxResponseBytes,
}) {
  assertControlledInputs(databaseAdapter, syntheticIdentity)
  let databaseCalls = 0
  const findSignup = async () => {
    databaseCalls += 1
    return assertSignupRows(await databaseAdapter.findSyntheticSignup(syntheticIdentity))
  }
  const countQueueRows = async (signupId) => {
    databaseCalls += 1
    const count = await databaseAdapter.countQueueRows({ signupId })
    if (!Number.isSafeInteger(count) || count < 0) throw new SmokeError('SMOKE_DATABASE_CONTRACT')
    return count
  }
  const deleteSignup = async (signupId) => {
    databaseCalls += 1
    const count = await databaseAdapter.deleteSyntheticSignup({
      signupId,
      identity: syntheticIdentity,
    })
    if (!Number.isSafeInteger(count) || count < 0) throw new SmokeError('SMOKE_DATABASE_CONTRACT')
    return count
  }

  const rowsBefore = await findSignup()
  if (rowsBefore.length !== 0) throw new SmokeError('SMOKE_SYNTHETIC_PREEXISTS')

  let postRequests = 0
  let status = 0
  let createdRows = []
  let queueRows = 0
  let removedRows = 0
  let remainingRows = []
  let pendingError = null
  try {
    postRequests = 1
    const response = await fetchWithTimeout(
      fetchAdapter,
      new URL('/api/signup', parsedOrigin),
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: syntheticIdentity.name,
          email: syntheticIdentity.email,
        }),
      },
      timeoutMs,
    )
    status = response.status
    await readBoundedBody(response, maxResponseBytes)
    createdRows = await findSignup()
    if (status !== 200) throw new SmokeError('SMOKE_SIGNUP_HTTP_CONTRACT')
    if (createdRows.length !== 1) throw new SmokeError('SMOKE_SIGNUP_ROW_CONTRACT')
    queueRows = await countQueueRows(createdRows[0].id)
    if (queueRows !== 0) throw new SmokeError('SMOKE_QUEUE_CONTRACT')
  } catch (error) {
    pendingError = error instanceof SmokeError ? error : new SmokeError('SMOKE_CONTROLLED_FAILED')
  } finally {
    if (postRequests === 1 && createdRows.length === 0) {
      try {
        createdRows = await findSignup()
      } catch (error) {
        pendingError ??= error instanceof SmokeError ? error : new SmokeError('SMOKE_DATABASE_CONTRACT')
      }
    }
    for (const row of createdRows) {
      try {
        const deleted = await deleteSignup(row.id)
        removedRows += deleted
        if (deleted !== 1) {
          pendingError ??= new SmokeError('SMOKE_TARGETED_CLEANUP_CONTRACT')
        }
      } catch (error) {
        pendingError ??= error instanceof SmokeError ? error : new SmokeError('SMOKE_DATABASE_CONTRACT')
      }
    }
    try {
      remainingRows = await findSignup()
    } catch (error) {
      pendingError ??= error instanceof SmokeError ? error : new SmokeError('SMOKE_DATABASE_CONTRACT')
    }
  }

  if (pendingError) throw pendingError
  if (removedRows !== 1 || remainingRows.length !== 0) {
    throw new SmokeError('SMOKE_TARGETED_CLEANUP_CONTRACT')
  }

  return {
    pass: true,
    mode: 'controlled-signup',
    routes: [{ route: '/api/signup', status, pass: true }],
    aggregate: {
      post_requests: postRequests,
      database_calls: databaseCalls,
      signup_rows_before: rowsBefore.length,
      signup_rows_created: createdRows.length,
      queue_rows: queueRows,
      signup_rows_removed: removedRows,
      signup_rows_remaining: remainingRows.length,
    },
  }
}

export async function runProductionSmoke({
  origin,
  mode = 'read-only',
  fetchAdapter = globalThis.fetch,
  databaseAdapter,
  syntheticIdentity,
  limits,
}) {
  if (mode !== 'read-only' && mode !== 'controlled-signup') {
    throw new SmokeError('SMOKE_MODE_INVALID')
  }
  const parsedOrigin = new URL(origin)
  if (parsedOrigin.protocol !== 'https:') throw new SmokeError('SMOKE_HTTPS_REQUIRED')
  const { timeoutMs, maxResponseBytes } = smokeLimits(limits)

  if (mode === 'controlled-signup') {
    return runControlledSignup({
      parsedOrigin,
      fetchAdapter,
      databaseAdapter,
      syntheticIdentity,
      timeoutMs,
      maxResponseBytes,
    })
  }

  const routeResults = []
  for (const route of READ_ONLY_ROUTES) {
    const response = await fetchWithTimeout(
      fetchAdapter,
      new URL(route, parsedOrigin),
      { method: 'GET' },
      timeoutMs,
    )
    if (route === '/api/embed' || route === '/api/chat') {
      await verifyDisabledEndpoint(response, maxResponseBytes)
    } else if (response.status !== 200) {
      throw new SmokeError('SMOKE_HTTP_CONTRACT')
    } else if (CANONICAL_ROUTES.has(route)) {
      const expectedCanonical = new URL(route, parsedOrigin).toString()
      if (readCanonicalHref(await readBoundedBody(response, maxResponseBytes)) !== expectedCanonical) {
        throw new SmokeError('SMOKE_CANONICAL_CONTRACT')
      }
    } else if (route === '/sitemap.xml') {
      const sitemap = await readBoundedBody(response, maxResponseBytes)
      for (const requiredRoute of CANONICAL_ROUTES) {
        const requiredUrl = new URL(requiredRoute, parsedOrigin).toString()
        if (!sitemap.includes(`<loc>${requiredUrl}</loc>`)) {
          throw new SmokeError('SMOKE_SITEMAP_CONTRACT')
        }
      }
    }
    routeResults.push({ route, status: response.status })
  }

  return {
    pass: true,
    mode,
    routes: routeResults,
    aggregate: {
      post_requests: 0,
      database_calls: 0,
    },
  }
}

function parseArgs(argv) {
  let origin = null
  let mode = 'read-only'
  let modeSeen = false
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--origin') {
      if (origin !== null || index + 1 >= argv.length) throw new SmokeError('SMOKE_ARGUMENTS_INVALID')
      origin = argv[index + 1]
      index += 1
    } else if (argument === '--read-only' || argument === '--controlled-signup') {
      if (modeSeen) throw new SmokeError('SMOKE_ARGUMENTS_INVALID')
      mode = argument.slice(2)
      modeSeen = true
    } else {
      throw new SmokeError('SMOKE_ARGUMENTS_INVALID')
    }
  }
  if (origin === null) throw new SmokeError('SMOKE_ARGUMENTS_INVALID')
  return { origin, mode }
}

export async function main(argv, dependencies = {}) {
  const writeLine = dependencies.writeLine ?? ((line) => console.log(line))
  let mode = 'none'
  try {
    const parsed = parseArgs(argv)
    mode = parsed.mode
    const result = await runProductionSmoke({
      ...parsed,
      fetchAdapter: dependencies.fetchAdapter ?? globalThis.fetch,
      databaseAdapter: dependencies.databaseAdapter,
      syntheticIdentity: dependencies.syntheticIdentity,
      limits: dependencies.limits,
    })
    writeLine(JSON.stringify(result))
    return 0
  } catch (error) {
    const code = error instanceof SmokeError ? error.code : 'SMOKE_FAILED'
    writeLine(JSON.stringify({ pass: false, mode, code }))
    return 1
  }
}

const isDirectInvocation = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isDirectInvocation) {
  process.exitCode = await main(process.argv.slice(2))
}
