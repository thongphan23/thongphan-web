import { createHash, createHmac, randomUUID as nodeRandomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { lstat, mkdir, open } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import * as tus from 'tus-js-client'
import { validateDraftInput, type RightsStatus } from '../lib/vid/contracts'
import { readVidAdminSecret } from './vid-keychain'

export type VidUploadOptions = {
  baseUrl: string
  filePath: string
  slug: string
  title: string
  description: string
  sourceTitle: string
  sourceCreator: string
  sourceCreatorUrl: string
  sourceVideoUrl: string
  translationLabel: string
  rightsStatus: RightsStatus
  rightsNote: string
  topics: string[]
  tags: string[]
  playlists: string[]
  publish: boolean
  dryRun: boolean
}

export type TusCredentials = {
  endpoint: string
  videoId: string
  libraryId: string
  expirationTime: number
  signature: string
}

type UploadRequest = {
  filePath: string
  fileSize: number
  title: string
  credentials: TusCredentials
  onProgress: (percent: number) => void
}

type VidUploadDependencies = {
  readSecret: () => Promise<string>
  fetch: typeof fetch
  uploadTus: (request: UploadRequest) => Promise<void>
  now: () => number
  randomUUID: () => string
  sleep: (milliseconds: number) => Promise<void>
  log: (message: string) => void
  maxPolls: number
}

const defaultDependencies: VidUploadDependencies = {
  readSecret: readVidAdminSecret,
  fetch,
  uploadTus: uploadWithTus,
  now: Date.now,
  randomUUID: nodeRandomUUID,
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  log: console.log,
  maxPolls: 120,
}

async function validateFile(filePath: string): Promise<number> {
  if (!path.isAbsolute(filePath)) throw new Error('Video path must be absolute')
  if (path.extname(filePath).toLowerCase() !== '.mp4') throw new Error('Video file must end in .mp4')
  const details = await lstat(filePath).catch(() => null)
  if (!details) throw new Error('Video file does not exist')
  if (details.isSymbolicLink()) throw new Error('Video file must not be a symlink')
  if (!details.isFile()) throw new Error('Video path must be a file')
  if (details.size <= 0) throw new Error('Video file is empty')
  return details.size
}

async function fileDigest(filePath: string): Promise<string> {
  const digest = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) digest.update(chunk)
  return digest.digest('hex')
}

function safeBaseUrl(value: string): string {
  const parsed = new URL(value)
  if (parsed.protocol !== 'https:') throw new Error('Vid base URL must use HTTPS')
  return parsed.origin
}

function signedHeaders(
  method: string,
  url: URL,
  body: string,
  idempotencyKey: string,
  secret: string,
  dependencies: VidUploadDependencies,
): Headers {
  const timestamp = String(Math.floor(dependencies.now() / 1000))
  const nonce = dependencies.randomUUID().replaceAll('-', '')
  const canonical = [
    method,
    `${url.pathname}${url.search}`,
    timestamp,
    nonce,
    idempotencyKey,
    createHash('sha256').update(body).digest('hex'),
  ].join('\n')
  return new Headers({
    'Content-Type': 'application/json',
    'X-Vid-Timestamp': timestamp,
    'X-Vid-Nonce': nonce,
    'X-Vid-Idempotency-Key': idempotencyKey,
    'X-Vid-Signature': createHmac('sha256', secret).update(canonical).digest('hex'),
  })
}

async function adminFetch(
  baseUrl: string,
  pathName: string,
  method: 'GET' | 'POST',
  body: string,
  idempotencyKey: string,
  secret: string,
  dependencies: VidUploadDependencies,
): Promise<Response> {
  const url = new URL(pathName, baseUrl)
  const response = await dependencies.fetch(new Request(url, {
    method,
    headers: signedHeaders(method, url, body, idempotencyKey, secret, dependencies),
    body: method === 'POST' ? body : undefined,
  }))
  if (!response.ok) throw new Error(`Vid admin request failed with HTTP ${response.status}`)
  return response
}

async function uploadWithTus(request: UploadRequest): Promise<void> {
  const cacheDirectory = path.join(os.homedir(), '.cache', 'thongphan-vid', 'uploads')
  await mkdir(cacheDirectory, { recursive: true, mode: 0o700 })
  const storagePath = path.join(cacheDirectory, 'tus-resume.json')
  const handle = await open(storagePath, 'a', 0o600)
  await handle.close()
  const TusModule = tus as typeof tus & { FileUrlStorage?: new (filePath: string) => unknown }
  const urlStorage = TusModule.FileUrlStorage ? new TusModule.FileUrlStorage(storagePath) : undefined

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(createReadStream(request.filePath), {
      endpoint: request.credentials.endpoint,
      uploadSize: request.fileSize,
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000, 60_000],
      headers: {
        AuthorizationSignature: request.credentials.signature,
        AuthorizationExpire: String(request.credentials.expirationTime),
        VideoId: request.credentials.videoId,
        LibraryId: request.credentials.libraryId,
      },
      metadata: { filetype: 'video/mp4', title: request.title },
      storeFingerprintForResuming: true,
      removeFingerprintOnSuccess: true,
      ...(urlStorage ? { urlStorage: urlStorage as never } : {}),
      onProgress: (sent, total) => request.onProgress(Math.round((sent / total) * 100)),
      onError: () => reject(new Error('Bunny upload failed')),
      onSuccess: () => resolve(),
    })
    void upload.findPreviousUploads().then((previous) => {
      if (previous[0]) upload.resumeFromPreviousUpload(previous[0])
      upload.start()
    }, reject)
  })
}

export async function runVidUpload(
  options: VidUploadOptions,
  overrides: Partial<VidUploadDependencies> = {},
) {
  const dependencies = { ...defaultDependencies, ...overrides }
  const fileSize = await validateFile(options.filePath)
  const draft = validateDraftInput({
    slug: options.slug,
    title: options.title,
    description: options.description,
    sourceTitle: options.sourceTitle,
    sourceCreator: options.sourceCreator,
    sourceCreatorUrl: options.sourceCreatorUrl,
    sourceVideoUrl: options.sourceVideoUrl,
    translationLabel: options.translationLabel,
    rightsStatus: options.rightsStatus,
    rightsNote: options.rightsNote,
    topics: options.topics,
    tags: options.tags,
    playlists: options.playlists,
  })
  const baseUrl = safeBaseUrl(options.baseUrl)
  if (options.dryRun) return { status: 'dry-run' as const, fileSize, slug: draft.slug }

  const secret = await dependencies.readSecret()
  const idempotencyKey = `upload:${draft.slug}:${(await fileDigest(options.filePath)).slice(0, 16)}`
  const { thumbnailFocalX: _thumbnailFocalX, thumbnailFocalY: _thumbnailFocalY, ...uploadDraft } = draft
  const uploadResponse = await adminFetch(
    baseUrl,
    '/api/admin/uploads',
    'POST',
    JSON.stringify(uploadDraft),
    idempotencyKey,
    secret,
    dependencies,
  )
  const operation = await uploadResponse.json() as { operationId: string } & TusCredentials
  if (!operation.operationId || !operation.videoId || !/^[0-9a-f]{64}$/.test(operation.signature)) {
    throw new Error('Vid upload credentials are invalid')
  }

  await dependencies.uploadTus({
    filePath: options.filePath,
    fileSize,
    title: draft.title,
    credentials: operation,
    onProgress: (percent) => dependencies.log(`Tải video: ${percent}%`),
  })
  if (!options.publish) return { status: 'uploaded' as const, operationId: operation.operationId, videoId: operation.videoId }

  let ready = false
  for (let attempt = 0; attempt < dependencies.maxPolls; attempt += 1) {
    const response = await adminFetch(
      baseUrl,
      `/api/admin/videos/${operation.operationId}/status`,
      'GET',
      '',
      `${idempotencyKey}:status:${attempt}`,
      secret,
      dependencies,
    )
    const status = await response.json() as { media_status?: string; mediaStatus?: string }
    if ((status.media_status ?? status.mediaStatus) === 'ready') { ready = true; break }
    if ((status.media_status ?? status.mediaStatus) === 'failed') throw new Error('Bunny processing failed')
    await dependencies.sleep(10_000)
  }
  if (!ready) throw new Error('Video is not ready for publish')
  await adminFetch(
    baseUrl,
    `/api/admin/videos/${operation.operationId}/publish`,
    'POST',
    '',
    `${idempotencyKey}:publish`,
    secret,
    dependencies,
  )
  return { status: 'published' as const, operationId: operation.operationId, videoId: operation.videoId }
}
