import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import LibraryDiscovery from '@/components/library/LibraryDiscovery'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import { getAllPosts } from '@/lib/blog'
import {
  adaptBlogPost,
  adaptLivingNote,
  adaptReadingSummary,
  type LibraryEntrySummary,
} from '@/lib/library-discovery'
import { getAllLibraryNotes } from '@/lib/library'
import { getAllReadingSummaries } from '@/lib/readings'
import { serializeStructuredData } from '@/lib/structured-data'
import styles from './page.module.css'

const FEATURED_SLUG = 'steve-jobs-2005-stanford-commencement-address'
const FEATURED_HREF = `/library/read/${FEATURED_SLUG}`
const LIBRARY_HEADLINE = 'Một thư viện để đọc sâu, nghĩ rõ và làm ra thứ có giá trị.'

const PAGE_DESCRIPTION =
  'Thư viện chọn lọc những bài đọc đáng tin, bài viết và ghi chú sống để bạn đọc sâu, nghĩ rõ và làm ra thứ có giá trị.'

export const metadata: Metadata = {
  title: 'Thư viện — Đọc sâu, nghĩ rõ, làm ra thứ có giá trị',
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/library',
  },
  openGraph: {
    title: 'Thư viện Thông Phan',
    description: PAGE_DESCRIPTION,
    url: '/library',
    type: 'website',
  },
}

const ENTRY_TYPE_LABELS = {
  reading: 'Tuyển đọc',
  post: 'Bài của Thông',
  note: 'Ghi chú sống',
} as const

function byRecentThenTitle(a: LibraryEntrySummary, b: LibraryEntrySummary) {
  const dateA = a.updatedAt ?? a.publishedAt ?? ''
  const dateB = b.updatedAt ?? b.publishedAt ?? ''
  return dateB.localeCompare(dateA) || a.title.localeCompare(b.title, 'vi')
}

function ArchiveLane({
  index,
  title,
  description,
  href,
  entries,
}: {
  index: string
  title: string
  description: string
  href: string
  entries: LibraryEntrySummary[]
}) {
  return (
    <section className={styles.archiveLane} aria-labelledby={`lane-${index}`} data-motion-reveal="drift">
      <header className={styles.laneHeader}>
        <div>
          <span>{index}</span>
          <h2 id={`lane-${index}`}>{title}</h2>
        </div>
        <Link href={href} data-motion-action>Xem tất cả <span aria-hidden="true">→</span></Link>
      </header>
      <p className={styles.laneDescription}>{description}</p>
      <div className={styles.laneList}>
        {entries.map((entry) => (
          <Link href={entry.href} key={`${entry.type}-${entry.slug}`} className={styles.laneItem} data-motion-surface>
            <span className={styles.laneType}>{ENTRY_TYPE_LABELS[entry.type]}</span>
            <span className={styles.laneCopy}>
              <strong>{entry.title}</strong>
              <small>{entry.author}{entry.source ? ` · ${entry.source}` : ''} · {entry.minutes} phút</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function LibraryPage() {
  const readingEntries = getAllReadingSummaries().map(adaptReadingSummary)
  const postEntries = getAllPosts().map(adaptBlogPost).sort(byRecentThenTitle)
  const noteEntries = getAllLibraryNotes().map(adaptLivingNote).sort(byRecentThenTitle)
  const entries = [...readingEntries, ...postEntries, ...noteEntries]
  const featured = readingEntries.find((entry) => entry.slug === FEATURED_SLUG)
  const readingLane = readingEntries.filter((entry) => entry.slug !== FEATURED_SLUG).slice(0, 3)
  const noteLane = noteEntries.slice(0, 3)

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Thư viện Thông Phan',
    description: PAGE_DESCRIPTION,
    url: 'https://thongphan.com/library',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.title,
        url: `https://thongphan.com${entry.href}`,
      })),
    },
  }

  return (
    <div className={styles.libraryPage}>
      <section className={styles.archiveFrame} aria-labelledby="library-title">
        <header className={styles.hero}>
          <div className={styles.heroCopy} data-motion-reveal="mask">
            <p className={styles.eyebrow}>Thư viện chọn lọc · Thông Phan</p>
            <h1 id="library-title" aria-label={LIBRARY_HEADLINE}>
              <span className={styles.headlineLine}>Một thư viện{' '}</span>
              <span className={styles.headlineLine}>để đọc sâu,{' '}</span>
              <span className={styles.headlineLine}>nghĩ rõ và làm ra{' '}</span>
              <span className={styles.headlineLine}>thứ có giá trị.</span>
            </h1>
            <p className={styles.lead}>
              Những bài đọc đáng tin, ghi chú đang sống và trải nghiệm đã được trả giá —
              được xếp lại để bạn nhìn rõ hơn trước khi làm nhanh hơn.
            </p>
            <Link href="/library/read/steve-jobs-2005-stanford-commencement-address" className={styles.primaryCta} data-motion-action>Bắt đầu đọc</Link>
          </div>

          {featured ? (
            <article className={styles.featured} aria-labelledby="featured-title" data-motion-surface data-motion-reveal="drift">
              <p className={styles.featuredLabel}>Bài đọc nổi bật · Stanford 2005</p>
              <h2 id="featured-title">{featured.title}</h2>
              <p>{featured.description}</p>
              <dl className={styles.featuredMeta}>
                <div><dt>Tác giả</dt><dd>{featured.author}</dd></div>
                <div><dt>Nguồn</dt><dd>{featured.source}</dd></div>
                <div><dt>Thời lượng</dt><dd>{featured.minutes} phút</dd></div>
              </dl>
              <Link href={FEATURED_HREF} className={styles.featuredLink} data-motion-action>Đọc ghi chú tuyển chọn <span aria-hidden="true">→</span></Link>
            </article>
          ) : null}
        </header>

        <section className={styles.currentState} aria-labelledby="current-state-title" data-motion-reveal="fade">
          <header>
            <p>Đừng bắt đầu từ định dạng</p>
            <h2 id="current-state-title">Bắt đầu từ điều bạn đang cần nhìn rõ.</h2>
          </header>
          <div className={styles.currentStateGrid}>
            <article data-motion-surface>
              <span>01 · Gọi đúng vấn đề</span>
              <h3>Làm rõ điều đang vướng</h3>
              <p>Năm câu hỏi giúp xác định điểm kẹt trước khi chọn thứ để đọc hoặc công cụ để dùng.</p>
              <Link href="/diagnostic" data-motion-action>Mở bản đồ chuyên môn <span aria-hidden="true">→</span></Link>
            </article>
            <article data-motion-surface>
              <span>02 · Làm ra một vật thể</span>
              <h3>Biến chuyên môn thành đầu ra</h3>
              <p>Chọn một bộ nhỏ để biến điều vừa hiểu thành thứ có thể dùng và nhận phản hồi.</p>
              <Link href="/assets" data-motion-action>Xem kho tài sản nhỏ <span aria-hidden="true">→</span></Link>
            </article>
            <article data-motion-surface>
              <span>03 · Tạo nhịp làm</span>
              <h3>Bắt đầu một nhịp thực hành</h3>
              <p>Gom nguyên liệu thật trong 21 ngày thay vì tiếp tục lưu thêm kiến thức rời rạc.</p>
              <Link href="/challenges/brain2-21-ngay" data-motion-action>Mở lịch 21 ngày <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </section>

        <div className={styles.primaryLanes}>
          <ArchiveLane
            index="01"
            title="Tuyển đọc thế giới"
            description="Bài viết và bài nói từ những tác giả, nhà tư tưởng và tổ chức đáng đọc."
            href="/library?type=reading"
            entries={readingLane}
          />
          <ArchiveLane
            index="02"
            title="Ghi chú sống của Thông"
            description="Những ghi chú, đúc kết và quan sát từ hành trình học, làm và xây hệ thống."
            href="/library?type=note"
            entries={noteLane}
          />
        </div>

        <div className={styles.filmRaster}>
          <img
            src="/images/library/library-film-archive-v1.webp"
            alt=""
            aria-hidden="true"
            width="2048"
            height="320"
          />
        </div>
      </section>

      <section className={styles.blogLane} aria-labelledby="blog-lane-title">
        <header className={styles.blogHeader} data-motion-reveal="mask">
          <div>
            <span>03</span>
            <h2 id="blog-lane-title">Bài của Thông</h2>
          </div>
          <Link href="/blog" data-motion-action>Đi tới trang bài viết <span aria-hidden="true">→</span></Link>
        </header>
        <p className={styles.blogIntro}>
          Những bài dài đi từ trải nghiệm thật tới một góc nhìn có thể dùng trong công việc và cuộc sống.
        </p>
        <div className={styles.blogList}>
          {postEntries.map((post) => (
            <Link href={post.href} key={post.slug} className={styles.blogItem} data-motion-surface>
              <span>{post.minutes} phút</span>
              <strong>{post.title}</strong>
              <p>{post.promise}</p>
            </Link>
          ))}
        </div>
      </section>

      <Suspense fallback={<div className={styles.discoveryFallback}>Đang mở mục lục thư viện…</div>}>
        <LibraryDiscovery entries={entries} />
      </Suspense>

      <ChapterHandoff journeyKey="library" tone="paper" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(collectionJsonLd) }}
      />
    </div>
  )
}
