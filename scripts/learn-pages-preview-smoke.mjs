import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'

const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url))
const routes = ['/learn', '/learn/free']

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
  for (let attempt = 0; attempt < 80; attempt += 1) {
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

async function verifyMode(name, runtimeFlag, expectedStatus) {
  const port = await openPort()
  const args = [
    wrangler,
    'pages',
    'dev',
    'out',
    '--ip', '127.0.0.1',
    '--port', String(port),
    '--log-level', 'error',
  ]
  if (runtimeFlag !== undefined) args.push('--binding', `LEARN_PUBLIC_ENABLED=${runtimeFlag}`)

  const child = spawn(process.execPath, args, {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, CI: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const output = { value: '' }
  child.stdout.on('data', (chunk) => { output.value += chunk })
  child.stderr.on('data', (chunk) => { output.value += chunk })
  const base = `http://127.0.0.1:${port}`

  try {
    await waitUntilReady(base, child, output)
    for (const route of routes) {
      const response = await fetch(`${base}${route}`, { redirect: 'manual' })
      assert.equal(response.status, expectedStatus, `${name} ${route}`)
      if (expectedStatus === 404) {
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
      } else {
        assert.match(await response.text(), /Học AI để làm việc tốt hơn|AI Foundation/)
      }
    }
  } finally {
    await stop(child)
  }
}

await verifyMode('runtime true', 'true', 200)
await verifyMode('runtime false', 'false', 404)
await verifyMode('runtime missing', undefined, 404)
console.log('Learn Pages preview smoke passed: runtime true 200; false/missing 404')
