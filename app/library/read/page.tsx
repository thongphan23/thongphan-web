import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import { topicLabel } from '@/lib/library-discovery'
import { getPublicReadings } from '@/lib/readings'
import { serializeStructuredData } from '@/lib/structured-data'
import styles from './page.module.css'

const DESCRIPTION =
  'Mười ba bài đọc và bài nói được tuyển chọn để rèn phán đoán, mở rộng thế giới quan và nghĩ rõ hơn trước khi hành động.'

const INTENT_LABELS = {
  clarity: 'Sáng tỏ',
  taste: 'Rèn gu',
  asset: 'Làm ra tài sản',
} as const

export const metadata: Metadata = {
  title: 'Tuyển đọc thế giới — Thư viện Thông Phan',
  description: DESCRIPTION,
  alternates: { canonical: '/library/read' },
  openGraph: {
    title: 'Tuyển đọc thế giới — Thư viện Thông Phan',
    description: DESCRIPTION,
    url: '/library/read',
    type: 'website',
  },
}

export default function ReadingIndexPage() {
  const readings = getPublicReadings()
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tuyển đọc thế giới',
    description: DESCRIPTION,
    url: 'https://thongphan.com/library/read',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: readings.length,
      itemListElement: readings.map((reading, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: reading.title,
        url: `https://thongphan.com${reading.readingPath}`,
      })),
    },
  }

  return (
    <div className={styles.readingIndexPage}>
      <section className={styles.hero} aria-labelledby="reading-index-title">
        <div className={styles.heroCopy}>
          <Link href="/library" className={styles.backLink}>Thư viện</Link>
          <p className={styles.eyebrow}>Tuyển đọc thế giới · 13 hồ sơ</p>
          <h1 id="reading-index-title">Đọc người khác để nhìn mình rõ hơn.</h1>
          <p>{DESCRIPTION}</p>
        </div>
        <div className={styles.heroNote}>
          <p>Nguyên tắc tuyển chọn</p>
          <strong>Không gom cho nhiều. Chỉ giữ những bài có thể thay đổi một cách nhìn.</strong>
          <span>Mỗi trang là ghi chú dẫn đường và luôn chỉ rõ nguồn bài gốc.</span>
        </div>
      </section>

      <div className={styles.filmRaster} aria-hidden="true">
        <img
          src="/images/library/library-film-archive-v1.webp"
          alt=""
          width="2048"
          height="320"
        />
      </div>

      <section className={styles.catalog} aria-labelledby="reading-catalog-title">
        <header className={styles.catalogHeader}>
          <p>13 bài tuyển đọc</p>
          <h2 id="reading-catalog-title">Chọn một bài theo câu hỏi bạn đang mang theo.</h2>
        </header>

        <div className={styles.readingList}>
          {readings.map((reading, index) => (
            <Link href={reading.readingPath} key={reading.slug} className={styles.readingRow}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.rowCopy}>
                <small>{INTENT_LABELS[reading.intent]} · {reading.minutes} phút</small>
                <strong>{reading.title}</strong>
                <span>{reading.description}</span>
              </span>
              <span className={styles.rowSource}>
                <strong>{reading.author}</strong>
                <small>{reading.source}</small>
                <span>{reading.topics.slice(0, 2).map(topicLabel).join(' · ')}</span>
              </span>
              <ArrowUpRight aria-hidden="true" size={22} strokeWidth={1.6} />
            </Link>
          ))}
        </div>
      </section>

      <ChapterHandoff journeyKey="reader" tone="paper" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(collectionJsonLd) }}
      />
    </div>
  )
}
