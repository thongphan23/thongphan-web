import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFile(new URL(path, root), 'utf8')

test('TPR console has the protected operational surfaces and noindex metadata', async () => {
  for (const path of [
    'app/tpr/page.tsx',
    'app/tpr/page.module.css',
    'components/tpr/TprConsole.tsx',
    'components/tpr/tpr-console.module.css',
    'lib/tpr/contracts.ts',
  ]) await access(new URL(path, root))

  const page = await read('app/tpr/page.tsx')
  const consoleSource = await read('components/tpr/TprConsole.tsx')
  assert.match(page, /robots:\s*\{\s*index:\s*false/)
  assert.match(consoleSource, /Tổng quan/)
  assert.match(consoleSource, /Video/)
  assert.match(consoleSource, /Nguồn phim/)
  assert.match(consoleSource, /Model & graph/)
  assert.match(consoleSource, /Taste & phản hồi/)
  assert.match(consoleSource, /Codex/)
  assert.match(consoleSource, /Hệ thống/)
  assert.match(consoleSource, /\/api\/tpr\/dashboard/)
})

test('TPR control plane has isolated config, migration, tests and secure routes', async () => {
  for (const path of [
    'wrangler.tpr-control-plane.jsonc',
    'workers/tpr-control-plane/index.ts',
    'workers/tpr-control-plane/auth.ts',
    'workers/tpr-control-plane/types.ts',
    'workers/tpr-migrations/0001_tpr_control_plane.sql',
    'scripts/tpr-control-plane.test.ts',
  ]) await access(new URL(path, root))

  const config = await read('wrangler.tpr-control-plane.jsonc')
  const worker = await read('workers/tpr-control-plane/index.ts')
  const auth = await read('workers/tpr-control-plane/auth.ts')
  assert.match(config, /thongphan-tpr-control-plane/)
  assert.match(config, /thongphan\.com\/api\/tpr\/\*/)
  assert.match(config, /TPR_DB/)
  assert.doesNotMatch(config, /TPR_OWNER_ACCESS_CODE_HASH\s*:/)
  assert.match(worker, /private, no-store/)
  assert.match(worker, /noindex, nofollow/)
  assert.match(auth, /timingSafeEqual/)
})

test('large binaries are never stored in D1', async () => {
  const migration = await read('workers/tpr-migrations/0001_tpr_control_plane.sql')
  const worker = await read('workers/tpr-control-plane/index.ts')
  assert.doesNotMatch(migration, /\bBLOB\b/i)
  assert.doesNotMatch(worker, /INSERT[\s\S]{0,100}video_bytes/i)
  assert.match(worker, /OBJECT_STORAGE_UNAVAILABLE/)
})
