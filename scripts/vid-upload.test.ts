import assert from 'node:assert/strict'
import { mkdtemp, symlink, writeFile } from 'node:fs/promises'
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

test('signs admin calls, uploads through TUS, polls ready and publishes without leaking secrets', async () => {
  const options = await fixtureOptions({ publish: true })
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
      assert.equal(upload.filePath, options.filePath)
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
  for (const request of requests) {
    assert.match(request.headers.get('X-Vid-Signature') ?? '', /^[0-9a-f]{64}$/)
  }
  assert.equal(logs.join('\n').includes('admin-secret'), false)
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
