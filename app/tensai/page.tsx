import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import JsonLd from '@/components/seo/JsonLd'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import TensaiLesson from '@/components/two-path/TensaiLesson'
import TwoPathPhoto from '@/components/two-path/TwoPathPhoto'
import twoPath from '@/components/two-path/TwoPath.module.css'
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

      {/* The stage: the first exercise of the live Định vị course, playable right here. On wide
          screens the hero pins, the card moves to the centre and answers itself once as a demo, then
          opens into the green of the next band (lessonStage in signatures.ts). */}
      <section className={styles.hero} aria-labelledby="tensai-title" data-lesson-stage>
        <div className={styles.heroText} data-lesson-words>
          <p className={`${styles.eyebrow} intro-fade`} style={{ '--intro-delay': '0.1s' } as CSSProperties}>
            {tensaiContent.eyebrow}
          </p>
          <h1 id="tensai-title" className={styles.title} style={{ '--intro-base': '0.18s' } as CSSProperties}>
            <SplitWords text={titleHead} />{' '}
            <em>
              <SplitWords text={accent} start={wordCount(titleHead)} />
            </em>{' '}
            <SplitWords text={titleTail} start={wordCount(titleHead) + wordCount(accent)} />
          </h1>
          <p className={`${styles.lead} intro-fade`} style={{ '--intro-delay': '0.55s' } as CSSProperties}>
            {tensaiContent.lead}
          </p>
          <div className={`${styles.actions} intro-fade`} style={{ '--intro-delay': '0.68s' } as CSSProperties}>
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
          <p className={`${styles.launchNote} intro-fade`} style={{ '--intro-delay': '0.8s' } as CSSProperties}>
            {tensaiContent.launchNote}
          </p>
        </div>
        {/* The card is real text and real choices, not a screenshot: it stays sharp at any scale and
            answers the way the app does. The pointer leans it a little (data-tilt). */}
        <div className={styles.lessonSlot}>
          <span className={styles.heroGlow} aria-hidden="true" data-lesson-glow />
          <div className={styles.lessonCard} data-lesson-card>
            <div data-tilt="2.5">
              <div className="intro-fade" style={{ '--intro-delay': '0.35s' } as CSSProperties}>
                <TensaiLesson />
              </div>
            </div>
          </div>
        </div>
        {/* 天才, the word Tensai comes from, grows with the sheet as it opens, so a stop mid-scroll
            shows a mark, not an empty panel. */}
        <div className={styles.portal} data-lesson-portal aria-hidden="true">
          <span className={styles.portalMark} data-lesson-portal-mark>
            天才
          </span>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.situationsBand}`}
        aria-labelledby="tensai-situations"
        data-lesson-next
      >
        <div className={`${styles.inner} ${styles.situationsGrid}`}>
          <div className={`${styles.sectionHead} ${styles.stickyHead}`}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              01 — Tình huống
            </p>
            <h2 id="tensai-situations" className={styles.sectionTitle} data-split>
              {situations.title}
            </h2>
          </div>
          {/* Each problem is a card that holds under the heading while the next one slides over it,
              so the three read as a pile the reader works through (stackCards in engine.ts). */}
          <ol
            className={styles.situations}
            data-stack
            data-stack-scale="0.94"
            data-stack-opacity="1"
            data-stack-start="top 55%"
          >
            {situations.items.map((item, index) => (
              <li
                key={item.course}
                className={styles.situation}
                data-stack-card
                style={{ '--stack-i': index } as CSSProperties}
              >
                <p className={styles.situationTop} aria-hidden="true">
                  <span className={styles.situationIndex}>{pad(index + 1)}</span>
                  <span className={styles.situationTotal}>/ {pad(situations.items.length)}</span>
                </p>
                <p className={styles.problem} data-scrub-words data-scrub-from="0.6" data-scrub-end="top 45%">
                  {item.problem}
                </p>
                <div className={styles.situationAnswer}>
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
                  data-cursor-tone="ink"
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

      <section className={`${styles.section} ${styles.methodBand}`} aria-labelledby="tensai-method">
        {/* Each step that reaches the middle of the screen swaps the sticky screen to its own crop. */}
        <div className={`${styles.inner} ${styles.methodGrid}`} data-swap>
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
                <li key={step.title} className={styles.step} data-swap-step>
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
              <div className={styles.swapLayers} data-reveal-media>
                {method.frames.map((frame, index) => (
                  <div key={`${frame.photoId}-${index}`} className={styles.swapLayer} data-swap-layer>
                    <div
                      className={styles.swapCanvas}
                      style={
                        {
                          '--zoom': frame.zoom,
                          '--origin': frame.origin,
                          '--position': 'position' in frame ? frame.position : undefined,
                        } as CSSProperties
                      }
                    >
                      <TwoPathPhoto
                        id={frame.photoId}
                        sizes="(max-width: 959px) 100vw, 820px"
                        decorative={index > 0}
                      />
                      <span
                        className={styles.swapFocus}
                        aria-hidden="true"
                        style={{
                          left: `${frame.focus.x}%`,
                          top: `${frame.focus.y}%`,
                          width: `${frame.focus.w}%`,
                          height: `${frame.focus.h}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <ol className={styles.swapProgress} aria-hidden="true">
                {method.steps.map((step, index) => (
                  <li key={step.title} data-swap-dot>
                    <span>{pad(index + 1)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <figcaption>{method.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="tensai-closing" data-curtain>
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
        {/* The name, outlined, fills with ink from left to right as it rises (scrollFill). */}
        <p className={styles.closingMark} aria-hidden="true" data-scroll-fill>
          <span className={styles.closingMarkLine}>Tensai</span>
          <span className={styles.closingMarkFill}>Tensai</span>
        </p>
      </section>
    </div>
  )
}
