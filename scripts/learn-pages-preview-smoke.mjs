import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, cp, mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { realpathSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
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
const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url))
const learnRoutes = ['/learn', '/learn/free']

async function exists(path) {
  try { await access(path); return true } catch { return false }
}

async function runBuild(enabled) {
  const child = spawn('npm', ['run', 'build'], {
    cwd: repo,
    env: { ...process.env, NEXT_PUBLIC_LEARN_PUBLIC_ENABLED: enabled ? 'true' : 'false' },
    stdio: 'inherit',
  })
  const code = await new Promise((resolve) => child.once('exit', resolve))
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
  if (child.exitCode !== null) return
  child.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ])
  if (child.exitCode === null) child.kill('SIGKILL')
}

async function withPreview(artifact, runtimeFlag, verify) {
  const port = await openPort()
  const args = [wrangler, 'pages', 'dev', artifact, '--ip', '127.0.0.1', '--port', String(port), '--log-level', 'error']
  if (runtimeFlag !== undefined) args.push('--binding', `LEARN_PUBLIC_ENABLED=${runtimeFlag}`)
  const child = spawn(process.execPath, args, { cwd: repo, env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] })
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

const temp = await mkdtemp(join(realpathSync(tmpdir()), 'thongphan-learn-pages-preview-smoke-'))
const originalOut = join(temp, 'original-out')
const disabledArtifact = join(temp, 'build-disabled')
const enabledArtifact = join(temp, 'build-enabled')
const hadOriginalOut = await exists(out)

try {
  if (hadOriginalOut) await cp(out, originalOut, { recursive: true })

  await runBuild(false)
  await cp(out, disabledArtifact, { recursive: true })
  await runBuild(true)
  await cp(out, enabledArtifact, { recursive: true })

  await withPreview(enabledArtifact, 'true', async (base) => {
    assertAlignedControls({ buildEnabled: true, runtimeEnabled: true })
    for (const route of learnRoutes) {
      const { html } = await responseAt(base, route, 200)
      assertEnabledLearnDocument(html, route)
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
} finally {
  await rm(out, { recursive: true, force: true })
  if (hadOriginalOut) await cp(originalOut, out, { recursive: true })
  await rm(temp, { recursive: true, force: true })
}
