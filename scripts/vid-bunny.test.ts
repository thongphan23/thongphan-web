import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import test from 'node:test'
import {
  buildTusAuthorization,
  createBunnyVideo,
  getBunnyVideoDetails,
  mapBunnyStatus,
  verifyBunnyWebhook,
} from '../workers/vid/bunny'
import type { VidEnv } from '../workers/vid/types'

const env = {
  VID_DB: {} as VidEnv['VID_DB'],
  PAGES_ORIGIN: 'https://pages.example.com',
  BUNNY_LIBRARY_ID: '123',
  BUNNY_CDN_HOST: 'media.example.com',
  BUNNY_STREAM_API_KEY: 'bunny-api-key',
  BUNNY_WEBHOOK_SECRET: 'bunny-read-only-key',
} satisfies VidEnv

test('creates a Bunny video using a server-only AccessKey', async () => {
  let request: Request | undefined
  const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
    request = new Request(input, init)
    return Response.json({ guid: 'video-guid', title: 'Tiêu đề' })
  }
  const result = await createBunnyVideo({ title: 'Tiêu đề' }, env, fetcher)
  assert.deepEqual(result, { videoId: 'video-guid' })
  assert.equal(request?.url, 'https://video.bunnycdn.com/library/123/videos')
  assert.equal(request?.headers.get('AccessKey'), 'bunny-api-key')
  assert.deepEqual(await request?.json(), { title: 'Tiêu đề' })
})

test('reads encoded media details and derives only configured Bunny URLs', async () => {
  const details = await getBunnyVideoDetails('video-guid', env, async () => Response.json({
    length: 605.8,
    thumbnailFileName: 'thumbnail_7.jpg',
  }))
  assert.deepEqual(details, {
    durationSeconds: 606,
    thumbnailUrl: 'https://media.example.com/video-guid/thumbnail_7.jpg',
    previewUrl: 'https://media.example.com/video-guid/preview.webp',
    playerUrl: 'https://player.mediadelivery.net/embed/123/video-guid',
  })
})

test('builds the documented TUS SHA-256 signature', async () => {
  const authorization = await buildTusAuthorization('video-guid', 1_786_586_400, env)
  const expected = createHash('sha256')
    .update('123bunny-api-key1786586400video-guid')
    .digest('hex')
  assert.deepEqual(authorization, {
    endpoint: 'https://video.bunnycdn.com/tusupload',
    videoId: 'video-guid',
    libraryId: '123',
    expirationTime: 1_786_586_400,
    signature: expected,
  })
})

test('verifies Bunny v1 raw-body HMAC and maps lifecycle status', async () => {
  const rawBody = '{"VideoLibraryId":123,"VideoGuid":"video-guid","Status":3}'
  const headers = new Headers({
    'X-BunnyStream-Signature-Version': 'v1',
    'X-BunnyStream-Signature-Algorithm': 'hmac-sha256',
    'X-BunnyStream-Signature': createHmac('sha256', 'bunny-read-only-key').update(rawBody).digest('hex'),
  })
  assert.equal(await verifyBunnyWebhook(rawBody, headers, env), true)
  assert.equal(await verifyBunnyWebhook(`${rawBody} `, headers, env), false)
  assert.equal(mapBunnyStatus(3), 'ready')
  assert.equal(mapBunnyStatus(4), 'ready')
  assert.equal(mapBunnyStatus(5), 'failed')
  assert.equal(mapBunnyStatus(6), 'uploading')
  assert.equal(mapBunnyStatus(2), 'processing')
})
