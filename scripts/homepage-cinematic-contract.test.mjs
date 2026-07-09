import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return ''
    throw error
  }
}

function escaped(phrase) {
  return new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

test('homepage locks the approved Evidence Cinema story and truthful assets', async () => {
  const page = await readProjectFile('app/page.tsx')
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const content = await readProjectFile('components/home-cinema/home-cinema-content.ts')
  const source = `${page}\n${home}\n${content}`

  for (const required of [
    'Biến chuyên môn thật thành tài sản có người muốn dùng.',
    'Từ trải nghiệm thật đến cộng đồng trả phí',
    'Khám phá lộ trình của bạn',
    'THÔNG PHAN',
    'id="story"',
    'id="proof"',
    'id="method"',
    'id="paths"',
    'id="conan"',
    'thong-stage-anchor.jpg',
    'thong-library-author.jpg',
    'LÀM THẬT · TRẢ GIÁ THẬT · HỆ THỐNG THẬT',
  ]) {
    assert.match(source, escaped(required))
  }

  for (const banned of [
    'Knowledge Garden',
    'premium-garden',
    'Brain2',
    'ACV Framework',
    '<video',
    'verified',
    '10,000',
    '10000',
  ]) {
    assert.doesNotMatch(source, escaped(banned))
  }
})

test('homepage source exposes the selected cinema visual and responsive contract', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const globals = await readProjectFile('styles/globals.css')
  const layout = await readProjectFile('app/layout.tsx')
  const combined = `${css}\n${globals}\n${layout}`

  for (const required of [
    '--cinema-ink: #070706',
    '--cinema-ink-raised: #12100f',
    '--cinema-paper: #e8dfcf',
    '--cinema-paper-muted: #a69e92',
    '--cinema-lacquer: #b3231b',
    '--cinema-lacquer-bright: #e04b43',
    '@media (prefers-reduced-motion: reduce)',
    '@media (max-width: 767px)',
    'scroll-snap-type: x mandatory',
    'Cormorant_Garamond',
    'Be_Vietnam_Pro',
  ]) {
    assert.match(combined, escaped(required))
  }

  assert.doesNotMatch(combined, /data-theme=["']premium-garden["']/i)
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}[^\n]*(gold|green|blue)/i)
})

test('route-aware chrome includes an accessible mobile cinema menu', async () => {
  const chrome = await readProjectFile('components/site-chrome/SiteChrome.tsx')
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  for (const required of [
    'usePathname',
    'Mục lục',
    'aria-expanded',
    'aria-modal="true"',
    'role="dialog"',
    'Escape',
    'triggerRef.current?.focus()',
    'Câu chuyện',
    'Bằng chứng',
    'Phương pháp',
    'Conan Maker',
  ]) {
    assert.match(chrome, escaped(required))
  }

  assert.match(css, /min-height:\s*44px/i)
})

test('homepage motion is scoped, reversible and reduced-motion safe', async () => {
  const motion = await readProjectFile('components/ScrollAnimations.tsx')

  for (const required of [
    "matchMedia('(prefers-reduced-motion: reduce)')",
    '[data-cinema-root]',
    '[data-cinema-reveal]',
    '[data-focus-pull]',
    '[data-evidence-stamp]',
    'observer.disconnect()',
  ]) {
    assert.match(motion, escaped(required))
  }

  assert.doesNotMatch(motion, /pointermove|cursor follower|data-cursor/i)
})
