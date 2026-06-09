import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  return readFile(new URL(path, root), 'utf8')
}

function escaped(phrase) {
  return new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

test('homepage speaks directly to the reader and keeps the real conversion path', async () => {
  const page = await readProjectFile('app/page.tsx')

  for (const required of [
    'Biến chuyên môn của bạn thành tài sản người khác muốn dùng',
    'Nếu bạn có năng lực thật',
    'Bạn không thiếu năng lực',
    'thị trường chưa hiểu bạn giỏi ở đâu',
    'Brain2',
    'ACV',
    'Authenticity',
    'Consistency',
    'Visibility',
    'Tự chẩn đoán trước',
    'Đọc thư viện',
    'Tìm hiểu Conan',
    'data-cinematic-mouse',
  ]) {
    assert.match(page, escaped(required))
  }
})

test('homepage visible copy avoids internal art-direction labels and cheap AI landing-page wording', async () => {
  const page = await readProjectFile('app/page.tsx')

  const bannedVisiblePhrases = [
    'Cinematic Knowledge Garden',
    'Invisible Experts',
    'CONCEPT PROTOTYPE',
    'Prototype cinematic',
    'trang chủ hiện tại',
    'Rendering experience layer',
    'Asset fruit picker',
    'Garden Gate',
    'Digital Assets',
    'Brain2 as Garden',
    'ACV Framework',
    'Cây tri thức 3D',
    'fear.exe',
    'vault.memory',
    'semantic.context',
    'proof beats claim',
    'Tool noise',
    'AI-native expertise',
    'Proof-first AI system',
    'Expertise Observatory',
    'Anh Thông giúp',
    'người mua',
    'người xem',
  ]

  for (const phrase of bannedVisiblePhrases) {
    assert.doesNotMatch(page, escaped(phrase))
  }
})

test('homepage locks the premium visual system and readable typography gates', async () => {
  const page = await readProjectFile('app/page.tsx')
  const css = await readProjectFile('app/page.module.css')
  const globals = await readProjectFile('styles/globals.css')

  for (const required of [
    'hero-premium-mist-knowledge-garden-chatgpt.png',
    'Hệ tri thức được xây từ sách, ghi chú và kinh nghiệm thật',
    'BrandGlyph',
  ]) {
    assert.match(page, escaped(required))
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
    assert.match(css, escaped(required))
  }

  assert.match(globals, /--text-hero:\s*clamp\(3rem, 5\.4vw, 4\.05rem\)/)
  assert.doesNotMatch(css, /font-size:\s*(9|10|11|12)rem/, 'homepage must not use unreadable oversized hero typography')
  assert.doesNotMatch(page, /seedCore|rootA|branchA|fruitA/, 'homepage should use rendered premium imagery, not CSS-only tree shapes')
})
