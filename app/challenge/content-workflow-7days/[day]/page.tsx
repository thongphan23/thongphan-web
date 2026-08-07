import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ChallengeWorkbench from '@/components/content-workflow/ChallengeWorkbench'
import { CONTENT_WORKFLOW_DAYS, getContentWorkflowDay } from '@/lib/content-workflow/content'
import styles from './page.module.css'

type Props = { params: Promise<{ day: string }> }

export function generateStaticParams() {
  return CONTENT_WORKFLOW_DAYS.map((lesson) => ({ day: lesson.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params
  const lesson = getContentWorkflowDay(day)
  if (!lesson) return { title: 'Không tìm thấy ngày thực hành — Thông Phan' }

  const canonical = `/challenge/content-workflow-7days/${lesson.slug}`
  return {
    title: `Ngày ${lesson.day}: ${lesson.title} — Content Workflow 7 Days`,
    description: `${lesson.question} Tự tạo ${lesson.artifact} bằng dữ liệu thật của business.`,
    alternates: { canonical },
    openGraph: {
      title: `Ngày ${lesson.day}: ${lesson.title}`,
      description: lesson.threshold,
      url: canonical,
      type: 'article',
    },
  }
}

export default async function ContentWorkflowDayPage({ params }: Props) {
  const { day } = await params
  const lesson = getContentWorkflowDay(day)
  if (!lesson) notFound()

  return <div className={styles.page}><ChallengeWorkbench lesson={lesson} /></div>
}
