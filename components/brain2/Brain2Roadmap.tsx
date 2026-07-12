import Link from 'next/link'

import { brain2LessonHref, brain2LessonMetadata } from '@/lib/brain2/lessons'
import Brain2ProgressClient from './Brain2ProgressClient'
import styles from './Brain2.module.css'

const weekCopy = [
  ['Nền tảng cá nhân', 'Đưa trải nghiệm, dự án, bài học, insight và câu chuyện vào một cấu trúc có thể gọi lại.'],
  ['Tạo đầu ra', 'Đọc sâu, viết, thuyết trình và phát triển bản thân từ dữ liệu đã tích lũy.'],
  ['Đóng gói hệ thống', 'Biến tri thức thành sản phẩm, tài liệu, kế hoạch và một dòng chảy bền vững.'],
] as const

export default function Brain2Roadmap() {
  return (
    <div className={styles.roadmap}>
      <Brain2ProgressClient variant="hub" />
      {weekCopy.map(([title, description], index) => {
        const week = index + 1
        const lessons = brain2LessonMetadata.filter((lesson) => lesson.week === week)
        return (
          <section className={styles.week} key={title} aria-labelledby={`brain2-week-${week}`} data-motion-reveal="fade">
            <header>
              <p>Tuần {week}</p>
              <h3 id={`brain2-week-${week}`}>{title}</h3>
              <span>{description}</span>
            </header>
            <ol>
              {lessons.map((lesson) => (
                <li key={lesson.slug} data-motion-surface>
                  <Link href={brain2LessonHref(lesson.day)}>
                    <span className={styles.dayNumber}>{String(lesson.day).padStart(2, '0')}</span>
                    <span className={styles.dayCopy}>
                      <strong>{lesson.title}</strong>
                      <small>{lesson.preview}</small>
                    </span>
                    <span className={styles.accessMark} data-access={lesson.access}>
                      {lesson.access === 'public' ? 'Miễn phí công khai' : 'Dành cho Conan Maker'}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
