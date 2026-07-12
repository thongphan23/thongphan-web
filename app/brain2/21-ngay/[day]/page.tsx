import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Brain2Analytics from '@/components/brain2/Brain2Analytics'
import Brain2LessonDocument from '@/components/brain2/Brain2LessonDocument'
import Brain2ProtectedLesson from '@/components/brain2/Brain2ProtectedLesson'
import JsonLd from '@/components/seo/JsonLd'
import {
  getBrain2LessonMeta,
  getBrain2LessonParams,
  getPublicBrain2Lesson,
} from '@/lib/brain2/lessons'
import { buildBrain2LessonStructuredData } from '@/lib/brain2/structured-data'
import styles from './page.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return getBrain2LessonParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>
}): Promise<Metadata> {
  const { day } = await params
  const meta = getBrain2LessonMeta(day)
  if (!meta) return { title: 'Không tìm thấy ngày thực hành' }

  const canonical = `/brain2/21-ngay/${meta.slug}`
  return {
    title: `Ngày ${String(meta.day).padStart(2, '0')} · ${meta.title} — 21 ngày Brain2`,
    description: meta.preview,
    alternates: { canonical },
    robots: {
      index: meta.access === 'public',
      follow: true,
    },
    openGraph: {
      title: meta.title,
      description: meta.preview,
      url: canonical,
      type: 'article',
    },
  }
}

export default async function Brain2LessonPage({
  params,
}: {
  params: Promise<{ day: string }>
}) {
  const { day } = await params
  const meta = getBrain2LessonMeta(day)
  if (!meta) notFound()

  const lesson = meta.access === 'public' ? getPublicBrain2Lesson(meta.slug) : null
  if (meta.access === 'public' && !lesson) notFound()
  const structuredData = buildBrain2LessonStructuredData(meta.slug)

  return (
    <div className={styles.lessonPage}>
      <Brain2Analytics event={{ name: 'brain2_lesson_opened', detail: { day: meta.day, access: meta.access } }} />
      <div className={styles.paperFrame}>
        {lesson ? <Brain2LessonDocument lesson={lesson} /> : <Brain2ProtectedLesson meta={meta} />}
      </div>
      {structuredData ? <JsonLd data={structuredData} /> : null}
    </div>
  )
}
