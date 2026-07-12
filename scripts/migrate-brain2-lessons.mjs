import { createHash } from 'node:crypto'
import { execFile as execFileCallback } from 'node:child_process'
import { constants as fsConstants } from 'node:fs'
import { chmod, lstat, mkdir, open, readFile, readdir, realpath, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'

import ts from 'typescript'

import {
  LESSON_EDITORIAL,
  MIGRATED_AT,
  RELEASE_ID,
  getLessonEditorial,
} from './brain2-editorial-metadata.mjs'
import {
  BANNED_OUTPUT_RULES,
  EDITORIAL_OMISSION_KEYS,
  buildManifest,
  contentSha256,
  deriveProtectedLessonBody,
  emptyEditorialCounts,
  isSafeLessonHref,
  retainedExternalHref,
  normalizeLessonHtml,
  sha256,
  stableJsonStringify,
} from './brain2-normalize.mjs'

const execFile = promisify(execFileCallback)
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')

export { LESSON_EDITORIAL, MIGRATED_AT, RELEASE_ID }
const fail = (sourceName, message) => {
  throw new Error(`${sourceName}: ${message}`)
}

const readLesson = (node, day, sourceName) => {
  if (!ts.isObjectLiteralExpression(node)) {
    fail(sourceName, `day ${day} must be an object literal`)
  }

  let title
  let content
  const seenFields = new Set()

  for (const field of node.properties) {
    if (ts.isSpreadAssignment(field)) {
      fail(sourceName, `day ${day} contains a spread field`)
    }
    if (!ts.isPropertyAssignment(field) || !ts.isIdentifier(field.name)) {
      fail(sourceName, `day ${day} fields must be plain property assignments`)
    }

    const fieldName = field.name.text
    if (fieldName !== 'title' && fieldName !== 'content') {
      fail(sourceName, `day ${day} contains unknown field ${fieldName}`)
    }
    if (seenFields.has(fieldName)) {
      fail(sourceName, `day ${day} contains duplicate field ${fieldName}`)
    }
    seenFields.add(fieldName)

    if (fieldName === 'title') {
      if (!ts.isStringLiteral(field.initializer)) {
        fail(sourceName, `day ${day} title must be a string literal`)
      }
      title = field.initializer.text
      continue
    }

    if (!ts.isNoSubstitutionTemplateLiteral(field.initializer)) {
      fail(sourceName, `day ${day} content must be a no-substitution template literal`)
    }
    content = field.initializer.text
  }

  if (title === undefined) fail(sourceName, `day ${day} is missing title`)
  if (content === undefined) fail(sourceName, `day ${day} is missing content`)
  return { day, title, content }
}

export function extractDayContent(sourceText, sourceName = '<memory>') {
  if (typeof sourceText !== 'string') fail(sourceName, 'source must be a string')

  const sourceFile = ts.createSourceFile(
    sourceName,
    sourceText,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.JS,
  )
  const diagnosticCount = sourceFile.parseDiagnostics.length
  if (diagnosticCount > 0) {
    fail(
      sourceName,
      `source contains ${diagnosticCount} TypeScript parse diagnostic${diagnosticCount === 1 ? '' : 's'}`,
    )
  }
  const declarations = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap(({ declarationList }) => declarationList.declarations)
    .filter(({ name }) => ts.isIdentifier(name) && name.text === 'DAY_CONTENT')

  if (declarations.length === 0) fail(sourceName, 'expected one top-level DAY_CONTENT declaration')
  if (declarations.length > 1) fail(sourceName, 'multiple top-level DAY_CONTENT declarations')

  const initializer = declarations[0].initializer
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    fail(sourceName, 'DAY_CONTENT must be an object literal')
  }
  if (initializer.properties.some(ts.isSpreadAssignment)) {
    fail(sourceName, 'DAY_CONTENT contains a spread property')
  }
  if (initializer.properties.length !== 21) {
    fail(sourceName, `DAY_CONTENT must contain exactly 21 lessons; found ${initializer.properties.length}`)
  }

  const entries = []
  const seenDays = new Set()
  for (const [index, property] of initializer.properties.entries()) {
    if (!ts.isPropertyAssignment(property)) {
      fail(sourceName, 'DAY_CONTENT members must be numeric property assignments')
    }
    if (ts.isComputedPropertyName(property.name)) {
      fail(sourceName, 'DAY_CONTENT does not allow computed day keys')
    }
    if (!ts.isNumericLiteral(property.name)) {
      fail(sourceName, 'DAY_CONTENT day keys must be numeric literals')
    }

    const day = Number(property.name.text)
    if (!Number.isInteger(day) || day < 1 || day > 21) {
      fail(sourceName, `DAY_CONTENT day ${property.name.text} is out of range 1..21`)
    }
    if (seenDays.has(day)) fail(sourceName, `DAY_CONTENT contains duplicate day ${day}`)
    seenDays.add(day)

    const expectedDay = index + 1
    if (day !== expectedDay) {
      fail(sourceName, `DAY_CONTENT lessons must be ordered 1..21; expected day ${expectedDay}, found ${day}`)
    }
    entries.push(readLesson(property.initializer, day, sourceName))
  }

  return entries
}

export function sourceFragmentSha256(entry) {
  return createHash('sha256')
    .update(`${entry.title}\n${entry.content}`, 'utf8')
    .digest('hex')
}

export {
  BANNED_OUTPUT_RULES,
  buildManifest,
  contentSha256,
  deriveProtectedLessonBody,
  isSafeLessonHref,
  retainedExternalHref,
  normalizeLessonHtml,
  stableJsonStringify,
}

const parseDuration = (entry, sourceName) => {
  const match = entry.content.match(/⏱(?:️)?\s*(\d{1,3})\s*[–—-]\s*(\d{1,3})\s*phút/i)
  if (!match) fail(sourceName, `day ${entry.day} is missing its source duration range`)
  const duration = { min: Number(match[1]), max: Number(match[2]) }
  if (duration.min < 10 || duration.max > 120 || duration.min > duration.max) {
    fail(sourceName, `day ${entry.day} duration is outside 10..120`)
  }
  return duration
}

const addCounts = (target, source) => {
  for (const [key, value] of Object.entries(source)) target[key] = (target[key] ?? 0) + value
}

export function migrateSourceText(sourceText, sourceName = '<memory>') {
  const entries = extractDayContent(sourceText, sourceName)
  const packages = []
  const stats = {
    sourceSha256: sha256(sourceText),
    copyDerivedPrompts: 0,
    sourceExternalLinks: 0,
    retainedExternalLinks: 0,
    unsafeLinksRemoved: 0,
  }
  const editorialCounts = emptyEditorialCounts()

  for (const entry of entries) {
    const reviewed = getLessonEditorial(entry.day)
    if (!reviewed || reviewed.day !== entry.day) fail(sourceName, `day ${entry.day} is missing reviewed metadata`)
    if (!new RegExp(`Ngày\\s*${entry.day}\\b`, 'i').test(entry.title)) {
      fail(sourceName, `day ${entry.day} source title does not match its reviewed row`)
    }
    const duration = parseDuration(entry, sourceName)
    if (
      duration.min !== reviewed.estimatedMinutes.min ||
      duration.max !== reviewed.estimatedMinutes.max
    ) {
      fail(sourceName, `day ${entry.day} source duration differs from reviewed metadata`)
    }

    const normalized = normalizeLessonHtml(entry.content, { day: entry.day, sourceName })
    addCounts(stats, normalized.inventory)
    addCounts(editorialCounts, normalized.editorialCounts)

    const slug = `ngay-${String(entry.day).padStart(2, '0')}`
    const protectedBody =
      entry.day > 7 ? deriveProtectedLessonBody(normalized.blocks, reviewed, slug) : null
    const body = {
      reason: protectedBody?.reason ?? reviewed.reason,
      blocks: normalized.blocks,
      deliverable: protectedBody?.deliverable ?? {
        title: reviewed.deliverable.title,
        body: [{ type: 'text', value: reviewed.deliverable.body }],
      },
      checklist: protectedBody?.checklist ?? reviewed.checklist.map((label, index) => ({
        id: `${slug}-check-${String(index + 1).padStart(2, '0')}`,
        label,
      })),
    }
    const meta = {
      schemaVersion: 1,
      day: entry.day,
      slug,
      week: Math.ceil(entry.day / 7),
      access: entry.day <= 7 ? 'public' : 'conan-maker',
      title: reviewed.title,
      promise: reviewed.promise,
      objective: reviewed.objective,
      estimatedMinutes: reviewed.estimatedMinutes,
      preview: reviewed.preview,
      sourceFragmentSha256: sourceFragmentSha256(entry),
      contentSha256: contentSha256(body),
      migratedAt: MIGRATED_AT,
      editorialState: 'reviewed',
    }
    packages.push({ meta, ...body })
  }

  if (stats.copyDerivedPrompts !== 41) {
    fail(sourceName, `copy-derived prompt count must be 41; found ${stats.copyDerivedPrompts}`)
  }
  if (stats.sourceExternalLinks !== 65) {
    fail(sourceName, `source external link count must be 65; found ${stats.sourceExternalLinks}`)
  }

  return {
    packages,
    stats,
    editorialCounts,
    manifest: buildManifest(packages, stats),
  }
}

const isWithin = (parent, candidate) => {
  const path = relative(parent, candidate)
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !path.startsWith(sep))
}

const realpathAllowMissing = async (candidate) => {
  const absolute = resolve(candidate)
  let ancestor = absolute
  const suffix = []
  while (true) {
    try {
      const realAncestor = await realpath(ancestor)
      return resolve(realAncestor, ...suffix.reverse())
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      const parent = dirname(ancestor)
      if (parent === ancestor) throw error
      suffix.push(ancestor.slice(parent.length + (parent.endsWith(sep) ? 0 : 1)))
      ancestor = parent
    }
  }
}

const discoverWorktreeRoots = async (repoRoot) => {
  const { stdout } = await execFile('git', ['-C', repoRoot, 'worktree', 'list', '--porcelain'])
  return stdout
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length))
}

export async function resolvePrivateContentDir(
  candidate,
  { repoRoot = REPO_ROOT, worktreeRoots } = {},
) {
  if (!candidate) throw new Error('BRAIN2_PRIVATE_CONTENT_DIR is required for --write')
  const resolvedCandidate = await realpathAllowMissing(candidate)
  const resolvedRepo = await realpathAllowMissing(repoRoot)
  const roots = worktreeRoots ?? (await discoverWorktreeRoots(resolvedRepo))
  const resolvedWorktrees = await Promise.all(roots.map(realpathAllowMissing))
  const tmpRoots = await Promise.all(['/tmp', '/private/tmp'].map(realpathAllowMissing))

  if (tmpRoots.some((root) => isWithin(root, resolvedCandidate))) {
    throw new Error('private content directory cannot be inside a temporary directory')
  }
  for (const worktree of new Set([resolvedRepo, ...resolvedWorktrees])) {
    if (isWithin(worktree, resolvedCandidate)) {
      throw new Error('private content directory must be outside every repository worktree')
    }
    if (isWithin(resolve(worktree, '.next'), resolvedCandidate)) {
      throw new Error('private content directory cannot be inside .next')
    }
    if (isWithin(resolve(worktree, 'out'), resolvedCandidate)) {
      throw new Error('private content directory cannot be inside out')
    }
  }
  return resolvedCandidate
}

const jsonFile = (value) => `${JSON.stringify(value, null, 2)}\n`

export const PROTECTED_LESSON_FILENAMES = Array.from(
  { length: 14 },
  (_, index) => `ngay-${String(index + 8).padStart(2, '0')}.json`,
)

const lstatIfExists = async (target) => {
  try {
    return await lstat(target)
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

const assertCanonicalDirectory = async (target, scope) => {
  const info = await lstatIfExists(target)
  if (!info) throw new Error(`${scope} is missing`)
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new Error(`${scope} must be a real directory, not a symlink or non-directory`)
  }
  const canonical = await realpath(target)
  if (canonical !== resolve(target)) throw new Error(`${scope} realpath escapes its canonical target`)
  return canonical
}

export async function preparePrivateVersionRoot(
  privateRoot,
  { repoRoot = REPO_ROOT, worktreeRoots, create = false } = {},
) {
  const resolvedPrivateRoot = await resolvePrivateContentDir(privateRoot, { repoRoot, worktreeRoots })
  if (create) await mkdir(resolvedPrivateRoot, { recursive: true, mode: 0o700 })
  const canonicalRoot = await assertCanonicalDirectory(resolvedPrivateRoot, 'private content root')
  const versionRoot = join(canonicalRoot, 'v1')
  if (create && !(await lstatIfExists(versionRoot))) await mkdir(versionRoot, { mode: 0o700 })
  const canonicalVersionRoot = await assertCanonicalDirectory(versionRoot, 'private v1 directory')
  if (!isWithin(canonicalRoot, canonicalVersionRoot)) {
    throw new Error('private v1 directory realpath escapes the safe root')
  }
  if (create) {
    await chmod(canonicalRoot, 0o700)
    await chmod(canonicalVersionRoot, 0o700)
  }
  return { privateRoot: canonicalRoot, versionRoot: canonicalVersionRoot }
}

export async function assertExactDirectoryEntries(
  directory,
  expectedNames,
  { allowMissing = false, scope = 'directory' } = {},
) {
  const actual = (await readdir(directory)).sort()
  const expected = [...expectedNames].sort()
  const allowed = new Set(expected)
  if (actual.some((name) => !allowed.has(name))) {
    throw new Error(`${scope} contains an unexpected entry`)
  }
  if (!allowMissing && (actual.length !== expected.length || actual.some((name, index) => name !== expected[index]))) {
    throw new Error(`${scope} does not contain the exact canonical entries`)
  }
  return actual
}

export async function assertSafePrivateLessonFile(
  target,
  versionRoot,
  { allowMissing = false } = {},
) {
  const info = await lstatIfExists(target)
  if (!info) {
    if (allowMissing) return null
    throw new Error('private lesson file is missing')
  }
  if (info.isSymbolicLink() || !info.isFile() || info.nlink !== 1) {
    throw new Error('private lesson file must be one regular, non-symlink file')
  }
  const canonical = await realpath(target)
  if (canonical !== resolve(target) || !isWithin(versionRoot, canonical)) {
    throw new Error('private lesson file realpath escapes the safe root')
  }
  return info
}

const writeFileNoFollow = async (target, value, versionRoot) => {
  const noFollow = fsConstants.O_NOFOLLOW ?? 0
  let handle
  try {
    handle = await open(target, fsConstants.O_WRONLY | noFollow)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    handle = await open(
      target,
      fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL | noFollow,
      0o600,
    )
  }
  try {
    const info = await handle.stat()
    if (!info.isFile() || info.nlink !== 1) {
      throw new Error('private lesson handle must reference one regular file')
    }
    await handle.truncate(0)
    await handle.writeFile(value, 'utf8')
    await handle.chmod(0o600)
  } finally {
    await handle.close()
  }
  await assertSafePrivateLessonFile(target, versionRoot)
}

export async function writeProtectedPackages(packages, privateRoot, options = {}) {
  const byName = new Map(packages.map((lesson) => [`${lesson.meta.slug}.json`, lesson]))
  const names = [...byName.keys()].sort()
  if (
    names.length !== PROTECTED_LESSON_FILENAMES.length ||
    names.some((name, index) => name !== [...PROTECTED_LESSON_FILENAMES].sort()[index])
  ) {
    throw new Error('protected writer requires the exact 14 canonical lessons')
  }

  const roots = await preparePrivateVersionRoot(privateRoot, { ...options, create: true })
  const existing = await assertExactDirectoryEntries(roots.versionRoot, names, {
    allowMissing: true,
    scope: 'private v1 directory',
  })
  for (const name of existing) {
    await assertSafePrivateLessonFile(join(roots.versionRoot, name), roots.versionRoot)
  }
  for (const name of names) {
    await writeFileNoFollow(join(roots.versionRoot, name), jsonFile(byName.get(name)), roots.versionRoot)
  }
  await assertExactDirectoryEntries(roots.versionRoot, names, { scope: 'private v1 directory' })
  return roots
}

const migrationReport = ({ stats, editorialCounts }) => {
  const omissionRows = EDITORIAL_OMISSION_KEYS.map(
    (key) => `| \`${key}\` | ${editorialCounts[key]} | Omitted before package output |`,
  ).join('\n')
  return `# Brain2 21-day canonical migration report

Status: PASS for the canonical migration package split.

## Safe evidence

- Lessons extracted and normalized: 21/21.
- Public packages: 7.
- Protected packages: 14, written only to the validated outside-repository target.
- Copy-derived prompt actions: ${stats.copyDerivedPrompts}.
- Source external links inventoried before omission: ${stats.sourceExternalLinks}.
- External links retained after editorial normalization: ${stats.retainedExternalLinks}.
- Static reviewed editorial rows: 21/21, including source-matched duration ranges.
- Protected-day tracked rows contain public metadata only; private package fields are derived deterministically at migration runtime.
- Private output uses canonical real directories, no-follow file writes and an exact 14-entry allowlist.
- Source SHA-256 prefix: \`${stats.sourceSha256.slice(0, 12)}\`.
- The implementation is split into editorial metadata, HTML normalization and migration orchestration modules so each review boundary stays focused.

## Editorial normalization

| Class | Count | Treatment |
| --- | ---: | --- |
${omissionRows}
| \`ai-tool-neutralized\` | ${editorialCounts['ai-tool-neutralized']} | Rephrased to tool-neutral instruction |
| \`audience-normalized\` | ${editorialCounts['audience-normalized']} | Normalized to \`bạn\` |

The report intentionally contains no protected lesson body, prompt, resource note, deliverable body or checklist label.
`
}

export async function writeMigration(result, privateRoot) {
  const publicRoot = join(REPO_ROOT, 'content', 'brain2', 'public')
  await mkdir(publicRoot, { recursive: true })
  const publicLessons = result.packages.filter(({ meta }) => meta.access === 'public')
  const publicNames = publicLessons.map(({ meta }) => `${meta.slug}.json`).sort()
  await assertExactDirectoryEntries(publicRoot, publicNames, {
    allowMissing: true,
    scope: 'public lesson directory',
  })

  await writeFile(join(REPO_ROOT, 'content', 'brain2', 'manifest.json'), jsonFile(result.manifest), 'utf8')
  for (const lesson of publicLessons) {
    await writeFile(join(publicRoot, `${lesson.meta.slug}.json`), jsonFile(lesson), 'utf8')
  }
  await assertExactDirectoryEntries(publicRoot, publicNames, { scope: 'public lesson directory' })
  const privateRoots = await writeProtectedPackages(
    result.packages.filter(({ meta }) => meta.access === 'conan-maker'),
    privateRoot,
  )
  await writeFile(
    join(REPO_ROOT, 'docs', 'BRAIN2_21_DAY_MIGRATION_REPORT.md'),
    migrationReport(result),
    'utf8',
  )
  return privateRoots.privateRoot
}

const run = async () => {
  const legacyRoot = process.env.BRAIN2_LEGACY_ROOT ?? '/Users/rio/brain2-landing'
  const sourceName = join(legacyRoot, 'script.js')
  const result = migrateSourceText(await readFile(sourceName, 'utf8'), sourceName)
  if (process.argv.includes('--write')) {
    await writeMigration(result, process.env.BRAIN2_PRIVATE_CONTENT_DIR)
  }
  const publicCount = result.packages.filter(({ meta }) => meta.access === 'public').length
  const protectedCount = result.packages.length - publicCount
  console.log(
    `Brain2 migration PASS lessons=${result.packages.length} public=${publicCount} protected=${protectedCount} prompts=${result.stats.copyDerivedPrompts} sourceLinks=${result.stats.sourceExternalLinks} retainedLinks=${result.stats.retainedExternalLinks}`,
  )
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await run()
}
