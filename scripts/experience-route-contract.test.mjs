import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function sources(directory) {
  const entries = await readdir(new URL(`${directory}/`, root), { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) return sources(path)
    return /\.(?:ts|tsx|mjs)$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : []
  }))
  return nested.flat()
}

test('Experience Hub is canonical and the retired route exists only as a redirect', async () => {
  await access(new URL('app/experiences/page.tsx', root))
  await assert.rejects(access(new URL('app/challenges/page.tsx', root)))

  const redirects = await readFile(new URL('public/_redirects', root), 'utf8')
  assert.match(redirects, /^\/challenges \/experiences 301$/m)
})

test('executable source contains no stale /challenges destination', async () => {
  const files = (await Promise.all(['app', 'components', 'lib'].map(sources))).flat()
  const bodies = await Promise.all(files.map(async (file) => ({
    file,
    body: await readFile(new URL(file, root), 'utf8'),
  })))
  const stale = bodies.filter(({ body }) => /['"]\/challenges(?:\/|['"])/.test(body)).map(({ file }) => file)
  assert.deepEqual(stale, [])
})
