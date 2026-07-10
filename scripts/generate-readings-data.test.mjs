import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'content/readings')
const generatorPath = join(root, 'scripts/generate-readings-data.mjs')
const validatorPath = join(root, 'scripts/validate-reading-rights.mjs')
const materializerPath = join(root, 'scripts/materialize-reading-assets.mjs')
const migrationPath = join(root, 'scripts/migrate-readings.mjs')
const generatedPath = join(root, 'lib/readings-data.generated.ts')
const legacyRoot = process.env.THONGPHAN_READ_ROOT ?? '/Users/rio/Projects/thongphan-read'

const exists = async (path) => stat(path).then(() => true, () => false)
const artifactsReady =
  (await exists(contentRoot)) &&
  (await exists(generatorPath)) &&
  (await exists(validatorPath)) &&
  (await exists(materializerPath)) &&
  (await exists(migrationPath))

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const signArticle = (article) => ({ ...article, contentChecksum: sha256(JSON.stringify(article)) })
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const blockCount = (item) =>
  (item.sections ?? []).reduce(
    (count, section) => count + (section.blocks?.length ?? section.paragraphs?.length ?? 0),
    0,
  )

test('reading ingestion artifacts exist before package validation', () => {
  assert.ok(artifactsReady, 'expected reading packages, generator, validator, and materializer')
})

test('13 committed packages preserve safe legacy parity without translated bodies', { skip: !artifactsReady }, async () => {
  const { libraryItems } = await import(pathToFileURL(join(legacyRoot, 'src/library.ts')).href)
  const slugs = (await readdir(contentRoot)).sort()

  assert.equal(libraryItems.length, 13)
  assert.equal(slugs.length, 13)
  assert.equal(new Set(slugs).size, 13)

  for (const item of libraryItems) {
    const packageRoot = join(contentRoot, item.slug)
    const [article, rights, imagePack] = await Promise.all([
      readJson(join(packageRoot, 'article.json')),
      readJson(join(packageRoot, 'rights.json')),
      readJson(join(packageRoot, 'image-pack.json')),
    ])

    assert.equal(article.slug, item.slug)
    assert.equal(article.title, item.title)
    assert.equal(article.author, item.author)
    assert.equal(article.sourceUrl, item.url)
    assert.equal(article.readingPath, `/library/read/${item.slug}`)
    assert.equal(article.legacySectionCount, item.sections?.length ?? 0)
    assert.equal(article.legacyBlockCount, blockCount(item))
    assert.equal(article.legacyBodyChecksum, sha256(JSON.stringify(item.sections ?? [])))
    const { contentChecksum, ...unsignedArticle } = article
    assert.equal(contentChecksum, sha256(JSON.stringify(unsignedArticle)))
    assert.ok(Array.isArray(article.topics) && article.topics.length > 0)
    assert.ok(['clarity', 'taste', 'asset'].includes(article.intent))
    assert.ok(['under-10', '10-20', 'over-20'].includes(article.durationBand))
    assert.equal(article.rightsStatus, 'source-link-only')
    assert.equal('sections' in article, false)
    assert.equal('paragraphs' in article, false)
    assert.equal('blocks' in article, false)

    assert.equal(rights.slug, item.slug)
    assert.equal(rights.rightsStatus, 'source-link-only')
    assert.equal(rights.publicationMode, 'summary')
    assert.deepEqual(rights.textRights, {
      translation: false,
      publicWeb: false,
      commercialContext: false,
    })
    assert.deepEqual(rights.evidence, [])

    assert.equal(imagePack.slug, item.slug)
    assert.equal(imagePack.candidates.length, item.images?.length ?? 0)
    assert.equal(imagePack.mediaChecksum, sha256(JSON.stringify(imagePack.candidates)))
    for (const candidate of imagePack.candidates) {
      assert.equal(candidate.status, 'pending-rights')
      assert.equal('publicPath' in candidate, false)
      assert.ok(candidate.sourceLocation)
      assert.ok(candidate.alt)
      assert.ok(candidate.caption)
      assert.ok(candidate.credit)
    }
  }
})

test('rights validator rejects bodies outside full mode and requires complete full-text evidence', { skip: !artifactsReady }, async () => {
  const { validateReadingPackage } = await import(pathToFileURL(validatorPath).href)
  const article = {
    schemaVersion: 1,
    slug: 'test-reading',
    title: 'Test',
    description: 'Safe summary',
    author: 'Author',
    source: 'Source',
    sourceUrl: 'https://example.com/source',
    sourcePublishedAt: null,
    translator: null,
    editor: null,
    translatedAt: null,
    lastReviewedAt: '2026-07-10',
    rightsStatus: 'source-link-only',
    minutes: 10,
    topics: ['thinking'],
    intent: 'clarity',
    durationBand: '10-20',
    readingPath: '/library/read/test-reading',
    legacySectionCount: 1,
    legacyBlockCount: 1,
    legacyBodyChecksum: `sha256:${'a'.repeat(64)}`,
    contentVersion: 1,
  }
  const imagePack = {
    schemaVersion: 1,
    slug: 'test-reading',
    candidates: [],
    mediaChecksum: sha256('[]'),
  }
  const sourceLinkRights = {
    schemaVersion: 1,
    slug: 'test-reading',
    rightsStatus: 'source-link-only',
    publicationMode: 'summary',
    textRights: { translation: false, publicWeb: false, commercialContext: false },
    evidence: [],
  }

  assert.match(
    validateReadingPackage({ article: signArticle({ ...article, sections: [] }), rights: sourceLinkRights, imagePack }).join('\n'),
    /must not contain body field "sections"/,
  )
  assert.match(
    validateReadingPackage({ article: signArticle({ ...article, rightsStatus: 'blocked', blocks: [] }), rights: { ...sourceLinkRights, rightsStatus: 'blocked', publicationMode: 'blocked' }, imagePack: { ...imagePack, slug: 'test-reading' } }).join('\n'),
    /must not contain body field "blocks"/,
  )

  const fullArticle = signArticle({ ...article, rightsStatus: 'licensed', sections: [] })
  const fullRights = {
    ...sourceLinkRights,
    rightsStatus: 'licensed',
    publicationMode: 'full',
    textRights: { translation: true, publicWeb: true, commercialContext: true },
  }
  assert.match(
    validateReadingPackage({ article: fullArticle, rights: fullRights, imagePack }).join('\n'),
    /non-placeholder evidence/,
  )
  assert.match(
    validateReadingPackage({ article: fullArticle, rights: { ...fullRights, evidence: [{ reference: 'TBD' }] }, imagePack }).join('\n'),
    /non-placeholder evidence/,
  )
  assert.deepEqual(
    validateReadingPackage({
      article: fullArticle,
      rights: {
        ...fullRights,
        evidence: [{ type: 'license', reference: 'License agreement 2026-07-10', verifiedAt: '2026-07-10' }],
      },
      imagePack,
    }),
    [],
  )
})

test('generation is byte-stable and public records expose summaries only', { skip: !artifactsReady }, async () => {
  const { generateReadingsData } = await import(pathToFileURL(generatorPath).href)
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'readings-data-'))
  const outputFile = join(temporaryRoot, 'readings.generated.ts')

  try {
    await generateReadingsData({ contentDir: contentRoot, outputFile })
    const first = await readFile(outputFile, 'utf8')
    await generateReadingsData({ contentDir: contentRoot, outputFile })
    const second = await readFile(outputFile, 'utf8')
    assert.equal(second, first)

    await generateReadingsData({ contentDir: contentRoot, outputFile: generatedPath })
    const generatedUrl = `${pathToFileURL(generatedPath).href}?test=${Date.now()}`
    const { generatedReadings } = await import(generatedUrl)
    assert.equal(generatedReadings.length, 13)

    for (const reading of generatedReadings) {
      assert.equal(reading.publicationMode, 'summary')
      assert.equal('sections' in reading, false)
      assert.equal('blocks' in reading, false)
      assert.equal('paragraphs' in reading, false)
      assert.equal('candidates' in reading, false)
      assert.deepEqual(reading.images, [])
      assert.deepEqual(reading.audio, [])
    }

    const readingsModule = await import(`${pathToFileURL(join(root, 'lib/readings.ts')).href}?test=${Date.now()}`)
    assert.equal(readingsModule.getAllReadingSummaries().length, 13)
    assert.equal(readingsModule.getPublicReadings().length, 13)
    assert.equal(readingsModule.getReadingSlugs().length, 13)
    assert.equal(readingsModule.getReadingBySlug('does-not-exist'), null)
    assert.ok(readingsModule.getPublicReadings().every((reading) => reading.rightsStatus !== 'blocked'))
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})

test('topic, intent, and duration adapters are deterministic', { skip: !artifactsReady }, async () => {
  const { adaptDurationBand, adaptIntent, adaptTopics } = await import(pathToFileURL(migrationPath).href)
  const sample = {
    theme: 'Taste trong lựa chọn đời sống',
    branch: 'Taste · Work · Mortality',
    abilityTags: ['Judgment'],
    minutes: 24,
  }

  assert.deepEqual(adaptTopics(sample), adaptTopics(sample))
  assert.equal(adaptIntent(sample), adaptIntent(sample))
  assert.equal(adaptDurationBand(sample.minutes), adaptDurationBand(sample.minutes))
})

test('materializer treats zero ready assets as a successful no-op', { skip: !artifactsReady }, async () => {
  const { materializeReadingAssets } = await import(pathToFileURL(materializerPath).href)
  assert.deepEqual(await materializeReadingAssets({ contentDir: contentRoot, publicDir: join(root, 'public') }), {
    ready: 0,
    validated: 0,
  })
})
