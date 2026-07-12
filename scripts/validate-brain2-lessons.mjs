import { readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { parseFragment } from 'parse5'

import {
  BANNED_OUTPUT_RULES,
  MIGRATED_AT,
  PROTECTED_LESSON_FILENAMES,
  RELEASE_ID,
  assertExactDirectoryEntries,
  assertSafePrivateLessonFile,
  contentSha256,
  extractDayContent,
  isSafeLessonHref,
  retainedExternalHref,
  preparePrivateVersionRoot,
} from './migrate-brain2-lessons.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')
const HEX_256 = /^[a-f0-9]{64}$/
const CANONICAL_EXTERNAL_LINK_COUNTS = Object.freeze({ source: 65, retained: 60, omitted: 5 })
const DEFAULT_LEGACY_ROOT = '/Users/rio/brain2-landing'
const DEFAULT_LINK_CONCURRENCY = 6
const DEFAULT_LINK_TIMEOUT_MS = 10_000

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

const nodeAttribute = (node, name) =>
  node.attrs?.find((entry) => entry.name === name)?.value

const sourceExternalUrls = (sourceText, sourceName) => {
  const urls = []
  const visit = (node) => {
    if (node.tagName === 'a') {
      const href = nodeAttribute(node, 'href')
      if (href && !href.startsWith('/') && !href.startsWith('#')) urls.push(href)
    }
    for (const child of node.childNodes ?? []) visit(child)
  }
  for (const entry of extractDayContent(sourceText, sourceName)) visit(parseFragment(entry.content))
  return urls
}

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const retainedHttpsUrls = (value, found = []) => {
  if (Array.isArray(value)) {
    for (const item of value) retainedHttpsUrls(item, found)
    return found
  }
  if (!plainObject(value)) return found
  if (typeof value.href === 'string' && retainedExternalHref(value.href)) found.push(value.href)
  for (const child of Object.values(value)) retainedHttpsUrls(child, found)
  return found
}

export function collectExternalLinkInventory(
  sourceText,
  retainedUrls,
  { sourceName = '<memory>' } = {},
) {
  if (!Array.isArray(retainedUrls) || retainedUrls.some((url) => !isHttpsUrl(url))) {
    throw validationError('external links', 'every retained URL must use HTTPS')
  }
  const sourceUrls = sourceExternalUrls(sourceText, sourceName)
  const unmatched = new Map()
  for (const url of retainedUrls) unmatched.set(url, (unmatched.get(url) ?? 0) + 1)

  const classifiedRetained = []
  const omittedUrls = []
  for (const url of sourceUrls) {
    const remaining = unmatched.get(url) ?? 0
    if (remaining === 0) {
      omittedUrls.push(url)
      continue
    }
    classifiedRetained.push(url)
    unmatched.set(url, remaining - 1)
  }

  const missing = [...unmatched.values()].reduce((sum, count) => sum + count, 0)
  if (missing > 0) {
    throw validationError('external links', `${missing} retained URL occurrence(s) are absent from the source inventory`)
  }
  return { sourceUrls, retainedUrls: classifiedRetained, omittedUrls }
}

export function assertCanonicalExternalLinkInventory(inventory) {
  if (!plainObject(inventory)) throw validationError('external links', 'inventory must be an object')
  const { sourceUrls, retainedUrls, omittedUrls } = inventory
  if (!Array.isArray(sourceUrls) || sourceUrls.length !== CANONICAL_EXTERNAL_LINK_COUNTS.source) {
    throw validationError('external links', 'source inventory must contain exactly 65 URL occurrences')
  }
  if (!Array.isArray(retainedUrls) || retainedUrls.length !== CANONICAL_EXTERNAL_LINK_COUNTS.retained) {
    throw validationError('external links', 'retained inventory must contain exactly 60 URL occurrences')
  }
  if (!Array.isArray(omittedUrls) || omittedUrls.length !== CANONICAL_EXTERNAL_LINK_COUNTS.omitted) {
    throw validationError('external links', 'omitted inventory must contain exactly five URL occurrences')
  }
  if (retainedUrls.some((url) => !isHttpsUrl(url))) {
    throw validationError('external links', 'every retained URL must use HTTPS')
  }
  return inventory
}

const fetchWithTimeout = async (url, method, { fetchImpl, timeoutMs }) => {
  const controller = new AbortController()
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      const error = new Error('request timed out')
      error.name = 'TimeoutError'
      reject(error)
    }, timeoutMs)
  })
  try {
    const response = await Promise.race([
      fetchImpl(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      }),
      timeout,
    ])
    return { response }
  } catch {
    return { error: controller.signal.aborted ? 'timeout' : 'network' }
  } finally {
    clearTimeout(timeoutId)
  }
}

const checkOneExternalLink = async (url, options) => {
  let last = {
    url,
    ok: false,
    method: 'HEAD',
    status: null,
    finalUrl: null,
    redirected: false,
    error: 'network',
  }

  for (const method of ['HEAD', 'GET']) {
    const attempt = await fetchWithTimeout(url, method, options)
    if (!attempt.response) {
      last = { ...last, method, error: attempt.error }
      continue
    }

    const response = attempt.response
    const finalUrl = typeof response.url === 'string' && response.url.length > 0 ? response.url : url
    const common = {
      url,
      method,
      status: Number.isInteger(response.status) ? response.status : null,
      finalUrl,
      redirected: Boolean(response.redirected),
    }
    if (method === 'GET' && typeof response.body?.cancel === 'function') {
      try {
        await response.body.cancel()
      } catch {
        // The status and redirect have already been observed; response content is never read.
      }
    }
    if (response.ok && !isHttpsUrl(finalUrl)) {
      return { ...common, ok: false, error: 'redirect-downgrade' }
    }
    if (response.ok) return { ...common, ok: true, error: null }
    last = { ...common, ok: false, error: 'http-status' }
  }
  return last
}

export async function checkRetainedExternalLinks(
  urls,
  {
    fetchImpl = globalThis.fetch,
    concurrency = DEFAULT_LINK_CONCURRENCY,
    timeoutMs = DEFAULT_LINK_TIMEOUT_MS,
  } = {},
) {
  if (!Array.isArray(urls) || urls.some((url) => !isHttpsUrl(url))) {
    throw validationError('external links', 'live checks accept retained HTTPS URLs only')
  }
  if (typeof fetchImpl !== 'function') throw validationError('external links', 'fetch is unavailable')
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw validationError('external links', 'concurrency must be a positive integer')
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw validationError('external links', 'timeout must be a positive integer')
  }

  const uniqueUrls = [...new Set(urls)]
  const results = Array(uniqueUrls.length)
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < uniqueUrls.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await checkOneExternalLink(uniqueUrls[index], { fetchImpl, timeoutMs })
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, () => worker()),
  )
  return { occurrences: urls.length, unique: uniqueUrls.length, results }
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
      if (retainedExternalHref(node.href)) retainedLinks += 1
      retainedLinks += validateRichText(node.children, `${nodeScope}.children`)
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
      if (retainedExternalHref(item.href)) retainedLinks += 1
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
  const retainedUrls = []
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
    retainedHttpsUrls(lesson, retainedUrls)
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
    retainedUrls,
  }
}

const run = async () => {
  const result = await validateMigrationFiles({ privateRoot: process.env.BRAIN2_PRIVATE_CONTENT_DIR })
  if (process.argv.includes('--check-external-links')) {
    const legacyRoot = process.env.BRAIN2_LEGACY_ROOT ?? DEFAULT_LEGACY_ROOT
    const sourceName = join(legacyRoot, 'script.js')
    const sourceText = await readFile(sourceName, 'utf8')
    const inventory = assertCanonicalExternalLinkInventory(
      collectExternalLinkInventory(sourceText, result.retainedUrls, { sourceName }),
    )
    const report = await checkRetainedExternalLinks(inventory.retainedUrls)
    const failures = report.results.filter(({ ok }) => !ok)
    if (failures.length > 0) {
      const summary = failures
        .map(({ url, status, error }) => {
          const parsed = new URL(url)
          return `${parsed.origin}${parsed.pathname} (${status ?? error})`
        })
        .join(', ')
      throw validationError(
        'external links',
        `${failures.length}/${report.unique} retained HTTPS targets failed: ${summary}`,
      )
    }
    console.log(
      `Brain2 external-link validation PASS source=${inventory.sourceUrls.length} retained=${inventory.retainedUrls.length} omitted=${inventory.omittedUrls.length} uniqueChecked=${report.unique}`,
    )
    return
  }
  console.log(
    `Brain2 validation PASS lessons=${result.lessons} public=${result.public} protected=${result.protected} prompts=${result.prompts} sourceLinks=${result.sourceLinks} retainedLinks=${result.retainedLinks}`,
  )
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await run()
}
