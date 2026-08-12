import { validateUploadManifest, type VidUploadManifest } from '../lib/vid/upload-manifest'
import { runVidUpload } from './vid-upload'

export type BatchUploadResult = {
  published: string[]
  uploaded: string[]
  failed: Array<{ slug: string; reason: string }>
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
  dependencies: { runUpload: typeof runVidUpload },
): Promise<BatchUploadResult> {
  // Validate the complete manifest before any credential or network work begins.
  const validated = validateUploadManifest(manifest)
  const result: BatchUploadResult = { published: [], uploaded: [], failed: [] }

  for (const video of validated.videos) {
    try {
      const upload = await dependencies.runUpload(video)
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
