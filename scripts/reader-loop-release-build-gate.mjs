import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const out = join(root, 'out')
const apiOrigin = 'https://thongphan-reader-loop-preview-api.thongphan-preview.workers.dev'

function runBuild(enabled) {
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
  delete env.NEXT_PUBLIC_READER_LOOP_PREVIEW_ENABLED
  delete env.NEXT_PUBLIC_READER_LOOP_API_ORIGIN
  if (enabled) {
    env.NEXT_PUBLIC_READER_LOOP_PREVIEW_ENABLED = 'true'
    env.NEXT_PUBLIC_READER_LOOP_API_ORIGIN = apiOrigin
  }
  const result = spawnSync('npm', ['run', 'build'], { cwd: root, env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  if (result.status !== 0) {
    const output = `${result.stdout}\n${result.stderr}`.slice(-12000)
    throw new Error(`${enabled ? 'enabled' : 'disabled'} Reader Loop build failed:\n${output}`)
  }
}

function routeHtml(name) {
  return readFileSync(join(out, `${name}.html`), 'utf8')
}

function filesContaining(value) {
  const result = spawnSync('rg', ['-l', value, out], { encoding: 'utf8' })
  if (result.status === 1) return ''
  if (result.status !== 0) throw new Error(`rg failed: ${result.stderr}`)
  return result.stdout
}

function assertDisabledArtifact() {
  assert.doesNotMatch(routeHtml('read'), /Hiện tại anh\/chị đang muốn giải quyết/)
  assert.doesNotMatch(routeHtml('read/inspector'), /Chuỗi này chỉ thuộc mã ẩn danh/)
  assert.equal(filesContaining(apiOrigin).trim(), '')
}

function assertEnabledArtifact() {
  assert.match(routeHtml('read'), /Hiện tại anh\/chị đang muốn giải quyết/)
  assert.match(routeHtml('read/inspector'), /Chuỗi này chỉ thuộc mã ẩn danh/)
  assert.match(filesContaining(apiOrigin), /_next\/static\/chunks/)
}

try {
  runBuild(false)
  assertDisabledArtifact()
  runBuild(true)
  assertEnabledArtifact()
} finally {
  runBuild(false)
  assertDisabledArtifact()
}

console.log('Reader Loop disabled production build: PASS')
console.log('Reader Loop enabled preview build: PASS')
console.log('Final Reader Loop artifact is production-disabled: PASS')
