import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const audioRoot = new URL('../public/voice/audio/', import.meta.url)
const tracks = [
  'benchmark-low-salary-a9f60144.mp3',
  'benchmark-stop-goal-b2f21c6b.mp3',
  'benchmark-fewer-friends-6ac9f880.mp3',
]

test('voice review route is noindex and exposes three Mèo béo review tracks', async () => {
  const [page, player] = await Promise.all([
    readFile(new URL('../app/voice/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/voice-review/VoiceReviewPlayer.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /OWNER VOICE REVIEW · MÈO BÉO/)
  assert.match(page, /18\/18 cụm được giữ trọn/)
  assert.match(page, /0–0,2562% · đạt/)
  assert.match(page, /Ba ý tưởng/)
  assert.match(page, /<VoiceReviewPlayer\s*\/>/)
  assert.match(player, /id:\s*['"]CV['"]/)
  assert.match(player, /id:\s*['"]DX['"]/)
  assert.match(player, /id:\s*['"]BB['"]/)
  assert.equal((player.match(/preload="metadata"/g) ?? []).length, 1)
  assert.match(player, /controls/)
  assert.match(player, /onPlay=/)
  assert.match(player, /Lương thấp nhưng học nhiều/)
  assert.match(player, /Khi nào nên ngừng một mục tiêu/)
  assert.match(player, /Tại sao càng lớn càng ít bạn/)
  assert.equal((player.match(/benchmark-[a-z-]+-[a-f0-9]{8}\.mp3/g) ?? []).length, 3)
  assert.match(player, /Đọc toàn bộ kịch bản/)
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
