'use client'

import Link from 'next/link'

import type { Brain2LessonMeta } from '@/lib/brain2/lesson-contract'
import { brain2LessonHref } from '@/lib/brain2/routes'
import Brain2Analytics, { Brain2ConanLink } from './Brain2Analytics'
import styles from './Brain2.module.css'

export default function Brain2ProtectedLesson({ meta }: { meta: Brain2LessonMeta }) {
  const navigation = (
    <nav className={styles.lessonNavigation} aria-label="Điều hướng bài thực hành">
      <Link href={brain2LessonHref(meta.day - 1)}>← Ngày {String(meta.day - 1).padStart(2, '0')}</Link>
      {meta.day < 21 ? <Link href={brain2LessonHref(meta.day + 1)}>Ngày {String(meta.day + 1).padStart(2, '0')} →</Link> : <Link href="/brain2/21-ngay">Khép lại hành trình →</Link>}
    </nav>
  )

  return (
    <article className={styles.lessonDocument}>
      <Brain2Analytics event={{ name: 'brain2_access_gate_viewed', detail: { day: meta.day } }} />
      <header className={styles.lessonHeader}>
        <Link href="/brain2/21-ngay" className={styles.backLink}>Bản đồ 21 ngày</Link>
        <p>Ngày {String(meta.day).padStart(2, '0')} · Tuần {meta.week} · Dành cho Conan Maker</p>
        <h1>{meta.title}</h1>
        <strong>{meta.promise}</strong>
        <dl>
          <div><dt>Mục tiêu</dt><dd>{meta.objective}</dd></div>
          <div><dt>Thời lượng</dt><dd>{meta.estimatedMinutes.min}–{meta.estimatedMinutes.max} phút</dd></div>
        </dl>
      </header>

      {meta.day === 21 ? navigation : null}

      <section className={styles.lockedSheet} data-motion-surface>
        <p>Phần tiếp theo của lộ trình</p>
        <h2>{meta.day === 21 ? 'Đừng giữ Brain2 như một kho lưu trữ.' : 'Nội dung ngày này được mở cho Conan Maker.'}</h2>
        <span>{meta.day === 21 ? 'Khép lại 21 ngày bằng cách chọn một công việc thật để hệ thống tiếp tục phục vụ.' : meta.preview}</span>
        {meta.day === 21 ? (
          <Brain2ConanLink placement="day-21">Tiếp tục thực hành trong Conan Maker →</Brain2ConanLink>
        ) : (
          <a href="/conanmaker/" data-motion-action>Tìm hiểu Conan Maker →</a>
        )}
      </section>

      {meta.day < 21 ? navigation : null}
    </article>
  )
}
