import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return ''
    throw error
  }
}

test('reading index and detail routes are static, canonical, and fail closed', async () => {
  const [indexPage, detailPage, seo, sitemap] = await Promise.all([
    readProjectFile('app/library/read/page.tsx'),
    readProjectFile('app/library/read/[slug]/page.tsx'),
    readProjectFile('lib/reading-structured-data.ts'),
    readProjectFile('app/sitemap.ts'),
  ])

  assert.match(indexPage, /getPublicReadings\(\)/)
  assert.match(indexPage, /CollectionPage/)
  assert.match(indexPage, /ItemList/)
  assert.match(indexPage, /canonical:\s*['"]\/library\/read['"]/)
  assert.equal((indexPage.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((indexPage.match(/<main\b/g) ?? []).length, 0)

  assert.match(detailPage, /export const dynamicParams = false/)
  assert.match(detailPage, /generateStaticParams/)
  assert.match(detailPage, /getReadingSlugs\(\)/)
  assert.match(detailPage, /notFound\(\)/)
  assert.match(detailPage, /generateMetadata/)
  assert.match(detailPage, /buildReadingStructuredData/)
  assert.match(detailPage, /SourceDisclosure/)
  assert.match(detailPage, /ReadingToolbar/)
  assert.equal((detailPage.match(/<h1\b/g) ?? []).length, 0, 'h1 belongs to ArticleHeader')
  assert.equal((detailPage.match(/<main\b/g) ?? []).length, 0)

  assert.match(seo, /isBasedOn/)
  assert.doesNotMatch(seo, /articleBody/)
  assert.match(sitemap, /getAllReadingSummaries/)
  assert.match(sitemap, /readingPath/)
})

test('current source-link pages expose only editorial guidance and the original source action', async () => {
  const [detailPage, sourceDisclosure, toolbar, readings] = await Promise.all([
    readProjectFile('app/library/read/[slug]/page.tsx'),
    readProjectFile('components/editorial/SourceDisclosure.tsx'),
    readProjectFile('components/library/ReadingToolbar.tsx'),
    readProjectFile('lib/readings.ts'),
  ])

  assert.match(detailPage, /Ghi chú tuyển đọc/)
  assert.match(detailPage, /coreIdea/)
  assert.match(detailPage, /whyRead/)
  assert.match(detailPage, /reflection/)
  assert.match(detailPage, /authorProfile/)
  assert.match(detailPage, /contentContext/)
  assert.doesNotMatch(detailPage, /articleBody|dangerouslySetInnerHTML|<audio|sections\.map|images\.map/)

  assert.match(sourceDisclosure, /bài gốc/)
  assert.match(sourceDisclosure, /target=["']_blank["']/)
  assert.match(sourceDisclosure, /noopener noreferrer/)
  assert.doesNotMatch(sourceDisclosure, /source-link-only|rightsStatus/)

  assert.match(toolbar, /SAVED_STORAGE_KEY/)
  assert.match(toolbar, /capabilitiesForPublication/)
  assert.doesNotMatch(toolbar, /contentHtml|sections|images|sourceTrace|rightsStatus|evidence|<audio|audio\.map/)
  assert.match(readings, /getRelatedReadingSummaries/)
})

test('reading routes respect public minimum type sizes and avoid legacy motifs', async () => {
  const sources = await Promise.all([
    readProjectFile('app/library/read/page.module.css'),
    readProjectFile('app/library/read/[slug]/page.module.css'),
    readProjectFile('components/editorial/Editorial.module.css'),
    readProjectFile('components/library/ReadingToolbar.module.css'),
  ])
  const combined = sources.join('\n')

  assert.doesNotMatch(combined, /Garden|graphStage|radar|halo|::before|::after/)
  const remSizes = [...combined.matchAll(/font-size:\s*(0?\.\d+)rem/g)].map((match) => Number(match[1]))
  assert.ok(remSizes.length > 0)
  assert.ok(remSizes.every((size) => size >= 0.75), `found sub-12px rem size: ${remSizes}`)
  assert.match(sources[2], /\.backLink,[\s\S]*?font-size:\s*0\.875rem/)
  assert.match(sources[3], /\.toolbar button\s*\{[\s\S]*?font-size:\s*0\.875rem/)
})
