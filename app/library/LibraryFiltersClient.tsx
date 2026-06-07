'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type {
  LibraryJourney,
  LibraryNoteMeta,
  LibraryReaderState,
  LibrarySection,
  LibraryStatus,
} from '@/lib/library'
import styles from './page.module.css'

interface Labels {
  sections: Record<LibrarySection, string>
  journeys: Record<LibraryJourney, string>
  readerStates: Record<LibraryReaderState, string>
  statuses: Record<LibraryStatus, string>
}

const ALL = 'all'

export default function LibraryFiltersClient({
  notes,
  labels,
}: {
  notes: LibraryNoteMeta[]
  labels: Labels
}) {
  const [section, setSection] = useState(ALL)
  const [journey, setJourney] = useState(ALL)
  const [readerState, setReaderState] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [query, setQuery] = useState('')

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return notes.filter((note) => {
      const matchesSection = section === ALL || note.section === section
      const matchesJourney = journey === ALL || note.journey === journey
      const matchesState = readerState === ALL || note.readerState === readerState
      const matchesStatus = status === ALL || note.status === status
      const searchable = [
        note.title,
        note.description,
        note.promise,
        note.proof,
        ...note.tags,
      ]
        .join(' ')
        .toLowerCase()

      return (
        matchesSection &&
        matchesJourney &&
        matchesState &&
        matchesStatus &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      )
    })
  }, [journey, notes, query, readerState, section, status])

  return (
    <section className={styles.catalog} id="library-notes" aria-label="Tất cả note thư viện">
      <div className={styles.sectionHeader} data-reveal>
        <span>Catalog</span>
        <h2>Search và lọc theo đúng trạng thái đọc.</h2>
      </div>

      <div className={styles.searchPanel} data-reveal>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo Brain2, proof, tài sản số..."
          aria-label="Tìm note trong thư viện"
          className="input"
        />

        <div className={styles.filterRows}>
          <FilterRow
            label="Section"
            value={section}
            onChange={setSection}
            options={labels.sections}
          />
          <FilterRow
            label="Journey"
            value={journey}
            onChange={setJourney}
            options={labels.journeys}
          />
          <FilterRow
            label="Reader state"
            value={readerState}
            onChange={setReaderState}
            options={labels.readerStates}
          />
          <FilterRow
            label="Status"
            value={status}
            onChange={setStatus}
            options={labels.statuses}
          />
        </div>
      </div>

      <div className={styles.resultMeta} data-reveal>
        <span>{filteredNotes.length} note phù hợp</span>
      </div>

      <div className={styles.noteGrid} data-reveal>
        {filteredNotes.map((note) => (
          <Link href={`/library/${note.slug}`} className={styles.noteCard} key={note.slug}>
            <div className={styles.noteTopline}>
              <span>{labels.sections[note.section]}</span>
              <span>{labels.readerStates[note.readerState]}</span>
            </div>
            <h3>{note.title}</h3>
            <p>{note.description}</p>
            <div className={styles.promiseBox}>{note.promise}</div>
            <div className={styles.noteMeta}>
              <span>{labels.journeys[note.journey]}</span>
              <span>{labels.statuses[note.status]}</span>
              <span>{note.readTime} phút</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className={styles.empty}>
          <p>Không có note nào khớp bộ lọc này.</p>
        </div>
      )}
    </section>
  )
}

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Record<string, string>
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.filterRow}>
      <span>{label}</span>
      <div className={styles.filterButtons}>
        <button
          type="button"
          className={value === ALL ? styles.activeFilter : ''}
          aria-pressed={value === ALL}
          onClick={() => onChange(ALL)}
        >
          Tất cả
        </button>
        {Object.entries(options).map(([key, optionLabel]) => (
          <button
            type="button"
            key={key}
            className={value === key ? styles.activeFilter : ''}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  )
}
