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

test('homepage CSS locks the organic cinematic visual system', async () => {
  const css = await readProjectFile('app/page.module.css')

  for (const required of [
    '--garden-ink',
    '--garden-green',
    'stageCard',
    'gardenObject',
    'seedCore',
    'reflection',
    'layerCard',
    'fruitCard',
    'gateCard',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    assert.match(css, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
