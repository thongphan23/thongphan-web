import assert from 'node:assert/strict'
import test from 'node:test'

import { getPlaylist, getVideo, listTopics, listVideos } from '../lib/vid/api-client'

const video = {
  slug: 'tu-duy-he-thong',
  title: 'Tư duy hệ thống trong thời đại AI',
  description: 'Một mô tả đủ dùng.',
  sourceTitle: 'Systems Thinking',
  sourceCreator: 'Original Creator',
  sourceCreatorUrl: 'https://example.com/creator',
  sourceVideoUrl: 'https://example.com/video',
  translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  topics: ['tu-duy'],
  tags: ['ai'],
  playlists: ['ai-foundation'],
  durationSeconds: 634,
  thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
  previewUrl: 'https://cdn.example.com/preview.mp4',
  playerUrl: 'https://player.example.com/embed/1',
  featuredRank: 1,
  publishedAt: '2026-08-12T00:00:00.000Z',
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function rawResponse(value: unknown): Response {
  return { ok: true, status: 200, json: async () => value } as Response
}

test('catalog client uses same-origin public endpoints and no-store semantics', async () => {
  const calls: Array<{ input: string; init?: RequestInit }> = []
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ input: String(input), init })
    return jsonResponse({ items: [video], page: 2, pageSize: 12, total: 13 })
  }

  const result = await listVideos({ page: 2, pageSize: 12 }, { fetcher })
  assert.equal(result.items[0]?.slug, video.slug)
  assert.equal(result.total, 13)
  assert.equal(calls[0]?.input, '/api/videos?page=2&pageSize=12')
  assert.equal(calls[0]?.init?.cache, 'no-store')
})

test('detail, topic and playlist clients validate public payloads', async () => {
  const responses = [
    jsonResponse(video),
    jsonResponse({ items: [{ slug: 'tu-duy', label: 'Tư duy', video_count: 4 }] }),
    jsonResponse({ slug: 'ai-foundation', title: 'Nền tảng AI', description: 'Tuyển tập', items: [video] }),
  ]
  const fetcher: typeof fetch = async () => responses.shift()!

  assert.equal((await getVideo(video.slug, { fetcher })).slug, video.slug)
  assert.equal((await listTopics({ fetcher }))[0]?.videoCount, 4)
  assert.equal((await getPlaylist('ai-foundation', { fetcher })).items.length, 1)
})

test('detail client preserves non-default integer focal percentages', async () => {
  const result = await getVideo(video.slug, {
    fetcher: async () => jsonResponse({ ...video, thumbnailFocalX: 17, thumbnailFocalY: 83 }),
  })
  assert.equal(result.thumbnailFocalX, 17)
  assert.equal(result.thumbnailFocalY, 83)
})

test('video client rejects malformed focal percentages without coercion', async () => {
  for (const key of ['thumbnailFocalX', 'thumbnailFocalY']) {
    for (const value of [null, true, '50', 50.5, -1, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
      await assert.rejects(
        () => getVideo(video.slug, { fetcher: async () => rawResponse({ ...video, [key]: value }) }),
        /Invalid video payload/,
        `accepted malformed ${key} value ${String(value)}`,
      )
    }
  }
})

test('catalog client fails closed on HTTP and malformed payloads', async () => {
  await assert.rejects(
    () => listVideos({}, { fetcher: async () => jsonResponse({ error: 'down' }, 503) }),
    /503/,
  )
  await assert.rejects(
    () => getVideo('bad', { fetcher: async () => jsonResponse({ title: 'missing fields' }) }),
    /payload/i,
  )
})
