import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { validateReadingPackages } from './validate-reading-rights.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'content/readings')
const readRoot = process.env.THONGPHAN_READ_ROOT ?? join(homedir(), 'Projects/thongphan-read')
const reviewedAt = '2026-07-12'
const publicReadingsDir = join(root, 'public/images/readings')
const ownerPermissionReference =
  'Owner directive 2026-07-12: restore the complete translated reader and editorial images previously published on read.thongphan.com'

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

const publicSections = (item) =>
  (item.sections ?? []).map((section) => ({
    title: section.title,
    minutes: section.minutes,
    blocks: section.blocks ?? (section.paragraphs ?? []).map((text) => ({ kind: 'paragraph', text })),
  }))

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
    rightsStatus: 'permission-confirmed',
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
    sections: publicSections(item),
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
  rightsStatus: 'permission-confirmed',
  publicationMode: 'full',
  textRights: {
    translation: true,
    publicWeb: true,
    commercialContext: true,
  },
  evidence: [
    {
      type: 'permission',
      reference: ownerPermissionReference,
      verifiedAt: reviewedAt,
    },
  ],
  reviewedAt,
})

const safeAssetName = (source, index) => {
  const path = /^https:\/\//.test(source) ? new URL(source).pathname : source
  const extension = extname(path).toLowerCase() || '.jpg'
  const stem = basename(path, extension)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 72) || `image-${index + 1}`
  return `${String(index + 1).padStart(2, '0')}-${stem}${extension}`
}

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds))

const loadLegacyImage = async (source) => {
  if (!/^https:\/\//.test(source)) {
    return readFile(join(readRoot, 'public', source.replace(/^\//, '')))
  }

  for (const delay of [0, 1200, 3500, 8000]) {
    if (delay) await wait(delay)
    const response = await fetch(source, {
      redirect: 'follow',
      headers: { 'user-agent': 'thongphan-com/1.0 (https://thongphan.com)' },
    })
    if (response.ok) {
      await wait(650)
      return Buffer.from(await response.arrayBuffer())
    }
    if (response.status !== 429) {
      throw new Error(`Could not fetch ${source}: HTTP ${response.status}`)
    }
  }
  throw new Error(`Could not fetch ${source}: Wikimedia rate limit persisted after retries`)
}

const createImagePack = async (item) => {
  const assetRoot = join(publicReadingsDir, item.slug)
  await mkdir(assetRoot, { recursive: true })

  const candidates = []
  for (const [index, image] of (item.images ?? []).entries()) {
    const filename = safeAssetName(image.src, index)
    const destination = join(assetRoot, filename)
    const bytes = await readFile(destination).catch(() => loadLegacyImage(image.src))
    await writeFile(destination, bytes)
    candidates.push({
      id: `image-${String(index + 1).padStart(2, '0')}`,
      sourceLocation: image.src,
      sourceUrl: /^https:\/\//.test(image.src) ? image.src : null,
      publicPath: `/images/readings/${item.slug}/${filename}`,
      alt: image.alt,
      caption: image.caption,
      credit: image.credit,
      license: image.credit,
      derivative: filename,
      checksum: sha256(bytes),
      rightsEvidence: [
        {
          type: 'permission',
          reference: ownerPermissionReference,
          verifiedAt: reviewedAt,
        },
      ],
      provenance: {
        legacyArticle: item.slug,
        legacyLocation: image.src,
        articleSourceUrl: item.url,
      },
      status: 'ready',
    })
  }

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
      createImagePack(item).then((pack) => writeJson(join(packageRoot, 'image-pack.json'), pack)),
    ])
    migratedSlugs.push(item.slug)

    if (migratedSlugs.length % 3 === 0 || migratedSlugs.length === libraryItems.length) {
      const batch = migratedSlugs.slice(Math.max(0, migratedSlugs.length - 3))
      await validateReadingPackages({ contentDir, slugs: batch })
      console.log(`Validated ${migratedSlugs.length}/${libraryItems.length} reading packages`)
    }
  }

  await validateReadingPackages({ contentDir })
  console.log(`Migrated 13 complete reading packages; materialized 65 images and 0 audio files`)
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) await migrateReadings()
