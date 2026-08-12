import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const routeCases = [
  ['app/vid/page.tsx', 'home'],
  ['app/vid/watch/page.tsx', 'watch'],
  ['app/vid/results/page.tsx', 'results'],
  ['app/vid/topic/page.tsx', 'topic'],
  ['app/vid/playlist/page.tsx', 'playlist'],
  ['app/vid/library/page.tsx', 'library'],
]

test('all Vid entry routes are static shells with exact view contracts', async () => {
  for (const [file, view] of routeCases) {
    const source = await readFile(file, 'utf8')
    assert.match(source, new RegExp(`initialView=["']${view}["']`))
  }
  const layout = await readFile('app/vid/layout.tsx', 'utf8')
  assert.match(layout, /https:\/\/vid\.thongphan\.com/)
})

test('Vid bypasses the general SiteChrome and owns one standalone shell', async () => {
  const [modes, chrome, shell] = await Promise.all([
    readFile('lib/site-route-mode.ts', 'utf8'),
    readFile('components/site-chrome/SiteChrome.tsx', 'utf8'),
    readFile('components/vid/VidShell.tsx', 'utf8'),
  ])
  assert.match(modes, /'video-platform'/)
  assert.match(modes, /'\/vid': 'video-platform'/)
  assert.match(chrome, /mode === 'video-platform'/)
  assert.match(chrome, /window\.location\.hostname === 'vid\.thongphan\.com'/)
  assert.match(shell, />VID<\/strong><span>·<\/span> THÔNG PHAN/)
  for (const label of ['Trang chủ', 'Chủ đề', 'Danh sách phát', 'Xem tiếp', 'Xem sau']) {
    assert.match(shell, new RegExp(label))
  }
  assert.doesNotMatch(shell, /Đăng nhập|Bình luận|Đăng ký kênh|Theo dõi/)
})

test('Vid shell locks pinned safe areas, focus and reduced motion', async () => {
  const css = await readFile('components/vid/Vid.module.css', 'utf8')
  assert.match(css, /\.header\s*\{[^}]*position:\s*fixed/s)
  assert.match(css, /\.sidebar\s*\{[^}]*position:\s*fixed/s)
  assert.match(css, /\.bottomNav\s*\{[^}]*position:\s*fixed/s)
  assert.match(css, /min-height:\s*44px/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
  assert.match(css, /overflow-x:\s*hidden/)
})
