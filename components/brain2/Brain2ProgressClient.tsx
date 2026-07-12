'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  markBrain2LessonComplete,
  nextBrain2Lesson,
  readBrain2Progress,
  recordBrain2LessonOpened,
  type Brain2Progress,
} from '@/lib/brain2/progress'
import { brain2LessonHref } from '@/lib/brain2/routes'
import { dispatchBrain2Event } from './Brain2Analytics'
import styles from './Brain2.module.css'

type Props =
  | { variant: 'hub' }
  | { variant: 'lesson'; slug: string; day: number }

const empty: Brain2Progress = { version: 1, completed: {} }

export default function Brain2ProgressClient(props: Props) {
  const [hydrated, setHydrated] = useState(false)
  const [progress, setProgress] = useState<Brain2Progress>(empty)

  useEffect(() => {
    const current = props.variant === 'lesson'
      ? recordBrain2LessonOpened(props.slug)
      : readBrain2Progress()
    setProgress(current)
    setHydrated(true)
  }, [props.variant, props.variant === 'lesson' ? props.slug : null])

  if (!hydrated) return null

  if (props.variant === 'hub') {
    const completedCount = Object.keys(progress.completed).length
    if (!progress.lastOpened && completedCount === 0) return null
    if (completedCount === 21) {
      return (
        <aside className={styles.progressSummary} aria-live="polite" data-motion-surface>
          <span>Bạn đã hoàn thành 21/21 ngày</span>
          <strong>Hành trình đã khép lại. Brain2 sẵn sàng phục vụ công việc tiếp theo.</strong>
        </aside>
      )
    }
    const nextSlug = nextBrain2Lesson(progress)
    const day = Number(nextSlug.slice(-2))
    return (
      <aside className={styles.progressSummary} aria-live="polite" data-motion-surface>
        <span>{completedCount}/21 ngày đã hoàn thành</span>
        <Link href={brain2LessonHref(day)} data-motion-action>Tiếp tục ngày {String(day).padStart(2, '0')} →</Link>
      </aside>
    )
  }

  const completed = Boolean(progress.completed[props.slug])
  return (
    <div className={styles.completionControl}>
      <button
        type="button"
        aria-pressed={completed}
        disabled={completed}
        data-motion-action
        onClick={() => {
          const next = markBrain2LessonComplete(props.slug)
          setProgress(next)
          dispatchBrain2Event({ name: 'brain2_lesson_completed', detail: { day: props.day } })
        }}
      >
        {completed ? 'Đã hoàn thành ngày này' : 'Đánh dấu đã hoàn thành'}
      </button>
      <span>{completed ? 'Tiến độ chỉ lưu trên trình duyệt này.' : 'Hoàn thành sau khi bạn đã tạo được đầu ra của ngày.'}</span>
    </div>
  )
}
