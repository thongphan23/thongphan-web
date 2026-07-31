import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/remotion-muc-dich-doi-song/media/',
  import.meta.url,
)
const MAX_PAGES_ASSET_BYTES = 25 * 1024 * 1024

const videos = [
  'soul-single-film-v2-web.mp4',
  'click-single-film-v2-web.mp4',
  'forrest-gump-single-film-v2-web.mp4',
]

test('review route is private-by-discovery and exposes exactly three single-film variants', async () => {
  const [page, gallery] = await Promise.all([
    readFile(new URL('../app/review/remotion-muc-dich-doi-song/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/remotion-review/VideoReviewGallery.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /<VideoReviewGallery\s*\/>/)
  assert.equal((gallery.match(/id:\s*['"](?:soul|click|forrest-gump)['"]/g) ?? []).length, 3)
  assert.match(gallery, /preload="metadata"/)
  assert.match(gallery, /playsInline/)
  assert.match(gallery, /controls/)
  assert.match(gallery, /poster=\{activeVariant\.poster\}/)
  assert.equal((gallery.match(/single-film-v2-web\.mp4/g) ?? []).length, 3)
  assert.equal((gallery.match(/single-film-v2-web\.mp4\?v=single-film-v2-20260731/g) ?? []).length, 3)
  assert.equal((gallery.match(/evidenceHref:/g) ?? []).length, 3)
  assert.equal((gallery.match(/continuityHref:/g) ?? []).length, 3)
  assert.match(gallery, /Mở quyết định hình ảnh/)
  assert.match(gallery, /Mở kiểm tra một-phim/)
  assert.match(gallery, /scorecardHref:/)
  assert.doesNotMatch(gallery, /direct-proof|soul-centered|office-human/)
  assert.doesNotMatch(gallery, /autoPlay/)
})

test('review handoff exposes the traceable visual-proposition evidence packet', async () => {
  const evidenceRoot = new URL('evidence/', mediaRoot)
  for (const filename of [
    'workflow-evidence-index.json',
    'workflow-evidence-manifest.json',
    'render-qa-report.json',
    'claim-timeline.json',
    'film-casting-decision.json',
    'single-film-batch-verification.json',
    'single-film-visual-mapping.md',
    'scorecard-comparison.md',
    'soul-visual-selection-review.md',
    'click-visual-selection-review.md',
    'forrest-gump-visual-selection-review.md',
    'soul-visual-proposition-graph.json',
    'click-visual-proposition-graph.json',
    'forrest-gump-visual-proposition-graph.json',
    'soul-single-film-continuity-report.json',
    'click-single-film-continuity-report.json',
    'forrest-gump-single-film-continuity-report.json',
  ]) {
    await access(new URL(filename, evidenceRoot))
  }
})

test('web videos stay below the Cloudflare Pages limit and have matching posters', async () => {
  for (const filename of videos) {
    const video = new URL(filename, mediaRoot)
    const poster = new URL(filename.replace('-web.mp4', '-poster.jpg'), mediaRoot)
    await access(video)
    await access(poster)
    const info = await stat(video)
    assert.ok(info.size > 1_000_000, `${filename} is unexpectedly small`)
    assert.ok(info.size < MAX_PAGES_ASSET_BYTES, `${filename} exceeds 25 MiB`)
  }
})

test('review layout keeps a stable 16:9 player and a one-column mobile reading order', async () => {
  const css = await readFile(
    new URL('../app/review/remotion-muc-dich-doi-song/page.module.css', import.meta.url),
    'utf8',
  )

  assert.match(css, /aspect-ratio:\s*16\s*\/\s*9/)
  assert.match(css, /@media\s*\(max-width:\s*720px\)/)
  assert.match(css, /grid-template-columns:\s*1fr/)
})
