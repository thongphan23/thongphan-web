import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, cp, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { hostname } from 'node:os'
import { fileURLToPath } from 'node:url'
import {
  assertAlignedControls,
  assertDisabledLearnDocument,
  assertEnabledDiscoveryDocument,
  assertEnabledLearnDocument,
  assertNoLearnDiscoveryDocument,
} from './learn-pages-preview-contract.mjs'

const repo = fileURLToPath(new URL('../', import.meta.url))
const out = join(repo, 'out')
const lock = join(repo, '.learn-pages-preview.lock')
const workspace = join(lock, 'workspace')
const ownerFile = join(lock, 'owner.json')
const originalOut = join(workspace, 'original-out')
const disabledArtifact = join(workspace, 'build-disabled')
const enabledArtifact = join(workspace, 'build-enabled')
const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url))
const learnRoutes = ['/learn', '/learn/free']
const activeChildren = new Set()
let lockOwned = false
let originalStateCaptured = false
let hadOriginalOut = false
let initializationPromise
let cleanupPromise
let signalExitCode

async function exists(path) {
  try { await access(path); return true } catch { return false }
}

async function acquireLock() {
  try {
    await mkdir(lock, { mode: 0o700 })
    lockOwned = true
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    throw new Error(
      `Learn Pages preview matrix already running or its lock is stale: ${lock}. `
      + 'This runner did not modify the lock. Inspect owner.json, verify the recorded PID is inactive, '
      + 'restore workspace/original-out when present, then remove the lock manually.',
    )
  }

  await writeFile(ownerFile, `${JSON.stringify({
    pid: process.pid,
    hostname: hostname(),
    startedAt: new Date().toISOString(),
    command: 'npm run test:learn-pages-preview',
  }, null, 2)}\n`, { mode: 0o600 })
  await mkdir(workspace, { mode: 0o700 })
}

async function captureOriginalOut() {
  hadOriginalOut = await exists(out)
  if (hadOriginalOut) await rename(out, originalOut)
  originalStateCaptured = true
  await writeFile(ownerFile, `${JSON.stringify({
    pid: process.pid,
    hostname: hostname(),
    startedAt: new Date().toISOString(),
    command: 'npm run test:learn-pages-preview',
    hadOriginalOut,
    snapshot: hadOriginalOut ? 'workspace/original-out' : null,
  }, null, 2)}\n`, { mode: 0o600 })
}

function childExited(child) {
  return child.exitCode !== null || child.signalCode !== null
}

function signalChild(child, signal) {
  if (childExited(child)) return
  try {
    if (child.spawnargs && process.platform !== 'win32') process.kill(-child.pid, signal)
    else child.kill(signal)
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error
  }
}

function spawnOwned(command, args, options) {
  if (signalExitCode) throw new Error('Learn Pages preview matrix interrupted')
  const child = spawn(command, args, {
    ...options,
    detached: process.platform !== 'win32',
  })
  activeChildren.add(child)
  const forget = () => activeChildren.delete(child)
  child.once('exit', forget)
  child.once('error', forget)
  return child
}

async function waitForChild(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
}

async function runBuild(enabled) {
  const child = spawnOwned('npm', ['run', 'build'], {
    cwd: repo,
    env: { ...process.env, NEXT_PUBLIC_LEARN_PUBLIC_ENABLED: enabled ? 'true' : 'false' },
    stdio: 'inherit',
  })
  const { code } = await waitForChild(child)
  if (code !== 0) throw new Error(`${enabled ? 'enabled' : 'disabled'} Learn build failed (${code})`)
}

async function openPort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return port
}

async function waitUntilReady(base, child, output) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Wrangler exited early (${child.exitCode}): ${output.value}`)
    try {
      const response = await fetch(base, { redirect: 'manual' })
      if (response.status > 0) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Wrangler did not become ready: ${output.value}`)
}

async function stop(child) {
  if (childExited(child)) return
  signalChild(child, 'SIGTERM')
  await new Promise((resolve) => {
    if (childExited(child)) return resolve()
    const finish = () => {
      clearTimeout(timeout)
      child.off('exit', finish)
      resolve()
    }
    const timeout = setTimeout(finish, 3_000)
    child.once('exit', finish)
  })
  if (!childExited(child)) {
    signalChild(child, 'SIGKILL')
    await new Promise((resolve) => child.once('exit', resolve))
  }
}

async function withPreview(artifact, runtimeFlag, verify) {
  const port = await openPort()
  const args = [wrangler, 'pages', 'dev', artifact, '--ip', '127.0.0.1', '--port', String(port), '--log-level', 'error']
  if (runtimeFlag !== undefined) args.push('--binding', `LEARN_PUBLIC_ENABLED=${runtimeFlag}`)
  const child = spawnOwned(process.execPath, args, { cwd: repo, env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] })
  const output = { value: '' }
  child.stdout.on('data', (chunk) => { output.value += chunk })
  child.stderr.on('data', (chunk) => { output.value += chunk })
  const base = `http://127.0.0.1:${port}`
  try {
    await waitUntilReady(base, child, output)
    await verify(base)
  } finally {
    await stop(child)
  }
}

async function responseAt(base, route, expectedStatus) {
  const response = await fetch(`${base}${route}`, { redirect: 'manual' })
  assert.equal(response.status, expectedStatus, `${route}: HTTP status`)
  return { response, html: await response.text() }
}

async function assertRuntimeDisabled(base) {
  for (const route of learnRoutes) {
    const { response, html } = await responseAt(base, route, 404)
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    assertDisabledLearnDocument(html, route)
  }
}

async function cleanupOwnedState() {
  if (!lockOwned) return
  if (cleanupPromise) return cleanupPromise
  cleanupPromise = (async () => {
    await Promise.all([...activeChildren].map(stop))
    if (initializationPromise) {
      try { await initializationPromise } catch {}
    }
    if (originalStateCaptured) {
      await rm(out, { recursive: true, force: true })
      if (hadOriginalOut) await rename(originalOut, out)
    }
    await rm(lock, { recursive: true, force: true })
    lockOwned = false
  })()
  return cleanupPromise
}

function handleSignal(signal) {
  if (signalExitCode) return
  signalExitCode = signal === 'SIGINT' ? 130 : 143
  void cleanupOwnedState().catch(() => {})
}

const onSigint = () => handleSignal('SIGINT')
const onSigterm = () => handleSignal('SIGTERM')

try {
  await acquireLock()
  process.on('SIGINT', onSigint)
  process.on('SIGTERM', onSigterm)
  initializationPromise = captureOriginalOut()
  await initializationPromise
  if (signalExitCode) throw new Error('Learn Pages preview matrix interrupted')

  await runBuild(false)
  await cp(out, disabledArtifact, { recursive: true })
  await runBuild(true)
  await cp(out, enabledArtifact, { recursive: true })

  await withPreview(enabledArtifact, 'true', async (base) => {
    assertAlignedControls({ buildEnabled: true, runtimeEnabled: true })
    for (const route of learnRoutes) {
      const { response, html } = await responseAt(base, route, 200)
      assertEnabledLearnDocument(html, route, response)
    }
    const { html: discovery } = await responseAt(base, '/experiences', 200)
    assertEnabledDiscoveryDocument(discovery)
  })

  for (const runtimeFlag of ['false', undefined]) {
    await withPreview(enabledArtifact, runtimeFlag, async (base) => {
      await assertRuntimeDisabled(base)
      const { html: discovery } = await responseAt(base, '/experiences', 200)
      assertEnabledDiscoveryDocument(discovery)
      assert.throws(
        () => assertAlignedControls({ buildEnabled: true, runtimeEnabled: false }),
        /incoherent deployment controls/,
      )
    })
  }

  await withPreview(disabledArtifact, 'true', async (base) => {
    for (const route of learnRoutes) {
      const { html } = await responseAt(base, route, 200)
      assertDisabledLearnDocument(html, route)
      assert.throws(
        () => assertEnabledLearnDocument(html, route),
        /canonical|indexable|error|noindex/i,
      )
    }
    const { html: discovery } = await responseAt(base, '/experiences', 200)
    assertNoLearnDiscoveryDocument(discovery)
    assert.throws(
      () => assertAlignedControls({ buildEnabled: false, runtimeEnabled: true }),
      /incoherent deployment controls/,
    )
  })

  for (const runtimeFlag of ['false', undefined]) {
    await withPreview(disabledArtifact, runtimeFlag, async (base) => {
      assertAlignedControls({ buildEnabled: false, runtimeEnabled: false })
      await assertRuntimeDisabled(base)
      const { html: discovery } = await responseAt(base, '/experiences', 200)
      assertNoLearnDiscoveryDocument(discovery)
    })
  }

  console.log('Learn Pages build/runtime matrix passed: 2 artifacts, 6 runtime pairs, mismatches rejected')
} catch (error) {
  if (!signalExitCode) throw error
} finally {
  await cleanupOwnedState()
  process.off('SIGINT', onSigint)
  process.off('SIGTERM', onSigterm)
}

if (signalExitCode) process.exitCode = signalExitCode
