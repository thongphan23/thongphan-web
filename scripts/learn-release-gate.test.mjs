import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('Learn stays fail-closed until its independent PWA is released', () => {
  const gate = read('lib/learn-release.ts')
  assert.match(gate, /NEXT_PUBLIC_LEARN_PUBLIC_ENABLED/)
  assert.match(gate, /=== 'true'/)

  for (const path of [
    'app/learn/page.tsx',
    'app/learn/free/page.tsx',
    'app/learn/diagnostic/page.tsx',
    'app/learn/courses/[slug]/page.tsx',
  ]) {
    const source = read(path)
    assert.match(source, /learnPublicEnabled/)
    assert.match(source, /if \(!learnPublicEnabled\) notFound\(\)/)
  }
})

test('disabled Learn is absent from discovery and recommendations', () => {
  const navigation = read('components/site-chrome/site-navigation.ts')
  const sitemap = read('app/sitemap.ts')
  const journey = read('lib/site-journey.ts')
  const diagnostic = read('app/diagnostic/diagnostic-model.ts')

  assert.doesNotMatch(navigation, /href: ['"]\/learn['"]/)
  assert.doesNotMatch(sitemap, /['"]\/learn(?:\/|['"])/)
  assert.doesNotMatch(journey, /href: ['"]\/learn['"]/)
  assert.doesNotMatch(diagnostic, /href: ['"]\/learn['"]/)
})
