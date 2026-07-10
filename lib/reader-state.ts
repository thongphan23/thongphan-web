export const SAVED_STORAGE_KEY = 'tp:library:saved:v1'
export const COMPLETED_STORAGE_KEY = 'tp:library:completed:v1'

export type ReaderPublicationMode = 'summary' | 'full'

export interface ReaderCapabilities {
  audio: boolean
  completion: boolean
  elapsed: boolean
  focus: boolean
  progress: boolean
}

export function parseStoredSlugs(raw: string | null): string[] {
  if (!raw) return []

  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []

    return [...new Set(value.filter((slug): slug is string => typeof slug === 'string')
      .map((slug) => slug.trim())
      .filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

export function toggleStoredSlug(slugs: string[], slug: string): string[] {
  const normalized = slug.trim()
  if (!normalized) return [...slugs]

  const current = new Set(slugs)
  if (current.has(normalized)) current.delete(normalized)
  else current.add(normalized)

  return [...current].sort((a, b) => a.localeCompare(b))
}

export function capabilitiesForPublication(
  publicationMode: ReaderPublicationMode,
  readyAudioCount: number,
): ReaderCapabilities {
  const full = publicationMode === 'full'

  return {
    audio: full && readyAudioCount > 0,
    completion: full,
    elapsed: full,
    focus: full,
    progress: full,
  }
}
