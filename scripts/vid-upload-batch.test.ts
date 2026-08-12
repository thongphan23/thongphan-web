import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { validateUploadManifest, type VidUploadManifest } from '../lib/vid/upload-manifest'
import { runVidUploadBatch } from './vid-upload-batch'
import type { VidUploadOptions } from './vid-upload'

const metadata = {
  title: 'Tư duy AI',
  description: 'Mô tả video',
  sourceTitle: 'Original title',
  sourceCreator: 'Creator',
  sourceCreatorUrl: 'https://example.com/creator',
  sourceVideoUrl: 'https://www.youtube.com/watch?v=abc',
  translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  rightsStatus: 'owner-reviewed',
  rightsNote: 'Chủ sở hữu đã rà soát nguồn và phạm vi sử dụng.',
  topics: ['ai'],
  tags: ['tư duy'],
  playlists: [],
}

async function fixtureManifest(slugs: string[] = ['video-a']): Promise<unknown> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-batch-'))
  const videos = await Promise.all(slugs.map(async (slug) => {
    const filePath = path.join(directory, `${slug}.mp4`)
    await writeFile(filePath, Buffer.alloc(512, 1))
    return {
      baseUrl: 'https://vid.thongphan.com',
      filePath,
      slug,
      ...metadata,
      publish: true,
      dryRun: false,
    }
  }))
  return { version: 1, videos }
}

async function runCli(...args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'scripts/vid-upload-cli.ts', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, HOME: awaitableHome },
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
}

const awaitableHome = path.join(os.tmpdir(), 'vid-upload-batch-no-secret-home')

test('manifest validates every M0 field and applies focal defaults before upload', async () => {
  const manifest = validateUploadManifest(await fixtureManifest())
  assert.equal(manifest.version, 1)
  assert.equal(manifest.videos[0]?.thumbnailFocalX, 50)
  assert.equal(manifest.videos[0]?.thumbnailFocalY, 24)
})

test('manifest rejects unknown root and item keys', async () => {
  const fixture = await fixtureManifest()
  assert.throws(() => validateUploadManifest({ ...fixture as object, unexpected: true }), /Unknown manifest field: unexpected/)
  const withUnexpectedItem = structuredClone(fixture) as { version: number; videos: Array<Record<string, unknown>> }
  withUnexpectedItem.videos[0]!.unexpected = true
  assert.throws(() => validateUploadManifest(withUnexpectedItem), /Unknown manifest video field: unexpected/)
})

test('manifest rejects duplicate slugs, non-regular paths, and more than 100 rows', async () => {
  const duplicate = await fixtureManifest(['video-a', 'video-a'])
  assert.throws(() => validateUploadManifest(duplicate), /Duplicate video slug: video-a/)

  const relative = structuredClone(await fixtureManifest()) as { videos: Array<Record<string, unknown>> }
  relative.videos[0]!.filePath = 'video.mp4'
  assert.throws(() => validateUploadManifest(relative), /Video path must be absolute/)

  const symlinkManifest = structuredClone(await fixtureManifest()) as { videos: Array<Record<string, unknown>> }
  const target = symlinkManifest.videos[0]!.filePath as string
  const link = path.join(path.dirname(target), 'linked.mp4')
  await symlink(target, link)
  symlinkManifest.videos[0]!.filePath = link
  assert.throws(() => validateUploadManifest(symlinkManifest), /must not be a symlink/)

  const oversized = await fixtureManifest(['video-a']) as { version: number; videos: Array<Record<string, unknown>> }
  oversized.videos = Array.from({ length: 101 }, (_, index) => ({ ...oversized.videos[0], slug: `video-${index}` }))
  assert.throws(() => validateUploadManifest(oversized), /at most 100/)
})

test('batch validates all rows before upload and continues independent failures sequentially', async () => {
  const manifest = validateUploadManifest(await fixtureManifest(['video-a', 'video-b', 'video-c']))
  const started: string[] = []
  let active = 0
  let maxConcurrentUploads = 0
  const result = await runVidUploadBatch(manifest, {
    runUpload: async (options: VidUploadOptions) => {
      started.push(options.slug)
      active += 1
      maxConcurrentUploads = Math.max(maxConcurrentUploads, active)
      await Promise.resolve()
      active -= 1
      if (options.slug === 'video-b') throw new Error('Bunny processing failed')
      return options.slug === 'video-c'
        ? { status: 'uploaded' as const, operationId: 'op-c', videoId: 'id-c' }
        : { status: 'published' as const, operationId: 'op-a', videoId: 'id-a' }
    },
  })
  assert.deepEqual(started, ['video-a', 'video-b', 'video-c'])
  assert.deepEqual(result.published, ['video-a'])
  assert.deepEqual(result.uploaded, ['video-c'])
  assert.deepEqual(result.failed, [{ slug: 'video-b', reason: 'Bunny processing failed' }])
  assert.equal(maxConcurrentUploads, 1)
})

test('batch never calls upload for an invalid manifest and does not call dry-run an upload', async () => {
  const invalid = await fixtureManifest(['video-a', 'video-b']) as { version: number; videos: Array<Record<string, unknown>> }
  invalid.videos[1]!.rightsStatus = 'unverified'
  let calls = 0
  await assert.rejects(
    () => runVidUploadBatch(invalid as unknown as VidUploadManifest, {
      runUpload: async () => { calls += 1; return { status: 'uploaded' as const, operationId: 'op', videoId: 'id' } },
    }),
    /rightsStatus is invalid/,
  )
  assert.equal(calls, 0)

  const dryRun = validateUploadManifest(await fixtureManifest())
  dryRun.videos[0]!.dryRun = true
  const dryRunResult = await runVidUploadBatch(dryRun, {
    runUpload: async () => ({ status: 'dry-run' as const, fileSize: 512, slug: 'video-a' }),
  })
  assert.deepEqual(dryRunResult, { published: [], uploaded: [], failed: [] })
})

test('batch returns a safe failure reason and does not retry a failed video', async () => {
  const manifest = validateUploadManifest(await fixtureManifest())
  let calls = 0
  const result = await runVidUploadBatch(manifest, {
    runUpload: async () => {
      calls += 1
      throw new Error('token secret-value must not be printed')
    },
  })
  assert.deepEqual(result, { published: [], uploaded: [], failed: [{ slug: 'video-a', reason: 'Upload failed' }] })
  assert.equal(calls, 1)
})

test('CLI dry-run validates a manifest without invoking the single-file mode', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-cli-'))
  const manifestPath = path.join(directory, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(await fixtureManifest(['video-a', 'video-b'])))
  const result = await runCli('--manifest', manifestPath, '--dry-run')
  assert.equal(result.code, 0)
  assert.deepEqual(JSON.parse(result.stdout), { published: [], uploaded: [], failed: [] })
  assert.equal(result.stderr, '')
})

test('CLI rejects a manifest mixed with a single-file flag', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-cli-'))
  const manifestPath = path.join(directory, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(await fixtureManifest()))
  const result = await runCli('--manifest', manifestPath, '--file', '/private/tmp/video.mp4')
  assert.equal(result.code, 1)
  assert.match(result.stderr, /--manifest cannot be combined with --file/)
})

test('CLI rejects a manifest mixed with an explicit single-file metadata flag', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-cli-'))
  const manifestPath = path.join(directory, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(await fixtureManifest()))
  const result = await runCli('--manifest', manifestPath, '--rights-status', 'owned')
  assert.equal(result.code, 1)
  assert.match(result.stderr, /--manifest cannot be combined with --rights-status/)
})
