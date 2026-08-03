import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/cua-ban-la-gi/media/',
  import.meta.url,
)

test('reel review route is noindex and exposes the locked Coco edit', async () => {
  const [page, css] = await Promise.all([
    readFile(new URL('../app/review/cua-ban-la-gi/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/review/cua-ban-la-gi/page.module.css', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /cua-ban-la-gi-coco-web\.mp4/)
  assert.match(page, /Coco/)
  assert.match(page, /production-shot-plan\.json/)
  assert.match(page, /owner-review-packet\.md/)
  assert.match(css, /aspect-ratio:\s*9\s*\/\s*16/)
})

test('web video and review evidence are bounded and present', async () => {
  const video = new URL('cua-ban-la-gi-coco-web.mp4', mediaRoot)
  const poster = new URL('cua-ban-la-gi-coco-poster.jpg', mediaRoot)
  const requiredEvidence = [
    'owner-review-packet.md',
    'final-video-qa.json',
    'production-shot-plan.json',
    'source-casting-board.json',
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
})
