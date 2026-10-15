import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import JsonLd from '@/components/seo/JsonLd'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import TensaiTryCard from '@/components/two-path/TensaiTryCard'
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
  // The hero screen is the Định vị map, so its callout quotes that course's own counts.
  const mapCourse = courses.items.find((course) => course.name === 'Định vị') ?? courses.items[0]
  return (
    <div className={`${twoPath.branch} ${styles.page}`} data-path="tensai" data-motion-stage>
      <PathMemory path="tensai" />
      <JsonLd data={buildBranchPageStructuredData({ name: 'Tensai', description, pathname: '/tensai' })} />

      {/* The stage: the real app floats as a tilted screen; on wide screens the hero pins while the
          screen squares up and moves to the centre (deviceStage in signatures.ts). 天才, the word
          Tensai comes from, stands beside it. */}
      <section className={styles.hero} aria-labelledby="tensai-title" data-device-stage>
        <p className={`${styles.kanji} intro-fade`} aria-hidden="true" data-device-aside>
          <span className={styles.kanjiChar} data-speed="0.12">
            天
          </span>
          <span className={styles.kanjiChar} data-speed="0.26">
            才
          </span>
          <span className={styles.kanjiGloss}>Tensai · thiên tài</span>
        </p>
        <div className={styles.heroText} data-device-words>
          <p className={`${styles.eyebrow} intro-fade`}>{tensaiContent.eyebrow}</p>
          <h1 id="tensai-title" className={styles.title}>
            <SplitWords text={titleHead} />{' '}
            <em>
              <SplitWords text={accent} start={wordCount(titleHead)} />
            </em>{' '}
            <SplitWords text={titleTail} start={wordCount(titleHead) + wordCount(accent)} />
          </h1>
          <p className={`${styles.lead} intro-fade`} style={{ '--intro-delay': '0.85s' } as CSSProperties}>
            {tensaiContent.lead}
          </p>
          <div className={`${styles.actions} intro-fade`} style={{ '--intro-delay': '1s' } as CSSProperties}>
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
          <p className={`${styles.launchNote} intro-fade`} style={{ '--intro-delay': '1.15s' } as CSSProperties}>
            {tensaiContent.launchNote}
          </p>
        </div>
        {/* Three depths: the map screen at the back, a real lesson question lifted out of the app in
            front (it can be answered), and two facts floating between. The pointer separates them
            (data-depth); on wide screens the question rises into place during the pinned scroll. */}
        <figure className={styles.heroFigure} data-depth-stage data-device-figure>
          <span className={styles.heroGlow} aria-hidden="true" />
          <div data-depth="0.3">
            <div className={styles.device} data-device>
              <div className={`${styles.heroFrame} intro-clip`} data-tilt="7">
                <TwoPathPhoto
                  id={tensaiContent.heroPhotoId}
                  priority
                  sizes="(max-width: 959px) 100vw, 860px"
                  className={styles.heroImage}
                />
                <span className={styles.heroGlare} aria-hidden="true" />
              </div>
            </div>
          </div>
          {/* data-speed moves the outer chip, so the intro runs on the inner one (GSAP folds a CSS
              translate on the element it drives into its own transform). */}
          <p
            className={`${styles.callout} ${styles.calloutCourse}`}
            aria-hidden="true"
            data-speed="-0.1"
            data-device-drift="-0.1"
          >
            <span className={styles.depthLayer} data-depth="0.7">
              <span className={`${styles.calloutInner} intro-fade`} style={{ '--intro-delay': '1.1s' } as CSSProperties}>
                <span className={styles.calloutDot} />
                Khóa {mapCourse.name} · {mapCourse.lessonCount} bài · {mapCourse.gateCount} màn vượt ải
              </span>
            </span>
          </p>
          <p
            className={`${styles.callout} ${styles.calloutGate}`}
            aria-hidden="true"
            data-speed="0.14"
            data-device-drift="0.05"
          >
            <span className={styles.depthLayer} data-depth="0.9">
              <span className={`${styles.calloutInner} intro-fade`} style={{ '--intro-delay': '1.3s' } as CSSProperties}>
                <Star size={16} strokeWidth={2.2} />
                {tensaiContent.heroCallout}
              </span>
            </span>
          </p>
          <div className={styles.tryCard} data-device-card>
            <div data-depth="1.2">
              <div className="intro-fade" style={{ '--intro-delay': '1.45s' } as CSSProperties}>
                <TensaiTryCard />
              </div>
            </div>
          </div>
          <figcaption className="intro-fade">{photo(tensaiContent.heroPhotoId).caption}</figcaption>
        </figure>
      </section>

      <section className={`${styles.section} ${styles.situationsBand}`} aria-labelledby="tensai-situations" data-curtain>
        <div className={`${styles.inner} ${styles.situationsGrid}`}>
          <div className={`${styles.sectionHead} ${styles.stickyHead}`}>
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
