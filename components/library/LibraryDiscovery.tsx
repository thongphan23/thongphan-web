'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import {
  clearDiscoveryParams,
  filterLibraryEntries,
  getDiscoveryTopics,
  parseDiscoveryParams,
  serializeDiscoveryParams,
  type LibraryDiscoveryState,
  type LibraryEntryDuration,
  type LibraryEntryIntent,
  type LibraryEntrySummary,
  type LibraryEntryType,
} from '@/lib/library-discovery'
import styles from './LibraryDiscovery.module.css'

const TYPE_OPTIONS: ReadonlyArray<{ value: LibraryEntryType; label: string }> = [
  { value: 'reading', label: 'Tuyển đọc' },
  { value: 'post', label: 'Bài của Thông' },
  { value: 'note', label: 'Ghi chú sống' },
]

const DURATION_OPTIONS: ReadonlyArray<{ value: LibraryEntryDuration; label: string }> = [
  { value: 'under-10', label: 'Dưới 10 phút' },
  { value: '10-20', label: '10–20 phút' },
  { value: 'over-20', label: 'Trên 20 phút' },
]

const INTENT_OPTIONS: ReadonlyArray<{ value: LibraryEntryIntent; label: string }> = [
  { value: 'clarity', label: 'Sáng tỏ' },
  { value: 'taste', label: 'Rèn gu' },
  { value: 'asset', label: 'Làm ra tài sản' },
]

const TYPE_LABELS: Record<LibraryEntryType, string> = {
  reading: 'Tuyển đọc thế giới',
  post: 'Bài của Thông',
  note: 'Ghi chú sống',
}

function FilterButtons<T extends string>({
  groupId,
  label,
  value,
  options,
  onChange,
}: {
  groupId: string
  label: string
  value: T | ''
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T | '') => void
}) {
  return (
    <div className={styles.filterGroup} role="group" aria-labelledby={`${groupId}-label`}>
      <span className={styles.filterLabel} id={`${groupId}-label`}>{label}</span>
      <div className={styles.filterButtons}>
        <button
          type="button"
          aria-pressed={value === ''}
          className={value === '' ? styles.activeFilter : undefined}
          onClick={() => onChange('')}
        >
          Tất cả
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            className={value === option.value ? styles.activeFilter : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LibraryDiscovery({ entries }: { entries: LibraryEntrySummary[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const state = useMemo(
    () => parseDiscoveryParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  )
  const topics = useMemo(() => getDiscoveryTopics(entries), [entries])
  const results = useMemo(() => filterLibraryEntries(entries, state), [entries, state])

  const replaceState = useCallback((nextState: LibraryDiscoveryState) => {
    const nextParams = serializeDiscoveryParams(nextState)
    const nextUrl = nextParams.size ? `${pathname}?${nextParams.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router])

  const updateState = useCallback(<Key extends keyof LibraryDiscoveryState>(
    key: Key,
    value: LibraryDiscoveryState[Key],
  ) => {
    replaceState({ ...state, [key]: value })
  }, [replaceState, state])

  const clearFilters = useCallback(() => {
    const cleared = clearDiscoveryParams(new URLSearchParams(searchParams.toString()))
    const nextUrl = cleared.size ? `${pathname}?${cleared.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  return (
    <section className={styles.discovery} id="kham-pha" aria-labelledby="discovery-title">
      <header className={styles.discoveryHeader}>
        <div>
          <span className={styles.index}>04</span>
          <p>Khám phá thư viện</p>
        </div>
        <h2 id="discovery-title">Tìm một bài đúng với điều bạn đang cần nghĩ tiếp.</h2>
      </header>

      <div className={styles.searchRow}>
        <label htmlFor="library-search">Tìm theo tiêu đề, tác giả, nguồn, chủ đề hoặc điều bài viết hứa hẹn</label>
        <input
          id="library-search"
          type="search"
          value={state.q}
          placeholder="Ví dụ: giọng riêng, Brain2, Steve Jobs..."
          onChange={(event) => updateState('q', event.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <FilterButtons
          groupId="content-type"
          label="Loại nội dung"
          value={state.type}
          options={TYPE_OPTIONS}
          onChange={(value) => updateState('type', value)}
        />

        <div className={styles.filterGroup} role="group" aria-labelledby="topic-label">
          <span className={styles.filterLabel} id="topic-label">Chủ đề</span>
          <select
            aria-label="Chọn chủ đề"
            value={state.topic}
            onChange={(event) => updateState('topic', event.target.value)}
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value}>{topic.label}</option>
            ))}
          </select>
        </div>

        <FilterButtons
          groupId="duration"
          label="Thời lượng"
          value={state.duration}
          options={DURATION_OPTIONS}
          onChange={(value) => updateState('duration', value)}
        />

        <FilterButtons
          groupId="reading-intent"
          label="Mục tiêu đọc"
          value={state.intent}
          options={INTENT_OPTIONS}
          onChange={(value) => updateState('intent', value)}
        />
      </div>

      <div className={styles.resultBar}>
        <p aria-live="polite">{results.length} nội dung phù hợp</p>
        <button type="button" onClick={clearFilters}>Xóa bộ lọc</button>
      </div>

      {results.length > 0 ? (
        <div className={styles.results}>
          {results.map((entry, index) => (
            <Link href={entry.href} key={`${entry.type}-${entry.slug}`} className={styles.resultItem}>
              <span className={styles.resultNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.resultCopy}>
                <small>{TYPE_LABELS[entry.type]} · {entry.minutes} phút</small>
                <strong>{entry.title}</strong>
                <span>{entry.promise}</span>
              </span>
              <span className={styles.resultAuthor}>{entry.author}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Chưa có nội dung khớp tổ hợp này. Hãy bỏ bớt một bộ lọc.</p>
      )}
    </section>
  )
}
