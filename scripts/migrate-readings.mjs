import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { validateReadingPackages } from './validate-reading-rights.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'content/readings')
const readRoot = process.env.THONGPHAN_READ_ROOT ?? join(homedir(), 'Projects/thongphan-read')
const reviewedAt = '2026-07-10'

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const writeJson = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function adaptTopics(item) {
  const topics = String(item.branch ?? '')
    .split('·')
    .map((topic) => slugify(topic.trim()))
    .filter(Boolean)
  return [...new Set(topics.length > 0 ? topics : [slugify(item.theme ?? 'general')])]
}

export function adaptIntent(item) {
  const signals = [item.theme, item.branch, ...(item.abilityTags ?? [])].join(' ').toLowerCase()
  if (/(?:taste|aesthetic|judgment|thẩm mỹ|\bgu\b)/i.test(signals)) return 'taste'
  if (/(?:asset|build|make|practice|write|tài sản|thực hành|tạo|viết|làm ra)/i.test(signals)) {
    return 'asset'
  }
  return 'clarity'
}

export function adaptDurationBand(minutes) {
  if (minutes < 10) return 'under-10'
  if (minutes <= 20) return '10-20'
  return 'over-20'
}

const countBlocks = (item) =>
  (item.sections ?? []).reduce(
    (count, section) => count + (section.blocks?.length ?? section.paragraphs?.length ?? 0),
    0,
  )

const safeInfoBox = (box) => {
  if (!box) return undefined
  return {
    title: box.title,
    summary: box.summary,
    ...(box.bullets ? { bullets: box.bullets } : {}),
  }
}

const createArticle = (item) => {
  const article = {
    schemaVersion: 1,
    slug: item.slug,
    title: item.title,
    description: item.coreIdea,
    author: item.author,
    source: item.source,
    sourceUrl: item.url,
    sourcePublishedAt: null,
    translator: null,
    editor: null,
    translatedAt: null,
    lastReviewedAt: reviewedAt,
    rightsStatus: 'source-link-only',
    minutes: item.minutes,
    topics: adaptTopics(item),
    intent: adaptIntent(item),
    durationBand: adaptDurationBand(item.minutes),
    readingPath: `/library/read/${item.slug}`,
    coreIdea: item.coreIdea,
    whyRead: item.whyRead,
    reflection: item.reflection,
    ...(item.authorProfile ? { authorProfile: safeInfoBox(item.authorProfile) } : {}),
    ...(item.contentContext ? { contentContext: safeInfoBox(item.contentContext) } : {}),
    legacySectionCount: item.sections?.length ?? 0,
    legacyBlockCount: countBlocks(item),
    legacyBodyChecksum: sha256(JSON.stringify(item.sections ?? [])),
    contentVersion: 1,
  }
  return { ...article, contentChecksum: sha256(JSON.stringify(article)) }
}

const createRights = (item) => ({
  schemaVersion: 1,
  slug: item.slug,
  rightsStatus: 'source-link-only',
  publicationMode: 'summary',
  textRights: {
    translation: false,
    publicWeb: false,
    commercialContext: false,
  },
  evidence: [],
  reviewedAt,
})

const createImagePack = (item) => {
  const candidates = (item.images ?? []).map((image, index) => ({
    id: `image-${String(index + 1).padStart(2, '0')}`,
    sourceLocation: image.src,
    sourceUrl: /^https:\/\//.test(image.src) ? image.src : null,
    alt: image.alt,
    caption: image.caption,
    credit: image.credit,
    license: null,
    derivative: null,
    checksum: null,
    rightsEvidence: [],
    provenance: {
      legacyArticle: item.slug,
      legacyLocation: image.src,
      articleSourceUrl: item.url,
    },
    status: 'pending-rights',
  }))

  return {
    schemaVersion: 1,
    slug: item.slug,
    candidates,
    mediaChecksum: sha256(JSON.stringify(candidates)),
  }
}

export async function migrateReadings() {
  const { libraryItems } = await import(pathToFileURL(join(readRoot, 'src/library.ts')).href)
  if (libraryItems.length !== 13) throw new Error(`Expected 13 legacy readings, found ${libraryItems.length}`)
  if (new Set(libraryItems.map((item) => item.slug)).size !== 13) {
    throw new Error('Legacy readings contain duplicate slugs')
  }

  const readyAudio = libraryItems.filter((item) => item.podcast?.status === 'ready')
  if (readyAudio.length > 0) {
    throw new Error(`Expected zero ready audio records, found ${readyAudio.length}`)
  }

  const migratedSlugs = []
  for (const item of libraryItems) {
    const packageRoot = join(contentDir, item.slug)
    await mkdir(packageRoot, { recursive: true })
    await Promise.all([
      writeJson(join(packageRoot, 'article.json'), createArticle(item)),
      writeJson(join(packageRoot, 'rights.json'), createRights(item)),
      writeJson(join(packageRoot, 'image-pack.json'), createImagePack(item)),
    ])
    migratedSlugs.push(item.slug)

    if (migratedSlugs.length % 3 === 0 || migratedSlugs.length === libraryItems.length) {
      const batch = migratedSlugs.slice(Math.max(0, migratedSlugs.length - 3))
      await validateReadingPackages({ contentDir, slugs: batch })
      console.log(`Validated ${migratedSlugs.length}/${libraryItems.length} reading packages`)
    }
  }

  await validateReadingPackages({ contentDir })
  console.log(`Migrated 13 fail-closed reading packages; copied 0 images and 0 audio files`)
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) await migrateReadings()
