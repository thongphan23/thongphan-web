import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('homepage exposes the Knowledge Garden thesis and real conversion path', async () => {
  const page = await readProjectFile('app/page.tsx')

  for (const required of [
    'Knowledge Garden',
    'Mỗi trải nghiệm thật',
    'mọc thành tài sản',
    'khu vườn tri thức sống',
    'Brain2',
    'tài sản số',
    'dòng tiền thứ hai',
    'Kho tài sản nhỏ',
    'Bước vào Conan',
    'data-cinematic-mouse',
    'data-hero-fragment',
  ]) {
    assert.match(page, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('homepage visible copy avoids prototype-only wording and unexplained English-heavy labels', async () => {
  const page = await readProjectFile('app/page.tsx')

  const bannedVisiblePhrases = [
    'CONCEPT PROTOTYPE',
    'Prototype cinematic',
    'trang chủ hiện tại',
    'Rendering experience layer',
    'Asset fruit picker',
    'Experience',
    'Income',
    'AI-native expertise',
    'Proof-first AI system',
    'Expertise Observatory',
    'fear.exe',
    'vault.memory',
    'semantic.context',
    'personal OS',
    'proof beats claim',
    'Tool noise',
  ]

  for (const phrase of bannedVisiblePhrases) {
    assert.doesNotMatch(page, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('homepage locks the cinematic Knowledge Garden key visual system', async () => {
  const page = await readProjectFile('app/page.tsx')
  const css = await readProjectFile('app/page.module.css')

  for (const required of [
    'hero-lush-knowledge-tree-object.png',
    'Cây cổ thụ tri thức xanh mướt bay lơ lửng',
    'BrandGlyph',
    '--garden-ink',
    '--garden-green',
    'stageCard',
    'gardenObject',
    'treeObjectShell',
    'treeObjectImage',
    'treeParticleOne',
    'treeBreath',
    'reflection',
    'layerCard',
    'fruitCard',
    'gateCard',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    const source = required.startsWith('hero-') || required.startsWith('knowledge-') || required.startsWith('Cây') || required.startsWith('Khu') || required === 'BrandGlyph' ? page : css
    assert.match(source, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  assert.doesNotMatch(page, /seedCore|rootA|branchA|fruitA/, 'homepage should use the rendered premium image, not CSS-only tree shapes')
})
