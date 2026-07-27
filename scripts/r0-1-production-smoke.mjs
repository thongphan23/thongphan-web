import { execFile } from 'node:child_process'
import { constants as fsConstants } from 'node:fs'
import { lstat, open } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const READING_PATH = '/library/read/steve-jobs-2005-stanford-commencement-address'
const BRAIN2_CHALLENGE_SLUG = 'brain2-21-ngay'
const CONTROLLED_PRODUCTION_ORIGIN = 'https://thongphan.com'
export const CONTROLLED_SIGNUP_SUCCESS_MESSAGE = 'Đã ghi nhận đăng ký. Email tự động hiện chưa được kích hoạt; bạn có thể bắt đầu Ngày 01 ngay trên website.'

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
const MAX_PRE_MIGRATION_AGGREGATE_ROWS = 64
const MAX_PRE_MIGRATION_AGGREGATE_BYTES = 16 * 1024
const MAX_SECURE_INPUT_BYTES = 4 * 1024
const MAX_D1_OUTPUT_BYTES = 64 * 1024
const D1_TIMEOUT_MS = 30_000
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/u
const CANONICAL_UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u

class SmokeError extends Error {
  constructor(code) {
    super(code)
    this.name = 'SmokeError'
    this.code = code
  }
}

function validCanonicalSignupId(value) {
  return typeof value === 'string' && CANONICAL_UUID_V4.test(value)
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

async function inspectControlledSignupResponse(response, maxResponseBytes) {
  let body
  let bodyInvalid = false
  try {
    body = await readBoundedBody(response, maxResponseBytes)
  } catch {
    bodyInvalid = true
  }
  let parsed
  if (!bodyInvalid) {
    try {
      parsed = JSON.parse(body)
    } catch {}
  }
  const signupId = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    && validCanonicalSignupId(parsed.signup_id)
    ? parsed.signup_id
    : null
  if (response.status !== 200) {
    return { signupId, error: new SmokeError('SMOKE_SIGNUP_HTTP_CONTRACT') }
  }
  const mediaType = response.headers.get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase()
  if (bodyInvalid || mediaType !== 'application/json' || !parsed || typeof parsed !== 'object' || Array.isArray(parsed)
    || Object.getPrototypeOf(parsed) !== Object.prototype
    || parsed.success !== true
    || parsed.message !== CONTROLLED_SIGNUP_SUCCESS_MESSAGE
    || signupId === null) {
    return { signupId, error: new SmokeError('SMOKE_SIGNUP_RESPONSE_CONTRACT') }
  }
  return { signupId, error: null }
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

function validSyntheticIdentity(syntheticIdentity) {
  return syntheticIdentity?.synthetic === true
    && typeof syntheticIdentity.name === 'string'
    && syntheticIdentity.name === syntheticIdentity.name.trim()
    && syntheticIdentity.name.length >= 2
    && syntheticIdentity.name.length <= 100
    && !CONTROL_CHARACTERS.test(syntheticIdentity.name)
    && typeof syntheticIdentity.email === 'string'
    && syntheticIdentity.email === syntheticIdentity.email.trim().toLowerCase()
    && syntheticIdentity.email.length <= 254
    && !CONTROL_CHARACTERS.test(syntheticIdentity.email)
    && /^[^\s@]+@[^\s@]+\.invalid$/i.test(syntheticIdentity.email)
}

function assertControlledInputs(databaseAdapter, syntheticIdentity) {
  const validIdentity = validSyntheticIdentity(syntheticIdentity)
  const validAdapter = databaseAdapter
    && typeof databaseAdapter.snapshotPreMigrationInvariants === 'function'
    && typeof databaseAdapter.findSyntheticSignup === 'function'
    && typeof databaseAdapter.countQueueRows === 'function'
    && typeof databaseAdapter.deleteSyntheticSignup === 'function'
  if (!validIdentity || !validAdapter) throw new SmokeError('SMOKE_CONTROLLED_INPUT_REQUIRED')
}

function assertPreMigrationSnapshot(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  const { challengeSignupCount, preMigrationEmailAggregate } = value
  if (!Number.isSafeInteger(challengeSignupCount) || challengeSignupCount < 0) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  if (!Array.isArray(preMigrationEmailAggregate)
    || preMigrationEmailAggregate.length > MAX_PRE_MIGRATION_AGGREGATE_ROWS) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  for (const row of preMigrationEmailAggregate) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new SmokeError('SMOKE_DATABASE_CONTRACT')
    }
    if (Object.keys(row).sort().join(',') !== 'campaign_version,row_count,status'
      || typeof row.campaign_version !== 'string' || row.campaign_version.length > 64
      || typeof row.status !== 'string' || row.status.length > 64
      || !Number.isSafeInteger(row.row_count) || row.row_count < 0) {
      throw new SmokeError('SMOKE_DATABASE_CONTRACT')
    }
  }
  const preMigrationBytes = JSON.stringify(preMigrationEmailAggregate)
  if (Buffer.byteLength(preMigrationBytes, 'utf8') > MAX_PRE_MIGRATION_AGGREGATE_BYTES) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  return { challengeSignupCount, preMigrationBytes }
}

function assertSignupRows(rows) {
  if (!Array.isArray(rows) || rows.some((row) => (
    !row || !validCanonicalSignupId(row.id)
  ))) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  return rows
}

async function readSecureControlledIdentity(env) {
  const inputPath = env?.R0_1_SMOKE_INPUT_FILE
  if (typeof inputPath !== 'string' || !isAbsolute(inputPath) || inputPath.length > 4096) {
    throw new SmokeError('SMOKE_SECURE_INPUT_REQUIRED')
  }

  let pathStat
  try {
    pathStat = await lstat(inputPath)
  } catch {
    throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
  }
  if (!pathStat.isFile() || pathStat.isSymbolicLink()) {
    throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
  }

  let handle
  try {
    handle = await open(inputPath, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW)
    const openedStat = await handle.stat()
    const currentUid = typeof process.getuid === 'function' ? process.getuid() : null
    if (!openedStat.isFile()
      || openedStat.dev !== pathStat.dev || openedStat.ino !== pathStat.ino
      || (currentUid !== null && openedStat.uid !== currentUid)
      || (openedStat.mode & 0o077) !== 0
      || (openedStat.mode & 0o400) === 0
      || (openedStat.mode & 0o111) !== 0
      || openedStat.size < 2 || openedStat.size > MAX_SECURE_INPUT_BYTES) {
      throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
    }
    const bytes = await handle.readFile()
    if (bytes.byteLength > MAX_SECURE_INPUT_BYTES) throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
    let identity
    try {
      identity = JSON.parse(bytes.toString('utf8'))
    } catch {
      throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
    }
    if (!identity || typeof identity !== 'object' || Array.isArray(identity)
      || Object.keys(identity).sort().join(',') !== 'email,name,synthetic'
      || !validSyntheticIdentity(identity)) {
      throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
    }
    return identity
  } catch (error) {
    if (error instanceof SmokeError) throw error
    throw new SmokeError('SMOKE_SECURE_INPUT_INVALID')
  } finally {
    await handle?.close()
  }
}

function nativeSubprocessAdapter({ executable, args, cwd, timeoutMs, maxOutputBytes }) {
  return new Promise((resolveResult) => {
    execFile(executable, args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: maxOutputBytes,
      timeout: timeoutMs,
      windowsHide: true,
    }, (error, stdout) => {
      resolveResult({
        exitCode: error ? 1 : 0,
        stdout: error ? '' : stdout,
        stderr: '',
      })
    })
  })
}

function sqlLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`
}

function parseWranglerResults(stdout, expectedSets) {
  if (typeof stdout !== 'string' || Buffer.byteLength(stdout, 'utf8') > MAX_D1_OUTPUT_BYTES) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  let parsed
  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  if (!Array.isArray(parsed) || parsed.length !== expectedSets
    || parsed.some((entry) => !entry || entry.success !== true || !Array.isArray(entry.results))) {
    throw new SmokeError('SMOKE_DATABASE_CONTRACT')
  }
  return parsed.map((entry) => entry.results)
}

function createWranglerD1Adapter({
  subprocessAdapter = nativeSubprocessAdapter,
  projectRoot = PROJECT_ROOT,
} = {}) {
  const executable = resolve(projectRoot, 'node_modules/.bin/wrangler')
  const configPath = resolve(projectRoot, 'wrangler.signup.toml')

  const executeSql = async (sql, expectedSets) => {
    try {
      const result = await subprocessAdapter({
        executable,
        args: [
          'd1', 'execute', 'thongphan-db',
          '--remote',
          '--command', sql,
          '--config', configPath,
          '--json',
          '--yes',
        ],
        cwd: projectRoot,
        timeoutMs: D1_TIMEOUT_MS,
        maxOutputBytes: MAX_D1_OUTPUT_BYTES,
      })
      if (!result || result.exitCode !== 0) throw new SmokeError('SMOKE_DATABASE_COMMAND_FAILED')
      return parseWranglerResults(result.stdout, expectedSets)
    } catch (error) {
      if (error instanceof SmokeError) throw error
      throw new SmokeError('SMOKE_DATABASE_COMMAND_FAILED')
    }
  }

  return {
    async snapshotPreMigrationInvariants() {
      const [signupRows, preMigrationRows] = await executeSql(`-- r0-1-smoke:pre-migration-snapshot
SELECT COUNT(*) AS challenge_signup_count FROM challenge_signups;
SELECT campaign_version, status, COUNT(*) AS row_count
FROM email_queue
WHERE campaign_version = 'legacy-v0'
GROUP BY campaign_version, status
ORDER BY campaign_version, status;
`, 2)
      if (signupRows.length !== 1) throw new SmokeError('SMOKE_DATABASE_CONTRACT')
      return {
        challengeSignupCount: signupRows[0].challenge_signup_count,
        preMigrationEmailAggregate: preMigrationRows,
      }
    },
    async findSyntheticSignup() {
      const [rows] = await executeSql(`-- r0-1-smoke:find-signup
SELECT s.id
FROM challenge_signups AS s
JOIN challenges AS c ON c.id = s.challenge_id
WHERE c.slug = ${sqlLiteral(BRAIN2_CHALLENGE_SLUG)}
  AND lower(s.email) LIKE '%.invalid'
ORDER BY s.id;
`, 1)
      return rows
    },
    async countQueueRows({ signupId }) {
      const [rows] = await executeSql(`-- r0-1-smoke:count-queue
SELECT COUNT(*) AS queue_count
FROM email_queue
WHERE signup_id = ${sqlLiteral(signupId)};
`, 1)
      if (rows.length !== 1) throw new SmokeError('SMOKE_DATABASE_CONTRACT')
      return rows[0].queue_count
    },
    async deleteSyntheticSignup({ signupId }) {
      const [rows] = await executeSql(`-- r0-1-smoke:delete-signup
DELETE FROM challenge_signups
WHERE id = ${sqlLiteral(signupId)}
  AND lower(email) LIKE '%.invalid'
  AND challenge_id = (SELECT id FROM challenges WHERE slug = ${sqlLiteral(BRAIN2_CHALLENGE_SLUG)})
RETURNING 1 AS deleted_count;
`, 1)
      if (rows.length !== 1) throw new SmokeError('SMOKE_DATABASE_CONTRACT')
      return rows[0].deleted_count
    },
  }
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
  const snapshotPreMigrationInvariants = async () => {
    databaseCalls += 1
    return assertPreMigrationSnapshot(await databaseAdapter.snapshotPreMigrationInvariants())
  }
  const findSignup = async () => {
    databaseCalls += 1
    return assertSignupRows(await databaseAdapter.findSyntheticSignup())
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
    })
    if (!Number.isSafeInteger(count) || count < 0) throw new SmokeError('SMOKE_DATABASE_CONTRACT')
    return count
  }

  const rowsBefore = await findSignup()
  if (rowsBefore.length !== 0) throw new SmokeError('SMOKE_SYNTHETIC_PREEXISTS')
  const preMigrationBefore = await snapshotPreMigrationInvariants()

  let postRequests = 0
  let status = 0
  let createdRows = []
  let queueRows = 0
  let removedRows = 0
  let remainingRows = []
  let preMigrationAfter = null
  let pendingError = null
  let signupResponse = null
  let cleanupSignupId = null
  try {
    postRequests = 1
    const response = await fetchWithTimeout(
      fetchAdapter,
      new URL('/api/signup', parsedOrigin),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Origin: parsedOrigin.origin,
        },
        body: JSON.stringify({
          challenge_slug: BRAIN2_CHALLENGE_SLUG,
          name: syntheticIdentity.name,
          email: syntheticIdentity.email,
        }),
      },
      timeoutMs,
    )
    status = response.status
    const signupInspection = await inspectControlledSignupResponse(response, maxResponseBytes)
    signupResponse = signupInspection.signupId ? { signupId: signupInspection.signupId } : null
    pendingError = signupInspection.error
    createdRows = await findSignup()
    if (createdRows.length !== 1) {
      pendingError ??= new SmokeError('SMOKE_SIGNUP_ROW_CONTRACT')
    } else {
      queueRows = await countQueueRows(createdRows[0].id)
      if (queueRows !== 0) pendingError ??= new SmokeError('SMOKE_QUEUE_CONTRACT')
      if (signupResponse && signupResponse.signupId !== createdRows[0].id) {
        pendingError ??= new SmokeError('SMOKE_SIGNUP_RESPONSE_CONTRACT')
      } else if (signupResponse) {
        cleanupSignupId = createdRows[0].id
      }
    }
  } catch (error) {
    pendingError ??= error instanceof SmokeError ? error : new SmokeError('SMOKE_CONTROLLED_FAILED')
  } finally {
    if (postRequests === 1 && createdRows.length === 0) {
      try {
        createdRows = await findSignup()
      } catch (error) {
        pendingError ??= error instanceof SmokeError ? error : new SmokeError('SMOKE_DATABASE_CONTRACT')
      }
    }
    if (cleanupSignupId) {
      try {
        const deleted = await deleteSignup(cleanupSignupId)
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
    if (postRequests === 1) {
      try {
        preMigrationAfter = await snapshotPreMigrationInvariants()
      } catch (error) {
        pendingError ??= error instanceof SmokeError ? error : new SmokeError('SMOKE_DATABASE_CONTRACT')
      }
    }
  }

  const signupTotalRestored = preMigrationAfter?.challengeSignupCount
    === preMigrationBefore.challengeSignupCount
  const preMigrationAggregateUnchanged = preMigrationAfter?.preMigrationBytes
    === preMigrationBefore.preMigrationBytes
  if (!signupTotalRestored || !preMigrationAggregateUnchanged) {
    pendingError ??= new SmokeError('SMOKE_GLOBAL_INVARIANT_DRIFT')
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
      signup_rows_total_before: preMigrationBefore.challengeSignupCount,
      signup_rows_total_after_cleanup: preMigrationAfter.challengeSignupCount,
      signup_rows_total_restored: signupTotalRestored,
      pre_migration_email_aggregate_unchanged: preMigrationAggregateUnchanged,
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
    let databaseAdapter = dependencies.databaseAdapter
    let syntheticIdentity = dependencies.syntheticIdentity
    if (parsed.mode === 'controlled-signup'
      && databaseAdapter === undefined && syntheticIdentity === undefined) {
      if (parsed.origin !== CONTROLLED_PRODUCTION_ORIGIN) {
        throw new SmokeError('SMOKE_CONTROLLED_ORIGIN_REQUIRED')
      }
      syntheticIdentity = await readSecureControlledIdentity(dependencies.env ?? process.env)
      databaseAdapter = createWranglerD1Adapter({
        subprocessAdapter: dependencies.subprocessAdapter,
        tempRoot: dependencies.tempRoot,
        projectRoot: dependencies.projectRoot,
      })
    }
    const result = await runProductionSmoke({
      ...parsed,
      fetchAdapter: dependencies.fetchAdapter ?? globalThis.fetch,
      databaseAdapter,
      syntheticIdentity,
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
