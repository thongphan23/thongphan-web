import { lstat, readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { runVidUpload } from './vid-upload'

async function readTextFile(filePath: string, label: string): Promise<string> {
  if (!path.isAbsolute(filePath)) throw new Error(`${label} path must be absolute`)
  const details = await lstat(filePath)
  if (details.isSymbolicLink() || !details.isFile()) throw new Error(`${label} must be a regular file`)
  const value = (await readFile(filePath, 'utf8')).trim()
  if (!value) throw new Error(`${label} must not be empty`)
  return value
}

async function main() {
  const { values } = parseArgs({
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
      'base-url': { type: 'string', default: 'https://vid.thongphan.com' },
      publish: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
    strict: true,
  })
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
    publish: values.publish!,
    dryRun: values['dry-run']!,
  })
  console.log(JSON.stringify(result))
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Vid upload failed')
  process.exitCode = 1
})
