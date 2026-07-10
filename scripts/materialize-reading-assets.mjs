import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const defaultContentDir = join(root, 'content/readings')
const defaultPublicDir = join(root, 'public')

const sha256 = (buffer) => `sha256:${createHash('sha256').update(buffer).digest('hex')}`

export async function materializeReadingAssets({
  contentDir = defaultContentDir,
  publicDir = defaultPublicDir,
} = {}) {
  const entries = (await readdir(contentDir, { withFileTypes: true })).filter((entry) => entry.isDirectory())
  const readyCandidates = []

  for (const entry of entries) {
    const imagePack = JSON.parse(await readFile(join(contentDir, entry.name, 'image-pack.json'), 'utf8'))
    readyCandidates.push(...imagePack.candidates.filter((candidate) => candidate.status === 'ready'))
  }

  let validated = 0
  const publicRoot = `${resolve(publicDir)}${sep}`
  for (const candidate of readyCandidates) {
    if (!candidate.publicPath?.startsWith('/images/readings/')) {
      throw new Error(`Ready asset ${candidate.id ?? 'unknown'} needs a local reading publicPath`)
    }
    const assetPath = resolve(publicDir, candidate.publicPath.replace(/^\/+/, ''))
    if (!assetPath.startsWith(publicRoot)) throw new Error(`Ready asset escapes public directory: ${assetPath}`)
    const asset = await readFile(assetPath)
    if (sha256(asset) !== candidate.checksum) {
      throw new Error(`Ready asset checksum mismatch: ${candidate.publicPath}`)
    }
    validated += 1
  }

  return { ready: readyCandidates.length, validated }
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) console.log(JSON.stringify(await materializeReadingAssets(), null, 2))
