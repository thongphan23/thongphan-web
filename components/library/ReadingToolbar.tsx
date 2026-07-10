'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  SAVED_STORAGE_KEY,
  capabilitiesForPublication,
  parseStoredSlugs,
  toggleStoredSlug,
  writeStoredSlugs,
  type ReaderPublicationMode,
} from '@/lib/reader-state'
import styles from './ReadingToolbar.module.css'

type ReadingToolbarProps = {
  publicationMode: ReaderPublicationMode
  readyAudioCount: number
  slug: string
}

export default function ReadingToolbar({
  publicationMode,
  readyAudioCount,
  slug,
}: ReadingToolbarProps) {
  const [saved, setSaved] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const capabilities = useMemo(
    () => capabilitiesForPublication(publicationMode, readyAudioCount),
    [publicationMode, readyAudioCount],
  )

  useEffect(() => {
    try {
      setSaved(parseStoredSlugs(window.localStorage.getItem(SAVED_STORAGE_KEY)).includes(slug))
      setStorageError(false)
    } catch {
      setSaved(false)
      setStorageError(true)
    } finally {
      setStorageReady(true)
    }
  }, [slug])

  function toggleSaved() {
    try {
      const current = parseStoredSlugs(window.localStorage.getItem(SAVED_STORAGE_KEY))
      const next = toggleStoredSlug(current, slug)
      if (!writeStoredSlugs(window.localStorage, next)) {
        setStorageError(true)
        return
      }
      setSaved(next.includes(slug))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }

  return (
    <div className={styles.toolbar} role="group" aria-label="Công cụ ghi chú tuyển đọc">
      <button
        type="button"
        aria-pressed={saved}
        aria-describedby="reading-storage-note"
        disabled={!storageReady || storageError}
        onClick={toggleSaved}
      >
        {saved ? <BookmarkCheck aria-hidden="true" size={19} /> : <Bookmark aria-hidden="true" size={19} />}
        <span>{saved ? 'Đã lưu ghi chú' : 'Lưu ghi chú'}</span>
      </button>
      <p id="reading-storage-note" role={storageError ? 'status' : undefined}>
        {storageError
          ? 'Trình duyệt đang chặn lưu ghi chú.'
          : 'Lưu trên trình duyệt này, không đồng bộ sang thiết bị khác.'}
      </p>
      {capabilities.progress ? <span className={styles.fullReaderReady}>Chế độ đọc đầy đủ đã sẵn sàng</span> : null}
    </div>
  )
}
