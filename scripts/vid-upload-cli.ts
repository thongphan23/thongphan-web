import { lstat, readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { validateUploadManifest } from '../lib/vid/upload-manifest'
import { runVidUpload } from './vid-upload'
import { runVidUploadBatch } from './vid-upload-batch'

async function readTextFile(filePath: string, label: string): Promise<string> {
  if (!path.isAbsolute(filePath)) throw new Error(`${label} path must be absolute`)
  const details = await lstat(filePath)
  if (details.isSymbolicLink() || !details.isFile()) throw new Error(`${label} must be a regular file`)
  const value = (await readFile(filePath, 'utf8')).trim()
  if (!value) throw new Error(`${label} must not be empty`)
  return value
}

async function main() {
  const { values, tokens, positionals } = parseArgs({
    options: {
      file: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
      'description-file': { type: 'string' },
      'source-title': { type: 'string' },
      'source-creator': { type: 'string' },
      'source-creator-url': { type: 'string' },
      'source-url': { type: 'string' },
      'rights-status': { type: 'string', default: 'owner-reviewed' },
      'rights-note-file': { type: 'string' },
      topic: { type: 'string', multiple: true },
      tag: { type: 'string', multiple: true },
      playlist: { type: 'string', multiple: true },
      'thumbnail-url': { type: 'string' },
      'base-url': { type: 'string', default: 'https://vid.thongphan.com' },
      publish: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      manifest: { type: 'string' },
    },
    strict: true,
    tokens: true,
    allowPositionals: true,
  })
  if (positionals.length > 1) throw new Error('Only one positional manifest path is allowed')
  if (values.manifest && positionals.length > 0) throw new Error('--manifest cannot be combined with a positional manifest path')
  const manifestPath = values.manifest ?? positionals[0]
  if (process.env.npm_lifecycle_event === 'vid:upload-batch' && values.manifest) {
    throw new Error('vid:upload-batch expects an absolute positional manifest path')
  }
  if (manifestPath) {
    const singleFileFlags = new Set(['file', 'slug', 'title', 'description-file', 'source-title', 'source-creator', 'source-creator-url', 'source-url', 'thumbnail-url', 'rights-status', 'rights-note-file', 'topic', 'tag', 'playlist', 'base-url', 'publish'])
    for (const token of tokens) {
      if (token.kind === 'option' && singleFileFlags.has(token.name)) {
        throw new Error(`--manifest cannot be combined with --${token.name}`)
      }
    }
    const manifestText = await readTextFile(manifestPath, 'Manifest')
    let parsed: unknown
    try {
      parsed = JSON.parse(manifestText)
    } catch {
      throw new Error('Manifest must be valid JSON')
    }
    const manifest = validateUploadManifest(parsed)
    const effectiveManifest = values['dry-run']
      ? { ...manifest, videos: manifest.videos.map((video) => ({ ...video, dryRun: true })) }
      : manifest
    const result = await runVidUploadBatch(effectiveManifest, { runUpload: runVidUpload })
    console.log(JSON.stringify(result))
    if (result.failed.length > 0) process.exitCode = 1
    return
  }
  const required = ['file', 'slug', 'title', 'description-file', 'source-title', 'source-creator', 'source-creator-url', 'source-url', 'rights-note-file'] as const
  for (const key of required) if (!values[key]) throw new Error(`Missing --${key}`)
  const result = await runVidUpload({
    baseUrl: values['base-url']!,
    filePath: values.file!,
    slug: values.slug!,
    title: values.title!,
    description: await readTextFile(values['description-file']!, 'Description'),
    sourceTitle: values['source-title']!,
    sourceCreator: values['source-creator']!,
    sourceCreatorUrl: values['source-creator-url']!,
    sourceVideoUrl: values['source-url']!,
    translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
    rightsStatus: values['rights-status'] as 'owner-reviewed',
    rightsNote: await readTextFile(values['rights-note-file']!, 'Rights note'),
    topics: values.topic ?? [],
    tags: values.tag ?? [],
    playlists: values.playlist ?? [],
    thumbnailUrl: values['thumbnail-url'],
    publish: values.publish!,
    dryRun: values['dry-run']!,
  })
  console.log(JSON.stringify(result))
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Vid upload failed')
  process.exitCode = 1
})
