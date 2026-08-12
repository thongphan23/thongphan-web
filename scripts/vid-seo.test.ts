import assert from 'node:assert/strict'
import test from 'node:test'
import { buildVidSitemap, buildWatchSeo } from '../workers/vid/seo'
import type { PublicVideo } from '../lib/vid/contracts'

const video: PublicVideo = {
  slug: 'tu-duy-ai',
  title: 'Tư duy AI & hệ thống',
  description: 'Mô tả video chuyên sâu.',
  sourceTitle: 'Original',
  sourceCreator: 'Creator',
  sourceCreatorUrl: 'https://example.com/creator',
  sourceVideoUrl: 'https://example.com/video',
  translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  topics: ['ai'], tags: ['tư duy'], playlists: [],
  durationSeconds: 605,
  thumbnailUrl: 'https://media.example.com/thumb.jpg',
  previewUrl: 'https://media.example.com/preview.webp',
  playerUrl: 'https://player.mediadelivery.net/embed/123/video',
  featuredRank: 1,
  publishedAt: '2026-08-12T00:00:00.000Z',
}

test('watch SEO has canonical subdomain metadata and VideoObject provenance', () => {
  const seo = buildWatchSeo(video)
  assert.equal(seo.canonical, 'https://vid.thongphan.com/watch?v=tu-duy-ai')
  assert.equal(seo.title, 'Tư duy AI & hệ thống · VID Thông Phan')
  assert.equal(seo.structuredData['@type'], 'VideoObject')
  assert.equal(seo.structuredData.thumbnailUrl, video.thumbnailUrl)
  assert.equal(seo.structuredData.embedUrl, video.playerUrl)
  assert.equal(seo.structuredData.duration, 'PT10M5S')
  assert.equal(seo.structuredData.isBasedOn, video.sourceVideoUrl)
})

test('Vid sitemap contains the hub and every published watch URL', () => {
  const xml = buildVidSitemap([
    { slug: 'tu-duy-ai', updatedAt: '2026-08-12T00:00:00.000Z' },
    { slug: 'he-thong', updatedAt: '2026-08-11T00:00:00.000Z' },
  ])
  assert.match(xml, /<loc>https:\/\/vid\.thongphan\.com<\/loc>/)
  assert.match(xml, /watch\?v=tu-duy-ai/)
  assert.match(xml, /watch\?v=he-thong/)
  assert.equal((xml.match(/<url>/g) ?? []).length, 3)
})
