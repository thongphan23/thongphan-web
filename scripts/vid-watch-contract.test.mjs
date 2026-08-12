import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('watch view embeds the official Bunny player without blocking its controls', async () => {
  const [app, player, watch, css] = await Promise.all([
    readFile('components/vid/VidApp.tsx', 'utf8'),
    readFile('components/vid/BunnyPlayer.tsx', 'utf8'),
    readFile('components/vid/WatchView.tsx', 'utf8'),
    readFile('components/vid/Vid.module.css', 'utf8'),
  ])
  assert.match(app, /<WatchView/)
  assert.match(player, /playerjs-latest\.min\.js/)
  assert.match(player, /player\.mediadelivery\.net/)
  assert.match(player, /timeupdate/)
  assert.match(player, /pause/)
  assert.match(player, /ended/)
  assert.match(player, /pagehide/)
  assert.match(player, /allowFullScreen/)
  assert.match(player, /picture-in-picture/)
  assert.match(css, /\.playerFrame,[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/)
  assert.doesNotMatch(css, /\.playerFrame::(?:before|after)/)
  assert.match(watch, /recordVideoProgress/)
})

test('watch view exposes provenance, sharing and related discovery', async () => {
  const source = await readFile('components/vid/WatchView.tsx', 'utf8')
  for (const token of [
    'Xem video gốc',
    'Bản thuyết minh tiếng Việt',
    'Sao chép liên kết',
    'Chia sẻ',
    'Sao chép tại thời điểm này',
    'Video liên quan',
    'Video trước',
    'Video tiếp',
    'rankRelated',
    '<details',
  ]) assert.match(source, new RegExp(token))
  assert.match(source, /rel="noopener noreferrer"/)
})

test('watch state updates cannot key or remount the Bunny player', async () => {
  const [player, watch, qa] = await Promise.all([
    readFile('components/vid/BunnyPlayer.tsx', 'utf8'),
    readFile('components/vid/WatchView.tsx', 'utf8'),
    readFile('scripts/qa-vid.mjs', 'utf8'),
  ])

  assert.match(qa, /watch: Bunny player iframe identity changed/)
  assert.match(qa, /watch: provider current time did not advance/)
  assert.match(qa, /watch: reload did not resume close to saved progress/)
  assert.doesNotMatch(watch, /<BunnyPlayer[^>]*key=/)
  assert.doesNotMatch(watch, /playerUrl=.*(?:library|watchLater)/)
  assert.match(watch, /data-vid-player={video\.slug}/)
  assert.match(player, /const onTimeUpdateRef/)
  assert.match(player, /\[playerUrl, scriptReady, startSeconds\]/)
  assert.match(player, /playerError/)
  assert.match(player, /player\.on\('error'/)
  assert.doesNotMatch(player, /setInterval\(/)
})

test('provider error QA matches alert text without assuming an accessible name', async () => {
  const qa = await readFile('scripts/qa-vid.mjs', 'utf8')

  assert.match(qa, /getByRole\('alert'\)\.filter\(\{ hasText:/)
  assert.doesNotMatch(qa, /getByRole\('alert', \{ name:/)
})
