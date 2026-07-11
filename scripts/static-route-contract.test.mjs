import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

test('static Conan Maker bundle matches the captured live fingerprint', async () => {
  const html = await readFile(new URL('public/conanmaker/index.html', root), 'utf8')

  assert.match(html, /\/conanmaker\/assets\/index-fF5i7DFq\.js/)
  assert.match(html, /\/conanmaker\/assets\/index-DPgHELtg\.css/)
})

test('static Conan Maker bundle references only present local assets', async () => {
  const html = await readFile(new URL('public/conanmaker/index.html', root), 'utf8')
  const refs = [...html.matchAll(/(?:src|href)="(\/conanmaker\/assets\/[^"]+)"/g)].map(([, ref]) => ref)

  assert.ok(refs.length >= 2, 'expected fingerprinted JS and CSS references')
  for (const ref of refs) {
    await access(new URL(`public${ref}`, root))
  }
})

test('static Crown game bundle is self-contained under /game', async () => {
  const html = await readFile(new URL('public/game/index.html', root), 'utf8')
  const refs = [...html.matchAll(/(?:src|href)="(\/game\/[^"]+)"/g)].map(([, ref]) => ref)

  assert.ok(refs.some((ref) => ref.endsWith('.js')), 'expected a fingerprinted game JavaScript bundle')
  assert.ok(refs.some((ref) => ref.endsWith('.css')), 'expected a fingerprinted game CSS bundle')
  for (const ref of refs) {
    await access(new URL(`public${ref}`, root))
  }

  const scriptRef = refs.find((ref) => ref.endsWith('.js'))
  const script = await readFile(new URL(`public${scriptRef}`, root), 'utf8')
  assert.match(script, /["']\/game\/["']/)
  assert.match(script, /\/assets\/generated\/v2/)

  const runtimeAssets = await readdir(new URL('public/game/assets/generated/v2/', root), { recursive: true })
  assert.equal(runtimeAssets.filter((path) => path.endsWith('.png')).length, 65)
})

test('static redirects preserve the canonical trailing slash', async () => {
  const redirects = await readFile(new URL('public/_redirects', root), 'utf8')

  assert.match(redirects, /^\/conanmaker \/conanmaker\/ 301$/m)
  assert.match(redirects, /^\/game \/game\/ 301$/m)
})
