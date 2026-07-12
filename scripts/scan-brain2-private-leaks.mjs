import { execFile as execFileCallback } from 'node:child_process'
import { lstat, readFile, readdir } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { PROTECTED_LESSON_FILENAMES } from './migrate-brain2-lessons.mjs'
import {
  validateMigrationFiles,
  validatePrivatePackageDirectory,
} from './validate-brain2-lessons.mjs'

const execFile = promisify(execFileCallback)
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_WORKER_BUNDLE_DIR = '/tmp/brain2-worker-dry-run'
const KEYCHAIN_SERVICE = 'thongphan-brain2-access'
const KEYCHAIN_ACCOUNTS = ['access-code', 'session-secret']

const isWithin = (parent, candidate) => {
  const path = relative(parent, candidate)
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path))
}

const decodeEscapes = (value) => value
  .replace(/\\u\{([a-f0-9]{1,6})\}/giu, (_, hex) => {
    const codePoint = Number.parseInt(hex, 16)
    return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : ' '
  })
  .replace(/\\u([a-f0-9]{4})/giu, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
  .replace(/\\x([a-f0-9]{2})/giu, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
  .replace(/\\[nrt]/g, ' ')

const normalizedTokens = (value, { escaped = false } = {}) => {
  const input = escaped ? decodeEscapes(value) : value
  return input
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? []
}

const flattenRichText = (nodes) => {
  if (!Array.isArray(nodes)) return ''
  const output = []
  const visit = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'text' && typeof node.value === 'string') output.push(node.value)
    else if (node.type === 'break') output.push(' ')
    else if (Array.isArray(node.children)) node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return output.join(' ')
}

function privateDisplayUnits(lesson) {
  const units = []
  if (typeof lesson?.reason === 'string') units.push(lesson.reason)
  for (const block of Array.isArray(lesson?.blocks) ? lesson.blocks : []) {
    if (!block || typeof block !== 'object') continue
    if (block.kind === 'list' && Array.isArray(block.items)) {
      block.items.forEach((item) => units.push(flattenRichText(item)))
    } else if (block.kind === 'prompt') {
      units.push([block.label, block.text].filter((value) => typeof value === 'string').join(' '))
    } else if (block.kind === 'resources' && Array.isArray(block.items)) {
      block.items.forEach((item) => units.push(
        [item?.title, item?.note].filter((value) => typeof value === 'string').join(' '),
      ))
    } else {
      units.push([
        typeof block.heading === 'string' ? block.heading : '',
        typeof block.title === 'string' ? block.title : '',
        flattenRichText(block.children),
      ].join(' '))
    }
  }
  if (lesson?.deliverable && typeof lesson.deliverable === 'object') {
    units.push([
      typeof lesson.deliverable.title === 'string' ? lesson.deliverable.title : '',
      flattenRichText(lesson.deliverable.body),
    ].join(' '))
  }
  for (const item of Array.isArray(lesson?.checklist) ? lesson.checklist : []) {
    if (typeof item?.label === 'string') units.push(item.label)
  }
  return units.filter((unit) => typeof unit === 'string' && unit.trim())
}

export function buildPrivateFingerprintIndex(privateLessons) {
  const index = new Map()
  for (const record of privateLessons) {
    if (!Number.isInteger(record?.day) || !record?.lesson) throw new Error('Private fingerprint source is invalid')
    for (const unit of privateDisplayUnits(record.lesson)) {
      const tokens = normalizedTokens(unit)
      for (let offset = 0; offset <= tokens.length - 12; offset += 1) {
        const fingerprint = tokens.slice(offset, offset + 12).join(' ')
        const days = index.get(fingerprint) ?? new Set()
        days.add(record.day)
        index.set(fingerprint, days)
      }
    }
  }
  if (index.size === 0) throw new Error('Private fingerprint source produced no 12-token windows')
  return index
}

async function defaultGitFiles(repoRoot) {
  const { stdout } = await execFile(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  )
  return stdout.split('\0').filter(Boolean).map((file) => resolve(repoRoot, file))
}

const labelFor = (path, repoRoot, workerBundleDir) => {
  if (isWithin(repoRoot, path)) return relative(repoRoot, path) || '.'
  if (isWithin(workerBundleDir, path)) return join('worker-bundle', relative(workerBundleDir, path))
  return path
}

export async function collectScanTargets({
  repoRoot = REPO_ROOT,
  workerBundleDir = DEFAULT_WORKER_BUNDLE_DIR,
  gitFiles = defaultGitFiles,
} = {}) {
  const resolvedRepo = resolve(repoRoot)
  const resolvedWorker = resolve(workerBundleDir)
  const files = new Map()
  const symlinks = []

  const addFile = async (path) => {
    const resolved = resolve(path)
    let info
    try {
      info = await lstat(resolved)
    } catch {
      throw new Error('A required private-boundary scan file is missing')
    }
    const label = labelFor(resolved, resolvedRepo, resolvedWorker)
    if (info.isSymbolicLink()) {
      symlinks.push(label)
      return
    }
    if (!info.isFile()) throw new Error('A private-boundary scan target is not a regular file')
    files.set(resolved, { path: resolved, label })
  }

  const walk = async (root) => {
    let info
    try {
      info = await lstat(root)
    } catch {
      throw new Error('A required private-boundary artifact root is missing')
    }
    const label = labelFor(resolve(root), resolvedRepo, resolvedWorker)
    if (info.isSymbolicLink()) {
      symlinks.push(label)
      return
    }
    if (!info.isDirectory()) throw new Error('A private-boundary artifact root is not a directory')
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const child = join(root, entry.name)
      if (entry.isSymbolicLink()) symlinks.push(labelFor(resolve(child), resolvedRepo, resolvedWorker))
      else if (entry.isDirectory()) await walk(child)
      else if (entry.isFile()) await addFile(child)
      else throw new Error('A private-boundary artifact contains an unsupported entry')
    }
  }

  for (const file of await gitFiles(resolvedRepo)) await addFile(file)
  await walk(join(resolvedRepo, '.next', 'static'))
  await walk(join(resolvedRepo, 'out'))
  await walk(resolvedWorker)
  return { files: [...files.values()], symlinks: [...new Set(symlinks)].sort() }
}

export async function scanCandidateFiles({ files, fingerprintIndex, secretValues = [] }) {
  const safeSecrets = secretValues
    .filter((record) => typeof record?.value === 'string' && record.value.length > 0)
    .map((record) => ({ label: String(record.label ?? 'secret'), bytes: Buffer.from(record.value) }))
  const hits = []
  let scannedFiles = 0
  for (const candidate of files) {
    const path = typeof candidate === 'string' ? candidate : candidate.path
    const label = typeof candidate === 'string' ? candidate : candidate.label
    const bytes = await readFile(path)
    scannedFiles += 1
    const secretMatches = safeSecrets.filter((secret) => bytes.indexOf(secret.bytes) !== -1).length
    const days = new Set()
    let fingerprintMatches = 0
    if (bytes.indexOf(0) === -1) {
      const tokens = normalizedTokens(bytes.toString('utf8'), { escaped: true })
      for (let offset = 0; offset <= tokens.length - 12; offset += 1) {
        const matchedDays = fingerprintIndex.get(tokens.slice(offset, offset + 12).join(' '))
        if (!matchedDays) continue
        fingerprintMatches += 1
        matchedDays.forEach((day) => days.add(day))
      }
    }
    if (days.size > 0 || secretMatches > 0) {
      hits.push({
        file: label,
        protectedDays: [...days].sort((left, right) => left - right),
        fingerprintMatches,
        secretMatches,
      })
    }
  }
  return { scannedFiles, fingerprintCount: fingerprintIndex.size, hits }
}

export function formatLeakReport({
  scannedFiles,
  fingerprintCount,
  hits,
  symlinks = [],
  keychainSecretsScanned = 0,
}) {
  const lines = [
    `scannedFiles=${scannedFiles} fingerprints=${fingerprintCount} hitFiles=${hits.length} symlinks=${symlinks.length} keychainSecretsScanned=${keychainSecretsScanned}`,
  ]
  for (const hit of hits) {
    lines.push(
      `${hit.file} protectedDays=${hit.protectedDays.join(',') || 'none'} fingerprintMatches=${hit.fingerprintMatches} secretMatches=${hit.secretMatches}`,
    )
  }
  for (const path of symlinks) lines.push(`${path} unsafeSymlink=1`)
  return lines.join('\n')
}

async function defaultReadKeychainSecret(account) {
  try {
    const { stdout } = await execFile(
      'security',
      ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', account, '-w'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 },
    )
    return stdout.replace(/[\r\n]+$/u, '') || null
  } catch {
    return null
  }
}

export async function readKeychainSecrets({
  requireSecrets = false,
  readSecret = defaultReadKeychainSecret,
} = {}) {
  const secrets = []
  for (const account of KEYCHAIN_ACCOUNTS) {
    const value = await readSecret(account)
    if (typeof value === 'string' && value.length > 0) secrets.push({ label: account, value })
  }
  if (requireSecrets && secrets.length !== KEYCHAIN_ACCOUNTS.length) {
    throw new Error('The required Brain2 Keychain secrets are unavailable')
  }
  return secrets
}

async function loadPrivateLessons(privateRoot, { repoRoot = REPO_ROOT } = {}) {
  await validateMigrationFiles({ repoRoot, privateRoot })
  const roots = await validatePrivatePackageDirectory(privateRoot, { repoRoot })
  const records = []
  for (const name of PROTECTED_LESSON_FILENAMES) {
    const lesson = JSON.parse(await readFile(join(roots.versionRoot, name), 'utf8'))
    records.push({ day: lesson.meta.day, lesson })
  }
  return records
}

export async function scanBrain2PrivateLeaks({
  repoRoot = REPO_ROOT,
  privateRoot,
  workerBundleDir = process.env.BRAIN2_WORKER_BUNDLE_DIR || DEFAULT_WORKER_BUNDLE_DIR,
  requireKeychainSecrets = false,
  readSecret,
} = {}) {
  const privateLessons = await loadPrivateLessons(privateRoot, { repoRoot })
  const fingerprintIndex = buildPrivateFingerprintIndex(privateLessons)
  const targets = await collectScanTargets({ repoRoot, workerBundleDir })
  const secretValues = await readKeychainSecrets({ requireSecrets: requireKeychainSecrets, readSecret })
  const result = await scanCandidateFiles({ files: targets.files, fingerprintIndex, secretValues })
  return { ...result, symlinks: targets.symlinks, keychainSecretsScanned: secretValues.length }
}

async function runCli() {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--require-keychain-secrets')) {
    throw new Error('Unsupported private-boundary scanner argument')
  }
  const result = await scanBrain2PrivateLeaks({
    privateRoot: process.env.BRAIN2_PRIVATE_CONTENT_DIR,
    requireKeychainSecrets: args.includes('--require-keychain-secrets'),
  })
  console.log(formatLeakReport(result))
  if (result.hits.length > 0 || result.symlinks.length > 0) process.exitCode = 1
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    await runCli()
  } catch {
    console.error('Brain2 private boundary scan failed without exposing protected data')
    process.exitCode = 1
  }
}
