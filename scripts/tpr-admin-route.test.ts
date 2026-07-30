import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('TPR admin is a standalone noindex route backed by the protected snapshot API', async () => {
  const [page, client, modes] = await Promise.all([
    readFile(new URL('../app/tpr/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/tpr/TprDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../lib/site-route-mode.ts', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /<TprDashboard\s*\/>/)
  assert.match(client, /fetch\('\/tpr\/api\/snapshot'/)
  assert.match(client, /setInterval\([\s\S]*?,\s*30_000\)/)
  assert.match(client, /Quyết định hình ảnh/)
  assert.match(client, /Bằng chứng Taste/)
  assert.match(client, /Rủi ro/)
  assert.match(modes, /'\/tpr':\s*'standalone'/)
  assert.doesNotMatch(page + client, /\b\d{8}\b/)
})
