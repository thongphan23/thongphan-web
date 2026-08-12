import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, appendFile, mkdtemp, open, readFile, rename, rm, stat, symlink, truncate, writeFile, type FileHandle } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { runVidUpload, type VidUploadOptions } from './vid-upload'

const metadata = {
  slug: 'tu-duy-ai',
  title: 'Tư duy AI',
  description: 'Mô tả video',
  sourceTitle: 'Original title',
  sourceCreator: 'Creator',
  sourceCreatorUrl: 'https://example.com/creator',
  sourceVideoUrl: 'https://www.youtube.com/watch?v=abc',
  translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  rightsStatus: 'owner-reviewed' as const,
  rightsNote: 'Chủ sở hữu đã rà soát nguồn và phạm vi sử dụng.',
  topics: ['ai'],
  tags: ['tư duy'],
  playlists: [],
}

async function fixtureOptions(overrides: Partial<VidUploadOptions> = {}): Promise<VidUploadOptions> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-'))
  const filePath = path.join(directory, 'video.mp4')
  await writeFile(filePath, Buffer.alloc(2_048, 1))
  return {
    baseUrl: 'https://vid.thongphan.com',
    filePath,
    ...metadata,
    publish: false,
    dryRun: false,
    ...overrides,
  }
}

test('dry-run validates an absolute MP4 without reading secrets or using network', async () => {
  const options = await fixtureOptions({ dryRun: true })
  let secretReads = 0
  let networkCalls = 0
  const result = await runVidUpload(options, {
    readSecret: async () => { secretReads += 1; return 'secret' },
    fetch: async () => { networkCalls += 1; throw new Error('network forbidden') },
    uploadTus: async () => { throw new Error('upload forbidden') },
  })
  assert.deepEqual(result, { status: 'dry-run', fileSize: 2_048, slug: 'tu-duy-ai' })
  assert.equal(secretReads, 0)
  assert.equal(networkCalls, 0)
})

test('rejects relative, symlink, empty and non-MP4 input before network', async () => {
  const options = await fixtureOptions()
  await assert.rejects(() => runVidUpload({ ...options, filePath: 'video.mp4' }), /absolute/)
  await assert.rejects(() => runVidUpload({ ...options, filePath: options.filePath.replace(/\.mp4$/, '.mov') }), /\.mp4/)

  const symlinkPath = path.join(path.dirname(options.filePath), 'linked.mp4')
  await symlink(options.filePath, symlinkPath)
  await assert.rejects(() => runVidUpload({ ...options, filePath: symlinkPath }), /symlink/)

  const emptyPath = path.join(path.dirname(options.filePath), 'empty.mp4')
  await writeFile(emptyPath, '')
  await assert.rejects(() => runVidUpload({ ...options, filePath: emptyPath }), /empty/)
})

test('rejects a non-production direct upload origin before secrets or network', async () => {
  const options = await fixtureOptions({ baseUrl: 'https://attacker.example' })
  let secretReads = 0
  let networkCalls = 0
  await assert.rejects(() => runVidUpload(options, {
    readSecret: async () => { secretReads += 1; return 'secret' },
    fetch: async () => { networkCalls += 1; throw new Error('network forbidden') },
  }), /base URL must be https:\/\/vid\.thongphan\.com/)
  assert.equal(secretReads, 0)
  assert.equal(networkCalls, 0)
})

test('rejects a video above the 50 GiB operator ceiling before staging or secrets', async () => {
  const options = await fixtureOptions()
  await truncate(options.filePath, 50 * 1024 ** 3 + 1)
  let secretReads = 0
  let secureOpenCalls = 0
  await assert.rejects(() => runVidUpload(options, {
    readSecret: async () => { secretReads += 1; return 'secret' },
    openSource: async () => { secureOpenCalls += 1; throw new Error('must not open') },
  }), /must not exceed 50 GiB/)
  assert.equal(secretReads, 0)
  assert.equal(secureOpenCalls, 0)
})

test('fails closed before copying or uploading when secure staging lacks its safety reserve', async () => {
  const options = await fixtureOptions()
  let sourceReads = 0
  let secretReads = 0
  let networkCalls = 0
  let tusUploads = 0

  await assert.rejects(() => runVidUpload(options, {
    openSource: async (filePath, flags) => {
      const handle = await open(filePath, flags)
      return {
        stat: () => handle.stat(),
        read: async (...args: Parameters<FileHandle['read']>) => {
          sourceReads += 1
          return handle.read(...args)
        },
        close: () => handle.close(),
      } as FileHandle
    },
    getFreeStagingBytes: async () => 2_048,
    readSecret: async () => { secretReads += 1; return 'secret' },
    fetch: async () => {
      networkCalls += 1
      return Response.json({
        operationId: 'operation-01', endpoint: 'https://video.bunnycdn.com/tusupload',
        videoId: 'bunny-guid', libraryId: '123', expirationTime: 1, signature: 'a'.repeat(64),
      }, { status: 201 })
    },
    uploadTus: async () => { tusUploads += 1 },
  }), /Secure video staging free space is insufficient$/)

  assert.equal(sourceReads, 0)
  assert.equal(secretReads, 0)
  assert.equal(networkCalls, 0)
  assert.equal(tusUploads, 0)
})

test('direct upload binds source bytes before a pathname swap and uses a stable content resume fingerprint', async () => {
  const options = await fixtureOptions()
  const originalBytes = Buffer.alloc(2_048, 1)
  const attackerPath = path.join(path.dirname(options.filePath), 'attacker.mp4')
  const movedPath = `${options.filePath}.original`
  await writeFile(attackerPath, Buffer.alloc(2_048, 9))
  let stagedPath = ''
  let stagedDirectoryMode = 0
  let stagedMode = 0
  let uploadedBytes = Buffer.alloc(0)
  let resumeFingerprint = ''

  const result = await runVidUpload(options, {
    openSource: async (filePath, flags) => {
      const handle = await open(filePath, flags)
      await rename(filePath, movedPath)
      await symlink(attackerPath, filePath)
      return handle
    },
    readSecret: async () => 'secret',
    fetch: async () => Response.json({
      operationId: 'operation-01', endpoint: 'https://video.bunnycdn.com/tusupload',
      videoId: 'bunny-guid', libraryId: '123', expirationTime: 1, signature: 'a'.repeat(64),
    }, { status: 201 }),
    uploadTus: async (upload) => {
      stagedPath = upload.filePath
      stagedDirectoryMode = (await stat(path.dirname(upload.filePath))).mode & 0o777
      stagedMode = (await stat(upload.filePath)).mode & 0o777
      uploadedBytes = await readFile(upload.filePath)
      resumeFingerprint = upload.resumeFingerprint
    },
  })

  const digest = createHash('sha256').update(originalBytes).digest('hex').slice(0, 16)
  assert.equal(result.status, 'uploaded')
  assert.notEqual(stagedPath, options.filePath)
  assert.equal(stagedDirectoryMode, 0o700)
  assert.equal(stagedMode, 0o600)
  assert.deepEqual(uploadedBytes, originalBytes)
  assert.equal(resumeFingerprint, `vid-upload:upload:tu-duy-ai:${digest}`)
  await assert.rejects(() => access(stagedPath), /ENOENT/)
})

test('fails closed when the opened source grows during bounded secure staging', async () => {
  const options = await fixtureOptions()
  let secretReads = 0
  let stagedPath = ''

  await assert.rejects(() => runVidUpload(options, {
    openSource: async (filePath, flags) => {
      const handle = await open(filePath, flags)
      let firstRead = true
      return {
        stat: () => handle.stat(),
        read: async (...args: Parameters<FileHandle['read']>) => {
          if (firstRead) {
            firstRead = false
            await appendFile(filePath, Buffer.from([9]))
          }
          return handle.read(...args)
        },
        close: () => handle.close(),
      } as FileHandle
    },
    readSecret: async () => { secretReads += 1; return 'secret' },
    cleanupStage: async (stage) => {
      stagedPath = stage.filePath
      await rm(stage.directory, { recursive: true, force: true })
    },
  }), /Video source changed during secure staging/)

  assert.equal(secretReads, 0)
  await assert.rejects(() => access(stagedPath), /ENOENT/)
})

test('does not report upload success when secure staging cleanup fails', async () => {
  const options = await fixtureOptions()
  let stagedPath = ''
  await assert.rejects(() => runVidUpload(options, {
    readSecret: async () => 'secret',
    fetch: async () => Response.json({
      operationId: 'operation-01', endpoint: 'https://video.bunnycdn.com/tusupload',
      videoId: 'bunny-guid', libraryId: '123', expirationTime: 1, signature: 'a'.repeat(64),
    }, { status: 201 }),
    uploadTus: async (upload) => { stagedPath = upload.filePath },
    cleanupStage: async () => { throw new Error('private cleanup detail') },
  }), /Secure video staging cleanup failed/)
  if (stagedPath) await rm(path.dirname(stagedPath), { recursive: true, force: true })
})

test('combines upload and cleanup failures without exposing either private detail', async () => {
  const options = await fixtureOptions()
  let stagedPath = ''
  const failure = await runVidUpload(options, {
    readSecret: async () => 'secret',
    fetch: async () => Response.json({
      operationId: 'operation-01', endpoint: 'https://video.bunnycdn.com/tusupload',
      videoId: 'bunny-guid', libraryId: '123', expirationTime: 1, signature: 'a'.repeat(64),
    }, { status: 201 }),
    uploadTus: async (upload) => {
      stagedPath = upload.filePath
      throw new Error('private upload token')
    },
    cleanupStage: async () => { throw new Error('private cleanup path') },
  }).then(() => null, (error: unknown) => error)

  assert.ok(failure instanceof Error)
  assert.equal(failure.message, 'Secure video staging cleanup failed after upload failure')
  assert.equal(failure.message.includes('private'), false)
  if (stagedPath) await rm(path.dirname(stagedPath), { recursive: true, force: true })
})

test('signs admin calls, preserves custom focal metadata, polls ready and publishes without leaking secrets', async () => {
  const options = await fixtureOptions({ publish: true, thumbnailFocalX: 17, thumbnailFocalY: 83 })
  const requests: Request[] = []
  const logs: string[] = []
  let uploadCalls = 0
  const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    requests.push(request)
    if (request.url.endsWith('/api/admin/uploads')) {
      return Response.json({
        operationId: 'operation-01',
        endpoint: 'https://video.bunnycdn.com/tusupload',
        videoId: 'bunny-guid',
        libraryId: '123',
        expirationTime: 1_786_586_400,
        signature: 'a'.repeat(64),
      }, { status: 201 })
    }
    if (request.url.endsWith('/status')) return Response.json({ media_status: 'ready' })
    if (request.url.endsWith('/publish')) return Response.json({ ok: true })
    return Response.json({ error: 'unexpected' }, { status: 500 })
  }

  const result = await runVidUpload(options, {
    readSecret: async () => 'admin-secret-that-must-never-be-logged',
    fetch: fetcher,
    uploadTus: async (upload) => {
      uploadCalls += 1
      assert.notEqual(upload.filePath, options.filePath)
      assert.equal(upload.credentials.videoId, 'bunny-guid')
    },
    now: () => 1_786_500_000_000,
    randomUUID: () => '12345678-1234-1234-1234-123456789012',
    sleep: async () => undefined,
    log: (message) => logs.push(message),
  })

  assert.deepEqual(result, { status: 'published', operationId: 'operation-01', videoId: 'bunny-guid' })
  assert.equal(uploadCalls, 1)
  assert.equal(requests.length, 3)
  const contentDigest = createHash('sha256').update(Buffer.alloc(2_048, 1)).digest('hex').slice(0, 16)
  assert.equal(requests[0]?.headers.get('X-Vid-Idempotency-Key'), `upload:tu-duy-ai:${contentDigest}`)
  const uploadBody = await requests[0]!.clone().json() as Record<string, unknown>
  assert.equal(uploadBody.thumbnailFocalX, 17)
  assert.equal(uploadBody.thumbnailFocalY, 83)
  for (const request of requests) {
    assert.match(request.headers.get('X-Vid-Signature') ?? '', /^[0-9a-f]{64}$/)
  }
  assert.equal(logs.join('\n').includes('admin-secret'), false)
})

test('uses an explicit compatibility fallback only for default focal metadata', async () => {
  const options = await fixtureOptions()
  const requests: Request[] = []
  const logs: string[] = []
  const result = await runVidUpload(options, {
    readSecret: async () => 'secret',
    fetch: async (input, init) => {
      const request = new Request(input, init)
      requests.push(request)
      if (requests.length === 1) return Response.json({ error: 'invalid_upload_metadata' }, { status: 400 })
      return Response.json({
        operationId: 'operation-01', endpoint: 'https://video.bunnycdn.com/tusupload',
        videoId: 'bunny-guid', libraryId: '123', expirationTime: 1, signature: 'a'.repeat(64),
      }, { status: 201 })
    },
    uploadTus: async () => undefined,
    log: (message) => logs.push(message),
  })

  assert.equal(result.status, 'uploaded')
  assert.equal(requests.length, 2)
  const fullBody = await requests[0]!.clone().json() as Record<string, unknown>
  const legacyBody = await requests[1]!.clone().json() as Record<string, unknown>
  assert.equal(fullBody.thumbnailFocalX, 50)
  assert.equal(fullBody.thumbnailFocalY, 24)
  assert.equal('thumbnailFocalX' in legacyBody, false)
  assert.equal('thumbnailFocalY' in legacyBody, false)
  assert.match(logs.join('\n'), /compatibility mode/)
})

test('fails instead of silently losing custom focal metadata on a legacy Worker', async () => {
  const options = await fixtureOptions({ thumbnailFocalX: 17, thumbnailFocalY: 83 })
  let uploadCalls = 0
  await assert.rejects(() => runVidUpload(options, {
    readSecret: async () => 'secret',
    fetch: async () => Response.json({ error: 'invalid_upload_metadata' }, { status: 400 }),
    uploadTus: async () => { uploadCalls += 1 },
  }), /Worker with focal metadata support must be deployed/)
  assert.equal(uploadCalls, 0)
})

test('does not publish when processing never reaches ready', async () => {
  const options = await fixtureOptions({ publish: true })
  const fetcher = async (input: RequestInfo | URL) => {
    const request = new Request(input)
    if (request.url.endsWith('/api/admin/uploads')) {
      return Response.json({
        operationId: 'operation-01', endpoint: 'https://video.bunnycdn.com/tusupload',
        videoId: 'bunny-guid', libraryId: '123', expirationTime: 1, signature: 'a'.repeat(64),
      }, { status: 201 })
    }
    return Response.json({ media_status: 'processing' })
  }
  await assert.rejects(() => runVidUpload(options, {
    readSecret: async () => 'secret',
    fetch: fetcher,
    uploadTus: async () => undefined,
    sleep: async () => undefined,
    maxPolls: 2,
  }), /not ready/)
})
