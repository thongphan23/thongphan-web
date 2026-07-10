import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const defaultContentDir = join(root, 'content/readings')

export const APPROVED_RIGHTS_STATUSES = new Set([
  'public-domain',
  'permission-confirmed',
  'licensed',
  'source-link-only',
  'blocked',
])

const FULL_RIGHTS_STATUSES = new Set(['public-domain', 'permission-confirmed', 'licensed'])
const BODY_FIELDS = new Set([
  'body',
  'bodyHtml',
  'blocks',
  'contentHtml',
  'paragraphs',
  'sections',
  'translatedBody',
  'translatedSections',
])
const PLACEHOLDER_EVIDENCE = /^(?:missing|n\/?a|none|not recorded|not verified|pending|placeholder|tbd|todo|unknown)$/i
const REQUIRED_ARTICLE_FIELDS = [
  'schemaVersion',
  'slug',
  'title',
  'description',
  'author',
  'source',
  'sourceUrl',
  'sourcePublishedAt',
  'translator',
  'editor',
  'translatedAt',
  'lastReviewedAt',
  'rightsStatus',
  'minutes',
  'topics',
  'intent',
  'durationBand',
  'readingPath',
  'legacySectionCount',
  'legacyBlockCount',
  'legacyBodyChecksum',
  'contentChecksum',
  'contentVersion',
]

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const isSha256 = (value) => /^sha256:[a-f0-9]{64}$/.test(value ?? '')
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

const collectBodyFields = (value, found = new Set()) => {
  if (!value || typeof value !== 'object') return found
  for (const [key, nested] of Object.entries(value)) {
    if (BODY_FIELDS.has(key)) found.add(key)
    collectBodyFields(nested, found)
  }
  return found
}

const hasRealEvidence = (evidence) =>
  Array.isArray(evidence) &&
  evidence.some((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const reference = typeof entry.reference === 'string' ? entry.reference.trim() : ''
    return (
      typeof entry.type === 'string' &&
      entry.type.trim().length > 0 &&
      reference.length > 0 &&
      !PLACEHOLDER_EVIDENCE.test(reference) &&
      typeof entry.verifiedAt === 'string' &&
      entry.verifiedAt.trim().length > 0
    )
  })

const validateReadyCandidate = (candidate, slug) => {
  const errors = []
  if (!candidate.publicPath?.startsWith(`/images/readings/${slug}/`)) {
    errors.push(`${slug}: ready media ${candidate.id ?? 'unknown'} needs a local publicPath`)
  }
  if (/^https?:\/\//.test(candidate.publicPath ?? '')) {
    errors.push(`${slug}: ready media ${candidate.id ?? 'unknown'} cannot hotlink`)
  }
  if (!isSha256(candidate.checksum)) {
    errors.push(`${slug}: ready media ${candidate.id ?? 'unknown'} needs a checksum`)
  }
  if (!/^https:\/\//.test(candidate.sourceUrl ?? '')) {
    errors.push(`${slug}: ready media ${candidate.id ?? 'unknown'} needs a source URL`)
  }
  if (!candidate.license || PLACEHOLDER_EVIDENCE.test(String(candidate.license).trim())) {
    errors.push(`${slug}: ready media ${candidate.id ?? 'unknown'} needs a verified license`)
  }
  if (!hasRealEvidence(candidate.rightsEvidence)) {
    errors.push(`${slug}: ready media ${candidate.id ?? 'unknown'} needs rights evidence`)
  }
  return errors
}

export function validateReadingPackage({ article, rights, imagePack }) {
  const errors = []
  const slug = article?.slug ?? rights?.slug ?? imagePack?.slug ?? 'unknown'

  if (!article || typeof article !== 'object') return [`${slug}: article.json must be an object`]
  if (!rights || typeof rights !== 'object') return [`${slug}: rights.json must be an object`]
  if (!imagePack || typeof imagePack !== 'object') return [`${slug}: image-pack.json must be an object`]

  for (const field of REQUIRED_ARTICLE_FIELDS) {
    if (!hasOwn(article, field)) errors.push(`${slug}: article missing ${field}`)
  }

  if (article.schemaVersion !== 1) errors.push(`${slug}: article schemaVersion must be 1`)
  if (rights.schemaVersion !== 1) errors.push(`${slug}: rights schemaVersion must be 1`)
  if (imagePack.schemaVersion !== 1) errors.push(`${slug}: image pack schemaVersion must be 1`)
  if (article.slug !== rights.slug || article.slug !== imagePack.slug) {
    errors.push(`${slug}: package slugs must match`)
  }
  if (!APPROVED_RIGHTS_STATUSES.has(article.rightsStatus)) {
    errors.push(`${slug}: invalid article rightsStatus ${article.rightsStatus}`)
  }
  if (!APPROVED_RIGHTS_STATUSES.has(rights.rightsStatus)) {
    errors.push(`${slug}: invalid rights.json rightsStatus ${rights.rightsStatus}`)
  }
  if (article.rightsStatus !== rights.rightsStatus) {
    errors.push(`${slug}: article and rights.json rightsStatus differ`)
  }
  if (!/^https:\/\//.test(article.sourceUrl ?? '')) errors.push(`${slug}: sourceUrl must use https`)
  if (article.readingPath !== `/library/read/${article.slug}`) {
    errors.push(`${slug}: readingPath must be canonical`)
  }
  if (!Number.isFinite(article.minutes) || article.minutes <= 0) {
    errors.push(`${slug}: minutes must be positive`)
  }
  if (!Array.isArray(article.topics) || article.topics.length === 0) {
    errors.push(`${slug}: topics must be non-empty`)
  }
  if (!['clarity', 'taste', 'asset'].includes(article.intent)) {
    errors.push(`${slug}: invalid intent ${article.intent}`)
  }
  if (!['under-10', '10-20', 'over-20'].includes(article.durationBand)) {
    errors.push(`${slug}: invalid durationBand ${article.durationBand}`)
  }
  if (!Number.isInteger(article.legacySectionCount) || article.legacySectionCount < 0) {
    errors.push(`${slug}: legacySectionCount must be a non-negative integer`)
  }
  if (!Number.isInteger(article.legacyBlockCount) || article.legacyBlockCount < 0) {
    errors.push(`${slug}: legacyBlockCount must be a non-negative integer`)
  }
  if (!isSha256(article.legacyBodyChecksum)) errors.push(`${slug}: invalid legacyBodyChecksum`)
  if (!isSha256(article.contentChecksum)) errors.push(`${slug}: invalid contentChecksum`)

  const { contentChecksum, ...unsignedArticle } = article
  if (contentChecksum !== sha256(JSON.stringify(unsignedArticle))) {
    errors.push(`${slug}: contentChecksum does not match article.json`)
  }

  const bodyFields = collectBodyFields(article)
  if (rights.publicationMode !== 'full') {
    for (const field of bodyFields) {
      errors.push(`${slug}: ${rights.rightsStatus} package must not contain body field "${field}"`)
    }
  }

  if (!rights.textRights || typeof rights.textRights !== 'object') {
    errors.push(`${slug}: rights.json needs textRights`)
  }
  if (!Array.isArray(rights.evidence)) errors.push(`${slug}: rights evidence must be an array`)

  if (rights.rightsStatus === 'source-link-only' && rights.publicationMode !== 'summary') {
    errors.push(`${slug}: source-link-only must use summary publication mode`)
  }
  if (rights.rightsStatus === 'blocked' && rights.publicationMode !== 'blocked') {
    errors.push(`${slug}: blocked must use blocked publication mode`)
  }
  if (rights.publicationMode === 'full') {
    if (!FULL_RIGHTS_STATUSES.has(rights.rightsStatus)) {
      errors.push(`${slug}: ${rights.rightsStatus} cannot use full publication mode`)
    }
    for (const field of ['translation', 'publicWeb', 'commercialContext']) {
      if (rights.textRights?.[field] !== true) errors.push(`${slug}: full publication needs ${field} rights`)
    }
    if (!hasRealEvidence(rights.evidence)) {
      errors.push(`${slug}: full publication needs non-placeholder evidence`)
    }
  }

  if (!Array.isArray(imagePack.candidates)) errors.push(`${slug}: image pack candidates must be an array`)
  if (!isSha256(imagePack.mediaChecksum)) errors.push(`${slug}: invalid mediaChecksum`)
  if (imagePack.mediaChecksum !== sha256(JSON.stringify(imagePack.candidates ?? []))) {
    errors.push(`${slug}: mediaChecksum does not match image-pack.json`)
  }

  for (const candidate of imagePack.candidates ?? []) {
    if (!candidate.id) errors.push(`${slug}: media candidate needs an id`)
    if (!candidate.sourceLocation) errors.push(`${slug}: media ${candidate.id ?? 'unknown'} needs sourceLocation`)
    if (!candidate.alt) errors.push(`${slug}: media ${candidate.id ?? 'unknown'} needs alt`)
    if (!candidate.caption) errors.push(`${slug}: media ${candidate.id ?? 'unknown'} needs caption`)
    if (!candidate.credit) errors.push(`${slug}: media ${candidate.id ?? 'unknown'} needs credit`)
    if (!['pending-rights', 'ready'].includes(candidate.status)) {
      errors.push(`${slug}: media ${candidate.id ?? 'unknown'} has invalid status`)
    }
    if (candidate.status === 'pending-rights' && hasOwn(candidate, 'publicPath')) {
      errors.push(`${slug}: pending media ${candidate.id ?? 'unknown'} must not have publicPath`)
    }
    if (candidate.status === 'ready') errors.push(...validateReadyCandidate(candidate, slug))
  }

  return errors
}

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))

export async function loadReadingPackages({ contentDir = defaultContentDir, slugs } = {}) {
  const packageSlugs = slugs
    ? [...slugs].sort()
    : (await readdir(contentDir, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()

  return Promise.all(
    packageSlugs.map(async (slug) => {
      const packageRoot = join(contentDir, slug)
      const [article, rights, imagePack] = await Promise.all([
        readJson(join(packageRoot, 'article.json')),
        readJson(join(packageRoot, 'rights.json')),
        readJson(join(packageRoot, 'image-pack.json')),
      ])
      return { slug, article, rights, imagePack }
    }),
  )
}

export async function validateReadingPackages({ contentDir = defaultContentDir, slugs } = {}) {
  const packages = await loadReadingPackages({ contentDir, slugs })
  const errors = packages.flatMap((record) => validateReadingPackage(record))

  if (!slugs && packages.length !== 13) errors.push(`expected 13 reading packages, found ${packages.length}`)
  if (new Set(packages.map((record) => record.article.slug)).size !== packages.length) {
    errors.push('reading packages contain duplicate slugs')
  }
  if (errors.length > 0) throw new Error(`Reading package validation failed:\n- ${errors.join('\n- ')}`)

  return packages
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) {
  const packages = await validateReadingPackages()
  const summary = {
    packages: packages.length,
    full: packages.filter(({ rights }) => rights.publicationMode === 'full').length,
    sourceLinkOnly: packages.filter(({ rights }) => rights.publicationMode === 'summary').length,
    blocked: packages.filter(({ rights }) => rights.publicationMode === 'blocked').length,
  }
  console.log(JSON.stringify(summary, null, 2))
}
