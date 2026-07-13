import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { access, chmod, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'

async function exists(path) {
  try { await access(path); return true } catch { return false }
}

async function waitForPath(path, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await exists(path)) return
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  assert.fail(`timed out waiting for ${path}`)
}

async function waitForExit(child, timeoutMs = 8_000) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { code: child.exitCode, signal: child.signalCode, output: child.testOutput }
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('child did not exit')), timeoutMs)
    child.once('exit', (code, signal) => {
      clearTimeout(timeout)
      resolve({ code, signal, output: child.testOutput })
    })
  })
}

function runSmoke(repo, env) {
  const child = spawn(process.execPath, ['scripts/learn-pages-preview-smoke.mjs'], {
    cwd: repo,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.testOutput = ''
  child.stdout.on('data', (chunk) => { child.testOutput += chunk })
  child.stderr.on('data', (chunk) => { child.testOutput += chunk })
  return child
}

async function treeHash(root) {
  const entries = []
  async function visit(current, relative = '') {
    for (const name of (await readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(current, name.name)
      const key = join(relative, name.name)
      if (name.isDirectory()) {
        entries.push(`dir:${key}`)
        await visit(path, key)
      } else {
        entries.push(`file:${key}:${createHash('sha256').update(await readFile(path)).digest('hex')}`)
      }
    }
  }
  await visit(root)
  return createHash('sha256').update(entries.join('\n')).digest('hex')
}

async function processExists(pid) {
  try { process.kill(pid, 0); return true } catch (error) {
    if (error?.code === 'ESRCH') return false
    throw error
  }
}

async function makeFixture(t) {
  const root = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(join(tmpdir(), 'learn-preview-concurrency-test-')))
  const repo = join(root, 'repo')
  const bin = join(root, 'bin')
  const temp = join(root, 'tmp')
  const ready = join(root, 'owner-ready')
  const buildPid = join(root, 'build.pid')
  const buildInvoked = join(root, 'build-invoked')
  await mkdir(join(repo, 'scripts'), { recursive: true })
  await mkdir(join(repo, 'out', 'nested'), { recursive: true })
  await mkdir(bin)
  await mkdir(temp)
  await cp(new URL('learn-pages-preview-smoke.mjs', import.meta.url), join(repo, 'scripts', 'learn-pages-preview-smoke.mjs'))
  await writeFile(join(repo, 'scripts', 'learn-pages-preview-contract.mjs'), `
export const assertAlignedControls = () => {}
export const assertDisabledLearnDocument = () => {}
export const assertEnabledDiscoveryDocument = () => {}
export const assertEnabledLearnDocument = () => {}
export const assertNoLearnDiscoveryDocument = () => {}
`)
  await writeFile(join(repo, 'out', 'learn.html'), '<html id="__next_error__"><meta name="robots" content="noindex">404</html>')
  await writeFile(join(repo, 'out', 'nested', 'asset.txt'), 'original-disabled-artifact\n')
  const fakeNpm = join(bin, 'npm')
  await writeFile(fakeNpm, `#!/usr/bin/env node
const { mkdir, rm, writeFile } = require('node:fs/promises')
const { join } = require('node:path')
;(async () => {
  await writeFile(process.env.TEST_BUILD_INVOKED, String(process.pid))
  const out = join(process.cwd(), 'out')
  await rm(out, { recursive: true, force: true })
  await mkdir(out, { recursive: true })
  await writeFile(join(out, 'learn.html'), 'owner-mutated-' + process.env.NEXT_PUBLIC_LEARN_PUBLIC_ENABLED)
  if (process.env.TEST_ROLE === 'owner') {
    await writeFile(process.env.TEST_BUILD_PID, String(process.pid))
    await writeFile(process.env.TEST_OWNER_READY, 'ready')
    setInterval(() => {}, 1_000)
    return
  }
  process.exitCode = 42
})().catch((error) => { console.error(error); process.exitCode = 1 })
`)
  await chmod(fakeNpm, 0o755)
  t.after(async () => { await rm(root, { recursive: true, force: true }) })
  return {
    root, repo, temp, ready, buildPid, buildInvoked,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      TMPDIR: temp,
      TEST_OWNER_READY: ready,
      TEST_BUILD_PID: buildPid,
      TEST_BUILD_INVOKED: buildInvoked,
    },
  }
}

for (const { signal, expectedCode } of [
  { signal: 'SIGINT', expectedCode: 130 },
  { signal: 'SIGTERM', expectedCode: 143 },
]) {
  test(`${signal} immediately after lock ownership removes only the owned lock`, async (t) => {
    const fixture = await makeFixture(t)
    const lock = join(fixture.repo, '.learn-pages-preview.lock')
    const marker = join(fixture.root, `${signal.toLowerCase()}-after-lock`)
    const originalHash = await treeHash(join(fixture.repo, 'out'))
    const owner = runSmoke(fixture.repo, {
      ...fixture.env,
      TEST_ROLE: 'owner',
      LEARN_PREVIEW_TEST_AFTER_LOCK_MARKER: marker,
    })

    try {
      await waitForPath(marker, 1_000)
      assert.deepEqual(await readdir(lock), [], 'checkpoint must precede owner metadata and workspace creation')
      owner.kill(signal)
      const stopped = await waitForExit(owner)
      assert.equal(stopped.code, expectedCode)
      assert.equal(stopped.signal, null)
      assert.equal(await treeHash(join(fixture.repo, 'out')), originalHash)
      assert.equal(await exists(lock), false)
      assert.equal(await exists(fixture.buildInvoked), false)
      assert.deepEqual(await readdir(fixture.temp), [])
    } finally {
      if (owner.exitCode === null && owner.signalCode === null) owner.kill('SIGKILL')
      if (await exists(fixture.buildPid)) {
        const pid = Number(await readFile(fixture.buildPid, 'utf8'))
        if (await processExists(pid)) process.kill(pid, 'SIGKILL')
      }
    }
  })
}

test('exclusive owner rejects a concurrent runner and restores out on SIGTERM', async (t) => {
  const fixture = await makeFixture(t)
  const lock = join(fixture.repo, '.learn-pages-preview.lock')
  const originalHash = await treeHash(join(fixture.repo, 'out'))
  const owner = runSmoke(fixture.repo, { ...fixture.env, TEST_ROLE: 'owner' })
  let buildProcessId

  try {
    await waitForPath(fixture.ready)
    buildProcessId = Number(await readFile(fixture.buildPid, 'utf8'))
    assert.deepEqual((await readdir(fixture.repo)).filter((name) => name === '.learn-pages-preview.lock'), ['.learn-pages-preview.lock'])
    const ownedLockHash = await treeHash(lock)

    const startedAt = Date.now()
    const rejected = await waitForExit(runSmoke(fixture.repo, { ...fixture.env, TEST_ROLE: 'second' }))
    assert.notEqual(rejected.code, 0)
    assert.ok(Date.now() - startedAt < 2_000, 'second runner must fail fast')
    assert.match(rejected.output, /already running|exclusive lock/i)
    assert.equal(await treeHash(lock), ownedLockHash, 'rejected runner must not touch the owner lock or workspace')

    owner.kill('SIGTERM')
    const stopped = await waitForExit(owner)
    assert.notEqual(stopped.code, 0)
    assert.equal(await treeHash(join(fixture.repo, 'out')), originalHash, 'signal cleanup must restore the original out tree')
    assert.equal(await exists(lock), false, 'owner lock must be removed')
    assert.deepEqual(await readdir(fixture.temp), [], 'owned temporary artifacts must be removed')
    assert.equal(await processExists(buildProcessId), false, 'active build child must not leak')
  } finally {
    if (owner.exitCode === null && owner.signalCode === null) owner.kill('SIGKILL')
    if (buildProcessId && await processExists(buildProcessId)) process.kill(buildProcessId, 'SIGKILL')
  }
})

test('a pre-existing unknown lock fails closed without touching out or lock metadata', async (t) => {
  const fixture = await makeFixture(t)
  const lock = join(fixture.repo, '.learn-pages-preview.lock')
  await mkdir(lock)
  await writeFile(join(lock, 'owner.json'), '{"pid":999999,"startedAt":"unknown"}\n')
  const lockHash = await treeHash(lock)
  const outHash = await treeHash(join(fixture.repo, 'out'))

  const rejected = await waitForExit(runSmoke(fixture.repo, { ...fixture.env, TEST_ROLE: 'second' }))
  assert.notEqual(rejected.code, 0)
  assert.match(rejected.output, /already running|stale|manual/i)
  assert.equal(await treeHash(lock), lockHash)
  assert.equal(await treeHash(join(fixture.repo, 'out')), outHash)
  assert.equal(await exists(fixture.buildInvoked), false, 'rejected runner must not invoke a build')
  assert.deepEqual(await readdir(fixture.temp), [])
})
