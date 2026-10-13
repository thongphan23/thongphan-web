import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import test from 'node:test'
import { twoPathPhotos } from '../lib/two-path-photos.ts'

const root = new URL('../', import.meta.url)
const out = new URL('out/', root)
const twoPathPages = ['index.html', 'tensai.html', 'conan.html']

async function requireBuildFile(path) {
  try {
    await access(new URL(path, out))
  } catch {
    assert.fail(`build output missing: out/${path}`)
  }
}

async function readBuildFile(path) {
  await requireBuildFile(path)
  return readFile(new URL(path, out), 'utf8')
}

test('two-path pages each ship one h1, no video and both doors', async () => {
  for (const page of twoPathPages) {
    const html = await readBuildFile(page)

    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${page} should have exactly one h1`)
    assert.doesNotMatch(html, /<video(?:\s|>)/i, `${page} should not ship a video`)
    assert.match(html, /href="\/tensai"/, `${page} should link the Tensai door`)
    assert.match(html, /href="\/conan"/, `${page} should link the Conan door`)
  }
})

test('the retired homepage promises stay out of the static build', async () => {
  for (const page of twoPathPages) {
    const html = await readBuildFile(page)

    assert.doesNotMatch(html, /Biến chuyên môn thật thành/, `${page} still carries the retired promise`)
    assert.doesNotMatch(html, /AI PHẢI RA TIỀN/i, `${page} still carries the retired slogan`)
    assert.doesNotMatch(html, /data-home-section/, `${page} still renders the evidence-cinema homepage`)
  }
})

test('branch pages send readers to their product with two-path attribution', async () => {
  const tensai = await readBuildFile('tensai.html')
  const conan = await readBuildFile('conan.html')

  assert.match(tensai, /href="https:\/\/learn\.thongphan\.com\/\?[^"]*utm_campaign=two-path/)
  assert.match(conan, /href="https:\/\/www\.conan\.school\/\?[^"]*utm_campaign=two-path/)
})

test('static build contains every local Next, Conan Maker and Crown game asset reference', async () => {
  const pages = ['index.html', 'conanmaker/index.html', 'game/index.html']

  for (const page of pages) {
    const html = await readBuildFile(page)
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map(([, ref]) => ref.split('?')[0])
      .filter((ref) => ref.startsWith('/_next/') || ref.startsWith('/conanmaker/assets/') || ref.startsWith('/game/assets/'))

    assert.ok(refs.length > 0, `${page} should reference local fingerprinted assets`)
    for (const ref of refs) await requireBuildFile(ref.slice(1))
  }
})

test('two-path photos ship inside their manifest budgets', async () => {
  const photos = Object.values(twoPathPhotos)
  assert.ok(photos.length > 0, 'two-path photo manifest is empty')

  for (const photo of photos) {
    const path = photo.src.slice(1)
    await requireBuildFile(path)
    const info = await stat(new URL(path, out))
    assert.ok(info.size <= photo.budgetBytes, `${path} is ${info.size} bytes; budget is ${photo.budgetBytes}`)
  }
})

test('homepage route JavaScript stays within the interaction budget', async () => {
  const scriptRefs = (html) => [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(([, ref]) => ref)
  const homepageRefs = scriptRefs(await readBuildFile('index.html'))
  const sharedRefs = new Set(scriptRefs(await readBuildFile('about.html')))
  const pageChunks = homepageRefs.filter((ref) => !sharedRefs.has(ref))
  assert.ok(pageChunks.length > 0, 'homepage-only interaction chunk not found')

  let gzipBytes = 0
  for (const ref of pageChunks) {
    const source = await readFile(new URL(ref.slice(1), out))
    gzipBytes += gzipSync(source).byteLength
  }
  assert.ok(gzipBytes <= 35 * 1024, `homepage route JS is ${gzipBytes} gzip bytes; budget is 35840`)
})
