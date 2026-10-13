import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import { twoPathPhotos, type TwoPathPhoto } from '../lib/two-path-photos'

// Release gate: no photo of identifiable people may ship before Thông confirms consent.
// Runs last in test:release, after the static export exists in out/.
const root = new URL('../', import.meta.url)
const bySrc = new Map<string, TwoPathPhoto>(Object.values(twoPathPhotos).map((p) => [p.src, p]))

async function walk(dir: URL, suffix: string): Promise<URL[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir)
      if (entry.isDirectory()) return walk(child, suffix)
      return Promise.resolve(entry.name.endsWith(suffix) ? [child] : [])
    }),
  )
  return nested.flat()
}

function blocked(p: TwoPathPhoto) {
  return p.faces === 'pending-owner-consent'
}

test('static export only ships two-path photos that are cleared for faces', async () => {
  const pages = await walk(new URL('out/', root), '.html').catch(() => {
    throw new Error('out/ is missing: run `npm run build` before the consent gate')
  })
  assert.ok(pages.length > 0, 'out/ has no HTML pages')
  const offenders = new Set<string>()
  for (const page of pages) {
    const html = await readFile(page, 'utf8')
    for (const [src] of html.matchAll(/\/images\/two-path\/[\w.-]+\.webp/g)) {
      const entry = bySrc.get(src)
      assert.ok(entry, `${src} in ${page.pathname} is not in lib/two-path-photos.ts`)
      if (blocked(entry)) offenders.add(`${entry.id} (${page.pathname.split('/out/')[1]})`)
    }
  }
  assert.deepEqual([...offenders], [], `Waiting for Thông's consent: ${[...offenders].join(', ')}`)
})

test('page sources reference only photos cleared for faces', async () => {
  const sources = ['lib/two-path-content.ts', 'app/page.tsx', 'app/tensai/page.tsx', 'app/conan/page.tsx']
  const componentDir = new URL('components/two-path/', root)
  const components = await walk(componentDir, '.tsx').catch(() => [])
  const texts = await Promise.all([
    ...sources.map((file) => readFile(new URL(file, root), 'utf8').catch(() => '')),
    ...components.map((file) => readFile(file, 'utf8')),
  ])
  const offenders = new Set<string>()
  for (const text of texts) {
    for (const [, id] of text.matchAll(/['"]([a-z0-9-]+)['"]/g)) {
      const entry = twoPathPhotos[id as keyof typeof twoPathPhotos]
      if (entry && blocked(entry)) offenders.add(entry.id)
    }
  }
  assert.deepEqual([...offenders], [], `Waiting for Thông's consent: ${[...offenders].join(', ')}`)
})
