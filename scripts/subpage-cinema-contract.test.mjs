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
  ['experiences', 'app/experiences/page.tsx', 'app/experiences/page.module.css'],
  ['Brain2 hub', 'app/brain2/21-ngay/page.tsx', 'app/brain2/21-ngay/page.module.css'],
  ['Brain2 lesson', 'app/brain2/21-ngay/[day]/page.tsx', 'app/brain2/21-ngay/[day]/page.module.css'],
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
  for (const path of ['/about', '/diagnostic', '/assets', '/experiences', '/chat']) {
    assert.match(routeMode, new RegExp(`['"]${path}['"]:\\s*['"](?:cinema-dark|evidence-dossier)['"]`), `${path} must enable the unified shell`)
  }
  assert.match(routeMode, /\['\/blog',\s*'editorial-light'\]/)
  assert.match(routeMode, /\['\/assets',\s*'evidence-dossier'\]/)
  assert.match(routeMode, /\['\/experiences',\s*'evidence-dossier'\]/)
  assert.match(routeMode, /mode !== 'legacy' && mode !== 'standalone'/)
})

test('about is a five-act evidence film rather than a metric-card biography', () => {
  assert.ok(existsSync(new URL('../content/proof/origin-story-evidence.json', import.meta.url)))
  assert.ok(existsSync(new URL('../lib/origin-story-evidence.ts', import.meta.url)))
  assert.ok(existsSync(new URL('../components/origin-story/OriginStory.tsx', import.meta.url)))
  const source = read('app/about/page.tsx')
  assert.match(source, /<OriginStory\s*\/>/)
  assert.doesNotMatch(source, /aboutProof|const chapters|chapterGrid|proofGrid/)
  assert.doesNotMatch(source, /14 tháng|10 năm|40\+|80k\+|600\+/, 'public metrics must not bypass the proof manifest')
  const css = `${read('app/about/page.module.css')}\n${read('components/origin-story/OriginStory.module.css')}`
  assert.match(css, /background:\s*var\(--cinema-ink\)/, 'About must keep the Cinema-dark origin treatment')
  assert.match(css, /var\(--cinema-paper\)|var\(--brand-paper\)/, 'Origin acts must include a paper-light counter-rhythm')
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

test('experience data and chat runtime have one source of truth', async () => {
  assert.ok(existsSync(new URL('../lib/experiences.ts', import.meta.url)))
  assert.equal(existsSync(new URL('../lib/challenges.ts', import.meta.url)), false)
  const experienceIndex = read('app/experiences/page.tsx')
  assert.match(experienceIndex, /from ['"]@\/lib\/experiences['"]/)
  assert.match(experienceIndex, /getPublishedExperiences/)
  assert.match(experienceIndex, /<ExperienceCard/)
  assert.equal(existsSync(new URL('../app/challenges/page.tsx', import.meta.url)), false)

  const chatPage = read('app/chat/page.tsx')
  const chatClient = read('app/chat/ChatClient.tsx')
  assert.doesNotMatch(chatPage, /['"]use client['"]/)
  assert.match(chatPage, /export const metadata/)
  assert.match(chatPage, /<ChatClient/)
  assert.doesNotMatch(chatClient, /NEXT_PUBLIC_CHAT_API_URL/)
  assert.doesNotMatch(chatClient, /\bfetch\s*\(/)
  assert.match(chatClient, /createLocalChatTurn\(text\)/)
  assert.doesNotMatch(read('components/SignupForm.module.css'), bannedVisuals, 'challenge signup must inherit the Cinema palette')

  const chatModel = await import(new URL('../app/chat/chat-model.ts', import.meta.url).href)
  assert.equal(typeof chatModel.createLocalChatTurn, 'function')
  assert.equal('splitSseEvents' in chatModel, false)
})

test('migrated routes override global Garden controls and experiences use real editorial imagery', () => {
  const chrome = read('components/site-chrome/SiteChrome.module.css')
  assert.match(chrome, /data-site-shell='unified'[\s\S]*:global\(\.btn-primary\)[\s\S]*var\(--brand-lacquer/)
  assert.doesNotMatch(chrome, /data-site-shell='unified'[\s\S]*accent-(?:green|gold|blue)/)

  const experienceSource = read('app/experiences/page.tsx')
  const cardSource = read('components/experience/ExperienceCard.tsx')
  assert.match(experienceSource, /thong-library-author\.jpg/)
  assert.match(cardSource, /experience\.media\.src/)
  assert.doesNotMatch(`${experienceSource}\n${cardSource}`, /dayDeck|dayStack|Array\.from\(\{ length: 21 \}\)/)
  assert.ok(existsSync(new URL('../public/images/challenges/brain2-21-day-editorial-slate-v1.webp', import.meta.url)))
  assert.ok(existsSync(new URL('../public/images/learn/course-ai-foundation.jpg', import.meta.url)))
})
