import { isPathKey, type PathKey } from './two-path-links'

export const PATH_STORAGE_KEY = 'tp:path'
export const PATH_MEMORY_EVENT = 'tp:path-change'

export type PathStorage = Pick<Storage, 'getItem' | 'setItem'>

// Storage can be missing, blocked (Safari private mode) or hold stale values; every access degrades to "no memory".
export function readStoredPath(storage: PathStorage | null): PathKey | null {
  if (!storage) return null
  try {
    const value = storage.getItem(PATH_STORAGE_KEY)
    return isPathKey(value) ? value : null
  } catch {
    return null
  }
}

export function writeStoredPath(storage: PathStorage | null, path: PathKey) {
  if (!storage) return
  try {
    storage.setItem(PATH_STORAGE_KEY, path)
  } catch {
    // Ignore: remembering the path is a convenience, never a requirement.
  }
}

export function browserStorage(): PathStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
