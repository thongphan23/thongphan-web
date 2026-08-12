import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('catalog experience has real cards, progress, delayed preview and complete states', async () => {
  const [app, card, grid, home, catalog, library, css] = await Promise.all([
    readFile('components/vid/VidApp.tsx', 'utf8'),
    readFile('components/vid/VideoCard.tsx', 'utf8'),
    readFile('components/vid/VideoGrid.tsx', 'utf8'),
    readFile('components/vid/HomeView.tsx', 'utf8'),
    readFile('components/vid/CatalogView.tsx', 'utf8'),
    readFile('components/vid/LocalLibraryView.tsx', 'utf8'),
    readFile('components/vid/Vid.module.css', 'utf8'),
  ])

  assert.doesNotMatch(app, /Nội dung đang được kết nối/)
  assert.match(card, /650/)
  assert.match(card, /prefers-reduced-motion/)
  assert.match(card, /watchLater/)
  assert.match(card, /durationSeconds/)
  assert.match(grid, /aria-live/)
  assert.match(home, /Suất chiếu nổi bật/i)
  assert.match(home, /Mới tuyển chọn/)
  assert.match(home, /Xem tiếp/)
  assert.match(home, /Theo chủ đề/)
  assert.match(catalog, /filterVideos/)
  assert.match(library, /useLocalLibraryState/)
  assert.match(css, /aspect-ratio:\s*16\s*\/\s*9/)
  assert.match(css, /-webkit-line-clamp:\s*2/)
  assert.match(css, /object-fit:\s*cover/)
  assert.match(css, /@media\s*\(hover:\s*hover\)/)
})

test('visible catalog states are natural and never impersonate social features', async () => {
  const sources = await Promise.all([
    'components/vid/HomeView.tsx',
    'components/vid/CatalogView.tsx',
    'components/vid/LocalLibraryView.tsx',
    'components/vid/VideoGrid.tsx',
  ].map((file) => readFile(file, 'utf8')))
  const source = sources.join('\n')
  for (const text of ['Thử lại', 'Chưa có video', 'Xem sau']) assert.match(source, new RegExp(text))
  assert.doesNotMatch(source, /Đăng nhập|Bình luận|Đăng ký kênh|Theo dõi/)
})
