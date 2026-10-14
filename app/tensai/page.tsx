import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
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

const pad = (value: number) => String(value).padStart(2, '0')

// "Thiên tài" is what Tensai means, so the headline sets it apart in italics.
const accent = 'thiên tài'
const accentAt = tensaiContent.title.indexOf(accent)
const titleHead = tensaiContent.title.slice(0, accentAt).trimEnd()
const titleTail = tensaiContent.title.slice(accentAt + accent.length).trimStart()

export default function TensaiPage() {
  const { situations, courses, method, closing } = tensaiContent
  return (
    <div className={`${twoPath.branch} ${styles.page}`} data-path="tensai" data-motion-stage>
      <PathMemory path="tensai" />
      <JsonLd data={buildBranchPageStructuredData({ name: 'Tensai', description, pathname: '/tensai' })} />

      <section className={styles.hero} aria-labelledby="tensai-title">
        <div className={styles.heroText} data-scroll-out="24">
          <p className={`${styles.eyebrow} intro-fade`}>{tensaiContent.eyebrow}</p>
          <h1 id="tensai-title" className={styles.title}>
            <SplitWords text={titleHead} />{' '}
            <em>
              <SplitWords text={accent} start={wordCount(titleHead)} />
            </em>{' '}
            <SplitWords text={titleTail} start={wordCount(titleHead) + wordCount(accent)} />
          </h1>
          <p className={`${styles.lead} intro-fade`}>{tensaiContent.lead}</p>
          <div className={styles.actions}>
            <PathLink
              path="tensai"
              kind="outbound"
              placement="hero"
              className={styles.primaryCta}
              data-motion-action
              data-magnetic="0.22"
            >
              <span className={styles.ctaInner} data-magnetic-inner>
                {tensaiContent.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </span>
            </PathLink>
            <a href={tensaiContent.secondaryCta.href} className={styles.secondaryLink}>
              {tensaiContent.secondaryCta.label}
            </a>
          </div>
          <p className={`${styles.launchNote} intro-fade`}>{tensaiContent.launchNote}</p>
        </div>
        <figure className={styles.heroFigure}>
          <div className={`${styles.heroFrame} intro-clip`} data-tilt="3">
            <TwoPathPhoto
              id={tensaiContent.heroPhotoId}
              priority
              sizes="(max-width: 959px) 100vw, 720px"
              className={styles.heroImage}
            />
            <span className={styles.heroGlare} aria-hidden="true" />
          </div>
          <figcaption className="intro-fade">{photo(tensaiContent.heroPhotoId).caption}</figcaption>
        </figure>
      </section>

      <section className={styles.section} aria-labelledby="tensai-situations">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              01 — Tình huống
            </p>
            <h2 id="tensai-situations" className={styles.sectionTitle} data-split>
              {situations.title}
            </h2>
          </div>
          <ol className={styles.situations}>
            {situations.items.map((item, index) => (
              <li key={item.course} className={styles.situation}>
                <span className={styles.rowLine} data-draw-line aria-hidden="true" />
                <span className={styles.situationIndex} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <p className={styles.problem} data-scrub-words>
                  {item.problem}
                </p>
                <div className={styles.situationAnswer} data-motion-reveal="drift">
                  <p className={styles.situationCourse}>Khóa {item.course}</p>
                  <ul className={styles.lessons}>
                    {item.lessons.map((lesson) => (
                      <li key={lesson}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id={tensaiContent.courses.id}
        className={`${styles.section} ${styles.coursesBand}`}
        aria-labelledby="tensai-courses"
      >
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              02 — Khóa học
            </p>
            <h2 id="tensai-courses" className={styles.sectionTitle} data-split>
              {courses.title}
            </h2>
          </div>
          <ul className={styles.courses} data-reveal-children data-stagger="0.12">
            {courses.items.map((course, index) => (
              <li key={course.name} className={styles.course}>
                <PathLink
                  path="tensai"
                  kind="outbound"
                  placement="page"
                  className={styles.courseLink}
                  data-cursor="Vào học"
                  data-cursor-tone="lime"
                >
                  <span className={styles.courseIndex} aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <div className={styles.courseBody}>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <p className={styles.courseTagline}>{course.tagline}</p>
                  </div>
                  <span className={styles.courseMeta}>
                    <span className={styles.courseStat}>
                      <strong data-count={course.lessonCount}>{course.lessonCount}</strong> bài
                    </span>
                    <span className={styles.courseStat}>
                      <strong data-count={course.gateCount}>{course.gateCount}</strong> màn vượt ải
                    </span>
                    <span className={styles.courseOpens}>Mở từ {course.opensOn}</span>
                  </span>
                  <ArrowUpRight className={styles.courseArrow} aria-hidden="true" size={28} />
                </PathLink>
              </li>
            ))}
          </ul>
          <p className={styles.note}>{courses.note}</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="tensai-method">
        <div className={`${styles.inner} ${styles.methodGrid}`}>
          <div className={styles.methodText}>
            <div className={styles.sectionHead}>
              <p className={styles.sectionMark} data-motion-reveal="mask">
                03 — Cách học
              </p>
              <h2 id="tensai-method" className={styles.sectionTitle} data-split>
                {method.title}
              </h2>
            </div>
            <ol className={styles.steps}>
              {method.steps.map((step, index) => (
                <li key={step.title} className={styles.step} data-motion-reveal="drift">
                  <span className={styles.stepNumber} aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <figure className={styles.methodFigure}>
            <div className={styles.methodFrame} data-img-reveal="center">
              <div data-reveal-media>
                <TwoPathPhoto id={method.photoId} sizes="(max-width: 959px) 100vw, 620px" />
              </div>
            </div>
            <figcaption>{photo(method.photoId).caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="tensai-closing">
        <div className={`${styles.inner} ${styles.closingInner}`}>
          <h2 id="tensai-closing" className={styles.closingTitle} data-split>
            {closing.title}
          </h2>
          <div className={styles.actions}>
            <PathLink
              path="tensai"
              kind="outbound"
              placement="closing"
              className={styles.primaryCta}
              data-motion-action
              data-magnetic="0.3"
            >
              <span className={styles.ctaInner} data-magnetic-inner>
                {tensaiContent.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </span>
            </PathLink>
            <PathLink path="conan" kind="door" placement="page" className={styles.crossLink}>
              {closing.crossLink.label}
            </PathLink>
          </div>
        </div>
        <p className={styles.closingMark} aria-hidden="true" data-speed="-0.12">
          Tensai
        </p>
      </section>
    </div>
  )
}
