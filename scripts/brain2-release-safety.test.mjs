import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  BRAIN2_LESSON_METADATA,
  BRAIN2_PUBLIC_LESSONS,
} from '../lib/brain2/brain2-data.generated.ts'

const root = new URL('../', import.meta.url)
const out = new URL('out/', root)
const read = (path) => readFile(new URL(path, root), 'utf8')
const expectedEvents = [
  'brain2_access_failed',
  'brain2_access_gate_viewed',
  'brain2_access_granted',
  'brain2_conan_handoff_clicked',
  'brain2_hub_viewed',
  'brain2_lesson_completed',
  'brain2_lesson_opened',
  'brain2_prompt_copied',
]

test('release build contains 21 canonical shells with the exact public indexing split', async () => {
  const publicLessons = BRAIN2_LESSON_METADATA.filter(({ access }) => access === 'public')
  const protectedLessons = BRAIN2_LESSON_METADATA.filter(({ access }) => access === 'conan-maker')

  assert.equal(BRAIN2_LESSON_METADATA.length, 21)
  assert.equal(publicLessons.length, 7)
  assert.equal(protectedLessons.length, 14)

  for (const meta of BRAIN2_LESSON_METADATA) {
    const relative = `brain2/21-ngay/${meta.slug}.html`
    const url = new URL(relative, out)
    await access(url)
    const html = await readFile(url, 'utf8')
    const expectedRobots = meta.access === 'public' ? 'index, follow' : 'noindex, follow'

    assert.match(html, new RegExp(`<meta name="robots" content="${expectedRobots}"\\s*\\/?`))
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="https://thongphan\\.com/brain2/21-ngay/${meta.slug}"\\s*\\/?`),
    )
  }
})

test('protected metadata and bodies remain physically separated from the public release', () => {
  const publicSlugs = Object.keys(BRAIN2_PUBLIC_LESSONS).sort()
  assert.deepEqual(
    publicSlugs,
    Array.from({ length: 7 }, (_, index) => `ngay-${String(index + 1).padStart(2, '0')}`),
  )

  const protectedMetadata = BRAIN2_LESSON_METADATA.filter(({ access }) => access === 'conan-maker')
  for (const record of protectedMetadata) {
    for (const privateField of ['reason', 'blocks', 'deliverable', 'checklist']) {
      assert.equal(Object.hasOwn(record, privateField), false, `${record.slug} exposes ${privateField}`)
    }
    assert.equal(Object.hasOwn(BRAIN2_PUBLIC_LESSONS, record.slug), false)
  }

  const tracked = execFileSync('git', ['ls-files'], { cwd: new URL('.', root), encoding: 'utf8' })
  assert.doesNotMatch(tracked, /content\/brain2\/(?:private|protected)\//)
  assert.doesNotMatch(tracked, /content\/brain2\/public\/ngay-(?:0[89]|1\d|2[01])\.json/)
})

test('canonical redirects and dedicated Worker routes fail closed around the global router', async () => {
  const redirects = await read('public/_redirects')
  for (const redirect of [
    '/brain2 /brain2/21-ngay 301',
    '/challenges/brain2-21-ngay /brain2/21-ngay 301',
  ]) assert.match(redirects, new RegExp(`^${redirect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'))

  const accessConfig = JSON.parse(await read('wrangler.brain2-access.jsonc'))
  assert.equal(accessConfig.workers_dev, false)
  assert.equal(accessConfig.preview_urls, false)
  assert.deepEqual(
    accessConfig.routes.map(({ pattern }) => pattern).sort(),
    [
      'thongphan.com/brain2/21-ngay/api/*',
      'www.thongphan.com/brain2/21-ngay/api/*',
    ],
  )
  assert.ok(accessConfig.routes.every(({ pattern }) => pattern.endsWith('/brain2/21-ngay/api/*')))
  assert.ok(accessConfig.routes.every(({ pattern }) => !pattern.endsWith('.com/*')))

  for (const configPath of ['wrangler.signup.toml', 'wrangler.brain2-email.toml']) {
    const config = await read(configPath)
    assert.match(config, /^workers_dev\s*=\s*false$/m)
    assert.match(config, /^preview_urls\s*=\s*false$/m)
  }
})

test('email sender is inert and selects only the versioned v1 campaign', async () => {
  const sender = await read('workers/api/email-drip.ts')
  const config = await read('wrangler.brain2-email.toml')
  const claim = sender.match(/const CLAIM_SQL\s*=\s*`([\s\S]*?)`/)?.[1] ?? ''

  assert.match(claim, /q\.campaign_version\s*=\s*'brain2-2026-v1'/)
  assert.match(claim, /AND campaign_version\s*=\s*'brain2-2026-v1'/)
  assert.doesNotMatch(claim, /legacy-v0/)
  assert.match(config, /\[triggers\]\s*\ncrons\s*=\s*\[\]/)
})

test('Brain2 analytics exposes only the exact anonymous event union', async () => {
  const analytics = await read('components/brain2/Brain2Analytics.tsx')
  const union = analytics.slice(
    analytics.indexOf('export type Brain2Event'),
    analytics.indexOf('export function dispatchBrain2Event'),
  )
  const events = [...union.matchAll(/name:\s*'([^']+)'/g)].map(([, name]) => name).sort()

  assert.deepEqual(events, expectedEvents)
  assert.doesNotMatch(union, /email|nameText|visitor|userId|fingerprint|freeText|answer|accessCode|session/i)
})

test('legacy retirement release contains only the redirect artifact and private runbook', async () => {
  const tracked = execFileSync(
    'git',
    ['ls-files', 'ops/brain2-legacy-redirect', 'scripts/snapshot-brain2-legacy.mjs'],
    { cwd: new URL('.', root), encoding: 'utf8' },
  ).trim().split('\n').filter(Boolean).sort()
  assert.deepEqual(tracked, [
    'ops/brain2-legacy-redirect/README.md',
    'ops/brain2-legacy-redirect/_worker.js',
    'scripts/snapshot-brain2-legacy.mjs',
  ])

  const worker = await read('ops/brain2-legacy-redirect/_worker.js')
  for (const forbidden of ['0203', 'REFLECTIONS', '/api/signup', '/api/reflections', 'passcode', 'source.pathname']) {
    assert.equal(worker.includes(forbidden), false, forbidden)
  }
  assert.match(worker, /status:\s*301/)
  assert.match(worker, /CANONICAL_HUB\}\$\{source\.search\}/)
})

test('rendered QA covers the complete release matrix without writing evidence into the repo', async () => {
  const qa = await read('scripts/qa-site.mjs')

  for (const route of [
    '/',
    '/about',
    '/brain2/21-ngay',
    '/brain2/21-ngay/ngay-01',
    '/brain2/21-ngay/ngay-07',
    '/brain2/21-ngay/ngay-08',
    '/brain2/21-ngay/ngay-21',
  ]) assert.match(qa, new RegExp(`['"]${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`))

  for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [390, 844], [320, 568]]) {
    assert.match(qa, new RegExp(`width:\\s*${width},\\s*height:\\s*${height}`))
  }
  for (const contract of [
    /QA_BASE_URL/,
    /QA_OUTPUT_DIR/,
    /BRAIN2_WORKER_BUNDLE/,
    /\/tmp\/thongphan-brain2-release-qa/,
    /restricted to a loopback origin/,
    /createBrain2AccessWorker/,
    /session: 'tampered'/,
    /assertProtectedHeaders/,
    /Shift\+Tab/,
    /reducedMotion:\s*'no-preference'/,
    /reducedMotion:\s*'reduce'/,
    /javaScriptEnabled:\s*false/,
    /PerformanceObserver/,
    /layout-shift/,
    /brokenImages/,
    /requestfailed/,
    /data-access-state/,
  ]) assert.match(qa, contract)
  assert.doesNotMatch(qa, /artifacts\/qa/)
})

test('package scripts make lint and every stable Brain2 release contract mandatory', async () => {
  const packageJson = JSON.parse(await read('package.json'))
  const expectedBrain2Tests = [
    'brain2-release-boundary.test.mjs',
    'brain2-migration.test.mjs',
    'brain2-external-links.test.mjs',
    'generate-brain2-data.test.mjs',
    'brain2-route-contract.test.ts',
    'brain2-progress.test.ts',
    'brain2-access-worker.test.ts',
    'brain2-private-publish.test.mjs',
    'brain2-email-campaign.test.ts',
    'origin-story-evidence.test.ts',
    'origin-story-route.test.ts',
    'brain2-legacy-retirement.test.mjs',
    'brain2-release-safety.test.mjs',
  ]

  assert.equal(packageJson.scripts.lint, 'eslint . --max-warnings=0')
  for (const filename of expectedBrain2Tests) assert.match(packageJson.scripts['test:brain2'], new RegExp(filename.replaceAll('.', '\\.')))
  assert.match(packageJson.scripts['test:release'], /npm run lint/)
  assert.match(packageJson.scripts['test:release'], /npm run test:brain2/)
})
