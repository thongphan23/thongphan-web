import { readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  BANNED_OUTPUT_RULES,
  MIGRATED_AT,
  PROTECTED_LESSON_FILENAMES,
  RELEASE_ID,
  assertExactDirectoryEntries,
  assertSafePrivateLessonFile,
  contentSha256,
  isSafeLessonHref,
  preparePrivateVersionRoot,
} from './migrate-brain2-lessons.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const HEX_256 = /^[a-f0-9]{64}$/

const validationError = (scope, message) => new Error(`${scope}: ${message}`)

const plainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const exactKeys = (value, expected, scope) => {
  if (!plainObject(value)) throw validationError(scope, 'must be an object')
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw validationError(scope, 'contains missing or unknown fields')
  }
}

const stringField = (value, scope) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw validationError(scope, 'must be a non-empty string')
  }
}

const validateRichText = (nodes, scope) => {
  if (!Array.isArray(nodes)) throw validationError(scope, 'must be a rich-text array')
  let retainedLinks = 0
  for (const [index, node] of nodes.entries()) {
    const nodeScope = `${scope}.node-${index + 1}`
    if (!plainObject(node) || typeof node.type !== 'string') {
      throw validationError(nodeScope, 'has an invalid rich-text node')
    }
    if (node.type === 'text') {
      exactKeys(node, ['type', 'value'], nodeScope)
      stringField(node.value, nodeScope)
      continue
    }
    if (node.type === 'break') {
      exactKeys(node, ['type'], nodeScope)
      continue
    }
    if (['strong', 'em', 'code'].includes(node.type)) {
      exactKeys(node, ['type', 'children'], nodeScope)
      retainedLinks += validateRichText(node.children, `${nodeScope}.children`)
      continue
    }
    if (node.type === 'link') {
      exactKeys(node, ['type', 'href', 'children'], nodeScope)
      if (!isSafeLessonHref(node.href)) throw validationError(nodeScope, 'contains an unsafe link href')
      retainedLinks += 1 + validateRichText(node.children, `${nodeScope}.children`)
      continue
    }
    throw validationError(nodeScope, 'contains an unknown rich-text node type')
  }
  return retainedLinks
}

const validateBlock = (block, scope) => {
  if (!plainObject(block) || typeof block.kind !== 'string') {
    throw validationError(scope, 'contains an invalid block')
  }
  stringField(block.id, `${scope}.id`)
  let prompts = 0
  let retainedLinks = 0

  if (block.kind === 'prose') {
    exactKeys(block, block.heading === undefined ? ['id', 'kind', 'children'] : ['id', 'kind', 'heading', 'children'], scope)
    if (block.heading !== undefined) stringField(block.heading, `${scope}.heading`)
    retainedLinks += validateRichText(block.children, `${scope}.children`)
    if (block.children.length === 0 && block.heading === undefined) {
      throw validationError(scope, 'empty prose requires a heading')
    }
    return { prompts, retainedLinks }
  }

  if (block.kind === 'list') {
    exactKeys(block, ['id', 'kind', 'ordered', 'items'], scope)
    if (typeof block.ordered !== 'boolean' || !Array.isArray(block.items) || block.items.length === 0) {
      throw validationError(scope, 'contains an invalid list')
    }
    for (const [index, item] of block.items.entries()) {
      retainedLinks += validateRichText(item, `${scope}.item-${index + 1}`)
    }
    return { prompts, retainedLinks }
  }

  if (block.kind === 'callout') {
    exactKeys(
      block,
      block.title === undefined ? ['id', 'kind', 'tone', 'children'] : ['id', 'kind', 'tone', 'title', 'children'],
      scope,
    )
    if (!['principle', 'tip', 'warning', 'example'].includes(block.tone)) {
      throw validationError(scope, 'contains an invalid callout tone')
    }
    if (block.title !== undefined) stringField(block.title, `${scope}.title`)
    retainedLinks += validateRichText(block.children, `${scope}.children`)
    return { prompts, retainedLinks }
  }

  if (block.kind === 'prompt') {
    exactKeys(block, ['id', 'kind', 'label', 'text'], scope)
    stringField(block.label, `${scope}.label`)
    stringField(block.text, `${scope}.text`)
    prompts += 1
    return { prompts, retainedLinks }
  }

  if (block.kind === 'resources') {
    exactKeys(block, ['id', 'kind', 'title', 'items'], scope)
    stringField(block.title, `${scope}.title`)
    if (!Array.isArray(block.items) || block.items.length === 0) {
      throw validationError(scope, 'contains an empty resource list')
    }
    for (const [index, item] of block.items.entries()) {
      const itemScope = `${scope}.resource-${index + 1}`
      exactKeys(item, item.note === undefined ? ['title', 'href'] : ['title', 'href', 'note'], itemScope)
      stringField(item.title, `${itemScope}.title`)
      if (item.note !== undefined) stringField(item.note, `${itemScope}.note`)
      if (!isSafeLessonHref(item.href)) throw validationError(itemScope, 'contains an unsafe resource href')
      retainedLinks += 1
    }
    return { prompts, retainedLinks }
  }

  if (block.kind === 'deliverable') {
    exactKeys(block, ['id', 'kind', 'title', 'children'], scope)
    stringField(block.title, `${scope}.title`)
    retainedLinks += validateRichText(block.children, `${scope}.children`)
    return { prompts, retainedLinks }
  }

  throw validationError(scope, 'contains an unknown block kind')
}

const META_KEYS = [
  'schemaVersion',
  'day',
  'slug',
  'week',
  'access',
  'title',
  'promise',
  'objective',
  'estimatedMinutes',
  'preview',
  'sourceFragmentSha256',
  'contentSha256',
  'migratedAt',
  'editorialState',
]

const validateMeta = (meta, { expectedDay, expectedAccess }, scope) => {
  exactKeys(meta, META_KEYS, scope)
  const expectedSlug = `ngay-${String(expectedDay).padStart(2, '0')}`
  if (meta.schemaVersion !== 1) throw validationError(scope, 'has an unsupported schema version')
  if (meta.day !== expectedDay || meta.slug !== expectedSlug) {
    throw validationError(scope, 'day or slug does not match its file')
  }
  if (meta.week !== Math.ceil(expectedDay / 7)) throw validationError(scope, 'week does not match day')
  if (meta.access !== expectedAccess) throw validationError(scope, 'access does not match the canonical split')
  for (const key of ['title', 'promise', 'objective', 'preview']) stringField(meta[key], `${scope}.${key}`)
  exactKeys(meta.estimatedMinutes, ['min', 'max'], `${scope}.estimatedMinutes`)
  const { min, max } = meta.estimatedMinutes
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 10 || max > 120 || min > max) {
    throw validationError(scope, 'duration is outside 10..120')
  }
  if (!HEX_256.test(meta.sourceFragmentSha256) || !HEX_256.test(meta.contentSha256)) {
    throw validationError(scope, 'contains an invalid checksum')
  }
  if (meta.migratedAt !== MIGRATED_AT || meta.editorialState !== 'reviewed') {
    throw validationError(scope, 'migration metadata is not canonical')
  }
}

const assertNoBannedOutput = (lesson, scope) => {
  const serialized = JSON.stringify(lesson)
  for (const [category, pattern] of BANNED_OUTPUT_RULES) {
    if (pattern.test(serialized)) throw validationError(scope, `contains banned output category ${category}`)
  }
}

export function validateLessonPackage(lesson, { expectedDay, expectedAccess }) {
  const scope = `day-${String(expectedDay).padStart(2, '0')}`
  exactKeys(lesson, ['meta', 'reason', 'blocks', 'deliverable', 'checklist'], scope)
  validateMeta(lesson.meta, { expectedDay, expectedAccess }, `${scope}.meta`)
  stringField(lesson.reason, `${scope}.reason`)
  if (!Array.isArray(lesson.blocks) || lesson.blocks.length === 0) {
    throw validationError(scope, 'must contain typed blocks')
  }

  const blockIds = new Set()
  let prompts = 0
  let retainedLinks = 0
  for (const [index, block] of lesson.blocks.entries()) {
    const result = validateBlock(block, `${scope}.block-${index + 1}`)
    if (blockIds.has(block.id)) throw validationError(scope, 'contains duplicate block IDs')
    blockIds.add(block.id)
    prompts += result.prompts
    retainedLinks += result.retainedLinks
  }

  exactKeys(lesson.deliverable, ['title', 'body'], `${scope}.deliverable`)
  stringField(lesson.deliverable.title, `${scope}.deliverable.title`)
  retainedLinks += validateRichText(lesson.deliverable.body, `${scope}.deliverable.body`)
  if (!Array.isArray(lesson.checklist) || lesson.checklist.length === 0) {
    throw validationError(scope, 'must contain a checklist')
  }
  const checklistIds = new Set()
  for (const [index, item] of lesson.checklist.entries()) {
    exactKeys(item, ['id', 'label'], `${scope}.check-${index + 1}`)
    stringField(item.id, `${scope}.check-${index + 1}.id`)
    stringField(item.label, `${scope}.check-${index + 1}.label`)
    if (checklistIds.has(item.id)) throw validationError(scope, 'contains duplicate checklist IDs')
    checklistIds.add(item.id)
  }

  assertNoBannedOutput(lesson, scope)
  if (contentSha256(lesson) !== lesson.meta.contentSha256) {
    throw validationError(scope, 'content checksum does not match canonical body')
  }
  return { prompts, retainedLinks }
}

const MANIFEST_COUNT_KEYS = [
  'lessons',
  'public',
  'protected',
  'copyDerivedPrompts',
  'sourceExternalLinks',
  'retainedExternalLinks',
]

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const validateManifest = (manifest, packages) => {
  exactKeys(manifest, ['schemaVersion', 'releaseId', 'migratedAt', 'source', 'counts', 'lessons'], 'manifest')
  if (manifest.schemaVersion !== 1 || manifest.releaseId !== RELEASE_ID || manifest.migratedAt !== MIGRATED_AT) {
    throw validationError('manifest', 'release metadata is not canonical')
  }
  exactKeys(manifest.source, ['sha256'], 'manifest.source')
  if (!HEX_256.test(manifest.source.sha256)) throw validationError('manifest.source', 'checksum is invalid')
  exactKeys(manifest.counts, MANIFEST_COUNT_KEYS, 'manifest.counts')
  if (
    manifest.counts.lessons !== 21 ||
    manifest.counts.public !== 7 ||
    manifest.counts.protected !== 14 ||
    manifest.counts.copyDerivedPrompts !== 41 ||
    manifest.counts.sourceExternalLinks !== 65
  ) {
    throw validationError('manifest.counts', 'does not match 21/7/14/41/65')
  }
  if (!Array.isArray(manifest.lessons) || manifest.lessons.length !== 21) {
    throw validationError('manifest.lessons', 'must contain exactly 21 metadata records')
  }

  for (const [index, record] of manifest.lessons.entries()) {
    const day = index + 1
    const access = day <= 7 ? 'public' : 'conan-maker'
    const recordKeys = access === 'public' ? META_KEYS : [...META_KEYS, 'storageKey']
    exactKeys(record, recordKeys, `manifest.day-${String(day).padStart(2, '0')}`)
    const { storageKey, ...recordMeta } = record
    validateMeta(recordMeta, { expectedDay: day, expectedAccess: access }, `manifest.day-${String(day).padStart(2, '0')}`)
    if (access === 'conan-maker') {
      const expectedKey = `brain2:21:${RELEASE_ID}:day:${String(day).padStart(2, '0')}`
      if (storageKey !== expectedKey) throw validationError('manifest', `day ${day} storage key is not immutable`)
    }
    const expected = { ...packages[index].meta, ...(access === 'conan-maker' ? { storageKey } : {}) }
    if (!sameJson(record, expected)) throw validationError('manifest', `day ${day} metadata differs from its package`)
  }
}

const parseJsonFile = async (file, scope) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    throw validationError(scope, 'is missing or is not valid JSON')
  }
}

export async function validatePrivatePackageDirectory(
  privateRoot,
  { repoRoot = REPO_ROOT, worktreeRoots } = {},
) {
  const roots = await preparePrivateVersionRoot(privateRoot, { repoRoot, worktreeRoots })
  await assertExactDirectoryEntries(roots.versionRoot, PROTECTED_LESSON_FILENAMES, {
    scope: 'protected packages',
  })
  for (const name of PROTECTED_LESSON_FILENAMES) {
    await assertSafePrivateLessonFile(join(roots.versionRoot, name), roots.versionRoot)
  }
  return roots
}

export async function validateMigrationFiles({ repoRoot = REPO_ROOT, privateRoot, worktreeRoots } = {}) {
  const privateRoots = await validatePrivatePackageDirectory(privateRoot, { repoRoot, worktreeRoots })
  const resolvedPrivateRoot = privateRoots.privateRoot
  const privateVersionRoot = privateRoots.versionRoot
  const publicRoot = join(repoRoot, 'content', 'brain2', 'public')
  const publicNames = Array.from({ length: 7 }, (_, index) => `ngay-${String(index + 1).padStart(2, '0')}.json`)
  await assertExactDirectoryEntries(publicRoot, publicNames, { scope: 'public packages' })
  const manifest = await parseJsonFile(join(repoRoot, 'content', 'brain2', 'manifest.json'), 'manifest')

  const packages = []
  let prompts = 0
  let retainedLinks = 0
  for (let day = 1; day <= 21; day += 1) {
    const access = day <= 7 ? 'public' : 'conan-maker'
    const directory = access === 'public' ? publicRoot : privateVersionRoot
    const file = join(directory, `ngay-${String(day).padStart(2, '0')}.json`)
    const privateInfo =
      access === 'conan-maker'
        ? await assertSafePrivateLessonFile(file, privateVersionRoot)
        : null
    const lesson = await parseJsonFile(file, `day-${String(day).padStart(2, '0')}`)
    const result = validateLessonPackage(lesson, { expectedDay: day, expectedAccess: access })
    packages.push(lesson)
    prompts += result.prompts
    retainedLinks += result.retainedLinks
    if (privateInfo && (privateInfo.mode & 0o077) !== 0) {
      throw validationError(`day-${String(day).padStart(2, '0')}`, 'private file permissions are too broad')
    }
  }

  if (prompts !== 41) throw validationError('packages', `prompt count must be 41; found ${prompts}`)
  if (retainedLinks !== manifest.counts.retainedExternalLinks) {
    throw validationError('packages', 'retained link count differs from the manifest')
  }
  validateManifest(manifest, packages)
  if (((await stat(resolvedPrivateRoot)).mode & 0o077) !== 0 || ((await stat(privateVersionRoot)).mode & 0o077) !== 0) {
    throw validationError('protected packages', 'private directory permissions are too broad')
  }

  return {
    lessons: packages.length,
    public: 7,
    protected: 14,
    prompts,
    sourceLinks: manifest.counts.sourceExternalLinks,
    retainedLinks,
  }
}

const run = async () => {
  if (process.argv.includes('--check-external-links')) {
    throw new Error('--check-external-links is reserved for Task 14')
  }
  const result = await validateMigrationFiles({ privateRoot: process.env.BRAIN2_PRIVATE_CONTENT_DIR })
  console.log(
    `Brain2 validation PASS lessons=${result.lessons} public=${result.public} protected=${result.protected} prompts=${result.prompts} sourceLinks=${result.sourceLinks} retainedLinks=${result.retainedLinks}`,
  )
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await run()
}
