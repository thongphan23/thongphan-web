import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const out = new URL('out/', root)

async function requireBuildFile(path) {
  try {
    await access(new URL(path, out))
  } catch {
    assert.fail(`build output missing: out/${path}`)
  }
}

test('static homepage build keeps one promise, one h1 and no hero video', async () => {
  await requireBuildFile('index.html')
  const html = await readFile(new URL('index.html', out), 'utf8')

  assert.match(html, /Biến chuyên môn thật thành/)
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1)
  assert.doesNotMatch(html, /<video(?:\s|>)/i)
})

test('static build contains every local Next, Conan Maker and Crown game asset reference', async () => {
  await requireBuildFile('index.html')
  await requireBuildFile('conanmaker/index.html')
  await requireBuildFile('game/index.html')
  const pages = ['index.html', 'conanmaker/index.html', 'game/index.html']

  for (const page of pages) {
    const html = await readFile(new URL(page, out), 'utf8')
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map(([, ref]) => ref.split('?')[0])
      .filter((ref) => ref.startsWith('/_next/') || ref.startsWith('/conanmaker/assets/') || ref.startsWith('/game/assets/'))

    assert.ok(refs.length > 0, `${page} should reference local fingerprinted assets`)
    for (const ref of refs) await requireBuildFile(ref.slice(1))
  }
})

test('homepage ships fingerprinted hero sources under desktop and mobile budgets', async () => {
  const budgets = [
    ['images/homepage/evidence-cinema-hero-v3.webp', 180 * 1024],
    ['images/homepage/evidence-cinema-hero-v3-mobile.webp', 180 * 1024],
    ['images/homepage/evidence-cinema-film-texture-v2.webp', 60 * 1024],
    ['images/homepage/evidence-cinema-stamp-v4.png', 80 * 1024],
    ['images/homepage/proof/thong-stage-3x2-v1.webp', 140 * 1024],
    ['images/homepage/proof/thong-author-book-3x2-v1.webp', 100 * 1024],
    ['images/homepage/proof/screenforge-production-3x2-v1.webp', 160 * 1024],
    ['images/homepage/evidence-cinema-signature-v3.png', 40 * 1024],
    ['images/homepage/evidence-cinema-arrow-v2.png', 20 * 1024],
    ['images/homepage/evidence-cinema-outer-frame-v2.png', 350 * 1024],
    ['images/homepage/evidence-cinema-conan-portrait-v2.webp', 300 * 1024],
  ]

  for (const [path, budget] of budgets) {
    await requireBuildFile(path)
    const info = await stat(new URL(path, out))
    assert.ok(info.size <= budget, `${path} is ${info.size} bytes; budget is ${budget}`)
  }
})

test('homepage route JavaScript stays within the interaction budget', async () => {
  const scriptRefs = (html) => [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(([, ref]) => ref)
  const homepageRefs = scriptRefs(await readFile(new URL('index.html', out), 'utf8'))
  const sharedRefs = new Set(scriptRefs(await readFile(new URL('about.html', out), 'utf8')))
  const pageChunks = homepageRefs.filter((ref) => !sharedRefs.has(ref))
  assert.ok(pageChunks.length > 0, 'homepage-only interaction chunk not found')

  let gzipBytes = 0
  for (const ref of pageChunks) {
    const source = await readFile(new URL(ref.slice(1), out))
    gzipBytes += gzipSync(source).byteLength
  }
  assert.ok(gzipBytes <= 35 * 1024, `homepage route JS is ${gzipBytes} gzip bytes; budget is 35840`)
})
