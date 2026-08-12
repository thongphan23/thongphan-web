import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PUBLIC_VIDEO_KEYS,
  toPublicVideo,
  validateDraftInput,
  type VideoRecord,
} from '../lib/vid/contracts'

const validDraft = {
  slug: 'tu-duy-ai-co-ban',
  title: 'Tư duy AI căn bản',
  description: 'Một bản thuyết minh giúp người xem hiểu nền tảng.',
  sourceTitle: 'AI Foundations',
  sourceCreator: 'Original Creator',
  sourceCreatorUrl: 'https://www.youtube.com/@creator',
  sourceVideoUrl: 'https://www.youtube.com/watch?v=abc123',
  translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  rightsStatus: 'owner-reviewed' as const,
  rightsNote: 'Nguồn và phạm vi sử dụng đã được chủ sở hữu rà soát.',
  topics: ['ai'],
  tags: ['tư duy'],
}

const published: VideoRecord = {
  id: 'vid_01',
  bunnyVideoId: '657bb740-a71b-4529-a012-528021c31a92',
  idempotencyKey: 'upload-01',
  ...validDraft,
  durationSeconds: 605,
  thumbnailUrl: 'https://media.example.com/vid/thumbnail.jpg',
  previewUrl: 'https://media.example.com/vid/preview.webp',
  playerUrl: 'https://player.mediadelivery.net/embed/123/657bb740-a71b-4529-a012-528021c31a92',
  status: 'published',
  mediaStatus: 'ready',
  featuredRank: 1,
  publishedAt: '2026-08-12T08:00:00.000Z',
  createdAt: '2026-08-12T07:00:00.000Z',
  updatedAt: '2026-08-12T08:00:00.000Z',
}

test('validates a complete owner-reviewed draft', () => {
  assert.deepEqual(validateDraftInput(validDraft), validDraft)
})

test('rejects unknown, unsafe and incomplete draft fields', () => {
  assert.throws(
    () => validateDraftInput({ ...validDraft, sourceVideoUrl: 'http://example.com/video' }),
    /sourceVideoUrl must be an HTTPS URL/,
  )
  assert.throws(
    () => validateDraftInput({ ...validDraft, rightsNote: '' }),
    /rightsNote is required/,
  )
  assert.throws(
    () => validateDraftInput({ ...validDraft, apiKey: 'must-not-be-accepted' }),
    /Unknown field: apiKey/,
  )
})

test('publishes only ready media with an exact safe DTO', () => {
  assert.equal(toPublicVideo({ ...published, status: 'processing' }), null)
  assert.equal(toPublicVideo({ ...published, mediaStatus: 'failed' }), null)

  const publicVideo = toPublicVideo(published)
  assert.ok(publicVideo)
  assert.deepEqual(Object.keys(publicVideo).sort(), [...PUBLIC_VIDEO_KEYS].sort())
  assert.equal('rightsNote' in publicVideo, false)
  assert.equal('idempotencyKey' in publicVideo, false)
  assert.equal('id' in publicVideo, false)
  assert.equal('bunnyVideoId' in publicVideo, false)
})
