import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('homepage exposes the Cinematic Knowledge Garden thesis and real conversion path', async () => {
  const page = await readProjectFile('app/page.tsx')

  for (const required of [
    'Cinematic Knowledge Garden',
    'Biến tri thức sống thành tài sản số',
    'Invisible Experts',
    'người giỏi nhưng chưa được biết đến',
    'Brain2',
    'ACV',
    'Authenticity',
    'Consistency',
    'Visibility',
    'Chẩn đoán năng lực AI',
    'Khám phá thư viện',
    'Bước vào Conan',
    'data-cinematic-mouse',
  ]) {
    assert.match(page, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('homepage visible copy avoids prototype-only wording and cheap AI landing-page labels', async () => {
  const page = await readProjectFile('app/page.tsx')

  const bannedVisiblePhrases = [
    'CONCEPT PROTOTYPE',
    'Prototype cinematic',
    'trang chủ hiện tại',
    'Rendering experience layer',
    'Asset fruit picker',
    'fear.exe',
    'vault.memory',
    'semantic.context',
    'proof beats claim',
    'Tool noise',
    'AI-native expertise',
    'Proof-first AI system',
    'Expertise Observatory',
  ]

  for (const phrase of bannedVisiblePhrases) {
    assert.doesNotMatch(page, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('homepage locks the premium visual system and readable typography gates', async () => {
  const page = await readProjectFile('app/page.tsx')
  const css = await readProjectFile('app/page.module.css')
  const globals = await readProjectFile('styles/globals.css')

  for (const required of [
    'hero-premium-mist-knowledge-garden-chatgpt.png',
    'Cây tri thức 3D',
    'BrandGlyph',
  ]) {
    assert.match(page, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  for (const required of [
    'visualPlate',
    'visualCaption',
    'editorialCard',
    'acvCard',
    'layerCard',
    'assetFruit',
    'gateCard',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    assert.match(css, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  assert.match(globals, /--text-hero:\s*clamp\(3rem, 5\.4vw, 4\.05rem\)/)
  assert.doesNotMatch(css, /font-size:\s*(9|10|11|12)rem/, 'homepage must not use unreadable oversized hero typography')
  assert.doesNotMatch(page, /seedCore|rootA|branchA|fruitA/, 'homepage should use rendered premium imagery, not CSS-only tree shapes')
})
