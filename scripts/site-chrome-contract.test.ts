import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path: string) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw error
  }
}

test('two-path navigation exposes the path switch, about link and the more list', async () => {
  const { pathNavigation, aboutNavigation, getMoreNavigation } = await import(
    '../components/site-chrome/site-navigation'
  )

  assert.deepEqual(pathNavigation, [
    { href: '/tensai', label: 'Đi làm', path: 'tensai' },
    { href: '/conan', label: 'Kinh doanh', path: 'conan' },
  ])
  assert.deepEqual(aboutNavigation, { href: '/about', label: 'Về Thông' })
  assert.deepEqual(getMoreNavigation(false), [
    { href: '/library', label: 'Thư viện' },
    { href: '/experiences', label: 'Trải nghiệm' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
    { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
  ])
  assert.deepEqual(getMoreNavigation(true), [
    { href: '/library', label: 'Thư viện' },
    { href: '/experiences', label: 'Trải nghiệm' },
    { href: '/learn', label: 'Học' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
    { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
  ])
})

test('footer navigation keeps legacy destinations reachable and Conan Maker as a utility link', async () => {
  const { footerExploreNavigation, footerUtilityNavigation, socialNavigation } = await import(
    '../components/site-chrome/site-navigation'
  )

  assert.deepEqual(footerExploreNavigation, [
    { href: '/about', label: 'Về Thông' },
    { href: '/library', label: 'Thư viện' },
    { href: '/blog', label: 'Bài viết' },
    { href: '/experiences', label: 'Trải nghiệm' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
    { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
    { href: '/assets', label: 'Tài sản' },
    { href: '/chat', label: 'Bàn hỏi' },
  ])
  assert.deepEqual(footerUtilityNavigation, [{ href: '/conanmaker/', label: 'Conan Maker' }])
  assert.deepEqual(socialNavigation, [
    { href: 'https://facebook.com/thongphan23', label: 'Facebook' },
    { href: 'https://linkedin.com/in/thongphan', label: 'LinkedIn' },
    { href: 'https://m.me/thongphan.88', label: 'Messenger' },
  ])
})

test('site navigation drops the old chapter and primary/secondary lists', async () => {
  const navigation = await import('../components/site-chrome/site-navigation')
  const sources = await Promise.all(
    ['SiteHeader.tsx', 'MobileMenu.tsx', 'SiteFooter.tsx', 'site-navigation.ts'].map((file) =>
      readProjectFile(`components/site-chrome/${file}`),
    ),
  )

  for (const removed of ['homepageChapterNavigation', 'primaryNavigation', 'secondaryNavigation', 'getPrimaryNavigation']) {
    assert.equal(removed in navigation, false, removed)
    for (const source of sources) assert.doesNotMatch(source, new RegExp(removed))
  }
  for (const source of sources) {
    assert.doesNotMatch(source, /Biến chuyên môn thật thành tài sản|AI PHẢI RA TIỀN/i)
  }
})

test('unified shell is route-mode themed while legacy routes keep their old shell', async () => {
  const chrome = await readProjectFile('components/site-chrome/SiteChrome.tsx')
  const header = await readProjectFile('components/site-chrome/SiteHeader.tsx')
  const footer = await readProjectFile('components/site-chrome/SiteFooter.tsx')

  assert.match(chrome, /isUnifiedRouteEnabled\(pathname\)/)
  assert.match(chrome, /routeModeForPath\(pathname\)/)
  assert.match(chrome, /data-site-shell=\{isUnified \? 'unified' : 'legacy'\}/)
  assert.match(chrome, /<SiteHeader[\s\S]*?<main[\s\S]*?<SiteFooter/)
  assert.match(chrome, /<DefaultHeader\s*\/>/)
  assert.match(chrome, /<DefaultFooter\s*\/>/)
  assert.equal((chrome.match(/<main\b/g) ?? []).length, 1)

  assert.match(header, /pathNavigation\.map/)
  assert.match(header, /aria-current=\{pathname === link\.href \? 'page' : undefined\}/)
  assert.match(header, /aboutNavigation/)
  assert.match(header, /moreNavigation\.map/)
  assert.match(footer, /<footer\b/)
  assert.equal((footer.match(/<footer\b/g) ?? []).length, 1)
})

test('unified navigation stays pinned with route-safe content offsets', async () => {
  const chrome = await readProjectFile('components/site-chrome/SiteChrome.tsx')
  const header = await readProjectFile('components/site-chrome/SiteHeader.tsx')
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  assert.match(header, /data-header-scrolled=\{scrolled\}/)
  assert.match(header, /window\.addEventListener\('scroll',[\s\S]*?passive:\s*true/)
  assert.match(header, /window\.requestAnimationFrame\(update\)/)
  assert.match(chrome, /data-homepage=\{pathname === '\/'\}/)
  assert.match(css, /\.cinemaHeader\s*\{[\s\S]*?position:\s*fixed/)
  assert.match(css, /\.cinemaHeader\[data-header-scrolled='true'\]\s*\{/)
  assert.match(
    css,
    /\.siteShell\[data-site-shell='unified'\]\[data-homepage='false'\] \.cinemaMain\s*\{[\s\S]*?padding-top:\s*82px/,
  )
  assert.match(css, /@media \(max-width:\s*900px\)[\s\S]*?padding-top:\s*64px/)
})

test('mobile menu traps focus, closes with Escape, locks scroll, and restores focus', async () => {
  const menu = await readProjectFile('components/site-chrome/MobileMenu.tsx')
  const header = await readProjectFile('components/site-chrome/SiteHeader.tsx')
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  for (const required of [
    'role="dialog"',
    'aria-modal="true"',
    "document.body.style.overflow = 'hidden'",
    'document.body.style.overflow = previousOverflow',
    'triggerRef.current?.focus()',
    "querySelectorAll<HTMLElement>('a[href], button:not([disabled])')",
    'resolveMenuKeyAction',
  ]) {
    assert.match(menu, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  assert.match(header, /aria-expanded=\{menuOpen\}/)
  assert.match(header, /aria-controls="site-mobile-menu"/)
  assert.match(header, /<Menu\b/)
  assert.match(menu, /<X\b/)
  assert.match(css, /\.menuDialog\s*\{[\s\S]*?min-height:\s*100dvh/)
})

test('mobile menu opens with the two path doors before About and the more list', async () => {
  const menu = await readProjectFile('components/site-chrome/MobileMenu.tsx')

  const pathIndex = menu.indexOf('pathNavigation.map')
  const aboutIndex = menu.indexOf('aboutNavigation.href')
  const moreIndex = menu.indexOf('moreNavigation.map')
  assert.ok(pathIndex > 0, 'menu renders pathNavigation')
  assert.ok(aboutIndex > pathIndex, 'path doors come before About')
  assert.ok(moreIndex > aboutIndex, 'About comes before the more list')
  assert.match(menu, /Tôi \{link\.label\.toLowerCase\(\)\}/)
  assert.match(menu, /PATH_LABELS\[link\.path\]/)
  assert.doesNotMatch(menu, /conanmaker/)
})

test('header more menu is a disclosure that closes on Escape and outside pointerdown', async () => {
  const header = await readProjectFile('components/site-chrome/SiteHeader.tsx')

  assert.match(header, /aria-controls="site-more-menu"/)
  assert.match(header, /aria-expanded=\{moreOpen\}/)
  assert.match(header, /id="site-more-menu"/)
  assert.match(header, /event\.key === 'Escape'[\s\S]*?moreTriggerRef\.current\?\.focus\(\)/)
  assert.match(header, /addEventListener\('pointerdown'/)
  assert.match(header, /removeEventListener\('pointerdown'/)
})

test('every header and menu control has a 44 by 44 pixel minimum target', async () => {
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  for (const selector of ['menuTrigger', 'menuClose', 'mobilePathNav a', 'mobileNav a', 'moreTrigger', 'moreMenu a', 'pathSwitch a']) {
    const escapedSelector = selector.replace('.', '\\.').replace(' ', '\\s+')
    const rule = new RegExp(`\\.${escapedSelector}\\s*\\{[\\s\\S]*?\\}`, 'i')
    const match = css.match(rule)?.[0] ?? ''
    const minHeight = Number(match.match(/min-height:\s*(\d+)px/i)?.[1] ?? 0)
    const minWidth = Number(match.match(/min-width:\s*(\d+)px/i)?.[1] ?? 0)
    assert.ok(minHeight >= 44, `${selector} min-height is ${minHeight}px`)
    assert.ok(minWidth >= 44, `${selector} min-width is ${minWidth}px`)
  }
})

test('the 320px header keeps the menu control compact without wrapping its label', async () => {
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  assert.match(css, /@media\s*\(max-width:\s*340px\)[\s\S]*?\.menuTrigger span\s*\{[\s\S]*?display:\s*none/)
  assert.match(css, /@media\s*\(max-width:\s*340px\)[\s\S]*?\.menuTrigger\s*\{[\s\S]*?padding:\s*0\.5rem/)
})

test('root fonts and shared brand primitives follow the unified contract', async () => {
  const layout = await readProjectFile('app/layout.tsx')
  const globals = await readProjectFile('styles/globals.css')
  const tokens = await readProjectFile('styles/brand-tokens.css')
  const chrome = await readProjectFile('components/site-chrome/SiteChrome.tsx')
  const chromeCss = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  for (const font of [
    'Be_Vietnam_Pro',
    'Cormorant_Garamond',
    'Newsreader',
    'Inter',
    'Lora',
    'JetBrains_Mono',
  ]) {
    assert.match(layout, new RegExp(font))
  }
  assert.equal((layout.match(/preload:\s*false/g) ?? []).length, 7)
  const rootBodyClass = layout.match(/<body className=\{`([^`]+)`\}/)?.[1] ?? ''
  for (const rootFont of ['beVietnamPro.variable', 'cormorantGaramond.variable', 'newsreader.variable', 'ibmPlexMono.variable']) {
    assert.match(rootBodyClass, new RegExp(rootFont.replace('.', '\\.')))
  }
  assert.doesNotMatch(rootBodyClass, /inter\.variable|lora\.variable|jetBrainsMono\.variable/)
  assert.match(layout, /const legacyFontClassName\s*=/)
  assert.match(layout, /<SiteChrome legacyFontClassName=\{legacyFontClassName\}>/)
  assert.match(chrome, /isUnified \? '' : legacyFontClassName/)
  assert.match(chromeCss, /\.siteShell\[data-site-shell=['"]legacy['"]\][\s\S]*?--font-body:\s*var\(--font-inter\)/)
  assert.match(chromeCss, /\.siteShell\[data-site-shell=['"]legacy['"]\][\s\S]*?--font-serif:\s*var\(--font-lora\)/)
  assert.match(chromeCss, /\.siteShell\[data-site-shell=['"]legacy['"]\][\s\S]*?--font-mono:\s*var\(--font-jetbrains\)/)
  assert.match(chromeCss, /\.siteShell\[data-site-shell=['"]legacy['"]\][\s\S]*?font-family:\s*var\(--font-body\)/)
  assert.match(globals, /@import ['"]\.\/brand-tokens\.css['"];?/)

  const semanticTokens = [
    ['--brand-ink', '#070706'],
    ['--brand-ink-raised', '#12100f'],
    ['--brand-paper', '#e8dfcf'],
    ['--brand-reading-paper', '#f3efe6'],
    ['--brand-reading-paper-deep', '#e8decf'],
    ['--brand-text-on-paper', '#171410'],
    ['--brand-muted-on-paper', '#756d62'],
    ['--brand-lacquer', '#b3231b'],
    ['--brand-lacquer-bright', '#e04b43'],
    ['--brand-line-dark', 'rgba(232, 223, 207, 0.2)'],
    ['--brand-line-paper', 'rgba(23, 20, 16, 0.16)'],
  ] as const

  for (const [token, value] of semanticTokens) {
    assert.match(tokens.toLowerCase(), new RegExp(`${token}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
  }
  for (const primitive of [
    '--brand-focus-ring-dark',
    '--brand-focus-ring-paper',
    '--brand-focus-offset',
    '--brand-space-inline',
    '--brand-space-section',
    '--brand-motion-fast',
    '--brand-motion-ease',
  ]) {
    assert.match(tokens, new RegExp(primitive))
  }
})

test('site chrome uses only direct Lucide menu, close, and arrow icons', async () => {
  const [header, menu, footer, packageJson] = await Promise.all([
    readProjectFile('components/site-chrome/SiteHeader.tsx'),
    readProjectFile('components/site-chrome/MobileMenu.tsx'),
    readProjectFile('components/site-chrome/SiteFooter.tsx'),
    readProjectFile('package.json'),
  ])
  const source = `${header}\n${menu}\n${footer}`

  assert.match(packageJson, /"lucide-react"\s*:/)
  assert.match(source, /from 'lucide-react'/)
  assert.doesNotMatch(source, /<svg\b|createLucideIcon|DynamicIcon/)
  assert.doesNotMatch(source, /\b(?:Search|Home|BookOpen|Sparkles|User)\b/)
})

test('footer keeps four blocks with the guide tagline and a plain Conan Maker anchor', async () => {
  const footer = await readProjectFile('components/site-chrome/SiteFooter.tsx')

  assert.match(footer, /Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI\./)
  for (const heading of ['Hai con đường', 'Khám phá', 'Kết nối']) assert.match(footer, new RegExp(heading))
  assert.match(footer, /kind="door"[\s\S]*?placement="footer"/)
  assert.match(footer, /kind="outbound"[\s\S]*?placement="footer"/)
  assert.match(footer, /footerExploreNavigation\.map/)
  assert.match(footer, /socialNavigation\.map[\s\S]*?rel="noopener noreferrer"/)
  assert.match(footer, /footerUtilityNavigation\.map[\s\S]*?<a[\s\S]*?href=\{link\.href\}/)
})
