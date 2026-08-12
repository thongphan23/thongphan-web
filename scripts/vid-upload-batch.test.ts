import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, mkdtemp, open, readFile, rename, symlink, writeFile } from 'node:fs/promises'
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
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
}

async function runNpmBatch(...args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'vid:upload-batch', '--', ...args], { cwd: process.cwd() })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
}

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

test('manifest rejects any signing origin except canonical VID production before upload', async () => {
  const fixture = await fixtureManifest() as { version: number; videos: Array<Record<string, unknown>> }
  fixture.videos[0]!.baseUrl = 'https://attacker.example'
  let uploadCalls = 0
  await assert.rejects(
    () => runVidUploadBatch(fixture as unknown as VidUploadManifest, {
      runUpload: async () => { uploadCalls += 1; return { status: 'uploaded' as const, operationId: 'op', videoId: 'id' } },
    }),
    /baseUrl must be https:\/\/vid\.thongphan\.com/,
  )
  assert.equal(uploadCalls, 0)
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

test('batch preserves custom focal metadata for the per-video upload path', async () => {
  const fixture = await fixtureManifest() as { version: number; videos: Array<Record<string, unknown>> }
  fixture.videos[0]!.thumbnailFocalX = 17
  fixture.videos[0]!.thumbnailFocalY = 83
  const seen: Array<[number | undefined, number | undefined]> = []
  const result = await runVidUploadBatch(validateUploadManifest(fixture), {
    runUpload: async (options) => {
      seen.push([options.thumbnailFocalX, options.thumbnailFocalY])
      return { status: 'uploaded' as const, operationId: 'op', videoId: 'id' }
    },
  })
  assert.deepEqual(result.uploaded, ['video-a'])
  assert.deepEqual(seen, [[17, 83]])
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
  let secureOpenCalls = 0
  const dryRunResult = await runVidUploadBatch(dryRun, {
    openSource: async () => { secureOpenCalls += 1; throw new Error('dry-run must not stage') },
    runUpload: async () => ({ status: 'dry-run' as const, fileSize: 512, slug: 'video-a' }),
  })
  assert.deepEqual(dryRunResult, { published: [], uploaded: [], failed: [] })
  assert.equal(secureOpenCalls, 0)
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

test('batch uploads bytes from the securely opened descriptor when source path is swapped after open', async () => {
  const manifest = validateUploadManifest(await fixtureManifest())
  const sourcePath = manifest.videos[0]!.filePath
  const movedPath = `${sourcePath}.original`
  const attackerPath = path.join(path.dirname(sourcePath), 'attacker.mp4')
  await writeFile(attackerPath, Buffer.alloc(512, 9))
  let stagedPath = ''
  let uploadedBytes = Buffer.alloc(0)

  const result = await runVidUploadBatch(manifest, {
    openSource: async (filePath, flags) => {
      const handle = await open(filePath, flags)
      await rename(filePath, movedPath)
      await symlink(attackerPath, filePath)
      return handle
    },
    runUpload: async (options) => {
      stagedPath = options.filePath
      uploadedBytes = await readFile(options.filePath)
      return { status: 'uploaded' as const, operationId: 'op', videoId: 'id' }
    },
  })

  assert.deepEqual(result, { published: [], uploaded: ['video-a'], failed: [] })
  assert.notEqual(stagedPath, sourcePath)
  assert.deepEqual(uploadedBytes, Buffer.alloc(512, 1))
  await assert.rejects(() => access(stagedPath), /ENOENT/)
})

test('batch fails closed when source becomes a symlink before secure open', async () => {
  const manifest = validateUploadManifest(await fixtureManifest())
  const sourcePath = manifest.videos[0]!.filePath
  const movedPath = `${sourcePath}.original`
  const attackerPath = path.join(path.dirname(sourcePath), 'attacker.mp4')
  await writeFile(attackerPath, Buffer.alloc(512, 9))
  let uploadCalls = 0

  const result = await runVidUploadBatch(manifest, {
    openSource: async (filePath, flags) => {
      await rename(filePath, movedPath)
      await symlink(attackerPath, filePath)
      return open(filePath, flags)
    },
    runUpload: async () => { uploadCalls += 1; return { status: 'uploaded' as const, operationId: 'op', videoId: 'id' } },
  })

  assert.deepEqual(result, { published: [], uploaded: [], failed: [{ slug: 'video-a', reason: 'Upload failed' }] })
  assert.equal(uploadCalls, 0)
})

test('batch stages and cleans only one video at a time', async () => {
  const manifest = validateUploadManifest(await fixtureManifest(['video-a', 'video-b']))
  const sourcePaths = manifest.videos.map((video) => video.filePath)
  const stagedPaths: string[] = []

  const result = await runVidUploadBatch(manifest, {
    runUpload: async (options) => {
      assert.equal(sourcePaths.includes(options.filePath), false)
      if (stagedPaths[0]) await assert.rejects(() => access(stagedPaths[0]!), /ENOENT/)
      stagedPaths.push(options.filePath)
      return { status: 'uploaded' as const, operationId: 'op', videoId: 'id' }
    },
  })

  assert.deepEqual(result, { published: [], uploaded: ['video-a', 'video-b'], failed: [] })
  for (const stagedPath of stagedPaths) await assert.rejects(() => access(stagedPath), /ENOENT/)
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

test('package batch command takes one absolute positional manifest path', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-cli-'))
  const manifestPath = path.join(directory, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(await fixtureManifest(['video-a', 'video-b'])))
  const result = await runNpmBatch(manifestPath, '--dry-run')
  assert.equal(result.code, 0)
  assert.match(result.stdout, /\{"published":\[\],"uploaded":\[\],"failed":\[\]\}/)
  assert.equal(result.stderr, '')
})

test('package batch command rejects the non-canonical --manifest form', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-cli-'))
  const manifestPath = path.join(directory, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(await fixtureManifest()))
  const result = await runNpmBatch('--manifest', manifestPath, '--dry-run')
  assert.equal(result.code, 1)
  assert.match(result.stderr, /vid:upload-batch expects an absolute positional manifest path/)
})
