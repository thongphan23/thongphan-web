'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  SAVED_STORAGE_KEY,
  capabilitiesForPublication,
  parseStoredSlugs,
  toggleStoredSlug,
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
  const capabilities = useMemo(
    () => capabilitiesForPublication(publicationMode, readyAudioCount),
    [publicationMode, readyAudioCount],
  )

  useEffect(() => {
    try {
      setSaved(parseStoredSlugs(window.localStorage.getItem(SAVED_STORAGE_KEY)).includes(slug))
    } catch {
      setSaved(false)
    } finally {
      setStorageReady(true)
    }
  }, [slug])

  function toggleSaved() {
    try {
      const current = parseStoredSlugs(window.localStorage.getItem(SAVED_STORAGE_KEY))
      const next = toggleStoredSlug(current, slug)
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next))
      setSaved(next.includes(slug))
    } catch {
      setSaved(false)
    }
  }

  return (
    <div className={styles.toolbar} aria-label="Công cụ ghi chú tuyển đọc">
      <button
        type="button"
        aria-pressed={saved}
        disabled={!storageReady}
        onClick={toggleSaved}
      >
        {saved ? <BookmarkCheck aria-hidden="true" size={19} /> : <Bookmark aria-hidden="true" size={19} />}
        <span>{saved ? 'Đã lưu ghi chú' : 'Lưu ghi chú'}</span>
      </button>
      <p>Lưu trên trình duyệt này, không đồng bộ sang thiết bị khác.</p>
      {capabilities.progress ? <span className={styles.fullReaderReady}>Chế độ đọc đầy đủ đã sẵn sàng</span> : null}
    </div>
  )
}
