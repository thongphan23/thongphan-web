'use client'

import { useEffect } from 'react'
import { browserStorage, PATH_MEMORY_EVENT, writeStoredPath } from '@/lib/path-memory'
import type { PathKey } from '@/lib/two-path-links'

// Remembers the last branch page so the homepage can offer a "continue" line. Renders nothing.
export default function PathMemory({ path }: { path: PathKey }) {
  useEffect(() => {
    writeStoredPath(browserStorage(), path)
    window.dispatchEvent(new Event(PATH_MEMORY_EVENT))
  }, [path])

  return null
}
