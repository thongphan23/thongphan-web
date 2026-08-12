export const LOCAL_LIBRARY_KEY = 'thongphan.vid.library.v1'

export type VideoProgress = {
  slug: string
  seconds: number
  duration: number
  updatedAt: number
}

export type LocalLibrary = {
  version: 1
  progress: VideoProgress[]
  watchLater: string[]
}

export function emptyLocalLibrary(): LocalLibrary {
  return { version: 1, progress: [], watchLater: [] }
}

function validSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

function validProgress(value: unknown): value is VideoProgress {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return validSlug(record.slug)
    && typeof record.seconds === 'number'
    && Number.isFinite(record.seconds)
    && record.seconds >= 0
    && typeof record.duration === 'number'
    && Number.isFinite(record.duration)
    && record.duration > 0
    && typeof record.updatedAt === 'number'
    && Number.isFinite(record.updatedAt)
}

export function readLocalLibrary(storage: Storage): LocalLibrary {
  try {
    const raw = storage.getItem(LOCAL_LIBRARY_KEY)
    if (!raw) return emptyLocalLibrary()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.version !== 1 || !Array.isArray(parsed.progress) || !Array.isArray(parsed.watchLater)) {
      return emptyLocalLibrary()
    }
    const progress = parsed.progress.filter(validProgress)
    const watchLater = parsed.watchLater.filter(validSlug)
    if (progress.length !== parsed.progress.length || watchLater.length !== parsed.watchLater.length) {
      return emptyLocalLibrary()
    }
    return {
      version: 1,
      progress: [...new Map(progress.map((item) => [item.slug, item])).values()]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 100),
      watchLater: [...new Set(watchLater)].slice(0, 200),
    }
  } catch {
    return emptyLocalLibrary()
  }
}

export function saveLocalLibrary(storage: Storage, state: LocalLibrary): boolean {
  try {
    storage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function recordProgress(state: LocalLibrary, update: VideoProgress): LocalLibrary {
  if (!validProgress(update)) return state
  const remaining = state.progress.filter(({ slug }) => slug !== update.slug)
  const ratio = update.seconds / update.duration
  const progress = update.seconds >= 10 && ratio < 0.95 ? [update, ...remaining] : remaining
  return { ...state, progress: progress.slice(0, 100) }
}

export function toggleWatchLater(state: LocalLibrary, slug: string): LocalLibrary {
  if (!validSlug(slug)) return state
  const exists = state.watchLater.includes(slug)
  return {
    ...state,
    watchLater: exists
      ? state.watchLater.filter((value) => value !== slug)
      : [slug, ...state.watchLater].slice(0, 200),
  }
}
