import { createHash, createHmac, randomUUID as nodeRandomUUID } from 'node:crypto'
import { constants, createReadStream, type Stats } from 'node:fs'
import { chmod, lstat, mkdir, mkdtemp, open, rmdir, statfs, unlink, type FileHandle } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import * as tus from 'tus-js-client'
import { validateDraftInput, type RightsStatus } from '../lib/vid/contracts'
import { MAX_VIDEO_FILE_BYTES, VID_PRODUCTION_ORIGIN, type UploadFileIdentity } from '../lib/vid/upload-manifest'
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
  thumbnailUrl?: string
  thumbnailFocalX?: number
  thumbnailFocalY?: number
  publish: boolean
  dryRun: boolean
}

export type VidReconcileOptions = {
  baseUrl: string
  operationId: string
  publish: boolean
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
  resumeFingerprint: string
  title: string
  credentials: TusCredentials
  onProgress: (percent: number) => void
}

type FilePreflight = UploadFileIdentity

type SecureStage = {
  directory: string
  filePath: string
  fileSize: number
  digest: string
}

// Staging needs the source bytes plus this headroom for filesystem metadata and cleanup.
const SECURE_STAGING_SAFETY_RESERVE_BYTES = 512 * 1024 ** 2

type VidUploadDependencies = {
  readSecret: () => Promise<string>
  fetch: typeof fetch
  uploadTus: (request: UploadRequest) => Promise<void>
  now: () => number
  randomUUID: () => string
  sleep: (milliseconds: number) => Promise<void>
  log: (message: string) => void
  maxPolls: number
  openSource: (filePath: string, flags: number) => Promise<FileHandle>
  getFreeStagingBytes: (directory: string) => Promise<number>
  cleanupStage: (stage: SecureStage) => Promise<void>
  expectedFileIdentity?: UploadFileIdentity
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
  openSource: (filePath, flags) => open(filePath, flags),
  getFreeStagingBytes: freeStagingBytes,
  cleanupStage: cleanupSecureStage,
}

async function validateFile(filePath: string): Promise<FilePreflight> {
  if (!path.isAbsolute(filePath)) throw new Error('Video path must be absolute')
  if (path.extname(filePath).toLowerCase() !== '.mp4') throw new Error('Video file must end in .mp4')
  const details = await lstat(filePath).catch(() => null)
  if (!details) throw new Error('Video file does not exist')
  if (details.isSymbolicLink()) throw new Error('Video file must not be a symlink')
  if (!details.isFile()) throw new Error('Video path must be a file')
  if (details.size <= 0) throw new Error('Video file is empty')
  if (details.size > MAX_VIDEO_FILE_BYTES) throw new Error('Video file must not exceed 50 GiB')
  return { device: details.dev, inode: details.ino, size: details.size, modifiedAt: details.mtimeMs }
}

function matchesPreflight(details: Stats, preflight: FilePreflight): boolean {
  return details.isFile()
    && details.dev === preflight.device
    && details.ino === preflight.inode
    && details.size === preflight.size
    && details.mtimeMs === preflight.modifiedAt
}

function safeBaseUrl(value: string): string {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`Vid base URL must be ${VID_PRODUCTION_ORIGIN}`)
  }
  if (
    parsed.origin !== VID_PRODUCTION_ORIGIN
    || parsed.pathname !== '/'
    || parsed.search
    || parsed.hash
    || parsed.username
    || parsed.password
  ) throw new Error(`Vid base URL must be ${VID_PRODUCTION_ORIGIN}`)
  return VID_PRODUCTION_ORIGIN
}

async function cleanupSecureStage(stage: SecureStage): Promise<void> {
  let failure: unknown
  try {
    await unlink(stage.filePath)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) failure = error
  }
  try {
    await rmdir(stage.directory)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) failure ??= error
  }
  if (failure) throw new Error('Secure video staging cleanup failed')
}

async function freeStagingBytes(directory: string): Promise<number> {
  const filesystem = await statfs(directory)
  const availableBlocks = filesystem.bavail
  const blockSize = filesystem.bsize
  if (
    !Number.isSafeInteger(availableBlocks)
    || !Number.isSafeInteger(blockSize)
    || availableBlocks < 0
    || blockSize <= 0
    || availableBlocks > Math.floor(Number.MAX_SAFE_INTEGER / blockSize)
  ) throw new Error('Secure video staging free space could not be verified')
  return availableBlocks * blockSize
}

async function verifySecureStagingCapacity(
  directory: string,
  expectedFileSize: number,
  dependencies: VidUploadDependencies,
): Promise<void> {
  let availableBytes: number
  try {
    availableBytes = await dependencies.getFreeStagingBytes(directory)
  } catch {
    throw new Error('Secure video staging free space could not be verified')
  }
  if (
    !Number.isSafeInteger(expectedFileSize)
    || !Number.isSafeInteger(availableBytes)
    || availableBytes < 0
    || expectedFileSize > Number.MAX_SAFE_INTEGER - SECURE_STAGING_SAFETY_RESERVE_BYTES
    || availableBytes < expectedFileSize + SECURE_STAGING_SAFETY_RESERVE_BYTES
  ) throw new Error('Secure video staging free space is insufficient')
}

async function stageVideoFile(
  filePath: string,
  preflight: FilePreflight,
  dependencies: VidUploadDependencies,
): Promise<SecureStage> {
  if (typeof constants.O_NOFOLLOW !== 'number') throw new Error('Secure no-follow file opens are unavailable')
  let source: FileHandle | undefined
  let target: FileHandle | undefined
  let stage: SecureStage | undefined
  try {
    source = await dependencies.openSource(filePath, constants.O_RDONLY | constants.O_NOFOLLOW)
    const opened = await source.stat()
    if (!matchesPreflight(opened, preflight)) throw new Error('Video source changed after validation')
    if (opened.size <= 0 || opened.size > MAX_VIDEO_FILE_BYTES) throw new Error('Video source size is unsafe')

    const directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-stage-'))
    const stagedPath = path.join(directory, 'video.mp4')
    stage = { directory, filePath: stagedPath, fileSize: opened.size, digest: '' }
    await chmod(directory, 0o700)
    await verifySecureStagingCapacity(directory, opened.size, dependencies)
    target = await open(
      stagedPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600,
    )

    const digest = createHash('sha256')
    const buffer = Buffer.allocUnsafe(1024 * 1024)
    let position = 0
    while (position < opened.size) {
      const length = Math.min(buffer.length, opened.size - position)
      const { bytesRead } = await source.read(buffer, 0, length, position)
      if (bytesRead <= 0) throw new Error('Video source changed during secure staging')
      digest.update(buffer.subarray(0, bytesRead))
      let written = 0
      while (written < bytesRead) {
        const { bytesWritten } = await target.write(buffer, written, bytesRead - written, position + written)
        if (bytesWritten <= 0) throw new Error('Video staging write failed')
        written += bytesWritten
      }
      position += bytesRead
    }

    await target.sync()
    const extraByte = Buffer.allocUnsafe(1)
    const [extraRead, sourceAfterCopy, targetAfterCopy] = await Promise.all([
      source.read(extraByte, 0, 1, opened.size),
      source.stat(),
      target.stat(),
    ])
    if (
      extraRead.bytesRead !== 0
      || !matchesPreflight(sourceAfterCopy, preflight)
      || targetAfterCopy.size !== opened.size
    ) throw new Error('Video source changed during secure staging')

    await target.close()
    target = undefined
    await source.close()
    source = undefined
    await chmod(stagedPath, 0o600)
    stage.digest = digest.digest('hex')
    return stage
  } catch (error) {
    let closeFailure = false
    try { await target?.close() } catch { closeFailure = true }
    try { await source?.close() } catch { closeFailure = true }
    if (stage) {
      try { await dependencies.cleanupStage(stage) } catch { throw new Error('Secure video staging cleanup failed') }
    }
    if (closeFailure) throw new Error('Secure video staging cleanup failed')
    if (error instanceof Error && /^Video |^Secure /.test(error.message)) throw error
    throw new Error('Video source could not be opened safely')
  }
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
  if (!response.ok) {
    let code: string | undefined
    try {
      const payload = await response.clone().json() as { error?: unknown }
      if (typeof payload.error === 'string' && /^[a-z0-9_]{1,64}$/.test(payload.error)) code = payload.error
    } catch {
      // Error bodies are intentionally not retained or logged.
    }
    throw new VidAdminRequestError(response.status, code)
  }
  return response
}

class VidAdminRequestError extends Error {
  constructor(readonly status: number, readonly code?: string) {
    super(`Vid admin request failed with HTTP ${status}`)
  }
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
      fingerprint: async () => request.resumeFingerprint,
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
  const baseUrl = safeBaseUrl(options.baseUrl)
  const filePreflight = await validateFile(options.filePath)
  if (
    dependencies.expectedFileIdentity
    && (
      filePreflight.device !== dependencies.expectedFileIdentity.device
      || filePreflight.inode !== dependencies.expectedFileIdentity.inode
      || filePreflight.size !== dependencies.expectedFileIdentity.size
      || filePreflight.modifiedAt !== dependencies.expectedFileIdentity.modifiedAt
    )
  ) throw new Error('Video source changed after manifest preflight')
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
    thumbnailUrl: options.thumbnailUrl,
    thumbnailFocalX: options.thumbnailFocalX,
    thumbnailFocalY: options.thumbnailFocalY,
  })
  if (options.dryRun) return { status: 'dry-run' as const, fileSize: filePreflight.size, slug: draft.slug }

  const staged = await stageVideoFile(options.filePath, filePreflight, dependencies)
  let uploadFailure: unknown
  let uploadResult: Awaited<ReturnType<typeof uploadStagedVideo>> | undefined
  try {
    uploadResult = await uploadStagedVideo(staged, draft, baseUrl, options.publish, dependencies)
  } catch (error) {
    uploadFailure = error
  }
  try {
    await dependencies.cleanupStage(staged)
  } catch {
    if (uploadFailure) throw new Error('Secure video staging cleanup failed after upload failure')
    throw new Error('Secure video staging cleanup failed')
  }
  if (uploadFailure) throw uploadFailure
  return uploadResult!
}

export async function runVidReconcile(
  options: VidReconcileOptions,
  overrides: Partial<VidUploadDependencies> = {},
) {
  const dependencies = { ...defaultDependencies, ...overrides }
  const baseUrl = safeBaseUrl(options.baseUrl)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(options.operationId)) {
    throw new Error('Vid operation ID is invalid')
  }
  const secret = await dependencies.readSecret()
  const idempotencyKey = `reconcile:${options.operationId}`
  let ready = false
  for (let attempt = 0; attempt < dependencies.maxPolls; attempt += 1) {
    const response = await adminFetch(
      baseUrl,
      `/api/admin/videos/${options.operationId}/status`,
      'GET',
      '',
      `${idempotencyKey}:status:${attempt}`,
      secret,
      dependencies,
    )
    const status = await response.json() as { media_status?: string; mediaStatus?: string }
    const mediaStatus = status.media_status ?? status.mediaStatus
    if (mediaStatus === 'ready') {
      ready = true
      break
    }
    if (mediaStatus === 'failed') throw new Error('Bunny processing failed')
    await dependencies.sleep(10_000)
  }
  if (!ready) throw new Error('Video is not ready for publish')
  if (!options.publish) return { status: 'ready' as const, operationId: options.operationId }
  await adminFetch(
    baseUrl,
    `/api/admin/videos/${options.operationId}/publish`,
    'POST',
    '',
    `${idempotencyKey}:publish`,
    secret,
    dependencies,
  )
  return { status: 'published' as const, operationId: options.operationId }
}

async function uploadStagedVideo(
  staged: SecureStage,
  draft: ReturnType<typeof validateDraftInput>,
  baseUrl: string,
  publish: boolean,
  dependencies: VidUploadDependencies,
) {
  const secret = await dependencies.readSecret()
  const idempotencyKey = `upload:${draft.slug}:${staged.digest.slice(0, 16)}`
  let uploadResponse: Response
  try {
    uploadResponse = await adminFetch(baseUrl, '/api/admin/uploads', 'POST', JSON.stringify(draft), idempotencyKey, secret, dependencies)
  } catch (error) {
    const legacyMetadataRejection = error instanceof VidAdminRequestError
      && error.status === 400
      && error.code === 'invalid_upload_metadata'
    if (!legacyMetadataRejection) throw error
    if (draft.thumbnailFocalX !== 50 || draft.thumbnailFocalY !== 24) {
      throw new Error('Worker with focal metadata support must be deployed before uploading custom focal metadata')
    }
    dependencies.log('Vid upload compatibility mode: focal defaults omitted for legacy Worker')
    const { thumbnailFocalX: _thumbnailFocalX, thumbnailFocalY: _thumbnailFocalY, ...legacyDraft } = draft
    uploadResponse = await adminFetch(baseUrl, '/api/admin/uploads', 'POST', JSON.stringify(legacyDraft), idempotencyKey, secret, dependencies)
  }
  const operation = await uploadResponse.json() as { operationId: string } & TusCredentials
  if (!operation.operationId || !operation.videoId || !/^[0-9a-f]{64}$/.test(operation.signature)) {
    throw new Error('Vid upload credentials are invalid')
  }

  await dependencies.uploadTus({
    filePath: staged.filePath,
    fileSize: staged.fileSize,
    resumeFingerprint: `vid-upload:${idempotencyKey}`,
    title: draft.title,
    credentials: operation,
    onProgress: (percent) => dependencies.log(`Tải video: ${percent}%`),
  })
  if (!publish) return { status: 'uploaded' as const, operationId: operation.operationId, videoId: operation.videoId }

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
