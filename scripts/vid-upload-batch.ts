import { constants } from 'node:fs'
import { chmod, mkdtemp, open, rmdir, unlink, type FileHandle } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  preflightUploadManifest,
  type UploadFileIdentity,
  type VidUploadManifest,
  type VidUploadManifestVideo,
} from '../lib/vid/upload-manifest'
import { runVidUpload } from './vid-upload'

export type BatchUploadResult = {
  published: string[]
  uploaded: string[]
  failed: Array<{ slug: string; reason: string }>
}

type BatchUploadDependencies = {
  runUpload: typeof runVidUpload
  openSource?: (filePath: string, flags: number) => Promise<FileHandle>
}

function matchesIdentity(details: Awaited<ReturnType<FileHandle['stat']>>, expected: UploadFileIdentity): boolean {
  return details.isFile()
    && details.dev === expected.device
    && details.ino === expected.inode
    && details.size === expected.size
    && details.mtimeMs === expected.modifiedAt
}

async function removeStage(filePath: string | undefined, directory: string | undefined): Promise<void> {
  if (filePath) {
    await chmod(filePath, 0o600).catch(() => undefined)
    await unlink(filePath).catch(() => undefined)
  }
  if (directory) await rmdir(directory).catch(() => undefined)
}

async function stageUploadFile(
  video: VidUploadManifestVideo,
  expected: UploadFileIdentity,
  openSource: NonNullable<BatchUploadDependencies['openSource']>,
): Promise<{ filePath: string; cleanup: () => Promise<void> }> {
  if (typeof constants.O_NOFOLLOW !== 'number') throw new Error('Secure no-follow file opens are unavailable')
  let source: FileHandle | undefined
  let target: FileHandle | undefined
  let directory: string | undefined
  let stagedPath: string | undefined

  try {
    source = await openSource(video.filePath, constants.O_RDONLY | constants.O_NOFOLLOW)
    const openedDetails = await source.stat()
    if (!matchesIdentity(openedDetails, expected) || openedDetails.size <= 0) throw new Error('Video source changed after manifest preflight')

    directory = await mkdtemp(path.join(os.tmpdir(), 'vid-upload-stage-'))
    await chmod(directory, 0o700)
    stagedPath = path.join(directory, `${video.slug}.mp4`)
    target = await open(
      stagedPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600,
    )

    const buffer = Buffer.allocUnsafe(1024 * 1024)
    let position = 0
    while (true) {
      const { bytesRead } = await source.read(buffer, 0, buffer.length, position)
      if (bytesRead === 0) break
      let written = 0
      while (written < bytesRead) {
        const { bytesWritten } = await target.write(buffer, written, bytesRead - written, position + written)
        if (bytesWritten === 0) throw new Error('Video staging write failed')
        written += bytesWritten
      }
      position += bytesRead
    }
    await target.sync()
    const [sourceAfterCopy, targetAfterCopy] = await Promise.all([source.stat(), target.stat()])
    if (!matchesIdentity(sourceAfterCopy, expected) || targetAfterCopy.size !== expected.size) {
      throw new Error('Video source changed during secure staging')
    }

    await target.close()
    target = undefined
    await source.close()
    source = undefined
    await chmod(stagedPath, 0o400)
    const finalPath = stagedPath
    const finalDirectory = directory
    return { filePath: finalPath, cleanup: () => removeStage(finalPath, finalDirectory) }
  } catch (error) {
    await target?.close().catch(() => undefined)
    await source?.close().catch(() => undefined)
    await removeStage(stagedPath, directory)
    throw error
  }
}

function safeFailureReason(error: unknown): string {
  if (!(error instanceof Error)) return 'Upload failed'
  if (error.message === 'Bunny processing failed' || error.message === 'Bunny upload failed' || error.message === 'Video is not ready for publish') {
    return error.message
  }
  if (/^Vid admin request failed with HTTP [1-5][0-9]{2}$/.test(error.message)) return error.message
  return 'Upload failed'
}

export async function runVidUploadBatch(
  manifest: VidUploadManifest,
  dependencies: BatchUploadDependencies,
): Promise<BatchUploadResult> {
  // Validate the complete manifest before any credential or network work begins.
  const preflight = preflightUploadManifest(manifest)
  const result: BatchUploadResult = { published: [], uploaded: [], failed: [] }
  const openSource = dependencies.openSource ?? ((filePath: string, flags: number) => open(filePath, flags))

  for (const [index, video] of preflight.manifest.videos.entries()) {
    let staged: Awaited<ReturnType<typeof stageUploadFile>> | undefined
    try {
      staged = video.dryRun ? undefined : await stageUploadFile(video, preflight.fileIdentities[index]!, openSource)
      const upload = await dependencies.runUpload(staged ? { ...video, filePath: staged.filePath } : video)
      // "uploaded" means TUS media transfer completed without publication;
      // dry-run is intentionally neither uploaded nor published.
      if (upload.status === 'published') result.published.push(video.slug)
      if (upload.status === 'uploaded') result.uploaded.push(video.slug)
    } catch (error) {
      // Per-video failures are independent, and this path intentionally has no retry.
      result.failed.push({ slug: video.slug, reason: safeFailureReason(error) })
    } finally {
      await staged?.cleanup()
    }
  }
  return result
}
