import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readRoot = process.env.THONGPHAN_READ_ROOT ?? join(homedir(), 'Projects/thongphan-read')
const manifestPath = join(root, 'scripts/fixtures/readings-legacy-manifest.json')
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`

const blockCount = (item) =>
  (item.sections ?? []).reduce(
    (count, section) => count + (section.blocks?.length ?? section.paragraphs?.length ?? 0),
    0,
  )

const manifestRecord = (item) => ({
  slug: item.slug,
  title: item.title,
  author: item.author,
  sourceUrl: item.url,
  legacySectionCount: item.sections?.length ?? 0,
  legacyBlockCount: blockCount(item),
  legacyBodyChecksum: sha256(JSON.stringify(item.sections ?? [])),
})

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const { libraryItems } = await import(pathToFileURL(join(readRoot, 'src/library.ts')).href)
const liveManifest = libraryItems.map(manifestRecord).sort((left, right) => left.slug.localeCompare(right.slug, 'en'))

if (JSON.stringify(liveManifest) !== JSON.stringify(manifest)) {
  throw new Error(
    'Live Read source differs from the committed safe manifest. Run the manual migration and review rights before updating it.',
  )
}

console.log(`Live-source parity verified for ${liveManifest.length} readings at ${readRoot}`)
