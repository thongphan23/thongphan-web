import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/cua-ban-la-gi/media/',
  import.meta.url,
)
const videoName = 'cua-ban-la-gi-coco-v4-5d6a41a8288f.mp4'
const retiredVideoName = 'cua-ban-la-gi-coco-v3-5fe2405c693b.mp4'
const posterName = 'cua-ban-la-gi-coco-v4-poster-07595f2cede5.jpg'

test('review route uses a content-addressed video and exposes encoded QA', async () => {
  const [page, css] = await Promise.all([
    readFile(new URL('../app/review/cua-ban-la-gi/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/review/cua-ban-la-gi/page.module.css', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, new RegExp(videoName.replaceAll('.', '\\.')))
  assert.doesNotMatch(page, new RegExp(retiredVideoName.replaceAll('.', '\\.')))
  assert.doesNotMatch(page, /cua-ban-la-gi-coco-web\.mp4/)
  assert.match(page, /vertical-edit-plan\.json/)
  assert.match(page, /vertical-semantic-pixel-qa\.json/)
  assert.match(page, /vertical-caption-safe-area-qa\.json/)
  assert.match(css, /aspect-ratio:\s*9\s*\/\s*16/)
})

test('review media and evidence are present and internally consistent', async () => {
  const video = new URL(videoName, mediaRoot)
  const retiredVideo = new URL(retiredVideoName, mediaRoot)
  const poster = new URL(posterName, mediaRoot)
  const requiredEvidence = [
    'owner-review-packet.md',
    'owner-feedback-crop-caption-incident.md',
    'final-video-qa.json',
    'production-shot-plan.json',
    'source-casting-board.json',
    'vertical-edit-plan.json',
    'vertical-semantic-pixel-qa.json',
    'vertical-rendered-observations.json',
    'vertical-caption-safe-area-qa.json',
    'final-contact-sheet.jpg',
    'face-review-contact-01.jpg',
    'face-review-contact-02.jpg',
    'face-review-contact-03.jpg',
    'face-review-contact-04.jpg',
    'face-review-contact-05.jpg',
    'face-review-contact-06.jpg',
  ]

  await Promise.all([access(video), access(poster)])
  await assert.rejects(access(retiredVideo))
  const [videoInfo, posterInfo, videoBytes] = await Promise.all([
    stat(video),
    stat(poster),
    readFile(video),
  ])
  assert.ok(videoInfo.size > 1_000_000)
  assert.ok(videoInfo.size < 25 * 1024 * 1024)
  assert.ok(posterInfo.size > 10_000)
  assert.equal(
    createHash('sha256').update(videoBytes).digest('hex'),
    '5d6a41a8288f131b8a50dc7b4fb0013352efd8ac066f496f1ab0f5eb2976c703',
  )

  for (const filename of requiredEvidence) {
    await access(new URL(`evidence/${filename}`, mediaRoot))
  }

  const qa = JSON.parse(
    await readFile(new URL('evidence/final-video-qa.json', mediaRoot), 'utf8'),
  )
  assert.equal(qa.status, 'PASS')
  assert.equal(qa.editorial.vertical_timeline_items, 46)
  assert.equal(qa.editorial.encoded_start_mid_end_observations, 138)
  assert.equal(qa.editorial.face_required_timeline_items, 27)
  assert.equal(qa.editorial.measured_face_observations, 81)
  assert.equal(qa.editorial.face_boundary_pass_observations, 81)
  assert.equal(qa.editorial.manual_face_and_head_review_pass_observations, 81)
  assert.equal(qa.web_delivery.sha256, '5d6a41a8288f131b8a50dc7b4fb0013352efd8ac066f496f1ab0f5eb2976c703')
  assert.equal(qa.captions.encoded_pixel_observations, 45)
  assert.equal(qa.captions.voice_words_covered, qa.captions.voice_words_total)
})
