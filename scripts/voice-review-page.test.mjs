import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const audioRoot = new URL('../public/voice/audio/', import.meta.url)
const tracks = ['A.mp3', 'B.mp3', 'C.mp3']

test('voice review route is noindex and exposes three controlled tracks', async () => {
  const [page, player] = await Promise.all([
    readFile(new URL('../app/voice/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/voice-review/VoiceReviewPlayer.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /<VoiceReviewPlayer\s*\/>/)
  assert.equal((player.match(/id:\s*['"][ABC]['"]/g) ?? []).length, 3)
  assert.equal((player.match(/preload="metadata"/g) ?? []).length, 1)
  assert.match(player, /controls/)
  assert.match(player, /onPlay=/)
  assert.doesNotMatch(player, /autoPlay/)
})

test('voice review audio is web-sized and complete', async () => {
  for (const filename of tracks) {
    const audio = new URL(filename, audioRoot)
    await access(audio)
    const info = await stat(audio)
    assert.ok(info.size > 1_000_000, `${filename} is unexpectedly small`)
    assert.ok(info.size < 5 * 1024 * 1024, `${filename} exceeds 5 MiB`)
  }
})

test('voice review remains readable on narrow remote-control screens', async () => {
  const css = await readFile(new URL('../app/voice/page.module.css', import.meta.url), 'utf8')

  assert.match(css, /@media\s*\(max-width:\s*720px\)/)
  assert.match(css, /grid-template-columns:\s*1fr/)
  assert.match(css, /min-height:\s*44px/)
})
