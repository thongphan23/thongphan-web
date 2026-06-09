import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import {
  getAllLibraryNotes,
  JOURNEY_LABELS,
  READER_STATE_LABELS,
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
  STATUS_LABELS,
  type LibraryNoteMeta,
} from '@/lib/library'
import LibraryFiltersClient from './LibraryFiltersClient'
import { GardenSignature } from '@/components/GardenSignature'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Thư viện sống — Đọc để bớt hoang mang giữa thời AI',
  description:
    'Thư viện sống về AI, Brain2, nội dung kéo khách và tài sản số cho người có chuyên môn muốn đi sâu hơn.',
  alternates: {
    canonical: '/library',
  },
  openGraph: {
    title: 'Living Library Thông Phan',
    description:
      'Một thư viện đọc theo hành trình để biến kiến thức thật thành nội dung, tài sản số và hệ thống AI.',
    url: '/library',
    type: 'website',
  },
}

const SECTION_ORDER = ['concepts', 'materials', 'patterns', 'structures', 'templates', 'maps', 'proof'] as const

const graphNodes = [
  ['Brain2', 'raw material'],
  ['Concept', 'đóng gói'],
  ['Template', 'tái dùng'],
  ['Bằng chứng', 'tạo niềm tin'],
  ['Conan', 'thực hành'],
]

function newest(notes: LibraryNoteMeta[]) {
  return [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)
}

export default function LibraryPage() {
  const notes = getAllLibraryNotes()
  const mapNotes = notes.filter((note) => note.section === 'maps')
  const recentNotes = newest(notes)

  return (
    <div className={styles.libraryPage}>
      <div className="container">
        <header className={styles.hero} data-reveal>
          <div className={styles.heroShell}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Thư viện sống · đọc theo hành trình</span>
              <h1>Nếu ngoài kia quá ồn, bắt đầu đọc từ đây.</h1>
              <p>
                Đây không phải nơi cập nhật công cụ mới. Đây là nơi gom các khái niệm, ví dụ, mẫu, bản đồ đọc và bằng chứng để bạn đi từ hoang mang tới sáng tỏ, rồi mới tạo tài sản số có gốc.
              </p>
              <div className={styles.heroStats} aria-label="Thống kê thư viện">
                <span>{notes.length} ghi chú sống</span>
                <span>{SECTION_ORDER.length} section</span>
                <span>Liên kết theo ý, không chỉ tag</span>
              </div>
              <GardenSignature variant="tree" eyebrow="Public Brain2" title="Những gì bạn đọc ở đây là phần công khai. Phần rễ nằm ở cách tri thức được nối lại và dùng thật." compact />
            </div>

            <div className={styles.graphStage} aria-label="Knowledge graph preview">
              <div className={styles.graphPlane} />
              <div className={styles.graphCore}>
                <span>Brain2</span>
                <strong>Lớp công khai</strong>
              </div>
              <div className={styles.graphNodes}>
                {graphNodes.map(([title, detail], index) => (
                  <div key={title} className={styles.graphNode} style={{ '--node': index } as CSSProperties}>
                    <span>{title}</span>
                    <strong>{detail}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.graphTrace} />
            </div>
          </div>
        </header>

        <section className={styles.sectionGrid} aria-label="Các section thư viện" data-reveal>
          {SECTION_ORDER.map((section) => (
            <a key={section} href={`#library-notes`} className={styles.sectionCard}>
              <span>{SECTION_LABELS[section]}</span>
              <p>{SECTION_DESCRIPTIONS[section]}</p>
            </a>
          ))}
        </section>

        <section className={styles.startMaps} aria-labelledby="start-maps-title" data-reveal>
          <div className={styles.sectionHeader}>
            <span>Bản đồ nên bắt đầu</span>
            <h2 id="start-maps-title">Đừng tự mò trong một đống bài. Hãy đi theo một đường đọc trước.</h2>
          </div>
          <div className={styles.mapGrid}>
            {mapNotes.map((note) => (
              <Link href={`/library/${note.slug}`} className={styles.mapCard} key={note.slug}>
                <span>{JOURNEY_LABELS[note.journey]} · {READER_STATE_LABELS[note.readerState]}</span>
                <h3>{note.title}</h3>
                <p>{note.promise}</p>
                <small>{note.readTime} phút đọc · {STATUS_LABELS[note.status]}</small>
              </Link>
            ))}
          </div>
        </section>

        <LibraryFiltersClient
          notes={notes}
          labels={{
            sections: SECTION_LABELS,
            journeys: JOURNEY_LABELS,
            readerStates: READER_STATE_LABELS,
            statuses: STATUS_LABELS,
          }}
        />

        <section className={styles.recentSection} aria-labelledby="recent-title" data-reveal>
          <div className={styles.sectionHeader}>
            <span>Note mới cập nhật</span>
            <h2 id="recent-title">Những mảnh vừa được cập nhật gần đây.</h2>
          </div>
          <div className={styles.recentList}>
            {recentNotes.map((note) => (
              <Link href={`/library/${note.slug}`} className={styles.recentItem} key={note.slug}>
                <div>
                  <span>{SECTION_LABELS[note.section]} · {STATUS_LABELS[note.status]}</span>
                  <h3>{note.title}</h3>
                </div>
                <small>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</small>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
