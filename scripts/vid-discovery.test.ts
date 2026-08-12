import assert from 'node:assert/strict'
import test from 'node:test'
import { filterVideos, normalizeVietnamese, rankRelated } from '../lib/vid/discovery'
import type { PublicVideo } from '../lib/vid/contracts'

function video(slug: string, overrides: Partial<PublicVideo> = {}): PublicVideo {
  return {
    slug,
    title: slug,
    description: 'Mô tả nền tảng',
    sourceTitle: 'Original',
    sourceCreator: 'Creator',
    sourceCreatorUrl: 'https://example.com/creator',
    sourceVideoUrl: 'https://example.com/video',
    translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
    topics: ['ai'],
    tags: ['tư duy'],
    playlists: [],
    durationSeconds: 600,
    thumbnailUrl: 'https://example.com/thumb.jpg',
    previewUrl: 'https://example.com/preview.webp',
    playerUrl: 'https://player.mediadelivery.net/embed/1/video',
    featuredRank: null,
    publishedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

test('normalizes Vietnamese diacritics and treats đ like d', () => {
  assert.equal(normalizeVietnamese('Đổi đời bằng AI'), 'doi doi bang ai')
})

test('search ranks title before description and filters by topic', () => {
  const titleMatch = video('title', { title: 'Hệ thống AI', topics: ['ai'] })
  const bodyMatch = video('body', { title: 'Công việc', description: 'Xây hệ thống AI', topics: ['ai'] })
  const wrongTopic = video('wrong', { title: 'Hệ thống AI', topics: ['content'] })

  assert.deepEqual(
    filterVideos([bodyMatch, wrongTopic, titleMatch], 'he thong ai', 'ai').map(({ slug }) => slug),
    ['title', 'body'],
  )
})

test('related videos prefer playlist, then topic, tag and recency deterministically', () => {
  const current = video('current', { playlists: ['foundation'], topics: ['ai'], tags: ['system'] })
  const playlist = video('playlist', { playlists: ['foundation'], topics: ['other'], tags: [] })
  const topic = video('topic', { topics: ['ai'], tags: [], publishedAt: '2026-08-10T00:00:00.000Z' })
  const tag = video('tag', { topics: ['other'], tags: ['system'] })

  assert.deepEqual(
    rankRelated(current, [tag, current, topic, playlist]).map(({ slug }) => slug),
    ['playlist', 'topic', 'tag'],
  )
})
