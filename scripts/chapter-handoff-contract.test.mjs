import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('chapter handoff renders reasoned internal and external actions', () => {
  assert.ok(existsSync(new URL('../components/journey/ChapterHandoff.tsx', import.meta.url)))
  const source = read('components/journey/ChapterHandoff.tsx')

  assert.match(source, /import Link from 'next\/link'/)
  assert.match(source, /data-tone=\{tone\}/)
  assert.match(source, /<span>\{action\.reason\}<\/span>[\s\S]*<ActionLink/)
  assert.match(source, /if \(action\.external\)[\s\S]*<a[\s\S]*<Link/)
  assert.match(source, /action\.href === '\/conanmaker\/'/)
  assert.match(source, /getJourneyHandoff\(journeyKey\)/)
})

test('chapter handoff has asymmetric responsive layout and accessible motion', () => {
  assert.ok(existsSync(new URL('../components/journey/ChapterHandoff.module.css', import.meta.url)))
  const css = read('components/journey/ChapterHandoff.module.css')

  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s+minmax\(0,\s*1\.18fr\)/)
  assert.match(css, /min-height:\s*44px/)
  assert.match(css, /var\(--brand-focus-ring-(?:dark|paper)\)/)
  assert.match(css, /@media\s*\(max-width:\s*760px\)/)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
})

test('unified routes load a real mono font and semantic oxblood token', () => {
  const layout = read('app/layout.tsx')
  const chrome = read('components/site-chrome/SiteChrome.module.css')
  const tokens = read('styles/brand-tokens.css')

  assert.match(layout, /IBM_Plex_Mono/)
  assert.match(layout, /variable:\s*'--font-ibm-plex-mono'/)
  assert.match(layout, /preload:\s*false/)
  assert.match(layout, /ibmPlexMono\.variable/)
  assert.match(chrome, /--font-mono:\s*var\(--font-ibm-plex-mono\)/)
  assert.match(chrome, /--cinema-oxblood:\s*var\(--brand-oxblood\)/)
  assert.match(tokens, /--brand-oxblood:\s*#7b2d1c/)
})

test('About closes with the shared dark chapter handoff', () => {
  const source = read('app/about/page.tsx')

  assert.match(source, /import ChapterHandoff from '@\/components\/journey\/ChapterHandoff'/)
  assert.match(source, /<ChapterHandoff journeyKey="about" tone="dark"\s*\/>/)
  assert.doesNotMatch(source, /styles\.closing/)
})

test('the physical brand stamp provides a bounded browser icon', () => {
  const iconUrl = new URL('../app/icon.png', import.meta.url)
  assert.ok(existsSync(iconUrl), 'app/icon.png must exist')
  const size = readFileSync(iconUrl).byteLength
  assert.ok(size > 0 && size <= 20_000, `favicon must stay below 20KB, received ${size}`)
})
