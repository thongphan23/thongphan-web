import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const snapshotScriptPath = path.join(repoRoot, 'scripts/snapshot-brain2-legacy.mjs')
const redirectWorkerPath = path.join(repoRoot, 'ops/brain2-legacy-redirect/_worker.js')

const expectedDeploymentId = '8d400ccd-3357-4c51-9a0f-87bd2648b9ff'
const expectedSourceAllowlist = [
  'functions/api/reflections.js',
  'functions/api/signup.js',
  'index.html',
  'script.js',
  'style.css',
  'thong-phan.jpg',
  'worldview-sample.md',
  'wrangler.toml',
]

async function importSnapshotModule() {
  return import(`${pathToFileURL(snapshotScriptPath).href}?test=${Date.now()}-${Math.random()}`)
}

async function importWorker() {
  const source = await readFile(redirectWorkerPath, 'utf8')
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  return { source, worker: (await import(moduleUrl)).default }
}

function publicRepositoryMainCheckout() {
  const result = spawnSync(
    'git',
    ['-C', repoRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 0)
  return path.dirname(result.stdout.trim())
}

function fixtureDeployments() {
  return Array.from({ length: 64 }, (_, index) => ({
    id: index === 0 ? expectedDeploymentId : `deployment-${String(index + 1).padStart(2, '0')}`,
    short_id: index === 0 ? '8d400ccd' : `short-${String(index + 1).padStart(2, '0')}`,
    environment: 'production',
    url: `https://deployment-${index + 1}.brain2-platform.pages.dev`,
    aliases: index === 0 ? ['https://brain2.thongphan.com'] : [],
    created_on: `2026-05-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
    modified_on: `2026-05-${String((index % 28) + 1).padStart(2, '0')}T00:01:00.000Z`,
    latest_stage: { name: 'deploy', status: 'success' },
    env_vars: {
      FORBIDDEN_SECRET: { type: 'secret_text', value: 'must-never-enter-snapshot' },
    },
  }))
}

function cloudflarePageResponse(deployments, page, perPage = 25) {
  const start = (page - 1) * perPage
  return {
    success: true,
    errors: [],
    messages: [],
    result: deployments.slice(start, start + perPage),
    result_info: {
      page,
      per_page: perPage,
      count: deployments.slice(start, start + perPage).length,
      total_count: deployments.length,
      total_pages: Math.ceil(deployments.length / perPage),
    },
  }
}

function createFixtureFetch(deployments, calls = []) {
  return async (input, init = {}) => {
    const url = new URL(String(input))
    calls.push({ url, init })

    if (url.hostname === 'api.cloudflare.com') {
      const page = Number(url.searchParams.get('page'))
      return new Response(JSON.stringify(cloudflarePageResponse(deployments, page)), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    if (url.pathname === '/api/reflections') {
      return new Response(JSON.stringify([{ id: 'reflection-1', body: 'private fixture' }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response('<!doctype html><title>Legacy Brain2 fixture</title>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }
}

async function listTree(root, relative = '') {
  const directory = path.join(root, relative)
  const entries = await readdir(directory, { withFileTypes: true })
  const result = []

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const child = path.join(relative, entry.name)
    result.push({ path: child, type: entry.isDirectory() ? 'directory' : 'file' })
    if (entry.isDirectory()) result.push(...(await listTree(root, child)))
  }

  return result
}

test('legacy redirect always returns a short-cached 301 to the canonical hub', async () => {
  const { worker } = await importWorker()
  const cases = [
    ['GET', 'https://brain2.thongphan.com/'],
    ['GET', 'https://brain2.thongphan.com/week/2?utm_source=legacy&day=08'],
    ['POST', 'https://brain2.thongphan.com/api/reflections?from=email'],
    ['OPTIONS', 'https://brain2.thongphan.com/api/signup?campaign=old'],
  ]

  for (const [method, url] of cases) {
    const source = new URL(url)
    const request = new Request(url, method === 'POST' ? { method, body: 'private-body' } : { method })
    const response = await worker.fetch(request)

    assert.equal(response.status, 301)
    assert.equal(
      response.headers.get('location'),
      `https://thongphan.com/brain2/21-ngay${source.search}`,
    )
    assert.equal(await response.text(), '')
    assert.equal(response.headers.get('set-cookie'), null)

    const cacheControl = response.headers.get('cache-control') ?? ''
    const maxAge = Number(cacheControl.match(/(?:^|,\s*)max-age=(\d+)/)?.[1])
    assert.ok(maxAge >= 60 && maxAge <= 600, `expected short initial cache, received ${cacheControl}`)
  }
})

test('redirect artifact contains no legacy content, API, passcode or reflected path logic', async () => {
  const { source } = await importWorker()

  for (const forbidden of [
    'DAY_CONTENT',
    '0203',
    'REFLECTIONS',
    '/api/reflections',
    '/api/signup',
    'passcode',
    'source.pathname',
  ]) {
    assert.equal(source.includes(forbidden), false, `redirect artifact contains ${forbidden}`)
  }
})

test('retirement runbook stages the Worker outside the repo before invoking Wrangler', async () => {
  const readme = await readFile(
    path.join(repoRoot, 'ops/brain2-legacy-redirect/README.md'),
    'utf8',
  )

  assert.match(readme, /set -euo pipefail/)
  assert.match(readme, /STAGING_DIR="\$\(mktemp -d \/tmp\/brain2-legacy-redirect\.XXXXXX\)"/)
  assert.match(readme, /cd "\$STAGING_DIR" && \\\n\s+"\$WRANGLER_BIN" pages deploy/)
  assert.match(readme, /"\$WRANGLER_BIN" pages deploy \. \\/)
  assert.doesNotMatch(readme, /wrangler pages deploy ops\/brain2-legacy-redirect/)
  assert.doesNotMatch(readme, /--cwd ops\/brain2-legacy-redirect/)
})

test('snapshot source is a closed allowlist that excludes dotenv, Wrangler cache and unrelated scripts', async () => {
  const { SOURCE_ALLOWLIST } = await importSnapshotModule()

  assert.deepEqual([...SOURCE_ALLOWLIST].sort(), expectedSourceAllowlist)
  for (const forbidden of [
    '.env.local',
    '.env',
    '.wrangler/cache/cf.json',
    '.claude/handoff.md',
    'google-apps-script.gs',
  ]) {
    assert.equal(SOURCE_ALLOWLIST.includes(forbidden), false)
  }
})

test('snapshot CLI refuses output inside the public repository before any remote work', () => {
  const forbiddenOutput = path.join(repoRoot, '.private-legacy-snapshot-test')
  const result = spawnSync(process.execPath, [snapshotScriptPath, '--output', forbiddenOutput], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /outside the public repository/i)
  assert.equal(result.stdout, '')
})

test('snapshot path guard rejects another checkout of the public Git repository', async () => {
  const { assertSafeOutputPath } = await importSnapshotModule()

  await assert.rejects(
    assertSafeOutputPath(
      path.join(publicRepositoryMainCheckout(), '.private-legacy-snapshot-test'),
      repoRoot,
    ),
    /outside .*Git worktree/i,
  )
})

test('snapshot path guard rejects the repository shared Git metadata directory', async () => {
  const { assertSafeOutputPath } = await importSnapshotModule()

  await assert.rejects(
    assertSafeOutputPath(
      path.join(publicRepositoryMainCheckout(), '.git/private-legacy-snapshot-test'),
      repoRoot,
    ),
    /outside the public repository/i,
  )
})

test('deployment inventory uses REST pagination and records all 64 production IDs', async () => {
  const { fetchDeploymentInventory } = await importSnapshotModule()
  const calls = []
  const deployments = fixtureDeployments()
  const inventory = await fetchDeploymentInventory({
    accountId: 'fixture-account',
    projectName: 'brain2-platform',
    authToken: 'fixture-token',
    fetchImpl: createFixtureFetch(deployments, calls),
    expectedCount: 64,
    expectedDeploymentId,
  })

  const apiCalls = calls.filter(({ url }) => url.hostname === 'api.cloudflare.com')
  assert.equal(apiCalls.length, 3)
  assert.deepEqual(apiCalls.map(({ url }) => url.searchParams.get('page')), ['1', '2', '3'])
  assert.deepEqual(apiCalls.map(({ url }) => url.searchParams.get('per_page')), ['25', '25', '25'])
  assert.deepEqual(apiCalls.map(({ url }) => url.searchParams.get('env')), [
    'production',
    'production',
    'production',
  ])
  assert.ok(apiCalls.every(({ init }) => init.headers.Authorization === 'Bearer fixture-token'))
  assert.equal(inventory.deployment_count, 64)
  assert.equal(inventory.api_pages.length, 3)
  assert.equal(inventory.deployments.length, 64)
  assert.equal(new Set(inventory.deployments.map(({ id }) => id)).size, 64)
  assert.ok(inventory.deployments.some(({ id }) => id === expectedDeploymentId))
  assert.equal(JSON.stringify(inventory).includes('must-never-enter-snapshot'), false)
  assert.equal(JSON.stringify(inventory).includes('env_vars'), false)
})

test('deployment inventory fails closed when the API mixes in a preview deployment', async () => {
  const { fetchDeploymentInventory } = await importSnapshotModule()
  const deployments = fixtureDeployments()
  deployments.at(-1).environment = 'preview'

  await assert.rejects(
    fetchDeploymentInventory({
      accountId: 'fixture-account',
      projectName: 'brain2-platform',
      authToken: 'fixture-token',
      fetchImpl: createFixtureFetch(deployments),
      expectedCount: 64,
      expectedDeploymentId,
    }),
    /non-production deployment/i,
  )
})

test('snapshot writes only allowlisted evidence with private permissions and verified hashes', async (t) => {
  const { createLegacySnapshot } = await importSnapshotModule()
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'brain2-legacy-snapshot-'))
  const sourceRoot = path.join(temporaryRoot, 'legacy-source')
  const outputDir = path.join(temporaryRoot, 'private-output')
  const secretSentinel = 'dotenv-secret-must-never-be-read-or-copied'

  t.after(async () => {
    await chmod(path.join(sourceRoot, '.env.local'), 0o600).catch(() => {})
    await rm(temporaryRoot, { recursive: true, force: true })
  })

  for (const relativePath of expectedSourceAllowlist) {
    const absolutePath = path.join(sourceRoot, relativePath)
    await mkdir(path.dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, `fixture:${relativePath}\n`)
  }
  await writeFile(path.join(sourceRoot, '.env.local'), secretSentinel, { mode: 0o000 })
  await mkdir(path.join(sourceRoot, '.wrangler/cache'), { recursive: true })
  await writeFile(path.join(sourceRoot, '.wrangler/cache/cf.json'), secretSentinel)

  const deployments = fixtureDeployments()
  const result = await createLegacySnapshot({
    repoRoot,
    sourceRoot,
    outputDir,
    legacyOrigin: 'https://brain2.thongphan.com',
    accountId: 'fixture-account',
    projectName: 'brain2-platform',
    authToken: 'fixture-token',
    fetchImpl: createFixtureFetch(deployments),
    expectedCount: 64,
    expectedDeploymentId,
    now: () => new Date('2026-07-12T00:00:00.000Z'),
  })

  assert.equal(result.verified, true)
  const tree = await listTree(outputDir)
  const files = tree.filter(({ type }) => type === 'file').map(({ path: filePath }) => filePath)
  assert.deepEqual(files, [
    'cloudflare/deployments.json',
    'live/production.html',
    'live/reflections.json',
    'manifest.json',
    ...expectedSourceAllowlist.map((filePath) => `source/${filePath}`),
  ].sort())
  assert.equal(files.some((filePath) => /env|\.wrangler|secret/i.test(filePath)), false)

  for (const entry of tree) {
    const info = await stat(path.join(outputDir, entry.path))
    assert.equal(info.mode & 0o777, entry.type === 'directory' ? 0o700 : 0o600)
  }
  assert.equal((await stat(outputDir)).mode & 0o777, 0o700)

  for (const filePath of files) {
    const contents = await readFile(path.join(outputDir, filePath))
    assert.equal(contents.includes(Buffer.from(secretSentinel)), false)
  }

  const manifest = JSON.parse(await readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
  const deploymentInventory = JSON.parse(
    await readFile(path.join(outputDir, 'cloudflare/deployments.json'), 'utf8'),
  )
  assert.equal(manifest.classification, 'private-release-evidence')
  assert.deepEqual(manifest.source_allowlist, expectedSourceAllowlist)
  assert.equal(manifest.artifacts.length, expectedSourceAllowlist.length + 3)
  assert.equal(deploymentInventory.deployment_count, 64)
  assert.ok(deploymentInventory.deployments.some(({ id }) => id === expectedDeploymentId))
})
