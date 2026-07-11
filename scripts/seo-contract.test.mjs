import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

import blogData from '../lib/blog-data.generated.ts'
import libraryData from '../lib/library-data.generated.ts'
import microAssetData from '../lib/micro-assets.ts'
import readingData from '../lib/readings.ts'

const { getAllPosts } = blogData
const { getAllLibraryNotes } = libraryData
const { getAllMicroAssets } = microAssetData
const { getAllReadingSummaries } = readingData

const root = new URL('../', import.meta.url)
const out = new URL('out/', root)

async function source(path) {
  return readFile(new URL(path, root), 'utf8')
}

async function built(path) {
  try {
    await access(new URL(path, out))
  } catch {
    assert.fail(`build output missing: out/${path}`)
  }
  return readFile(new URL(path, out), 'utf8')
}

function assertCanonical(html, pathname) {
  const absolute = `https://thongphan.com${pathname}`
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1]
  assert.ok(canonical, `canonical link missing for ${pathname}`)
  assert.equal(new URL(canonical).toString(), new URL(absolute).toString())
  assert.match(html, /<meta[^>]+property="og:title"[^>]+content="[^"]+"/)
  assert.match(html, /<meta[^>]+property="og:description"[^>]+content="[^"]+"/)
}

test('SEO primitives and fail-closed legacy metadata exist', async () => {
  const [seo, jsonLd, classic, concept, headers, redirects] = await Promise.all([
    source('lib/seo.ts'),
    source('components/seo/JsonLd.tsx'),
    source('app/classic/page.tsx'),
    source('app/concept/page.tsx'),
    source('public/_headers'),
    source('public/_redirects'),
  ])

  assert.match(
    seo,
    /SITE_URL\s*=\s*['"]https:\/\/thongphan\.com['"]/,
  )
  assert.match(jsonLd, /application\/ld\+json/)
  for (const legacy of [classic, concept]) {
    assert.match(legacy, /index:\s*false/)
    assert.match(legacy, /follow:\s*false/)
  }
  assert.match(headers, /X-Robots-Tag:\s*noindex, nofollow/i)
  assert.match(headers, /Cache-Control:.*immutable/i)
  assert.deepEqual(
    redirects.trim().split(/\r?\n/).sort(),
    ['/conanmaker /conanmaker/ 301', '/game /game/ 301'].sort(),
  )
  assert.doesNotMatch(redirects, /read\.thongphan\.com|\/library\/read/i)
})

test('built sitemap includes every public content family and excludes legacy routes', async () => {
  const sitemap = await built('sitemap.xml')
  const expected = [
    'https://thongphan.com/',
    ...getAllPosts().map((post) => `https://thongphan.com/blog/${post.slug}`),
    ...getAllLibraryNotes().map((note) => `https://thongphan.com/library/${note.slug}`),
    ...getAllReadingSummaries().map((reading) => `https://thongphan.com${reading.readingPath}`),
    ...getAllMicroAssets().map((asset) => `https://thongphan.com/assets/${asset.slug}`),
    'https://thongphan.com/challenges/brain2-21-ngay',
  ]
  for (const url of expected) assert.match(sitemap, new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`))
  assert.doesNotMatch(sitemap, /\/classic|\/concept|co-che-tep-moi|read\.thongphan\.com/)
})

test('robots, canonical metadata, structured data and custom 404 survive export', async () => {
  const robots = await built('robots.txt')
  assert.match(robots, /Disallow:\s*\/classic/i)
  assert.match(robots, /Disallow:\s*\/concept/i)
  assert.match(robots, /Sitemap:\s*https:\/\/thongphan\.com\/sitemap\.xml/i)

  const reading = getAllReadingSummaries()[0]
  const samples = [
    ['index.html', '/'],
    ['library.html', '/library'],
    ['library/read.html', '/library/read'],
    [`library/read/${reading.slug}.html`, reading.readingPath],
    ['about.html', '/about'],
  ]
  for (const [file, pathname] of samples) assertCanonical(await built(file), pathname)

  const readingHtml = await built(`library/read/${reading.slug}.html`)
  assert.match(readingHtml, /<script[^>]+type="application\/ld\+json"/)
  assert.match(readingHtml, /https:\/\/schema\.org/)

  const notFound = await built('404.html')
  assert.match(notFound, /data-cinema-not-found/)
  assert.match(notFound, /data-site-shell="unified"/)
  assert.match(notFound, /data-route-mode="cinema-dark"/)
  assert.match(notFound, /href="\/"/)
})
