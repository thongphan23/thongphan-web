import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('homepage exposes the Vietnamese hero statement and real speaker stage', async () => {
  const page = await readProjectFile('app/page.tsx')

  for (const required of [
    'speakerSignals',
    'speakerFragments',
    'data-cinematic-mouse',
    'data-hero-fragment',
    'data-speaker-fragment',
    'data-speaker-photo',
    'Biến chuyên môn thành dòng tiền bằng hệ thống AI cá nhân',
    '/images/homepage/thong-stage-anchor.jpg',
  ]) {
    assert.match(page, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('homepage visible copy avoids unexplained English-heavy labels', async () => {
  const page = await readProjectFile('app/page.tsx')

  const bannedVisiblePhrases = [
    'AI-native expertise',
    'AI-native expertise business',
    'Proof-first AI system',
    'Expertise Observatory',
    'Brain2 core',
    'Clarity in Chaos',
    'evidence',
    'systems',
    'memory',
    'community',
    'Cashflow',
    'outcome',
    'state',
    'job',
    'hype',
    'fear.exe',
    'clarity.signal',
    'human > tool',
    'vault.memory',
    'semantic.context',
    'personal OS',
    'receipts',
    'track record',
    'proof beats claim',
    'Proof Index',
    'có proof',
    'case, proof',
    'lượt chia sẻ từ insight',
    'Ảnh sân khấu thật',
    'các mảnh hệ thống bay',
    'mảnh hệ thống bay',
    'bay quanh chuyên môn',
    'bay quanh chuyên gia',
    'Tool noise',
    'ebook và',
    'Ebook / diagnostic / workflow',
    'template, diagnostic, offer',
    'output có thị trường',
  ]

  for (const phrase of bannedVisiblePhrases) {
    assert.doesNotMatch(page, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('homepage CSS locks the Thong Phan cinematic brand system', async () => {
  const css = await readProjectFile('app/page.module.css')

  for (const required of [
    '--brand-midnight',
    '--brand-amber',
    'speakerStage',
    'speakerPhoto',
    'speakerFragment',
    'speakerOrbit',
    'signalBeam',
    'noiseFragment',
    'clarityMap',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    assert.match(css, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
