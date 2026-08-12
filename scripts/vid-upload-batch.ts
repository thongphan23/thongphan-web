import { preflightUploadManifest, type VidUploadManifest } from '../lib/vid/upload-manifest'
import { runVidUpload } from './vid-upload'

export type BatchUploadResult = {
  published: string[]
  uploaded: string[]
  failed: Array<{ slug: string; reason: string }>
}

type BatchUploadDependencies = {
  runUpload: typeof runVidUpload
}

function safeFailureReason(error: unknown): string {
  if (!(error instanceof Error)) return 'Upload failed'
  if (error.message === 'Bunny processing failed' || error.message === 'Bunny upload failed' || error.message === 'Video is not ready for publish') {
    return error.message
  }
  if (
    error.message === 'Secure video staging cleanup failed'
    || error.message === 'Secure video staging cleanup failed after upload failure'
  ) return error.message
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

  for (const [index, video] of preflight.manifest.videos.entries()) {
    try {
      const upload = await dependencies.runUpload(video, {
        expectedFileIdentity: preflight.fileIdentities[index],
      })
      // "uploaded" means TUS media transfer completed without publication;
      // dry-run is intentionally neither uploaded nor published.
      if (upload.status === 'published') result.published.push(video.slug)
      if (upload.status === 'uploaded') result.uploaded.push(video.slug)
    } catch (error) {
      // Per-video failures are independent, and this path intentionally has no retry.
      result.failed.push({ slug: video.slug, reason: safeFailureReason(error) })
    }
  }
  return result
}
