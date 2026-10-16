import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import JsonLd from '@/components/seo/JsonLd'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import TensaiHeroFx from '@/components/two-path/TensaiHeroFx'
import TensaiLesson, { TensaiLessonReplay } from '@/components/two-path/TensaiLesson'
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
          <h1 id="tensai-title" className={styles.title} style={{ '--intro-base': '0.06s' } as CSSProperties}>
            <SplitWords text={titleHead} />{' '}
            {/* Where motion runs, the guide's pen rings the word once the title is in (in place of the marker). */}
            <em data-pen="circle" data-pen-tone="lime" data-pen-width="6" data-pen-trigger="load" data-pen-delay="950">
              <SplitWords text={accent} start={wordCount(titleHead)} />
            </em>{' '}
            <SplitWords text={titleTail} start={wordCount(titleHead) + wordCount(accent)} />
          </h1>
          {/* On wide screens the headline runs the full width above; the words under it and the card
              share the row below, a clear gap under the headline's last line. */}
          <div className={styles.heroBody}>
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
              data-cursor="Mở"
              data-cursor-tone="ink"
            >
              <span className={styles.ctaInner} data-magnetic-inner>
                {tensaiContent.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </span>
            </PathLink>
            <a
              href={tensaiContent.secondaryCta.href}
              className={styles.secondaryLink}
              data-cursor="Xem"
              data-cursor-tone="ink"
            >
              {tensaiContent.secondaryCta.label}
            </a>
          </div>
          <p className={`${styles.launchNote} intro-fade`} style={{ '--intro-delay': '0.8s' } as CSSProperties}>
            {tensaiContent.launchNote}
          </p>
          </div>
        </div>
        {/* The card is real text and real choices, not a screenshot: it stays sharp at any scale and
            answers the way the app does. The pointer leans it a little (data-tilt) and a soft light
            follows it across the face. */}
        <div className={styles.lessonSlot}>
          <span className={styles.heroGlow} aria-hidden="true" data-lesson-glow />
          <div
            className={styles.lessonCard}
            data-lesson-card
            data-cursor={tensaiContent.lesson.cursorTry}
            data-cursor-tone="ink"
          >
            <div className={styles.lessonTilt} data-tilt="6">
              <div className={styles.cardEnter}>
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
                the held column keeps pace with the cards (situationPile marks data-current). */}
            <ol className={styles.situationRail} data-stack-rail aria-hidden="true">
              {situations.items.map((item, index) => (
                <li
                  key={item.course}
                  {...(index === 0
                    ? { 'data-pen': 'arrow', 'data-pen-tone': 'lime', 'data-pen-width': '4', 'data-pen-to': '[data-stack-card]', 'data-pen-start': 'top 60%', 'data-pen-end': 'top 20%' }
                    : {})}
                >
                  <span>{pad(index + 1)}</span>
                  Khóa {item.course}
                </li>
              ))}
            </ol>
          </div>
          {/* Each problem is a card in one pile held under the heading: only the card on top is drawn
              whole, the ones under it show as edges, and the next one stays out of sight until its
              hand-over (situationPile in tensai-stage.ts; the track sets how long the pile holds). */}
          <div className={styles.stackTrack} data-situation-track>
            <ol className={styles.situations} data-situation-stack>
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
          {/* Each row carries its course's map inline as a segmented bar (a segment per lesson, a starred
              gate after each run), drawn from the lesson and gate counts, so touch reads the same facts.
              With a fine pointer the row opens a little and a preview card follows the pointer: the
              course's path at full size and, where the repo holds a real screen of that course, that
              screen (tensai-stage.ts sets --px/--py). */}
          <ul className={styles.courses} data-reveal-children data-stagger="0.12">
            {courses.items.map((course, index) => {
              const previewPhoto = 'previewPhotoId' in course ? course.previewPhotoId : undefined
              return (
              <li key={course.name} className={styles.course}>
                <PathLink
                  path="tensai"
                  kind="outbound"
                  placement="page"
                  className={styles.courseLink}
                  data-course-row
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
                  <div className={styles.courseMeta} data-course-meta>
                    <p className={styles.courseCounts}>
                      <span>
                        <strong>{course.lessonCount}</strong> bài
                      </span>
                      <span>
                        <strong>{course.gateCount}</strong> màn vượt ải
                      </span>
                    </p>
                    {/* The segments fill in turn while the row is lit (--n staggers them). */}
                    <span className={styles.segBar} aria-hidden="true">
                      {courseMap(course.lessonCount, course.gateCount).map((kind, n) =>
                        kind === 'gate' ? (
                          <b key={n} className={styles.segGate} style={{ '--n': n } as CSSProperties}>
                            <Star size={10} strokeWidth={2.4} fill="currentColor" />
                          </b>
                        ) : (
                          <i key={n} className={styles.seg} style={{ '--n': n } as CSSProperties} />
                        ),
                      )}
                    </span>
                    <span className={styles.courseOpens}>Mở từ {course.opensOn}</span>
                  </div>
                  <ArrowUpRight className={styles.courseArrow} aria-hidden="true" size={28} strokeWidth={2.25} />
                  <span className={styles.coursePreview} aria-hidden="true" data-course-preview>
                    {previewPhoto && (
                      <span className={styles.previewShot}>
                        <TwoPathPhoto id={previewPhoto} sizes="320px" decorative />
                      </span>
                    )}
                    <span className={styles.previewHead}>
                      <b>{course.name}</b>
                      <span>Mở từ {course.opensOn}</span>
                    </span>
                    <span className={styles.previewPath}>
                      {courseMap(course.lessonCount, course.gateCount).map((kind, n) =>
                        kind === 'gate' ? (
                          <b key={n} className={styles.previewGate}>
                            <Star size={12} strokeWidth={2.4} fill="currentColor" />
                          </b>
                        ) : (
                          <i key={n} className={styles.previewNode} />
                        ),
                      )}
                    </span>
                    <span className={styles.previewFoot}>
                      {course.lessonCount} bài · {course.gateCount} màn vượt ải
                    </span>
                  </span>
                </PathLink>
              </li>
              )
            })}
          </ul>
          <p className={styles.note}>{courses.note}</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.methodBand}`} aria-labelledby="tensai-method">
        {/* The device holds a live lesson window (real text of the Định vị course, played as a script)
            that moves to the step being read: the idea of the lesson, an answer picked and the app's
            reply, then the path to its gate. The steps are driven by an invisible track of spacers
            beside them (stickySwap marks data-swap-active); the real screens sit in the device's foot. */}
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
                <li key={step.title} className={styles.step}>
                  <div className={styles.stepCard}>
                    {/* The pen rings the number of the step being played, drawn as the step arrives
                        (guide-pen's "when" trigger, keyed on stickySwap and the window being in view). */}
                    <span
                      className={styles.stepNumber}
                      aria-hidden="true"
                      data-pen="circle"
                      data-pen-tone="lime"
                      data-pen-width="3"
                      data-pen-trigger="when"
                      data-pen-when={`[data-swap-active='${index}']:has([data-replay-in]) li:nth-child(${index + 1}) span`}
                    >
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
                <div className={styles.replayMedia} data-reveal-media>
                  <TensaiLessonReplay steps={method.steps} />
                </div>
              </div>
              {/* The app's real screens, one per step, the one being played ringed in lime and named
                  beside them in one line (the step's own title; the steps list already reads it out). */}
              <div className={styles.proofFoot}>
                <ol className={styles.proof}>
                  {method.frames.map((frame, index) => (
                    <li key={`${frame.photoId}-${index}`} className={styles.proofItem}>
                      <span className={styles.proofShot}>
                        <TwoPathPhoto id={frame.photoId} sizes="192px" />
                      </span>
                      <span className={styles.proofNum} aria-hidden="true">
                        {pad(index + 1)}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className={styles.proofLabels} aria-hidden="true">
                  {method.steps.map((step, index) => (
                    <span key={step.title} className={styles.proofLabel}>
                      <b>{pad(index + 1)}</b> {step.title}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <figcaption className={styles.methodCaption}>{method.caption}</figcaption>
          </figure>
          <div className={styles.swapTrack} aria-hidden="true">
            {method.steps.map((step) => (
              <span key={step.title} data-swap-step />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="tensai-closing" data-curtain>
        {/* The call arrives with the band rather than after it, rising a little as the band opens. */}
        <div className={`${styles.inner} ${styles.closingInner}`} data-closing-rise>
          <h2 id="tensai-closing" className={styles.closingTitle} data-pen="underline" data-pen-tone="ink" data-pen-start="top 90%" data-pen-end="top 55%">
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
              data-cursor="Mở"
              data-cursor-tone="ink"
            >
              <span className={styles.ctaInner} data-magnetic-inner>
                {tensaiContent.primaryCta}
                <ArrowRight aria-hidden="true" size={24} strokeWidth={2.75} />
              </span>
            </PathLink>
            <PathLink
              path="conan"
              kind="door"
              placement="page"
              className={styles.crossLink}
              data-magnetic="0.18"
              data-cursor="Sang Conan"
              data-cursor-tone="ink"
            >
              {closing.crossLink.label}
            </PathLink>
          </div>
          {/* The mark the page opened on, set upright at the band's edge like a seal under the call. */}
          <span className={styles.closingSeal} aria-hidden="true">
            {tensaiContent.portal.mark}
          </span>
        </div>
      </section>
    </div>
  )
}
