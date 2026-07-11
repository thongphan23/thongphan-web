import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const out = new URL('out/', root)
const routeFiles = [
  'index.html',
  'about.html',
  'diagnostic.html',
  'library.html',
  'library/read.html',
  'blog.html',
  'assets.html',
  'challenges.html',
  'chat.html',
]

async function requireBuild(path) {
  const url = new URL(path, out)
  try {
    await access(url)
  } catch {
    assert.fail(`build output missing: out/${path}`)
  }
  return url
}

function refs(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1].split('?')[0])
}

async function gzipTotal(paths) {
  let total = 0
  for (const path of new Set(paths)) total += gzipSync(await readFile(await requireBuild(path.slice(1)))).byteLength
  return total
}

test('public route families stay inside reproducible JS, CSS and font-request budgets', async () => {
  for (const file of routeFiles) {
    const html = await readFile(await requireBuild(file), 'utf8')
    const scripts = refs(html, /<script[^>]+src="([^"]+\.js(?:\?[^"]*)?)"/g).filter((ref) => ref.startsWith('/_next/'))
    const styles = refs(html, /<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"/g).filter((ref) => ref.startsWith('/_next/'))
    const preloadFonts = refs(html, /<link[^>]+rel="preload"[^>]+href="([^"]+\.woff2(?:\?[^"]*)?)"/g)

    assert.ok((await gzipTotal(scripts)) <= 230 * 1024, `${file} exceeds 230 KiB gzip JS`)
    assert.ok((await gzipTotal(styles)) <= 35 * 1024, `${file} exceeds 35 KiB gzip CSS`)
    assert.ok(preloadFonts.length <= 2, `${file} preloads ${preloadFonts.length} fonts; budget is 2`)
  }
})

test('first-view local raster assets are individually bounded', async () => {
  for (const file of routeFiles) {
    const html = await readFile(await requireBuild(file), 'utf8')
    const images = refs(html, /(?:src|href)="(\/[^"\s]+\.(?:png|jpe?g|webp)(?:\?[^"\s]*)?)"/gi)
      .filter((ref) => !ref.startsWith('/_next/image'))
    for (const image of new Set(images)) {
      const info = await stat(await requireBuild(image.slice(1)))
      assert.ok(info.size <= 500 * 1024, `${file}: ${image} is ${info.size} bytes; budget is 512000`)
    }
  }
})
