import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('Vid release gate covers the complete video-first foundation and production route contract', async () => {
  const [gate, qa, packageJson, migration, cursor, infiniteFeed, batch, player] = await Promise.all([
    readFile('scripts/vid-release-gate.mjs', 'utf8'),
    readFile('scripts/qa-vid.mjs', 'utf8'),
    readFile('package.json', 'utf8'),
    readFile('scripts/vid-migration.test.mjs', 'utf8'),
    readFile('scripts/vid-worker.test.ts', 'utf8'),
    readFile('scripts/vid-ui-contract.test.mjs', 'utf8'),
    readFile('scripts/vid-upload-batch.test.ts', 'utf8'),
    readFile('scripts/vid-watch-contract.test.mjs', 'utf8'),
  ])
  for (const command of ['focused tests', 'full tests', 'TypeScript', 'Vid Worker TypeScript', 'lint', 'build', 'bundle budget', 'secret integrity', 'Wrangler dry run', 'visual QA', 'diff check']) {
    assert.match(gate, new RegExp(command))
  }
  for (const contract of ['migration', 'cursor', 'infinite feed', 'batch upload', 'stable player', 'three cursor slices', 'production routes']) {
    assert.match(gate, new RegExp(contract, 'i'))
  }
  for (const testFile of ['vid-migration.test.mjs', 'vid-worker.test.ts', 'vid-ui-contract.test.mjs', 'vid-upload-batch.test.ts', 'vid-watch-contract.test.mjs']) {
    assert.match(gate, new RegExp(testFile.replaceAll('.', '\\.'), 'i'))
  }
  for (const route of ['/', '/topic', '/results', '/library', '/watch', '/sitemap.xml', '/robots.txt']) {
    assert.match(gate, new RegExp(route.replaceAll('.', '\\.'), 'i'))
  }
  assert.match(gate, /--production/)
  assert.match(gate, /VID_RELEASE_PRODUCTION_BASE_URL/)
  assert.match(gate, /VID_RELEASE_EXPECT_BUNNY_GUID/)
  assert.match(gate, /'--env',\s*''/)
  assert.match(gate, /MAX_PRODUCTION_CURSOR_SLICES\s*=\s*48/)
  assert.match(gate, /production catalog exhaustion was not proven/)
  for (const viewport of ['1440', '1280', '1024', '768', '390']) assert.match(qa, new RegExp(`(?:width|name):[^\\n]*${viewport}`))
  assert.doesNotMatch(qa, /name:\s*['"](?:mobile-)?320/)
  assert.match(qa, /Kỹ thuật prompting Claude để hiểu đúng vấn đề và hành động có hệ thống/)
  assert.match(qa, /reducedMotion/)
  assert.match(qa, /provider current time did not advance/)
  assert.match(migration, /thumbnail_focal_x/)
  assert.match(migration, /populated pre-migration snapshot/)
  assert.match(cursor, /cursor feed returns one extra row and advances without duplicates/)
  assert.match(infiniteFeed, /InfiniteVideoFeed/)
  assert.match(batch, /sequential/)
  assert.match(player, /watch state updates cannot key or remount the Bunny player/)
  assert.match(packageJson, /"qa:vid"/)
  assert.match(packageJson, /"test:vid-release"/)
})

test('QA fixtures never enter production source', async () => {
  const files = ['components/vid/HomeView.tsx', 'components/vid/CatalogView.tsx', 'components/vid/WatchView.tsx', 'lib/vid/api-client.ts']
  const source = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n')
  assert.doesNotMatch(source, /qa-vid|video-thu-|thongphan-vid-qa/)
})
