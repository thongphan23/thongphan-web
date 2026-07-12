import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
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
const legacyManifestPath = join(root, 'scripts/fixtures/readings-legacy-manifest.json')
const testFilePath = fileURLToPath(import.meta.url)

const exists = async (path) => stat(path).then(() => true, () => false)
const artifactsReady =
  (await exists(contentRoot)) &&
  (await exists(generatorPath)) &&
  (await exists(validatorPath)) &&
  (await exists(materializerPath)) &&
  (await exists(migrationPath))

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const signArticle = (article) => ({ ...article, contentChecksum: sha256(JSON.stringify(article)) })
const signImagePack = (candidates) => ({
  schemaVersion: 1,
  slug: 'test-reading',
  candidates,
  mediaChecksum: sha256(JSON.stringify(candidates)),
})
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))

const articleFixture = {
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

const sourceLinkRightsFixture = {
  schemaVersion: 1,
  slug: 'test-reading',
  rightsStatus: 'source-link-only',
  publicationMode: 'summary',
  textRights: { translation: false, publicWeb: false, commercialContext: false },
  evidence: [],
}

const createPackageFixture = ({ article = {}, rights = {}, candidates = [] } = {}) => ({
  article: signArticle({ ...articleFixture, ...article }),
  rights: { ...sourceLinkRightsFixture, ...rights },
  imagePack: signImagePack(candidates),
})

test('reading ingestion artifacts exist before package validation', () => {
  assert.ok(artifactsReady, 'expected reading packages, generator, validator, and materializer')
})

test('13 committed packages preserve the complete translated legacy reader', { skip: !artifactsReady }, async () => {
  const legacyManifest = await readJson(legacyManifestPath)
  const slugs = (await readdir(contentRoot)).sort()

  assert.equal(legacyManifest.length, 13)
  assert.equal(slugs.length, 13)
  assert.equal(new Set(slugs).size, 13)
  assert.deepEqual(slugs, legacyManifest.map((item) => item.slug).sort())

  for (const item of legacyManifest) {
    const packageRoot = join(contentRoot, item.slug)
    const [article, rights, imagePack] = await Promise.all([
      readJson(join(packageRoot, 'article.json')),
      readJson(join(packageRoot, 'rights.json')),
      readJson(join(packageRoot, 'image-pack.json')),
    ])

    assert.equal(article.slug, item.slug)
    assert.equal(article.title, item.title)
    assert.equal(article.author, item.author)
    assert.equal(article.sourceUrl, item.sourceUrl)
    assert.equal(article.readingPath, `/library/read/${item.slug}`)
    assert.equal(article.legacySectionCount, item.legacySectionCount)
    assert.equal(article.legacyBlockCount, item.legacyBlockCount)
    assert.equal(article.legacyBodyChecksum, item.legacyBodyChecksum)
    const { contentChecksum, ...unsignedArticle } = article
    assert.equal(contentChecksum, sha256(JSON.stringify(unsignedArticle)))
    assert.ok(Array.isArray(article.topics) && article.topics.length > 0)
    assert.ok(['clarity', 'taste', 'asset'].includes(article.intent))
    assert.ok(['under-10', '10-20', 'over-20'].includes(article.durationBand))
    assert.equal(article.rightsStatus, 'permission-confirmed')
    assert.equal(article.sections.length, item.legacySectionCount)
    assert.equal(
      article.sections.reduce((count, section) => count + section.blocks.length, 0),
      item.legacyBlockCount,
    )

    assert.equal(rights.slug, item.slug)
    assert.equal(rights.rightsStatus, 'permission-confirmed')
    assert.equal(rights.publicationMode, 'full')
    assert.deepEqual(rights.textRights, {
      translation: true,
      publicWeb: true,
      commercialContext: true,
    })
    assert.ok(rights.evidence.length > 0)

    assert.equal(imagePack.slug, item.slug)
    assert.equal(imagePack.candidates.length, 5)
    assert.equal(imagePack.mediaChecksum, sha256(JSON.stringify(imagePack.candidates)))
    for (const candidate of imagePack.candidates) {
      assert.equal(candidate.status, 'ready')
      assert.match(candidate.publicPath, new RegExp(`^/images/readings/${item.slug}/`))
      assert.match(candidate.checksum, /^sha256:[a-f0-9]{64}$/)
      assert.ok(candidate.sourceLocation)
      assert.ok(candidate.alt)
      assert.ok(candidate.caption)
      assert.ok(candidate.credit)
    }
  }
})

test('default tests are self-contained and live-source parity is manual only', async () => {
  const [testSource, packageJson] = await Promise.all([
    readFile(testFilePath, 'utf8'),
    readJson(join(root, 'package.json')),
  ])
  const absoluteLegacyRoot = ['', 'Users', 'rio', 'Projects', 'thongphan-read'].join('/')
  const legacyRootVariable = ['THONGPHAN', 'READ', 'ROOT'].join('_')

  assert.equal(testSource.includes(absoluteLegacyRoot), false)
  assert.equal(testSource.includes(legacyRootVariable), false)
  assert.equal(packageJson.scripts.test.includes('verify-readings-live-parity'), false)
  assert.equal(
    packageJson.scripts['test:readings-live-parity'],
    'node --import tsx scripts/verify-readings-live-parity.mjs',
  )
})

test('rights validator rejects bodies outside full mode and requires complete full-text evidence', { skip: !artifactsReady }, async () => {
  const { validateReadingPackage } = await import(pathToFileURL(validatorPath).href)

  assert.match(
    validateReadingPackage(createPackageFixture({ article: { sections: [] } })).join('\n'),
    /must not contain body field "sections"/,
  )
  assert.match(
    validateReadingPackage(createPackageFixture({
      article: { rightsStatus: 'blocked', blocks: [] },
      rights: { rightsStatus: 'blocked', publicationMode: 'blocked' },
    })).join('\n'),
    /must not contain body field "blocks"/,
  )

  const fullPackage = {
    article: { rightsStatus: 'licensed', sections: [] },
    rights: {
      rightsStatus: 'licensed',
      publicationMode: 'full',
      textRights: { translation: true, publicWeb: true, commercialContext: true },
    },
  }
  assert.match(
    validateReadingPackage(createPackageFixture(fullPackage)).join('\n'),
    /non-placeholder evidence/,
  )
  assert.match(
    validateReadingPackage(createPackageFixture({
      ...fullPackage,
      rights: { ...fullPackage.rights, evidence: [{ reference: 'TBD' }] },
    })).join('\n'),
    /non-placeholder evidence/,
  )
  assert.deepEqual(
    validateReadingPackage(createPackageFixture({
      ...fullPackage,
      rights: {
        ...fullPackage.rights,
        evidence: [{ type: 'license', reference: 'License agreement 2026-07-10', verifiedAt: '2026-07-10' }],
      },
    })),
    [],
  )
})

test('full publication evidence rejects placeholder types and invalid verification dates', { skip: !artifactsReady }, async () => {
  const { validateReadingPackage } = await import(pathToFileURL(validatorPath).href)
  const fullRights = {
    rightsStatus: 'licensed',
    publicationMode: 'full',
    textRights: { translation: true, publicWeb: true, commercialContext: true },
  }
  const invalidEvidence = [
    {
      evidence: [{ type: 'TBD', reference: 'License agreement 2026-07-10', verifiedAt: '2026-07-10' }],
      expected: /evidence type/,
    },
    {
      evidence: [{ type: 'license', reference: 'License agreement 2026-07-10', verifiedAt: 'TBD' }],
      expected: /verifiedAt.*ISO date/,
    },
    {
      evidence: [{ type: 'license', reference: 'License agreement 2026-07-10', verifiedAt: '2026-13-40' }],
      expected: /verifiedAt.*ISO date/,
    },
  ]

  for (const { evidence, expected } of invalidEvidence) {
    const errors = validateReadingPackage(createPackageFixture({
      article: { rightsStatus: 'licensed', sections: [] },
      rights: { ...fullRights, evidence },
    }))
    assert.match(errors.join('\n'), expected)
  }
})

test('publication mode must be an explicit approved enum before status compatibility', { skip: !artifactsReady }, async () => {
  const { validateReadingPackage } = await import(pathToFileURL(validatorPath).href)
  const missingMode = createPackageFixture()
  delete missingMode.rights.publicationMode

  for (const fixture of [missingMode, createPackageFixture({ rights: { publicationMode: 'summry' } })]) {
    const errors = validateReadingPackage(fixture)
    const enumError = errors.findIndex((error) => error.includes('invalid publicationMode'))
    const compatibilityError = errors.findIndex((error) => error.includes('must use summary publication mode'))
    assert.ok(enumError >= 0, errors.join('\n'))
    assert.ok(enumError < compatibilityError, errors.join('\n'))
  }
})

test('ready media validator rejects normalized traversal outside its slug directory', { skip: !artifactsReady }, async () => {
  const { validateReadingPackage } = await import(pathToFileURL(validatorPath).href)
  const candidate = {
    id: 'image-01',
    sourceLocation: 'https://example.com/image.jpg',
    sourceUrl: 'https://example.com/image.jpg',
    publicPath: '/images/readings/test-reading/../../escape.jpg',
    alt: 'Test image',
    caption: 'Test caption',
    credit: 'Example',
    license: 'CC BY 4.0',
    checksum: `sha256:${'c'.repeat(64)}`,
    rightsEvidence: [
      { type: 'license', reference: 'CC BY 4.0 license page', verifiedAt: '2026-07-10' },
    ],
    status: 'ready',
  }

  assert.match(
    validateReadingPackage(createPackageFixture({ candidates: [candidate] })).join('\n'),
    /must stay within.*test-reading/,
  )
})

test('generation is byte-stable and public records expose complete reader content', { skip: !artifactsReady }, async () => {
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
      assert.equal(reading.publicationMode, 'full')
      assert.ok(reading.sections.length > 0)
      assert.equal('candidates' in reading, false)
      assert.equal(reading.images.length, 5)
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

test('materializer verifies all restored editorial assets', { skip: !artifactsReady }, async () => {
  const { materializeReadingAssets } = await import(pathToFileURL(materializerPath).href)
  assert.deepEqual(await materializeReadingAssets({ contentDir: contentRoot, publicDir: join(root, 'public') }), {
    ready: 65,
    validated: 65,
  })
})

test('materializer rejects traversal before reading a ready asset', { skip: !artifactsReady }, async () => {
  const { materializeReadingAssets } = await import(pathToFileURL(materializerPath).href)
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'readings-assets-'))
  const contentDir = join(temporaryRoot, 'content/readings')
  const packageRoot = join(contentDir, 'test-reading')

  try {
    await mkdir(packageRoot, { recursive: true })
    await writeFile(
      join(packageRoot, 'image-pack.json'),
      JSON.stringify({
        slug: 'test-reading',
        candidates: [{
          id: 'image-01',
          status: 'ready',
          publicPath: '/images/readings/test-reading/../../escape.jpg',
          checksum: `sha256:${'c'.repeat(64)}`,
        }],
      }),
    )

    await assert.rejects(
      materializeReadingAssets({ contentDir, publicDir: join(temporaryRoot, 'public') }),
      /must stay within.*test-reading/,
    )
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})
