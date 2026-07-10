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

test('library hub locks the approved headline, CTA, lanes, and summary-only data boundary', async () => {
  const [page, discovery] = await Promise.all([
    readProjectFile('app/library/page.tsx'),
    readProjectFile('components/library/LibraryDiscovery.tsx'),
  ])

  assert.match(page, /Một thư viện để đọc sâu, nghĩ rõ và làm ra thứ có giá trị\./)
  assert.match(
    page,
    /href=["'{`]\/library\/read\/steve-jobs-2005-stanford-commencement-address/,
  )
  assert.match(page, />Bắt đầu đọc</)
  assert.match(page, /Tuyển đọc thế giới/)
  assert.match(page, /Ghi chú sống của Thông/)
  assert.match(page, /Bài của Thông/)
  assert.match(page, /getAllReadingSummaries\(\)/)
  assert.match(page, /getAllPosts\(\)/)
  assert.match(page, /getAllLibraryNotes\(\)/)
  assert.match(page, /<Suspense[\s\S]*?<LibraryDiscovery/)
  assert.equal((page.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((page.match(/<main\b/g) ?? []).length, 0)

  assert.match(discovery, /useSearchParams\(\)/)
  assert.match(discovery, /router\.replace\(/)
  assert.match(discovery, /Loại nội dung/)
  assert.match(discovery, /Chủ đề/)
  assert.match(discovery, /Thời lượng/)
  assert.match(discovery, /Mục tiêu đọc/)
  assert.match(discovery, /Xóa bộ lọc/)
  assert.doesNotMatch(discovery, /contentHtml|sections|images|audio|sourceTrace|rightsStatus/)
})

test('library hub removes Garden and CSS-art motifs from its migrated surface', async () => {
  const sources = await Promise.all([
    readProjectFile('app/library/page.tsx'),
    readProjectFile('app/library/page.module.css'),
    readProjectFile('components/library/LibraryDiscovery.tsx'),
    readProjectFile('components/library/LibraryDiscovery.module.css'),
  ])
  const combined = sources.join('\n')

  for (const banned of [
    'GardenSignature',
    'graphStage',
    'graphCore',
    'graphNode',
    'heroStats',
    '>Catalog<',
    '>Status<',
    '>Growing<',
    '>Section<',
  ]) {
    assert.doesNotMatch(combined, new RegExp(banned))
  }
  assert.doesNotMatch(sources[1], /::before|::after/)
  assert.doesNotMatch(sources[3], /::before|::after/)
})

test('library metadata and generated SEO are canonical, deterministic, and safe', async () => {
  const [page, sitemap, robots, { serializeStructuredData }] = await Promise.all([
    readProjectFile('app/library/page.tsx'),
    readProjectFile('app/sitemap.ts'),
    readProjectFile('app/robots.ts'),
    import('../lib/structured-data'),
  ])

  assert.match(page, /canonical:\s*['"]\/library['"]/)
  assert.match(page, /CollectionPage/)
  assert.match(page, /ItemList/)
  assert.match(page, /serializeStructuredData/)
  assert.equal(serializeStructuredData({ value: '<script' }), '{"value":"\\u003cscript"}')
  assert.doesNotMatch(sitemap, /new Date\(\)/)
  assert.doesNotMatch(sitemap, /read\.thongphan\.com/)
  assert.match(sitemap, /export const dynamic = ['"]force-static['"]/)
  assert.match(robots, /export const dynamic = ['"]force-static['"]/)
  assert.match(robots, /https:\/\/thongphan\.com\/sitemap\.xml/)
  assert.doesNotMatch(robots, /read\.thongphan\.com/)
})

test('library visual uses the approved raster rather than a fabricated portrait or CSS frame', async () => {
  const [page, css, siteHeader] = await Promise.all([
    readProjectFile('app/library/page.tsx'),
    readProjectFile('app/library/page.module.css'),
    readProjectFile('components/site-chrome/SiteHeader.tsx'),
  ])

  assert.match(page, /evidence-cinema-film-texture-v2\.webp/)
  assert.doesNotMatch(page, /Steve Jobs[^\n]*<img|steve[^\n]*(?:png|jpe?g|webp)/i)
  assert.doesNotMatch(css, /filter:\s*(?:brightness|saturate)|box-shadow:\s*[^;]*(?:green|blue|gold)/i)
  assert.match(siteHeader, /pathname\.startsWith\(['"]\/library['"]\)/)
  assert.match(siteHeader, /THƯ VIỆN/)
})
