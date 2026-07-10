import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import libraryModule from '../lib/library.ts'

const { getLibraryNoteBySlug, getLibrarySlugs } = libraryModule

const root = new URL('../', import.meta.url)
const CONTENT_CONTRACT_HASH = '867c1fd5a9c4015bf7003982c27509ada162041b819f2090a29341f11bb5d6da'

async function readProjectFile(path) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return ''
    throw error
  }
}

test('living notes preserve all 14 canonical content contracts', async () => {
  const slugs = getLibrarySlugs()
  const notes = await Promise.all(slugs.map((slug) => getLibraryNoteBySlug(slug)))

  assert.ok(notes.every((note) => note !== null))
  assert.ok(notes.every((note) => typeof note?.contentHtml === 'string' && note.contentHtml.length > 0))
  assert.ok(notes.every((note) => Array.isArray(note?.headings) && note.headings.length > 0))

  const contract = notes.map((note) => ({
    slug: note?.slug,
    contentHtml: note?.contentHtml,
    headings: note?.headings,
    relatedLinks: note?.relatedLinks,
    sourceTrace: note?.sourceTrace,
    cta: note?.cta,
  }))

  assert.equal(notes.length, 14)
  assert.equal(slugs.length, 14)
  assert.equal(new Set(slugs).size, 14)
  assert.equal(slugs.includes('read'), false)
  assert.equal(createHash('sha256').update(JSON.stringify(contract)).digest('hex'), CONTENT_CONTRACT_HASH)
})

test('living-note route is static, fail-closed, semantic, and graph-free', async () => {
  const [route, article, css] = await Promise.all([
    readProjectFile('app/library/[slug]/page.tsx'),
    readProjectFile('app/library/[slug]/LibraryArticle.tsx'),
    readProjectFile('app/library/[slug]/page.module.css'),
  ])

  assert.match(route, /export const dynamicParams = false/)
  assert.match(route, /generateStaticParams/)
  assert.match(route, /getLibrarySlugs\(\)/)
  assert.match(route, /notFound\(\)/)
  assert.match(route, /canonical:\s*`?\/library\//)

  assert.match(article, /dangerouslySetInnerHTML=\{\{ __html: note\.contentHtml \}\}/)
  assert.match(article, /note\.headings/)
  assert.match(article, /Note này mở ra/)
  assert.match(article, /Các note dẫn về đây/)
  assert.match(article, /Nguồn tạo nên ghi chú này/)
  assert.equal((article.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((article.match(/<main\b/g) ?? []).length, 0)

  const surface = `${article}\n${css}`
  assert.doesNotMatch(surface, /Local graph|GraphGroups|graphSection|graphColumns|GardenSignature/)
  assert.doesNotMatch(surface, /accent-(?:blue|gold|green)|box-shadow/)
  assert.match(css, /font-size:\s*1\.125rem/)
  assert.match(css, /position:\s*sticky/)
  assert.match(css, /overflow-wrap:\s*anywhere/)
})

test('blog index uses all four posts and keeps featured search and filters truthful', async () => {
  const [page, client, css] = await Promise.all([
    readProjectFile('app/blog/page.tsx'),
    readProjectFile('app/blog/BlogFiltersClient.tsx'),
    readProjectFile('app/blog/page.module.css'),
  ])

  assert.match(page, /canonical:\s*['"]\/blog['"]/)
  assert.match(page, /posts=\{posts\.map/)
  assert.doesNotMatch(page, /regularPosts/)
  assert.doesNotMatch(page, /GardenSignature|readingCompass|readingJourney|CSSProperties/)
  assert.match(client, /filterBlogPosts/)
  assert.match(client, /showFeatured/)
  assert.match(client, /featuredSlug/)
  assert.doesNotMatch(`${page}\n${client}\n${css}`, /compassGrid|compassCore|pathNode|filterIcon|accent-(?:blue|gold|green)|box-shadow/)

  const { filterBlogPosts } = await import('../app/blog/blog-filtering.ts')
  const posts = [
    { slug: 'ai', title: 'AI không cướp việc bạn', description: 'Bớt sợ AI', category: 'ai', journeyLabel: 'Sợ AI' },
    { slug: 'brain2', title: 'Xây Brain2', description: 'Hệ tri thức', category: 'brain2', journeyLabel: 'Brain2' },
    { slug: 'viral', title: '40 bài viral', description: 'Đọc dữ liệu', category: 'content', journeyLabel: 'Content kéo khách' },
    { slug: 'marketing', title: '10 năm marketing', description: 'Kinh nghiệm thật', category: 'career', journeyLabel: 'Tài sản số' },
  ]
  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'fear-ai', label: 'Sợ AI', slugs: ['ai'] },
    { key: 'brain2', label: 'Brain2', categories: ['brain2'] },
  ]

  assert.deepEqual(filterBlogPosts(posts, categories, 'all', '10 năm').map((post) => post.slug), ['marketing'])
  assert.deepEqual(filterBlogPosts(posts, categories, 'fear-ai', '').map((post) => post.slug), ['ai'])
  assert.deepEqual(filterBlogPosts(posts, categories, 'brain2', '').map((post) => post.slug), ['brain2'])
})
