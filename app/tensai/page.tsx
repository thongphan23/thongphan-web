import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import TwoPathPhoto from '@/components/two-path/TwoPathPhoto'
import twoPath from '@/components/two-path/TwoPath.module.css'
import { photo } from '@/lib/two-path-photos'
import { tensaiContent } from '@/lib/two-path-content'
import { buildBranchPageStructuredData, createPageMetadata } from '@/lib/seo'
import styles from './page.module.css'

const description =
  'Tensai là nơi học dùng AI cho chính việc bạn đang làm: bài ngắn, thử ngay trong bài và vượt ải để biết mình làm được.'

export const metadata: Metadata = createPageMetadata({
  title: 'Tensai — Học dùng AI cho việc thật mỗi ngày | Thông Phan',
  description,
  pathname: '/tensai',
  image: '/images/two-path/tensai-map.webp',
})

export default function TensaiPage() {
  const { situations, courses, method, closing } = tensaiContent
  return (
    <div className={`${twoPath.branch} ${styles.page}`} data-path="tensai" data-motion-tempo="calm">
      <PathMemory path="tensai" />
      <JsonLd data={buildBranchPageStructuredData({ name: 'Tensai', description, pathname: '/tensai' })} />

      <section className={styles.hero} aria-labelledby="tensai-title">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>{tensaiContent.eyebrow}</p>
          <h1 id="tensai-title" className={styles.title}>
            {tensaiContent.title}
          </h1>
          <p className={styles.lead}>{tensaiContent.lead}</p>
          <div className={styles.actions}>
            <PathLink path="tensai" kind="outbound" placement="hero" className={styles.primaryCta} data-motion-action>
              {tensaiContent.primaryCta}
              <ArrowRight aria-hidden="true" size={18} />
            </PathLink>
            <a href={tensaiContent.secondaryCta.href} className={styles.secondaryLink}>
              {tensaiContent.secondaryCta.label}
            </a>
          </div>
          <p className={styles.launchNote}>{tensaiContent.launchNote}</p>
        </div>
        <figure className={styles.heroFigure}>
          <TwoPathPhoto
            id={tensaiContent.heroPhotoId}
            priority
            sizes="(max-width: 959px) 100vw, 640px"
            className={styles.heroImage}
          />
          <figcaption>{photo(tensaiContent.heroPhotoId).caption}</figcaption>
        </figure>
      </section>

      <section className={styles.section} aria-labelledby="tensai-situations">
        <div className={styles.inner}>
          <h2 id="tensai-situations" className={styles.sectionTitle} data-motion-reveal="mask">
            {situations.title}
          </h2>
          <ul className={styles.situations}>
            {situations.items.map((item) => (
              <li key={item.course} className={styles.situation} data-motion-reveal="drift">
                <p className={styles.problem}>{item.problem}</p>
                <p className={styles.situationCourse}>Khóa {item.course}</p>
                <ul className={styles.lessons}>
                  {item.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id={tensaiContent.courses.id} className={`${styles.section} ${styles.coursesBand}`} aria-labelledby="tensai-courses">
        <div className={styles.inner}>
          <h2 id="tensai-courses" className={styles.sectionTitle} data-motion-reveal="mask">
            {courses.title}
          </h2>
          <ul className={styles.courses}>
            {courses.items.map((course) => (
              <li key={course.name} className={styles.course} data-motion-surface>
                <h3 className={styles.courseName}>{course.name}</h3>
                <p className={styles.courseTagline}>{course.tagline}</p>
                <p className={styles.courseMeta}>
                  {course.scale}
                  <span aria-hidden="true"> · </span>
                  <span>Mở từ {course.opensOn}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className={styles.note}>{courses.note}</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="tensai-method">
        <div className={`${styles.inner} ${styles.methodGrid}`}>
          <div>
            <h2 id="tensai-method" className={styles.sectionTitle} data-motion-reveal="mask">
              {method.title}
            </h2>
            <ol className={styles.steps}>
              {method.steps.map((step, index) => (
                <li key={step.title} className={styles.step} data-motion-reveal="drift">
                  <span className={styles.stepNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <figure className={styles.methodFigure} data-motion-surface>
            <TwoPathPhoto id={method.photoId} sizes="(max-width: 959px) 100vw, 560px" />
            <figcaption>{photo(method.photoId).caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="tensai-closing">
        <div className={styles.inner}>
          <h2 id="tensai-closing" className={styles.closingTitle} data-motion-reveal="mask">
            {closing.title}
          </h2>
          <div className={styles.actions}>
            <PathLink path="tensai" kind="outbound" placement="closing" className={styles.primaryCta} data-motion-action>
              {tensaiContent.primaryCta}
              <ArrowRight aria-hidden="true" size={18} />
            </PathLink>
            <PathLink path="conan" kind="door" placement="page" className={styles.crossLink}>
              {closing.crossLink.label}
            </PathLink>
          </div>
        </div>
      </section>
    </div>
  )
}
