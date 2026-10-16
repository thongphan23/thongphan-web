import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import JsonLd from '@/components/seo/JsonLd'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import TensaiHeroFx from '@/components/two-path/TensaiHeroFx'
import TensaiLesson from '@/components/two-path/TensaiLesson'
import TwoPathPhoto from '@/components/two-path/TwoPathPhoto'
import twoPath from '@/components/two-path/TwoPath.module.css'
import { tensaiContent } from '@/lib/two-path-content'
import { buildBranchPageStructuredData, createPageMetadata } from '@/lib/seo'
import { TENSAI_URL } from '@/lib/two-path-links'
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

// A course's map, flattened into one row the way the app draws it: a node per lesson and a gate
// after every run of lessons, from the course's own counts (lib/two-path-content.ts).
const courseMap = (lessons: number, gates: number) => {
  const run = Math.max(1, Math.round(lessons / Math.max(1, gates)))
  return Array.from({ length: lessons }, (_, n) => ((n + 1) % run === 0 ? ['lesson', 'gate'] : ['lesson'])).flat()
}

// "Thiên tài" is what Tensai means, so the headline sets it apart in italics.
const accent = 'thiên tài'
const accentAt = tensaiContent.title.indexOf(accent)
const titleHead = tensaiContent.title.slice(0, accentAt).trimEnd()
const titleTail = tensaiContent.title.slice(accentAt + accent.length).trimStart()

// The words of each problem that a lime marker sweeps under as its card takes the top of the pile. They
// only pick words out of the problem's own text (lib/two-path-content.ts); one that is not found there
// is simply not marked.
const problemHits = ['bằng tay', 'không chắc nó đúng', 'khác người'] as const

function ProblemText({ text, hit }: { text: string; hit?: string }) {
  const at = hit ? text.indexOf(hit) : -1
  if (!hit || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className={styles.hit} data-problem-hit>
        {hit}
      </span>
      {text.slice(at + hit.length)}
    </>
  )
}

// How each real screen of the method sits in the device. A crop is a window on the 1120 x 1013 screen,
// in the screen's own pixels: its left and top edge and its width (the height follows from the frame).
// `d` is the wide frame (1120 x 700 in shape, about 900px wide), `m` the phone frame (1120 x 1013 in
// shape). Every wide window is cut in the gaps between the app's lines, never through a word: the
// lesson's heading, explanation and its three questions; the exercise's question, case and both
// answers; the map's next-lesson card, the three-star note and "Cứ 3 bài, một màn vượt ải." On a
// phone the frame is about 330px wide, so each window is cut deeper still: the heading of the first
// screen, the case and both answers of the second (the screen ends below them) and the map's note of
// the third. Where a window cuts a line at its
// side, the CSS fades that side out. The map's wide window starts right of the mascot's line and runs
// past the screen's right edge into the frame's paper, which is the screen's own paper colour.
const SCREEN = { w: 1120, h: 1013 }
const methodCrops = [
  { d: { x: 0, y: 0, w: 1120 }, m: { x: 0, y: 0, w: 590 } },
  { d: { x: 0, y: 182, w: 1120 }, m: { x: 0, y: 416, w: 590 } },
  { d: { x: 624, y: 606, w: 560 }, m: { x: 700, y: 736, w: 300 } },
] as const

const cropVars = (crop: (typeof methodCrops)[number]) =>
  ({
    '--ds': SCREEN.w / crop.d.w,
    '--dx': (crop.d.x / SCREEN.w) * 100,
    '--dy': (crop.d.y / SCREEN.h) * 100,
    '--ms': SCREEN.w / crop.m.w,
    '--mx': (crop.m.x / SCREEN.w) * 100,
    '--my': (crop.m.y / SCREEN.h) * 100,
  }) as CSSProperties

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
        <TensaiHeroFx />
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
            answers the way the app does. The pointer leans it a little (data-tilt) and a soft light
            follows it across the face. */}
        <div className={styles.lessonSlot}>
          <span className={styles.heroGlow} aria-hidden="true" data-lesson-glow />
          <div className={styles.lessonCard} data-lesson-card>
            <div className={styles.lessonTilt} data-tilt="6">
              <div className="intro-fade" style={{ '--intro-delay': '0.35s' } as CSSProperties}>
                <TensaiLesson />
              </div>
            </div>
          </div>
        </div>
        {/* 天才, the word Tensai comes from, grows with the sheet as it opens, so a stop mid-scroll
            shows a mark, not an empty panel. */}
        <div className={styles.portal} data-lesson-portal aria-hidden="true">
          <div className={styles.portalRise} data-lesson-portal-rise>
            <span className={styles.portalMark} data-lesson-portal-mark>
              <span className={styles.portalGlyph} data-kanji-write>{tensaiContent.portal.mark}</span>
              <span className={styles.portalGloss}>{tensaiContent.portal.gloss}</span>
            </span>
            <span className={styles.portalPromise} data-lesson-portal-promise>
              {tensaiContent.title}
            </span>
          </div>
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
            {/* Where you are in the three: a numeral that rolls and a segment bar that fills as each
                card takes the top of the pile. It reads the rail's data-current, so it only shows
                where that is driven (html.motion). */}
            <div className={styles.counter} aria-hidden="true">
              <span className={styles.counterRoll}>
                {situations.items.map((item, index) => (
                  <span key={item.course} className={styles.counterNum}>
                    {pad(index + 1)}
                  </span>
                ))}
              </span>
              <span className={styles.counterSide}>
                <span className={styles.counterTotal}>/ {pad(situations.items.length)}</span>
                <span className={styles.counterBar}>
                  {situations.items.map((item) => (
                    <i key={item.course} />
                  ))}
                </span>
              </span>
            </div>
            {/* The course each card leads to, lit in turn as its card takes the top of the pile, so
                the held column keeps pace with the cards (stackCards marks data-current). */}
            <ol className={styles.situationRail} data-stack-rail aria-hidden="true">
              {situations.items.map((item, index) => (
                <li key={item.course}>
                  <span>{pad(index + 1)}</span>
                  Khóa {item.course}
                </li>
              ))}
            </ol>
          </div>
          {/* Each problem is a card that holds under the heading while the next one slides over it,
              so the three read as a pile the reader works through (stackCards in engine.ts). */}
          <ol
            className={styles.situations}
            data-stack
            data-stack-scale="0.94"
            data-stack-opacity="1"
            data-stack-dim="0.9"
            data-stack-start="top 55%"
          >
            {situations.items.map((item, index) => {
              const course = courses.items.find((entry) => entry.name === item.course)
              return (
              <li
                key={item.course}
                className={styles.situation}
                data-stack-card
                style={{ '--stack-i': index } as CSSProperties}
              >
                <div className={styles.situationTop}>
                  <p className={styles.situationCount} aria-hidden="true">
                    <span className={styles.situationIndex}>{pad(index + 1)}</span>
                    <span className={styles.situationTotal}>/ {pad(situations.items.length)}</span>
                  </p>
                  <p className={styles.situationCourse}>Khóa {item.course}</p>
                </div>
                <p className={styles.problem} data-scrub-words data-scrub-from="0.72" data-scrub-end="top 78%">
                  <ProblemText text={item.problem} hit={problemHits[index]} />
                </p>
                <div className={styles.situationAnswer}>
                  <ul className={styles.lessons}>
                    {item.lessons.map((lesson) => (
                      <li key={lesson}>
                        {/* The app's own lesson node, a green disc with a star, so the row reads as a
                            lesson of the course and not as a bullet. */}
                        <span className={styles.lessonNode} aria-hidden="true">
                          <Star size={14} strokeWidth={2.2} fill="currentColor" />
                        </span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                  {/* The course behind the card, drawn as its map: every lesson a node, a starred gate
                      after each run, then the same counts in words. The nodes light in turn as the card
                      comes up (tensai-stage.ts). */}
                  {course && (
                    <div className={styles.situationMap}>
                      <ol className={styles.mapTrack} aria-hidden="true" data-situation-map>
                        {courseMap(course.lessonCount, course.gateCount).map((kind, n) => (
                          <li key={n} className={kind === 'gate' ? styles.mapGate : styles.mapNode}>
                            {kind === 'gate' && <Star size={12} strokeWidth={2.4} fill="currentColor" />}
                          </li>
                        ))}
                      </ol>
                      <p className={styles.mapMeta}>
                        {course.lessonCount} bài · {course.gateCount} màn vượt ải · Mở từ {course.opensOn}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            )
            })}
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
                      <strong>{course.lessonCount}</strong> bài
                    </span>
                    <span className={styles.courseStat}>
                      <strong>{course.gateCount}</strong> màn vượt ải
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
                  {/* On wide screens the words hold beside the screen for as long as their step is on,
                      then slide up as the next step's words arrive. */}
                  <div className={styles.stepCard}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {pad(index + 1)}
                    </span>
                    <p className={styles.stepTitle}>{step.title}</p>
                    <p className={styles.stepBody}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <figure className={styles.methodFigure}>
            {/* The real screens sit in a dark device: a title bar, the screen with a ring and a callout
                on the part each step is about, and a foot that holds the step marks, so nothing
                floats loose beside the picture. */}
            <div className={styles.device}>
              <div className={styles.deviceBar} aria-hidden="true">
                <span className={styles.deviceDots}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className={styles.deviceUrl}>{new URL(TENSAI_URL).host}</span>
              </div>
              <div className={styles.methodFrame} data-img-reveal="center">
                <div className={styles.swapLayers} data-reveal-media>
                  {method.frames.map((frame, index) => (
                    <div key={`${frame.photoId}-${index}`} className={styles.swapLayer} data-swap-layer>
                      <div className={styles.swapCanvas} style={cropVars(methodCrops[index])}>
                        <TwoPathPhoto id={frame.photoId} sizes="(max-width: 959px) 100vw, 900px" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.deviceFoot}>
                <ol className={styles.swapProgress} aria-hidden="true">
                  {method.steps.map((step, index) => (
                    <li key={step.title} data-swap-dot>
                      <span>{pad(index + 1)}</span>
                    </li>
                  ))}
                </ol>
                <span className={styles.swapNow} aria-hidden="true">
                  {method.steps.map((step) => (
                    <span key={step.title}>{step.title}</span>
                  ))}
                </span>
              </div>
            </div>
            <figcaption className={styles.methodCaption}>{method.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="tensai-closing" data-curtain>
        {/* The call arrives with the band rather than after it, rising a little as the band opens. */}
        <div className={`${styles.inner} ${styles.closingInner}`} data-closing-rise>
          <h2 id="tensai-closing" className={styles.closingTitle}>
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
