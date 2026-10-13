import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const componentDir = 'components/two-path'
const componentFiles = readdirSync(new URL(`../${componentDir}`, import.meta.url))
  .filter((name) => name.endsWith('.tsx'))
  .map((name) => `${componentDir}/${name}`)
const componentSource = componentFiles.map(read).join('\n')
const css = read(`${componentDir}/TwoPath.module.css`)

const routes = {
  home: { page: 'app/page.tsx', css: 'app/home.module.css' },
  tensai: { page: 'app/tensai/page.tsx', css: 'app/tensai/page.module.css' },
  conan: { page: 'app/conan/page.tsx', css: 'app/conan/page.module.css' },
}

const count = (source, pattern) => source.match(pattern)?.length ?? 0

test('each route renders exactly one h1 and shared components never add another', () => {
  for (const file of componentFiles) assert.equal(count(read(file), /<h1\b/g), 0, file)
  for (const [name, route] of Object.entries(routes)) {
    assert.equal(count(read(route.page), /<h1\b/g), 1, name)
  }
})

test('branch pages carry their path accent, calm tempo and remember the visit', () => {
  for (const path of ['tensai', 'conan']) {
    const source = read(routes[path].page)
    assert.match(source, new RegExp(`data-path="${path}"`), path)
    assert.match(source, /data-motion-tempo="calm"/, path)
    assert.match(source, new RegExp(`<PathMemory path="${path}" />`), path)
    assert.match(source, /buildBranchPageStructuredData\(/, path)
    assert.match(source, /<PathLink[\s\S]*?kind="outbound"/, path)
  }
  assert.match(read(routes.tensai.page), /id=\{tensaiContent\.courses\.id\}/)
})

test('the homepage offers both doors without choosing a path for the visitor', () => {
  const source = read(routes.home.page)
  assert.doesNotMatch(source, /data-path=/)
  assert.match(source, /data-motion-tempo="calm"/)
  assert.match(source, /<PathDoors variant="hero" placement="door" \/>/)
  assert.match(source, /<PathDoors variant="closing" placement="closing" \/>/)
  assert.match(source, /<PathResume copy=\{homeContent\.resume\} \/>/)
  assert.doesNotMatch(source, /<PathMemory/)
})

test('the resume line reads storage without hydration mismatch or auto-redirect', () => {
  const source = read(`${componentDir}/PathResume.tsx`)
  assert.match(source, /useSyncExternalStore\(/)
  assert.match(source, /,\s*\(\) => null\s*\)/)
  assert.doesNotMatch(source, /router\.push|location\.assign|location\.replace|location\.href\s*=/)
  assert.match(css, /\.resume\s*\{[^}]*min-height:\s*44px/)
})

test('path links dispatch the measurement events and keep destinations in one place', () => {
  const source = read(`${componentDir}/PathLink.tsx`)
  assert.match(source, /'use client'/)
  assert.match(source, /doorEvent\(/)
  assert.match(source, /outboundEvent\(/)
  assert.match(source, /outboundUrl\(/)
  assert.match(source, /new CustomEvent\(/)
  assert.match(source, /PATH_ROUTES\[/)
})

test('path accents follow the endorsed brand palette', () => {
  assert.match(css, /\[data-path='tensai'\][^{]*\{[^}]*#c3f331[^}]*#073b2f/i)
  assert.match(css, /\[data-path='conan'\][^{]*\{[^}]*#c4441f/i)
  assert.match(css, /--path-cta-fg/)
})

test('motion hooks are present and stay within the calm budget', () => {
  const sources = [componentSource, ...Object.values(routes).map((route) => read(route.page))].join('\n')
  for (const hook of [
    'data-motion-action',
    'data-motion-surface',
    'data-motion-reveal="mask"',
    'data-motion-reveal="drift"',
    'data-motion-parallax',
  ]) {
    assert.ok(sources.includes(hook), hook)
  }
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /scale\(1\.03\)/)

  const motion = read('components/ScrollAnimations.tsx')
  assert.match(motion, /closest\('\[data-motion-tempo="calm"\]'\)/)
  assert.match(motion, /calm \? 16 : 28/)
  assert.match(motion, /calm \? 0\.4 :/)
})

test('route modes, sitemap and SEO know the two branch pages', async () => {
  const { routeModeForPath } = await import('../lib/site-route-mode.ts')
  assert.equal(routeModeForPath('/tensai'), 'editorial-light')
  assert.equal(routeModeForPath('/conan'), 'cinema-dark')

  const sitemap = read('app/sitemap.ts')
  assert.match(sitemap, /'\/tensai'/)
  assert.match(sitemap, /'\/conan'/)

  const { buildBranchPageStructuredData, DEFAULT_DESCRIPTION } = await import('../lib/seo.ts')
  const data = buildBranchPageStructuredData({
    path: 'tensai',
    name: 'Tensai',
    description: 'Học dùng AI cho việc thật mỗi ngày.',
    pathname: '/tensai',
  })
  assert.equal(data['@type'], 'WebPage')
  assert.equal(data.url, 'https://thongphan.com/tensai')
  assert.equal(data.isPartOf['@id'], 'https://thongphan.com/#website')
  assert.equal(data.about['@id'], 'https://thongphan.com/about#person')
  assert.doesNotMatch(JSON.stringify(data), /Course|Offer|price/)
  assert.doesNotMatch(DEFAULT_DESCRIPTION, /tài sản số|dòng tiền/)

  const layout = read('app/layout.tsx')
  assert.match(layout, /Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI/)
  assert.doesNotMatch(layout, /dòng tiền thứ 2|Biến kiến thức thành tài sản/)
})
