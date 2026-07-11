import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const bannedVisuals = /GardenSignature|BrandGlyph|accent-blue|accent-gold|assetRadar|scanHalo|stageOrbit|stageScan/

const migratedRoutes = [
  ['about', 'app/about/page.tsx', 'app/about/page.module.css'],
  ['diagnostic', 'app/diagnostic/DiagnosticClient.tsx', 'app/diagnostic/page.module.css'],
  ['assets', 'app/assets/page.tsx', 'app/assets/page.module.css'],
  ['asset detail', 'app/assets/[slug]/page.tsx', 'app/assets/[slug]/page.module.css'],
  ['challenges', 'app/challenges/page.tsx', 'app/challenges/page.module.css'],
  ['challenge detail', 'app/challenges/[slug]/page.tsx', 'app/challenges/[slug]/page.module.css'],
  ['chat', 'app/chat/ChatClient.tsx', 'app/chat/page.module.css'],
  ['blog detail', 'app/blog/[slug]/BlogArticle.tsx', 'app/blog/[slug]/page.module.css'],
]

test('all migrated direct-entry routes use the Cinema system without legacy visual motifs', () => {
  for (const [label, componentPath, cssPath] of migratedRoutes) {
    assert.ok(existsSync(new URL(`../${componentPath}`, import.meta.url)), `${label}: component must exist`)
    const source = `${read(componentPath)}\n${read(cssPath)}`
    assert.doesNotMatch(source, bannedVisuals, `${label}: legacy Garden/blue/gold/radar visual remains`)
    assert.doesNotMatch(source, /<main\b/, `${label}: SiteChrome owns the only outer main landmark`)
  }

  const chrome = read('components/site-chrome/SiteChrome.tsx')
  assert.equal((chrome.match(/<main\b/g) ?? []).length, 1, 'SiteChrome must expose exactly one outer main landmark')
})

test('shared dossier primitives exist and migrated routes enable the unified shell', () => {
  for (const path of [
    'components/dossier/DossierHeader.tsx',
    'components/dossier/DossierFolio.tsx',
    'components/dossier/Dossier.module.css',
  ]) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} must exist`)

  const routeMode = read('lib/site-route-mode.ts')
  for (const path of ['/about', '/diagnostic', '/assets', '/challenges', '/chat']) {
    assert.match(routeMode, new RegExp(`pathname === ['"]${path}['"]`), `${path} must enable the unified shell`)
  }
  assert.match(routeMode, /pathname\.startsWith\(['"]\/blog\/['"]\)/)
  assert.match(routeMode, /pathname\.startsWith\(['"]\/assets\/['"]\)/)
  assert.match(routeMode, /pathname\.startsWith\(['"]\/challenges\/['"]\)/)
})

test('about metrics are released only through the proof manifest', () => {
  assert.ok(existsSync(new URL('../content/proof/about-proof.json', import.meta.url)))
  assert.ok(existsSync(new URL('../lib/about-proof.ts', import.meta.url)))
  const source = read('app/about/page.tsx')
  assert.match(source, /aboutProof/)
  assert.doesNotMatch(source, /const proofIndex|const proofArcs/)
  assert.doesNotMatch(source, /14 tháng|10 năm|40\+|80k\+|600\+/, 'public metrics must not bypass the proof manifest')
  assert.match(read('app/about/page.module.css'), /background:\s*var\(--cinema-ink\)/, 'About must use the Cinema-dark origin treatment')
})

test('diagnostic keeps five questions and the approved score boundaries in a pure model', async () => {
  const modelUrl = new URL('../app/diagnostic/diagnostic-model.ts', import.meta.url)
  assert.ok(existsSync(modelUrl), 'diagnostic-model.ts must exist')
  const { diagnosticQuestions, diagnosticLevels, getDiagnosticLevel } = await import(modelUrl.href)
  assert.equal(diagnosticQuestions.length, 5)
  assert.deepEqual(diagnosticLevels.map((level) => level.min), [0, 9, 13, 17, 19])
  assert.equal(getDiagnosticLevel(8).min, 0)
  assert.equal(getDiagnosticLevel(9).min, 9)
  assert.equal(getDiagnosticLevel(12).min, 9)
  assert.equal(getDiagnosticLevel(13).min, 13)
  assert.equal(getDiagnosticLevel(16).min, 13)
  assert.equal(getDiagnosticLevel(17).min, 17)
  assert.equal(getDiagnosticLevel(18).min, 17)
  assert.equal(getDiagnosticLevel(19).min, 19)
  assert.equal(getDiagnosticLevel(20).min, 19)
})

test('challenge data and chat runtime have one source of truth without changing their contracts', async () => {
  assert.ok(existsSync(new URL('../lib/challenges.ts', import.meta.url)))
  assert.match(read('app/challenges/page.tsx'), /from ['"]@\/lib\/challenges['"]/)
  assert.match(read('app/challenges/[slug]/page.tsx'), /from ['"]@\/lib\/challenges['"]/)

  const chatPage = read('app/chat/page.tsx')
  const chatClient = read('app/chat/ChatClient.tsx')
  assert.doesNotMatch(chatPage, /['"]use client['"]/)
  assert.match(chatPage, /export const metadata/)
  assert.match(chatPage, /<ChatClient/)
  assert.match(chatClient, /NEXT_PUBLIC_CHAT_API_URL/)
  assert.match(chatClient, /JSON\.stringify\(\{ message: text \}\)/)
  assert.doesNotMatch(read('components/SignupForm.module.css'), bannedVisuals, 'challenge signup must inherit the Cinema palette')

  const { splitSseEvents } = await import(new URL('../app/chat/chat-model.ts', import.meta.url).href)
  assert.equal(typeof splitSseEvents, 'function')
  assert.deepEqual(splitSseEvents('data: {"response":"xin', '"}\n\ndata: [DONE]\n\n'), {
    events: ['data: {"response":"xin"}', 'data: [DONE]'],
    remainder: '',
  })
})

test('migrated routes override global Garden controls and challenges use a real editorial slate', () => {
  const chrome = read('components/site-chrome/SiteChrome.module.css')
  assert.match(chrome, /data-site-shell='unified'[\s\S]*:global\(\.btn-primary\)[\s\S]*var\(--brand-lacquer/)
  assert.doesNotMatch(chrome, /data-site-shell='unified'[\s\S]*accent-(?:green|gold|blue)/)

  const challengeSource = `${read('app/challenges/page.tsx')}\n${read('app/challenges/[slug]/page.tsx')}`
  assert.match(challengeSource, /brain2-21-day-editorial-slate-v1\.webp/)
  assert.doesNotMatch(challengeSource, /dayDeck|dayStack|Array\.from\(\{ length: 21 \}\)/)
  assert.ok(existsSync(new URL('../public/images/challenges/brain2-21-day-editorial-slate-v1.webp', import.meta.url)))
})
