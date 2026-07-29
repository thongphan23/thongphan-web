import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const mediaRoot = new URL(
  '../public/review/remotion-muc-dich-doi-song/media/',
  import.meta.url,
)
const MAX_PAGES_ASSET_BYTES = 25 * 1024 * 1024

const videos = [
  'soul-silent-first-v2-web.mp4',
  'walter-mitty-silent-first-v2-web.mp4',
  'whiplash-silent-first-v2-web.mp4',
]

test('review route is private-by-discovery and exposes exactly three film variants', async () => {
  const [page, gallery] = await Promise.all([
    readFile(new URL('../app/review/remotion-muc-dich-doi-song/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/remotion-review/VideoReviewGallery.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /<VideoReviewGallery\s*\/>/)
  assert.equal((gallery.match(/id:\s*['"](?:soul|walter-mitty|whiplash)['"]/g) ?? []).length, 3)
  assert.match(gallery, /preload="metadata"/)
  assert.match(gallery, /playsInline/)
  assert.match(gallery, /controls/)
  assert.match(gallery, /poster=\{activeVariant\.poster\}/)
  assert.equal((gallery.match(/silent-first-v2-web\.mp4/g) ?? []).length, 3)
  assert.doesNotMatch(gallery, /media\/(?:soul|walter-mitty|whiplash)-web\.mp4/)
  assert.doesNotMatch(gallery, /autoPlay/)
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
