import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { homedir } from 'node:os'
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import test, { after } from 'node:test'

import {
  RELEASE_ID,
  buildKvGetArgs,
  buildKvListArgs,
  buildKvPutArgs,
  buildPublishPlan,
  publishBrain2Private,
  validateNamespaceId,
} from './publish-brain2-private.mjs'
import {
  buildPrivateFingerprintIndex,
  collectScanTargets,
  formatLeakReport,
  scanCandidateFiles,
} from './scan-brain2-private-leaks.mjs'

const roots = []
const TEST_NAMESPACE = '1'.repeat(32)
const RELEASE_PREFIX = `brain2:21:${RELEASE_ID}:day:`

after(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })))
})

async function fixtureRoot(label) {
  const root = await mkdtemp(join(homedir(), `.brain2-${label}-`))
  roots.push(root)
  return root
}

async function publisherFixture() {
  const root = await fixtureRoot('publisher-test')
  const repoRoot = join(root, 'repo')
  const privateRoot = join(root, 'private')
  const versionRoot = join(privateRoot, 'v1')
  await mkdir(join(repoRoot, 'content', 'brain2'), { recursive: true })
  await mkdir(versionRoot, { recursive: true, mode: 0o700 })
  await chmod(privateRoot, 0o700)
  await chmod(versionRoot, 0o700)

  const lessons = []
  const values = new Map()
  for (let day = 8; day <= 21; day += 1) {
    const dayText = String(day).padStart(2, '0')
    const slug = `ngay-${dayText}`
    const storageKey = `${RELEASE_PREFIX}${dayText}`
    const value = `${JSON.stringify({
      meta: { day, slug, access: 'conan-maker', contentSha256: String(day).padStart(64, '0') },
      reason: `SYNTHETIC_PUBLISH_CANARY_${day}`,
    })}\n`
    const file = join(versionRoot, `${slug}.json`)
    await writeFile(file, value, { mode: 0o600 })
    await chmod(file, 0o600)
    values.set(storageKey, Buffer.from(value))
    lessons.push({
      day,
      slug,
      access: 'conan-maker',
      storageKey,
      contentSha256: String(day).padStart(64, '0'),
    })
  }
  await writeFile(
    join(repoRoot, 'content', 'brain2', 'manifest.json'),
    `${JSON.stringify({ schemaVersion: 1, releaseId: RELEASE_ID, lessons }, null, 2)}\n`,
  )
  await writeFile(
    join(repoRoot, 'wrangler.brain2-access.jsonc'),
    `${JSON.stringify({ kv_namespaces: [{ binding: 'BRAIN2_CONTENT', id: TEST_NAMESPACE }] }, null, 2)}\n`,
  )
  return { root, repoRoot, privateRoot, versionRoot, lessons, values }
}

const skipDeepValidation = async () => ({ protected: 14 })

function fakeKvRunner(initial = new Map(), { tamperKey } = {}) {
  const remote = new Map([...initial].map(([key, value]) => [key, Buffer.from(value)]))
  const calls = []
  const runWrangler = async (args) => {
    calls.push([...args])
    const operation = args.slice(0, 3).join(' ')
    if (operation === 'kv key list') {
      const prefix = args[args.indexOf('--prefix') + 1]
      return Buffer.from(JSON.stringify(
        [...remote.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })),
      ))
    }
    const key = args[3]
    if (operation === 'kv key put') {
      const file = args[args.indexOf('--path') + 1]
      remote.set(key, await readFile(file))
      return Buffer.alloc(0)
    }
    if (operation === 'kv key get') {
      if (key === tamperKey) {
        const changed = Buffer.from(remote.get(key) ?? '')
        if (changed.length > 0) changed[0] ^= 1
        return changed
      }
      return Buffer.from(remote.get(key) ?? '')
    }
    throw new Error(`unexpected fake Wrangler operation: ${operation}`)
  }
  return { remote, calls, runWrangler }
}

test('publisher rejects unsafe roots, namespace placeholders and malformed release plans', async () => {
  const fixture = await publisherFixture()
  await assert.rejects(
    buildPublishPlan({
      repoRoot: fixture.repoRoot,
      privateRoot: join(fixture.repoRoot, 'private'),
      worktreeRoots: [fixture.repoRoot],
      validateFiles: skipDeepValidation,
    }),
    /outside every repository worktree/,
  )
  for (const value of ['', 'abc', '0'.repeat(32), 'g'.repeat(32)]) {
    assert.throws(() => validateNamespaceId(value), /namespace/i)
  }

  const manifestPath = join(fixture.repoRoot, 'content', 'brain2', 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  manifest.releaseId = 'mutable-release'
  await writeFile(manifestPath, JSON.stringify(manifest))
  await assert.rejects(
    buildPublishPlan({
      repoRoot: fixture.repoRoot,
      privateRoot: fixture.privateRoot,
      worktreeRoots: [fixture.repoRoot],
      validateFiles: skipDeepValidation,
    }),
    /release/i,
  )
})

test('publisher constructs only remote path-based immutable Wrangler commands', async () => {
  const fixture = await publisherFixture()
  const plan = await buildPublishPlan({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    worktreeRoots: [fixture.repoRoot],
    validateFiles: skipDeepValidation,
  })
  assert.equal(plan.entries.length, 14)
  assert.equal(new Set(plan.entries.map((entry) => entry.key)).size, 14)
  assert.deepEqual(plan.entries.map((entry) => entry.day), Array.from({ length: 14 }, (_, index) => index + 8))

  const entry = plan.entries[0]
  assert.deepEqual(buildKvListArgs(TEST_NAMESPACE), [
    'kv', 'key', 'list', '--namespace-id', TEST_NAMESPACE, '--prefix', RELEASE_PREFIX, '--remote',
  ])
  assert.deepEqual(buildKvPutArgs(entry, TEST_NAMESPACE), [
    'kv', 'key', 'put', entry.key, '--path', entry.file, '--namespace-id', TEST_NAMESPACE, '--remote',
  ])
  assert.deepEqual(buildKvGetArgs(entry, TEST_NAMESPACE), [
    'kv', 'key', 'get', entry.key, '--namespace-id', TEST_NAMESPACE, '--remote',
  ])
  assert.equal(buildKvPutArgs(entry, TEST_NAMESPACE).includes(entry.bytes.toString('utf8')), false)
})

test('dry-run validates all packages without calling Wrangler or disclosing private data', async () => {
  const fixture = await publisherFixture()
  const calls = []
  const logs = []
  const report = await publishBrain2Private({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    namespaceId: TEST_NAMESPACE,
    dryRun: true,
    worktreeRoots: [fixture.repoRoot],
    validateFiles: skipDeepValidation,
    runWrangler: async (args) => { calls.push(args); return Buffer.alloc(0) },
    log: (line) => logs.push(line),
  })
  assert.equal(report.length, 14)
  assert.equal(calls.length, 0)
  assert.ok(logs.every((line) => /^day=\d{2} key=brain2:21:[^ ]+ status=planned$/.test(line)))
  assert.doesNotMatch(logs.join('\n'), /SYNTHETIC_PUBLISH_CANARY|\/private\//)
})

test('live publisher refuses any existing release key before the first put', async () => {
  const fixture = await publisherFixture()
  const existingKey = fixture.lessons[0].storageKey
  const fake = fakeKvRunner(new Map([[existingKey, Buffer.from('existing')]]))
  await assert.rejects(
    publishBrain2Private({
      repoRoot: fixture.repoRoot,
      privateRoot: fixture.privateRoot,
      namespaceId: TEST_NAMESPACE,
      worktreeRoots: [fixture.repoRoot],
      validateFiles: skipDeepValidation,
      runWrangler: fake.runWrangler,
      log: () => {},
    }),
    /immutable/i,
  )
  assert.equal(fake.calls.filter((args) => args.slice(0, 3).join(' ') === 'kv key put').length, 0)
})

test('live publisher refuses a namespace binding mismatch and packages above the Worker ceiling', async () => {
  const mismatch = await publisherFixture()
  await writeFile(
    join(mismatch.repoRoot, 'wrangler.brain2-access.jsonc'),
    JSON.stringify({ kv_namespaces: [{ binding: 'BRAIN2_CONTENT', id: '2'.repeat(32) }] }),
  )
  const fake = fakeKvRunner()
  await assert.rejects(
    publishBrain2Private({
      repoRoot: mismatch.repoRoot,
      privateRoot: mismatch.privateRoot,
      namespaceId: TEST_NAMESPACE,
      worktreeRoots: [mismatch.repoRoot],
      validateFiles: skipDeepValidation,
      runWrangler: fake.runWrangler,
      log: () => {},
    }),
    /binding/i,
  )
  assert.equal(fake.calls.length, 0)

  const oversized = await publisherFixture()
  await writeFile(join(oversized.versionRoot, 'ngay-08.json'), 'x'.repeat(64 * 1024 + 1))
  await assert.rejects(
    buildPublishPlan({
      repoRoot: oversized.repoRoot,
      privateRoot: oversized.privateRoot,
      worktreeRoots: [oversized.repoRoot],
      validateFiles: skipDeepValidation,
    }),
    /byte ceiling/i,
  )
})

test('live publisher uploads 14 files, verifies exact round-trip bytes and fails closed on tamper', async () => {
  const fixture = await publisherFixture()
  const fake = fakeKvRunner()
  const logs = []
  const report = await publishBrain2Private({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    namespaceId: TEST_NAMESPACE,
    worktreeRoots: [fixture.repoRoot],
    validateFiles: skipDeepValidation,
    runWrangler: fake.runWrangler,
    log: (line) => logs.push(line),
    verifyAttempts: 1,
  })
  assert.equal(report.length, 14)
  assert.equal(fake.calls.filter((args) => args.slice(0, 3).join(' ') === 'kv key put').length, 14)
  assert.equal(fake.calls.filter((args) => args.slice(0, 3).join(' ') === 'kv key get').length, 14)
  for (const [key, bytes] of fixture.values) assert.deepEqual(fake.remote.get(key), bytes)
  assert.ok(logs.every((line) => line.endsWith('status=verified')))
  assert.doesNotMatch(logs.join('\n'), /SYNTHETIC_PUBLISH_CANARY|\/private\//)

  const tampered = fakeKvRunner(new Map(), { tamperKey: fixture.lessons[4].storageKey })
  await assert.rejects(
    publishBrain2Private({
      repoRoot: fixture.repoRoot,
      privateRoot: fixture.privateRoot,
      namespaceId: TEST_NAMESPACE,
      worktreeRoots: [fixture.repoRoot],
      validateFiles: skipDeepValidation,
      runWrangler: tampered.runWrangler,
      log: () => {},
      verifyAttempts: 1,
    }),
    /round-trip/i,
  )
})

test('leak scanner catches normalized canaries across Git and every build surface without echoing them', async () => {
  const root = await fixtureRoot('leak-test')
  const repoRoot = join(root, 'repo')
  const workerBundleDir = join(root, 'worker-bundle')
  await mkdir(join(repoRoot, '.next', 'static'), { recursive: true })
  await mkdir(join(repoRoot, 'out'), { recursive: true })
  await mkdir(workerBundleDir, { recursive: true })
  execFileSync('git', ['init', '-q'], { cwd: repoRoot })

  const canary = 'Một Hai Ba Bốn Năm Sáu Bảy Tám Chín Mười Mười Một Mười Hai Mười Ba'
  const secret = 'synthetic-keychain-secret-never-print-this'
  const tracked = join(repoRoot, 'tracked.txt')
  await writeFile(tracked, canary.toUpperCase())
  await writeFile(join(repoRoot, '.next', 'static', 'chunk.js'), JSON.stringify(canary))
  await writeFile(join(repoRoot, 'out', 'index.html'), canary.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  await writeFile(join(repoRoot, 'out', 'secret.js'), secret)
  await writeFile(join(workerBundleDir, 'index.js.map'), canary.replaceAll(' ', '\\n'))
  execFileSync('git', ['add', 'tracked.txt'], { cwd: repoRoot })

  const fingerprintIndex = buildPrivateFingerprintIndex([{
    day: 8,
    lesson: {
      meta: { preview: 'Public metadata must not become a private fingerprint even when it has many words.' },
      reason: canary,
      blocks: [],
      deliverable: { title: 'Synthetic', body: [] },
      checklist: [{ id: 'one', label: 'Synthetic checklist.' }],
    },
  }])
  const targets = await collectScanTargets({ repoRoot, workerBundleDir })
  const result = await scanCandidateFiles({
    files: targets.files,
    fingerprintIndex,
    secretValues: [{ label: 'session-secret', value: secret }],
  })
  assert.equal(result.hits.length, 5)
  assert.ok(result.hits.some((hit) => hit.file.endsWith('tracked.txt') && hit.protectedDays.includes(8)))
  assert.ok(result.hits.some((hit) => hit.file.endsWith('chunk.js') && hit.protectedDays.includes(8)))
  assert.ok(result.hits.some((hit) => hit.file.endsWith('index.html') && hit.protectedDays.includes(8)))
  assert.ok(result.hits.some((hit) => hit.file.endsWith('index.js.map') && hit.protectedDays.includes(8)))
  assert.ok(result.hits.some((hit) => hit.file.endsWith('secret.js') && hit.secretMatches === 1))
  const report = formatLeakReport({ ...result, symlinks: targets.symlinks })
  assert.match(report, /tracked\.txt/)
  assert.doesNotMatch(report, new RegExp(canary.split(' ')[0], 'i'))
  assert.doesNotMatch(report, new RegExp(secret))
})

test('scanner ignores public metadata and reports clean files without content values', async () => {
  const root = await fixtureRoot('clean-scan')
  const file = join(root, 'clean.txt')
  const publicMetadata = 'Public metadata with twelve harmless words that may be repeated in a public generated module today'
  await writeFile(file, publicMetadata)
  const fingerprintIndex = buildPrivateFingerprintIndex([{
    day: 8,
    lesson: {
      meta: { preview: publicMetadata },
      reason: 'Private unit has exactly twelve distinct protected marker tokens alpha beta gamma delta epsilon zeta',
      blocks: [],
      deliverable: { title: 'Synthetic', body: [] },
      checklist: [{ id: 'one', label: 'Synthetic checklist.' }],
    },
  }])
  const result = await scanCandidateFiles({ files: [resolve(file)], fingerprintIndex, secretValues: [] })
  assert.deepEqual(result.hits, [])
  assert.doesNotMatch(formatLeakReport({ ...result, symlinks: [] }), /Private unit|protected marker/)
})

test('scanner fails closed when a required artifact is missing and surfaces symlinks without following them', async () => {
  const root = await fixtureRoot('scan-boundaries')
  const repoRoot = join(root, 'repo')
  const workerBundleDir = join(root, 'worker-bundle')
  await mkdir(join(repoRoot, '.next', 'static'), { recursive: true })
  await mkdir(join(repoRoot, 'out'), { recursive: true })
  execFileSync('git', ['init', '-q'], { cwd: repoRoot })
  await assert.rejects(collectScanTargets({ repoRoot, workerBundleDir }), /artifact root/i)

  await mkdir(workerBundleDir)
  await writeFile(join(repoRoot, 'outside.txt'), 'synthetic public fixture')
  await symlink(join(repoRoot, 'outside.txt'), join(repoRoot, 'out', 'linked.txt'))
  const targets = await collectScanTargets({ repoRoot, workerBundleDir })
  assert.deepEqual(targets.symlinks, ['out/linked.txt'])
  assert.match(formatLeakReport({ scannedFiles: 0, fingerprintCount: 1, hits: [], symlinks: targets.symlinks }), /unsafeSymlink=1/)
})
