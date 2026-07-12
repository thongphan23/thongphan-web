import manifest from '../../content/brain2/manifest.json'
import type { Brain2LessonMeta, Brain2LessonPackage } from '../../lib/brain2/lesson-contract'
import { validateBrain2LessonPackage } from '../../lib/brain2/lesson-validation'
import type { KVNamespaceLike, ProtectedContentDescriptor } from './types'

const MAX_PROTECTED_PACKAGE_BYTES = 64 * 1024

type ProtectedManifestLesson = Brain2LessonMeta & { storageKey?: string }

export const PROTECTED_CONTENT_INDEX: Readonly<Record<string, ProtectedContentDescriptor>> =
  Object.fromEntries(
    (manifest.lessons as ProtectedManifestLesson[])
      .filter((lesson) => lesson.access === 'conan-maker')
      .map((lesson) => {
        if (!lesson.storageKey) throw new Error(`Missing protected storage key for ${lesson.slug}`)
        const { storageKey, ...meta } = lesson
        return [lesson.slug, {
          slug: lesson.slug,
          key: storageKey,
          contentSha256: lesson.contentSha256,
          meta,
          maxBytes: MAX_PROTECTED_PACKAGE_BYTES,
        } satisfies ProtectedContentDescriptor]
      }),
  )

if (Object.keys(PROTECTED_CONTENT_INDEX).length !== 14) {
  throw new Error('Protected content index must contain exactly days 08 through 21')
}

export async function validateProtectedContent(
  raw: string,
  descriptor: ProtectedContentDescriptor,
): Promise<Brain2LessonPackage | null> {
  if (new TextEncoder().encode(raw).byteLength > descriptor.maxBytes) return null
  if (descriptor.meta.contentSha256 !== descriptor.contentSha256) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return await validateBrain2LessonPackage(parsed, descriptor.meta)
  } catch {
    return null
  }
}

export async function loadProtectedContent(
  KV: KVNamespaceLike,
  descriptor: ProtectedContentDescriptor,
): Promise<Brain2LessonPackage | null> {
  const raw = await KV.get(descriptor.key)
  if (raw === null) return null
  return validateProtectedContent(raw, descriptor)
}
