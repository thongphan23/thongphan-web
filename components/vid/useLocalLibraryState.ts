'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  emptyLocalLibrary,
  readLocalLibrary,
  recordProgress,
  saveLocalLibrary,
  toggleWatchLater,
  type LocalLibrary,
} from '../../lib/vid/local-library'

type LibrarySnapshot = { library: LocalLibrary; ready: boolean }

const serverSnapshot: LibrarySnapshot = { library: emptyLocalLibrary(), ready: false }
let snapshot: LibrarySnapshot = serverSnapshot
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!snapshot.ready) {
    snapshot = { library: readLocalLibrary(window.localStorage), ready: true }
    queueMicrotask(emit)
  }
  return () => listeners.delete(listener)
}

function getSnapshot() { return snapshot }
function getServerSnapshot() { return serverSnapshot }

export function useLocalLibraryState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleLater = useCallback((slug: string) => {
    const next = toggleWatchLater(snapshot.library, slug)
    saveLocalLibrary(window.localStorage, next)
    snapshot = { library: next, ready: true }
    emit()
  }, [])

  const recordVideoProgress = useCallback((slug: string, seconds: number, duration: number) => {
    const next = recordProgress(snapshot.library, { slug, seconds, duration, updatedAt: Date.now() })
    if (next === snapshot.library) return
    saveLocalLibrary(window.localStorage, next)
    snapshot = { library: next, ready: true }
    emit()
  }, [])

  return { ...state, toggleLater, recordVideoProgress }
}
