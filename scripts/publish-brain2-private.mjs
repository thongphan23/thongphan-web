import { execFile as execFileCallback } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  PROTECTED_LESSON_FILENAMES,
  RELEASE_ID,
  assertExactDirectoryEntries,
  assertSafePrivateLessonFile,
  preparePrivateVersionRoot,
} from './migrate-brain2-lessons.mjs'
import { validateMigrationFiles } from './validate-brain2-lessons.mjs'

export { RELEASE_ID }

const execFile = promisify(execFileCallback)
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const WRANGLER_BIN = join(REPO_ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const MAX_PACKAGE_BYTES = 64 * 1024
const HEX_256 = /^[a-f0-9]{64}$/
const NAMESPACE_ID = /^[a-f0-9]{32}$/
const RELEASE_PREFIX = `brain2:21:${RELEASE_ID}:day:`

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

export function validateNamespaceId(value) {
  if (typeof value !== 'string' || !NAMESPACE_ID.test(value) || /^0+$/.test(value)) {
    throw new Error('A provisioned Brain2 KV namespace ID is required')
  }
  return value
}

function assertManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || manifest.releaseId !== RELEASE_ID || !Array.isArray(manifest.lessons)) {
    throw new Error('Brain2 manifest release is not immutable')
  }
  const protectedLessons = manifest.lessons.filter((lesson) => lesson?.access === 'conan-maker')
  if (protectedLessons.length !== 14) throw new Error('Brain2 manifest must expose exactly 14 protected descriptors')
  const seenDays = new Set()
  const seenKeys = new Set()
  for (const [index, lesson] of protectedLessons.entries()) {
    const day = index + 8
    const dayText = String(day).padStart(2, '0')
    if (
      lesson.day !== day ||
      lesson.slug !== `ngay-${dayText}` ||
      lesson.storageKey !== `${RELEASE_PREFIX}${dayText}` ||
      !HEX_256.test(lesson.contentSha256 ?? '') ||
      seenDays.has(lesson.day) ||
      seenKeys.has(lesson.storageKey)
    ) {
      throw new Error('Brain2 protected manifest descriptors are not canonical')
    }
    seenDays.add(lesson.day)
    seenKeys.add(lesson.storageKey)
  }
  return protectedLessons
}

async function assertLiveBinding(repoRoot, namespaceId) {
  let config
  try {
    config = JSON.parse(await readFile(join(repoRoot, 'wrangler.brain2-access.jsonc'), 'utf8'))
  } catch {
    throw new Error('Brain2 Worker config is unavailable or not strict JSONC')
  }
  const bindings = Array.isArray(config.kv_namespaces) ? config.kv_namespaces : []
  const matches = bindings.filter((binding) => binding?.binding === 'BRAIN2_CONTENT')
  if (matches.length !== 1 || matches[0].id !== namespaceId || /^0+$/.test(matches[0].id ?? '')) {
    throw new Error('Brain2 KV namespace does not match the provisioned Worker binding')
  }
}

export async function buildPublishPlan({
  repoRoot = REPO_ROOT,
  privateRoot,
  worktreeRoots,
  validateFiles = validateMigrationFiles,
} = {}) {
  const roots = await preparePrivateVersionRoot(privateRoot, { repoRoot, worktreeRoots })
  await assertExactDirectoryEntries(roots.versionRoot, PROTECTED_LESSON_FILENAMES, {
    scope: 'protected packages',
  })
  await validateFiles({ repoRoot, privateRoot: roots.privateRoot, worktreeRoots })

  let manifest
  try {
    manifest = JSON.parse(await readFile(join(repoRoot, 'content', 'brain2', 'manifest.json'), 'utf8'))
  } catch {
    throw new Error('Brain2 manifest is missing or invalid')
  }
  const protectedLessons = assertManifest(manifest)
  const entries = []
  for (const lesson of protectedLessons) {
    const file = join(roots.versionRoot, `${lesson.slug}.json`)
    await assertSafePrivateLessonFile(file, roots.versionRoot)
    const bytes = await readFile(file)
    if (bytes.byteLength > MAX_PACKAGE_BYTES) throw new Error('A protected package exceeds the Worker byte ceiling')
    let packageMeta
    try {
      packageMeta = JSON.parse(bytes.toString('utf8')).meta
    } catch {
      throw new Error('A protected package is not valid JSON')
    }
    if (
      packageMeta?.day !== lesson.day ||
      packageMeta?.slug !== lesson.slug ||
      packageMeta?.access !== 'conan-maker' ||
      packageMeta?.contentSha256 !== lesson.contentSha256
    ) {
      throw new Error('A protected package differs from its public manifest descriptor')
    }
    entries.push({
      day: lesson.day,
      key: lesson.storageKey,
      file,
      bytes,
      rawSha256: sha256(bytes),
    })
  }
  return { releaseId: RELEASE_ID, prefix: RELEASE_PREFIX, entries }
}

export function buildKvListArgs(namespaceId) {
  return ['kv', 'key', 'list', '--namespace-id', namespaceId, '--prefix', RELEASE_PREFIX, '--remote']
}

export function buildKvPutArgs(entry, namespaceId) {
  return ['kv', 'key', 'put', entry.key, '--path', entry.file, '--namespace-id', namespaceId, '--remote']
}

export function buildKvGetArgs(entry, namespaceId) {
  return ['kv', 'key', 'get', entry.key, '--namespace-id', namespaceId, '--remote']
}

async function defaultRunWrangler(args, { repoRoot = REPO_ROOT } = {}) {
  const { stdout } = await execFile(process.execPath, [WRANGLER_BIN, ...args], {
    cwd: repoRoot,
    encoding: null,
    maxBuffer: 2 * 1024 * 1024,
  })
  return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout ?? '')
}

const safeWranglerCall = async (runWrangler, args, operation) => {
  try {
    const output = await runWrangler(args)
    return Buffer.isBuffer(output) ? output : Buffer.from(output ?? '')
  } catch {
    throw new Error(`Wrangler ${operation} failed without exposing child output`)
  }
}

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))

export async function publishBrain2Private({
  repoRoot = REPO_ROOT,
  privateRoot,
  namespaceId,
  dryRun = false,
  worktreeRoots,
  validateFiles = validateMigrationFiles,
  runWrangler = (args) => defaultRunWrangler(args, { repoRoot }),
  log = console.log,
  verifyAttempts = 30,
  verifyDelayMs = 1_000,
  wait = sleep,
} = {}) {
  validateNamespaceId(namespaceId)
  if (!Number.isInteger(verifyAttempts) || verifyAttempts < 1 || verifyAttempts > 60) {
    throw new Error('Round-trip verification attempts are invalid')
  }
  const plan = await buildPublishPlan({ repoRoot, privateRoot, worktreeRoots, validateFiles })
  if (dryRun) {
    return plan.entries.map((entry) => {
      const result = { day: entry.day, key: entry.key, status: 'planned' }
      log(`day=${String(entry.day).padStart(2, '0')} key=${entry.key} status=planned`)
      return result
    })
  }

  await assertLiveBinding(repoRoot, namespaceId)
  const listed = await safeWranglerCall(runWrangler, buildKvListArgs(namespaceId), 'prefix preflight')
  let existing
  try {
    existing = JSON.parse(listed.toString('utf8'))
  } catch {
    throw new Error('Wrangler prefix preflight returned an invalid response')
  }
  if (!Array.isArray(existing) || existing.some((record) => typeof record?.name !== 'string')) {
    throw new Error('Wrangler prefix preflight returned an invalid key list')
  }
  if (existing.length > 0) throw new Error('The immutable Brain2 release prefix already contains keys')

  const report = []
  for (const entry of plan.entries) {
    await safeWranglerCall(runWrangler, buildKvPutArgs(entry, namespaceId), `put day ${entry.day}`)
    let verified = false
    for (let attempt = 1; attempt <= verifyAttempts; attempt += 1) {
      const remote = await safeWranglerCall(runWrangler, buildKvGetArgs(entry, namespaceId), `get day ${entry.day}`)
      if (remote.equals(entry.bytes) && sha256(remote) === entry.rawSha256) {
        verified = true
        break
      }
      if (attempt < verifyAttempts) await wait(verifyDelayMs)
    }
    if (!verified) throw new Error(`Brain2 round-trip verification failed for day ${entry.day}`)
    const result = { day: entry.day, key: entry.key, status: 'verified' }
    report.push(result)
    log(`day=${String(entry.day).padStart(2, '0')} key=${entry.key} status=verified`)
  }
  return report
}

async function runCli() {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--dry-run')) throw new Error('Unsupported publisher argument')
  await publishBrain2Private({
    privateRoot: process.env.BRAIN2_PRIVATE_CONTENT_DIR,
    namespaceId: process.env.BRAIN2_KV_NAMESPACE_ID,
    dryRun: args.includes('--dry-run'),
  })
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    await runCli()
  } catch {
    console.error('Brain2 private publish failed without exposing protected data')
    process.exitCode = 1
  }
}
