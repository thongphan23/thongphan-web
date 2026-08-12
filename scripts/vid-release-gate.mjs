import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'

const productionMode = process.argv.includes('--production')
const MAX_PRODUCTION_CURSOR_SLICES = 48
const requiredFocusedTests = [
  // Task 1: migration, focal metadata and five-viewport long-title QA.
  'scripts/vid-migration.test.mjs',
  'scripts/vid-contract.test.ts',
  // Task 2: cursor contract, keyset ordering and three cursor slices.
  'scripts/vid-worker.test.ts',
  // Task 3: reusable infinite feed.
  'scripts/vid-api-client.test.ts',
  'scripts/vid-ui-contract.test.mjs',
  // Task 4: safe sequential batch upload.
  'scripts/vid-upload-batch.test.ts',
  // Task 5: stable player lifecycle.
  'scripts/vid-watch-contract.test.mjs',
]

await Promise.all(requiredFocusedTests.map((file) => access(file)))
console.log(`[foundation coverage] migration, cursor, infinite feed, batch upload, stable player: ${requiredFocusedTests.length} contract files present`)

const checks = [
  ['focused tests', 'node', ['--import', 'tsx', '--test', 'scripts/vid-*.test.ts', 'scripts/vid-*.test.mjs']],
  ['full tests', 'npm', ['test']],
  ['TypeScript', 'npx', ['tsc', '--noEmit']],
  ['Vid Worker TypeScript', 'npm', ['run', 'typecheck:vid-worker']],
  ['lint', 'npm', ['run', 'lint']],
  ['build', 'npm', ['run', 'build']],
  ['bundle budget', 'npm', ['run', 'test:bundle']],
  ['secret integrity', 'npm', ['run', 'test:secret-integrity']],
  ['Wrangler dry run', 'npx', ['wrangler', 'deploy', '--config', 'wrangler.vid.toml', '--env', '', '--dry-run', '--outdir', '/private/tmp/thongphan-vid-worker-dry-run']],
  ['visual QA', 'npm', ['run', 'qa:vid']],
  ['diff check', 'git', ['diff', '--check']],
]

const results = []
for (const [label, command, args] of checks) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: label === 'focused tests',
    stdio: 'pipe',
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  process.stdout.write(`\n[${label}]\n${output}`)
  results.push({ label, pass: result.status === 0, status: result.status, signal: result.signal })
  if (result.status !== 0) break
}

const config = await readFile('wrangler.vid.toml', 'utf8')
const externalReady = !config.includes('00000000-0000-0000-0000-000000000000')
  && !config.includes('configure-before-deploy')
const localPass = results.length === checks.length && results.every(({ pass }) => pass)
console.log(`\nVID_RELEASE_LOCAL=${localPass ? 'PASS_LOCAL' : 'FAIL'}`)
console.log(`VID_RELEASE_EXTERNAL=${externalReady ? 'CONFIGURED_NOT_VERIFIED' : 'PARTIAL_NOT_PROVISIONED'}`)

if (!localPass) {
  process.exitCode = 1
} else if (productionMode) {
  try {
    const evidence = await verifyProduction()
    console.log(`VID_RELEASE_PRODUCTION=PASS_PRODUCTION ${JSON.stringify(evidence)}`)
  } catch (error) {
    console.error(`VID_RELEASE_PRODUCTION=FAIL ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}

async function fetchOk(url, accept = '') {
  const response = await fetch(url, { redirect: 'follow', headers: accept ? { accept } : undefined })
  assert.equal(response.ok, true, `${url} returned HTTP ${response.status}`)
  return response
}

async function verifyProduction() {
  // Post-cutover production routes, cursor exhaustion and released Bunny identity.
  const baseValue = process.env.VID_RELEASE_PRODUCTION_BASE_URL
  const expectedGuid = process.env.VID_RELEASE_EXPECT_BUNNY_GUID
  assert.ok(baseValue, 'VID_RELEASE_PRODUCTION_BASE_URL is required with --production')
  assert.match(expectedGuid ?? '', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'VID_RELEASE_EXPECT_BUNNY_GUID must be a UUID')
  const base = new URL(baseValue)
  assert.equal(base.protocol, 'https:', 'production base URL must use HTTPS')
  assert.equal(base.pathname, '/', 'production base URL must not include a path')

  const seen = new Set()
  const slices = []
  const videos = []
  let cursor = null
  let firstVideo = null
  for (let index = 0; index < MAX_PRODUCTION_CURSOR_SLICES; index += 1) {
    const url = new URL('/api/videos', base)
    url.searchParams.set('limit', '1')
    if (cursor) url.searchParams.set('cursor', cursor)
    const response = await fetchOk(url, 'application/json')
    const slice = await response.json()
    assert.equal(slice.policyVersion, 'vid-feed-v1', `cursor slice ${index + 1} policy`)
    assert.ok(Array.isArray(slice.items), `cursor slice ${index + 1} items`)
    assert.equal(typeof slice.hasMore, 'boolean', `cursor slice ${index + 1} hasMore`)
    assert.equal(slice.hasMore, slice.nextCursor !== null, `cursor slice ${index + 1} cursor state`)
    for (const item of slice.items) {
      assert.equal(seen.has(item.slug), false, `duplicate production cursor slug ${item.slug}`)
      seen.add(item.slug)
      videos.push(item)
      firstVideo ??= item
    }
    slices.push({ count: slice.items.length, hasMore: slice.hasMore })
    if (!slice.hasMore) break
    cursor = slice.nextCursor
  }
  assert.ok(firstVideo, 'production catalog is empty')
  assert.ok(slices.length === 3 || slices.at(-1)?.hasMore === false, 'three cursor slices were not reached and catalog exhaustion was not proven')
  assert.equal(slices.at(-1)?.hasMore, false, 'production catalog exhaustion was not proven')
  const releasedVideo = videos.find((item) => item.playerUrl.includes(expectedGuid))
  assert.ok(releasedVideo, 'released Bunny GUID is not present in the public catalog')
  for (const field of ['sourceCreatorUrl', 'sourceVideoUrl']) assert.match(releasedVideo[field] ?? '', /^https:\/\//, `public DTO ${field}`)

  const topic = firstVideo.topics?.[0]
  assert.ok(topic, 'released video has no public topic')
  const query = String(firstVideo.title).trim().split(/\s+/u)[0]
  const routes = [
    '/',
    `/topic?topic=${encodeURIComponent(topic)}`,
    `/results?search_query=${encodeURIComponent(query)}`,
    '/library',
    `/watch?v=${encodeURIComponent(releasedVideo.slug)}`,
    '/sitemap.xml',
    '/robots.txt',
  ]
  const routeEvidence = []
  for (const route of routes) {
    const response = await fetchOk(new URL(route, base))
    const body = await response.text()
    assert.ok(body.length > 0, `${route} returned an empty body`)
    routeEvidence.push({ route, status: response.status, bytes: Buffer.byteLength(body) })
  }
  return {
    productionRoutes: routeEvidence,
    cursorSlices: slices,
    cursorOutcome: slices.length >= 3 ? `three cursor slices plus catalog exhaustion after ${slices.length}` : `current catalog exhausted after ${slices.length}`,
    releasedSlug: releasedVideo.slug,
    sourceLinks: 'public DTO present',
  }
}
