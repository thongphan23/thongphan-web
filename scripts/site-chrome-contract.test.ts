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

test('primary and homepage chapter navigation expose the complete route contract', async () => {
  const { primaryNavigation, homepageChapterNavigation } = await import(
    '../components/site-chrome/site-navigation'
  )
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')

  assert.deepEqual(primaryNavigation, [
    { href: '/about', label: 'Câu chuyện' },
    { href: '/library', label: 'Thư viện' },
    { href: '/learn', label: 'Học' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
    { href: '/conanmaker/', label: 'Conan Maker' },
  ])
  assert.deepEqual(
    homepageChapterNavigation.map(({ href }) => href),
    ['#story', '#mirror', '#proof', '#method', '#paths', '#conan'],
  )
  for (const { section } of homepageChapterNavigation) {
    assert.match(
      home,
      new RegExp(`<section[^>]*id=["']${section}["'][^>]*data-home-section`),
      section,
    )
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

  assert.match(header, /primaryNavigation\.map/)
  assert.match(header, /homepageChapterNavigation\.map/)
  assert.match(header, /pathname === '\/'/)
  assert.match(footer, /<footer\b/)
  assert.equal((footer.match(/<footer\b/g) ?? []).length, 1)
})

test('mobile menu traps focus, closes with Escape, locks scroll, and restores focus', async () => {
  const menu = await readProjectFile('components/site-chrome/MobileMenu.tsx')
  const header = await readProjectFile('components/site-chrome/SiteHeader.tsx')

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
})

test('every mobile menu control has a 44 by 44 pixel minimum target', async () => {
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')

  for (const selector of ['menuTrigger', 'menuClose', 'mobileNav a', 'mobileChapterNav a']) {
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
  assert.equal((layout.match(/preload:\s*false/g) ?? []).length, 6)
  const rootBodyClass = layout.match(/<body className=\{`([^`]+)`\}/)?.[1] ?? ''
  for (const rootFont of ['beVietnamPro.variable', 'cormorantGaramond.variable', 'newsreader.variable']) {
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

test('standalone Conan Maker links preserve their canonical trailing slash', async () => {
  const sources = await Promise.all([
    readProjectFile('components/site-chrome/SiteHeader.tsx'),
    readProjectFile('components/site-chrome/MobileMenu.tsx'),
    readProjectFile('components/site-chrome/SiteFooter.tsx'),
  ])

  for (const source of sources) {
    assert.match(source, /link\.href === '\/conanmaker\/'[\s\S]*?<a[\s\S]*?href=\{link\.href\}/)
  }
})
