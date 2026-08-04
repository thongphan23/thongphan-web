import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/cua-ban-la-gi/media/',
  import.meta.url,
)
const videoName = 'cua-ban-la-gi-coco-v3-5fe2405c693b.mp4'

test('review route uses a content-addressed video and exposes encoded QA', async () => {
  const [page, css] = await Promise.all([
    readFile(new URL('../app/review/cua-ban-la-gi/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/review/cua-ban-la-gi/page.module.css', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, new RegExp(videoName.replaceAll('.', '\\.')))
  assert.doesNotMatch(page, /cua-ban-la-gi-coco-web\.mp4/)
  assert.match(page, /vertical-edit-plan\.json/)
  assert.match(page, /vertical-semantic-pixel-qa\.json/)
  assert.match(page, /vertical-caption-safe-area-qa\.json/)
  assert.match(css, /aspect-ratio:\s*9\s*\/\s*16/)
})

test('review media and evidence are present and internally consistent', async () => {
  const video = new URL(videoName, mediaRoot)
  const poster = new URL('cua-ban-la-gi-coco-poster.jpg', mediaRoot)
  const requiredEvidence = [
    'owner-review-packet.md',
    'final-video-qa.json',
    'production-shot-plan.json',
    'source-casting-board.json',
    'vertical-edit-plan.json',
    'vertical-semantic-pixel-qa.json',
    'vertical-caption-safe-area-qa.json',
    'final-contact-sheet.jpg',
  ]

  await Promise.all([access(video), access(poster)])
  const [videoInfo, posterInfo] = await Promise.all([stat(video), stat(poster)])
  assert.ok(videoInfo.size > 1_000_000)
  assert.ok(videoInfo.size < 25 * 1024 * 1024)
  assert.ok(posterInfo.size > 10_000)

  for (const filename of requiredEvidence) {
    await access(new URL(`evidence/${filename}`, mediaRoot))
  }

  const qa = JSON.parse(
    await readFile(new URL('evidence/final-video-qa.json', mediaRoot), 'utf8'),
  )
  assert.equal(qa.status, 'PASS')
  assert.equal(qa.editorial.vertical_timeline_items, 46)
  assert.equal(qa.captions.encoded_pixel_observations, 45)
  assert.equal(qa.captions.voice_words_covered, qa.captions.voice_words_total)
})
