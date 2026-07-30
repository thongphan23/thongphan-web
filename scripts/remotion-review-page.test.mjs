import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/remotion-muc-dich-doi-song/media/',
  import.meta.url,
)
const MAX_PAGES_ASSET_BYTES = 25 * 1024 * 1024

const videos = [
  'direct-proof-visual-semantic-v1-web.mp4',
  'soul-centered-visual-semantic-v1-web.mp4',
  'office-human-visual-semantic-v1-web.mp4',
]

test('review route is private-by-discovery and exposes exactly three visual-semantic variants', async () => {
  const [page, gallery] = await Promise.all([
    readFile(new URL('../app/review/remotion-muc-dich-doi-song/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/remotion-review/VideoReviewGallery.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /<VideoReviewGallery\s*\/>/)
  assert.equal((gallery.match(/id:\s*['"](?:direct-proof|soul-centered|office-human)['"]/g) ?? []).length, 3)
  assert.match(gallery, /preload="metadata"/)
  assert.match(gallery, /playsInline/)
  assert.match(gallery, /controls/)
  assert.match(gallery, /poster=\{activeVariant\.poster\}/)
  assert.equal((gallery.match(/visual-semantic-v1-web\.mp4/g) ?? []).length, 3)
  assert.equal((gallery.match(/evidenceHref:/g) ?? []).length, 3)
  assert.match(gallery, /Mở quyết định hình ảnh/)
  assert.match(gallery, /scorecardHref:/)
  assert.doesNotMatch(gallery, /media\/(?:about-time|click|up-in-the-air)-visual-proposition/)
  assert.doesNotMatch(gallery, /autoPlay/)
})

test('review handoff exposes the traceable visual-proposition evidence packet', async () => {
  const evidenceRoot = new URL('evidence/', mediaRoot)
  for (const filename of [
    'workflow-evidence-index.json',
    'render-qa-report.json',
    'claim-timeline.json',
    'source-reuse-report.json',
    'scorecard-comparison.md',
    'direct-proof-visual-selection-review.md',
    'soul-centered-visual-selection-review.md',
    'office-human-visual-selection-review.md',
    'direct-proof-visual-proposition-graph.json',
    'soul-centered-visual-proposition-graph.json',
    'office-human-visual-proposition-graph.json',
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
