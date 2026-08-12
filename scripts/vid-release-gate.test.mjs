import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('Vid release gate covers code, security, build, Worker and rendered QA', async () => {
  const [gate, qa, packageJson, report, releaseReport] = await Promise.all([
    readFile('scripts/vid-release-gate.mjs', 'utf8'),
    readFile('scripts/qa-vid.mjs', 'utf8'),
    readFile('package.json', 'utf8'),
    readFile('docs/qa/VID_SCREENING_ROOM_REPORT.md', 'utf8'),
    readFile('docs/releases/VID_SCREENING_ROOM_RELEASE_REPORT.md', 'utf8'),
  ])
  for (const command of ['focused tests', 'full tests', 'TypeScript', 'Vid Worker TypeScript', 'lint', 'build', 'bundle budget', 'secret integrity', 'Wrangler dry run', 'visual QA', 'diff check']) {
    assert.match(gate, new RegExp(command))
  }
  for (const viewport of ['1440', '1280', '1024', '390', '320']) assert.match(qa, new RegExp(viewport))
  assert.match(qa, /reducedMotion/)
  assert.match(qa, /player pointer is blocked/)
  assert.match(packageJson, /"qa:vid"/)
  assert.match(packageJson, /"test:vid-release"/)
  assert.match(report, /PASS_LOCAL/)
  assert.match(report, /PASS_PRODUCTION/)
  assert.match(releaseReport, /e9fedb7c-e756-4418-aa26-a15a64afc980/)
  assert.match(releaseReport, /3c5ae7cc-54d1-4d45-830e-56a784a70e47/)
  assert.match(gate, /configure-before-deploy/)
})

test('QA fixtures never enter production source', async () => {
  const files = ['components/vid/HomeView.tsx', 'components/vid/CatalogView.tsx', 'components/vid/WatchView.tsx', 'lib/vid/api-client.ts']
  const source = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n')
  assert.doesNotMatch(source, /qa-vid|video-thu-|thongphan-vid-qa/)
})
