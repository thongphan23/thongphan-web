import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleHeader from '@/components/editorial/ArticleHeader'
import ReadNext from '@/components/editorial/ReadNext'
import SourceDisclosure from '@/components/editorial/SourceDisclosure'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import ReadingToolbar from '@/components/library/ReadingToolbar'
import ReadingBody from '@/components/library/ReadingBody'
import { buildReadingStructuredData } from '@/lib/reading-structured-data'
import {
  getReadingBySlug,
  getReadingSlugs,
  getRelatedReadingSummaries,
  type ReadingInfoBox,
} from '@/lib/readings'
import { serializeStructuredData } from '@/lib/structured-data'
import styles from './page.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return getReadingSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const reading = getReadingBySlug(slug)

  if (!reading) return { title: 'Không tìm thấy ghi chú tuyển đọc' }

  return {
    title: `${reading.title} — Ghi chú tuyển đọc`,
    description: reading.description,
    alternates: { canonical: reading.readingPath },
    authors: [{ name: 'Thông Phan', url: 'https://thongphan.com/about' }],
    keywords: reading.topics,
    openGraph: {
      title: reading.title,
      description: reading.description,
      url: reading.readingPath,
      type: 'article',
      modifiedTime: reading.lastReviewedAt,
      authors: ['Thông Phan'],
      tags: reading.topics,
    },
    twitter: {
      card: 'summary',
      title: reading.title,
      description: reading.description,
    },
  }
}

function InfoSection({ box, index }: { box: ReadingInfoBox; index: string }) {
  return (
    <section className={styles.infoSection} aria-labelledby={`info-${index}`}>
      <p>{index}</p>
      <div>
        <h2 id={`info-${index}`}>{box.title}</h2>
        <p>{box.summary}</p>
        {box.bullets?.length ? (
          <ul>{box.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
        ) : null}
      </div>
    </section>
  )
}

export default async function ReadingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const reading = getReadingBySlug(slug)
  if (!reading) notFound()

  const related = getRelatedReadingSummaries(reading.slug)
  const jsonLd = buildReadingStructuredData(reading)

  return (
    <div className={styles.readingPage}>
      <div className={styles.pageFrame}>
        <ArticleHeader
          author={reading.author}
          description={reading.description}
          label="Ghi chú tuyển đọc"
          minutes={reading.minutes}
          source={reading.source}
          title={reading.title}
          topics={reading.topics}
        />

        <ReadingToolbar
          slug={reading.slug}
          publicationMode={reading.publicationMode}
          readyAudioCount={reading.audio.length}
        />

        <article className={styles.editorialGuide}>
          <section className={styles.guideSection} aria-labelledby="core-idea-title">
            <p>01</p>
            <div>
              <h2 id="core-idea-title">Ý chính để mang theo</h2>
              <p className={styles.leadIdea}>{reading.coreIdea ?? reading.description}</p>
            </div>
          </section>

          <section className={styles.guideSection} aria-labelledby="why-read-title">
            <p>02</p>
            <div>
              <h2 id="why-read-title">Vì sao bài này đáng thời gian của bạn?</h2>
              <p>{reading.whyRead ?? reading.description}</p>
            </div>
          </section>

          <SourceDisclosure source={reading.source} sourceUrl={reading.sourceUrl} />

          {reading.sections?.length ? (
            <ReadingBody sections={reading.sections} images={reading.images} />
          ) : null}

          {reading.reflection ? (
            <section className={styles.reflection} aria-labelledby="reflection-title">
              <p>Khoảng dừng</p>
              <h2 id="reflection-title">Một câu hỏi trước khi mở bài gốc</h2>
              <blockquote>{reading.reflection}</blockquote>
            </section>
          ) : null}

          {reading.authorProfile ? <InfoSection box={reading.authorProfile} index="03" /> : null}
          {reading.contentContext ? <InfoSection box={reading.contentContext} index="04" /> : null}
          <ReadNext readings={related} />
        </article>

        <ChapterHandoff journeyKey="reader" tone="paper" />
      </div>

      <script type="application/ld+json">{serializeStructuredData(jsonLd)}</script>
    </div>
  )
}
