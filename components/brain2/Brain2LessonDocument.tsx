'use client'

import Link from 'next/link'

import type { Brain2LessonBlock, Brain2LessonPackage } from '@/lib/brain2/lesson-contract'
import { brain2LessonHref } from '@/lib/brain2/routes'
import { Brain2ConanLink } from './Brain2Analytics'
import Brain2PromptCopy from './Brain2PromptCopy'
import Brain2ProgressClient from './Brain2ProgressClient'
import Brain2RichText, { Brain2SafeLink } from './Brain2RichText'
import styles from './Brain2.module.css'

function ResourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Brain2SafeLink href={href}>{children}</Brain2SafeLink>
}

function LessonBlock({ block, day }: { block: Brain2LessonBlock; day: number }) {
  switch (block.kind) {
    case 'prose':
      return (
        <section className={styles.proseBlock}>
          {block.heading ? <h2>{block.heading}</h2> : null}
          {block.children.length ? <p><Brain2RichText nodes={block.children} /></p> : null}
        </section>
      )
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul'
      return <List className={styles.lessonList}>{block.items.map((item, index) => <li key={`${block.id}-${index}`}><Brain2RichText nodes={item} /></li>)}</List>
    }
    case 'callout':
      return (
        <aside className={styles.callout} data-tone={block.tone}>
          {block.title ? <h3>{block.title}</h3> : null}
          <p><Brain2RichText nodes={block.children} /></p>
        </aside>
      )
    case 'prompt':
      return <Brain2PromptCopy day={day} blockId={block.id} label={block.label} text={block.text} />
    case 'resources':
      return (
        <section className={styles.resources}>
          <h2>{block.title}</h2>
          <ul>{block.items.map((item) => <li key={item.href}><ResourceLink href={item.href}>{item.title}</ResourceLink>{item.note ? <p>{item.note}</p> : null}</li>)}</ul>
        </section>
      )
    case 'deliverable':
      return <section className={styles.inlineDeliverable}><h3>{block.title}</h3><p><Brain2RichText nodes={block.children} /></p></section>
    default: {
      const unreachable: never = block
      throw new Error(`Unknown Brain2 lesson block: ${JSON.stringify(unreachable)}`)
    }
  }
}

function LessonNavigation({ day }: { day: number }) {
  return (
    <nav className={styles.lessonNavigation} aria-label="Điều hướng bài thực hành">
      {day > 1 ? <Link href={brain2LessonHref(day - 1)}>← Ngày {String(day - 1).padStart(2, '0')}</Link> : <Link href="/brain2/21-ngay">← Bản đồ 21 ngày</Link>}
      {day < 21 ? <Link href={brain2LessonHref(day + 1)}>Ngày {String(day + 1).padStart(2, '0')} →</Link> : <Link href="/brain2/21-ngay">Khép lại hành trình →</Link>}
    </nav>
  )
}

export default function Brain2LessonDocument({ lesson }: { lesson: Brain2LessonPackage }) {
  const { meta } = lesson
  return (
    <article className={styles.lessonDocument}>
      <header className={styles.lessonHeader}>
        <Link href="/brain2/21-ngay" className={styles.backLink}>Bản đồ 21 ngày</Link>
        <p>
          Ngày {String(meta.day).padStart(2, '0')} · Tuần {meta.week} ·{' '}
          {meta.access === 'public' ? 'Miễn phí công khai' : 'Dành cho Conan Maker'}
        </p>
        <h1>{meta.title}</h1>
        <strong>{meta.promise}</strong>
        <dl>
          <div><dt>Mục tiêu</dt><dd>{meta.objective}</dd></div>
          <div><dt>Thời lượng</dt><dd>{meta.estimatedMinutes.min}–{meta.estimatedMinutes.max} phút</dd></div>
        </dl>
      </header>

      <section className={styles.reason} aria-labelledby="why-this-day">
        <p>Vì sao ngày này quan trọng</p>
        <h2 id="why-this-day">{lesson.reason}</h2>
      </section>

      <div className={styles.lessonBody}>
        {lesson.blocks.map((block) => <LessonBlock key={block.id} block={block} day={meta.day} />)}
      </div>

      <section className={styles.deliverable} aria-labelledby="brain2-deliverable">
        <p>Đầu ra quan sát được</p>
        <h2 id="brain2-deliverable">{lesson.deliverable.title}</h2>
        <p><Brain2RichText nodes={lesson.deliverable.body} /></p>
      </section>

      <section className={styles.checklist} aria-labelledby="brain2-checklist">
        <h2 id="brain2-checklist">Tự kiểm tra trước khi khép ngày</h2>
        <ul>{lesson.checklist.map((item) => <li key={item.id}>{item.label}</li>)}</ul>
      </section>

      <Brain2ProgressClient variant="lesson" slug={meta.slug} day={meta.day} />

      <LessonNavigation day={meta.day} />

      {meta.day === 7 ? (
        <aside className={styles.weekBoundary} data-motion-surface>
          <p>Hết tuần công khai</p>
          <h2>Bạn đã có nền. Hai tuần tiếp theo biến nền đó thành đầu ra và hệ thống.</h2>
          <Brain2ConanLink placement="day-07">Tiếp tục với quyền Conan Maker →</Brain2ConanLink>
        </aside>
      ) : null}

      {meta.day === 21 ? (
        <aside className={styles.weekBoundary} data-motion-surface>
          <p>Ngày 21</p>
          <h2>Đừng giữ Brain2 như một kho lưu trữ. Hãy dùng nó cho quyết định và công việc tiếp theo.</h2>
          <Brain2ConanLink placement="day-21">Tiếp tục thực hành trong Conan Maker →</Brain2ConanLink>
        </aside>
      ) : null}

    </article>
  )
}
