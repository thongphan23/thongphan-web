import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/remotion-muc-dich-doi-song/media/',
  import.meta.url,
)
const evidenceRoot = new URL('evidence/vertical-framing-v1/', mediaRoot)
const MAX_PAGES_ASSET_BYTES = 25 * 1024 * 1024
const films = ['soul', 'forrest-gump', 'a-beautiful-mind']
const videos = [
  'vertical-r1-soul-web.mp4',
  'vertical-r1-forrest-gump-web.mp4',
  'vertical-r1-a-beautiful-mind-web.mp4',
  'vertical-r2-soul-web.mp4',
  'vertical-r2-forrest-gump-web.mp4',
  'vertical-r2-a-beautiful-mind-web.mp4',
  'vertical-r3-soul-web.mp4',
  'vertical-r3-forrest-gump-web.mp4',
  'vertical-r3-a-beautiful-mind-web.mp4',
]

test('review route is noindex and exposes three rounds by three single-film videos', async () => {
  const [page, gallery] = await Promise.all([
    readFile(new URL('../app/review/remotion-muc-dich-doi-song/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/remotion-review/VideoReviewGallery.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /<VideoReviewGallery\s*\/>/)
  assert.match(page, /3 vòng × 3 phim/)
  assert.match(gallery, /aria-label="Chọn vòng cải tiến"/)
  assert.match(gallery, /aria-label="Chọn phim"/)
  assert.equal((gallery.match(/id: 'r[123]'/g) ?? []).length, 3)
  assert.equal((gallery.match(/id: '(?:soul|forrest-gump|a-beautiful-mind)'/g) ?? []).length, 3)
  assert.equal((gallery.match(/vertical-r[123]-(?:soul|forrest-gump|a-beautiful-mind)-web\.mp4/g) ?? []).length, 9)
  assert.match(gallery, /preload="metadata"/)
  assert.match(gallery, /playsInline/)
  assert.match(gallery, /controls/)
  assert.match(gallery, /poster=\{media\.poster\}/)
  assert.match(gallery, /Chỉ phản hồi trực tiếp của anh mới/)
  assert.doesNotMatch(gallery, /autoPlay/)
})

test('all nine web videos are bounded, non-empty and have matching posters', async () => {
  for (const filename of videos) {
    const video = new URL(filename, mediaRoot)
    const poster = new URL(filename.replace('-web.mp4', '-poster.jpg'), mediaRoot)
    await access(video)
    await access(poster)
    const [videoInfo, posterInfo] = await Promise.all([stat(video), stat(poster)])
    assert.ok(videoInfo.size > 1_000_000, `${filename} is unexpectedly small`)
    assert.ok(videoInfo.size < MAX_PAGES_ASSET_BYTES, `${filename} exceeds 25 MiB`)
    assert.ok(posterInfo.size > 10_000, `${poster.pathname} is unexpectedly small`)
  }
})

test('each round exposes its report, three plans and three contact sheets', async () => {
  await access(new URL('implementation-report.md', evidenceRoot))
  await access(new URL('vertical-focus-observations.json', evidenceRoot))
  await access(new URL('vertical-focus-overrides.json', evidenceRoot))
  await access(new URL('round-3-manual-pixel-adjudication.json', evidenceRoot))

  for (const round of [1, 2, 3]) {
    await access(new URL(`round-${round}-self-evaluation.md`, evidenceRoot))
    await access(new URL(`round-${round}-self-evaluation.json`, evidenceRoot))
    await access(new URL(`round-${round}-vertical-videos.json`, evidenceRoot))
    for (const film of films) {
      await access(new URL(`round-${round}-${film}-composition-plan.json`, evidenceRoot))
      await access(new URL(`round-${round}-${film}-contact-sheet.jpg`, evidenceRoot))
    }
  }
})

test('review layout keeps a stable 9:16 player and a one-column mobile reading order', async () => {
  const css = await readFile(
    new URL('../app/review/remotion-muc-dich-doi-song/page.module.css', import.meta.url),
    'utf8',
  )

  assert.match(css, /aspect-ratio:\s*9\s*\/\s*16/)
  assert.match(css, /@media\s*\(max-width:\s*820px\)/)
  assert.match(css, /\.reviewStage[\s\S]*grid-template-columns:\s*1fr/)
})
