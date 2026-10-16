import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import JsonLd from '@/components/seo/JsonLd'
import ConanLensAuto from '@/components/two-path/ConanLensAuto'
import ConanStageNav from '@/components/two-path/ConanStageNav'
import MentorCards from '@/components/two-path/MentorCards'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import PhotoGallery from '@/components/two-path/PhotoGallery'
import TwoPathPhoto, { HeroPicture } from '@/components/two-path/TwoPathPhoto'
import twoPath from '@/components/two-path/TwoPath.module.css'
import { conanContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import { buildBranchPageStructuredData, createPageMetadata } from '@/lib/seo'
import styles from './page.module.css'

const description =
  'Conan School là cộng đồng cho người bắt đầu xây doanh nghiệp trong kỷ nguyên AI: hiểu khách hàng, thiết kế offer, xây sản phẩm thật và cải tiến với AI.'

export const metadata: Metadata = createPageMetadata({
  title: 'Conan School — Xây doanh nghiệp trong kỷ nguyên AI | Thông Phan',
  description,
  pathname: '/conan',
  image: '/images/two-path/conan-hero.webp',
})

const pad = (value: number) => String(value).padStart(2, '0')

// The era the school is built for is set apart in italics.
const accent = 'kỷ nguyên AI.'
const accentAt = conanContent.title.indexOf(accent)
const titleHead = conanContent.title.slice(0, accentAt).trimEnd()

// Each half of the stage band must be wider than the widest screen before it is doubled.
const BAND_REPEAT = 2
// The English row is set smaller, so it needs more turns to fill the same width.
const TERM_REPEAT = 4
// The class that opens the page closes it too, beside the call; none of the gallery's photos repeats.
const closingPhotoId = 'conan-hero'
// Two more classes take turns inside the letters of the hero; neither is a course thumbnail.
const heroCycleIds = ['gallery-katinat', 'gallery-content-flow-haus'] as const

export default function ConanPage() {
  const { principle, audiences, journey, gallery, mentors, closing } = conanContent
  const bandHalf = Array.from({ length: BAND_REPEAT }, () => journey.stages.map((stage) => stage.gloss)).flat()
  const termHalf = Array.from({ length: TERM_REPEAT }, () => journey.stages.map((stage) => stage.name)).flat()
  return (
    <div className={`${twoPath.branch} ${styles.page}`} data-path="conan" data-motion-stage>
      <PathMemory path="conan" />
      <JsonLd data={buildBranchPageStructuredData({ name: 'Conan School', description, pathname: '/conan' })} />

      <section className={styles.hero} aria-labelledby="conan-title" data-mask-flight>
        <div className={styles.heroMedia} data-cursor="Cuộn" data-cursor-tone="lacquer" data-lens-auto>
          {/* The drift wraps the photo, not the photo itself: the GL layer paints over the picture
              and would hide any motion given to it. */}
          <div className={styles.heroDrift}>
            {/* The frame holds the crop and the pointer pan: the parallax writes its own scale and
                translate on the photo inline, which would wipe any framing set there. */}
            <div className={styles.heroFrame}>
              <div className={styles.heroPhoto} data-motion-parallax data-parallax-max="12" data-gl-photo data-gl-delay="1.1">
                <HeroPicture id={conanContent.heroPhotoId} mobileId={conanContent.heroMobilePhotoId} className={styles.heroPicture} />
              </div>
            </div>
            {/* Wide screens only: the rooms inside the word cross-fade every few seconds. */}
            <div className={styles.heroCycle} aria-hidden="true">
              {heroCycleIds.map((id) => (
                <TwoPathPhoto key={id} id={id} sizes="100vw" decorative />
              ))}
            </div>
          </div>
          <div className={styles.heroShade} aria-hidden="true" data-mask-shade />
          <div className={styles.heroSheen} aria-hidden="true" data-mask-sheen />
          {/* The room is first seen through the letters of "Conan", then the camera flies through
              the stem of the a and the ink falls away: by the reader's scroll on wide screens
              (maskFlight in signatures.ts), on load elsewhere (page.module.css, heroMask). */}
          <div className={styles.heroMask} aria-hidden="true" data-mask-sheet />
          <div className={styles.heroOutline} aria-hidden="true" data-mask-outline />
          {/* The tag names whichever room is showing: the cycle captions take turns with the
              letters' cross-fade and are only shown where that cycle runs. */}
          <p className={styles.heroTag}>
            <span>{photo(conanContent.heroPhotoId).caption}</span>
            {heroCycleIds.map((id) => (
              <span key={id} aria-hidden="true">
                {photo(id).caption}
              </span>
            ))}
          </p>
        </div>
        <ConanLensAuto />
        <div className={styles.heroContent} data-mask-out>
          <div>
            <p className={`${styles.eyebrow} intro-fade`} style={{ '--intro-delay': '0.15s' } as CSSProperties}>
              {conanContent.eyebrow}
            </p>
            <h1 id="conan-title" className={styles.title} style={{ '--intro-base': '0.28s' } as CSSProperties}>
              <SplitWords text={titleHead} />{' '}
              <em>
                <SplitWords text={accent} start={wordCount(titleHead)} />
              </em>
            </h1>
          </div>
          <div className={styles.heroAside}>
            <p className={`${styles.lead} intro-fade`} style={{ '--intro-delay': '0.5s' } as CSSProperties}>
              {conanContent.lead}
            </p>
            <div className={`${styles.actions} intro-fade`} style={{ '--intro-delay': '0.62s' } as CSSProperties}>
              <PathLink
                path="conan"
                kind="outbound"
                placement="hero"
                className={styles.primaryCta}
                data-motion-action
                data-magnetic="0.22"
              >
                <span className={styles.ctaInner} data-magnetic-inner>
                  {conanContent.primaryCta}
                  <ArrowRight aria-hidden="true" size={18} />
                </span>
              </PathLink>
            </div>
          </div>
        </div>
      </section>

      {/* The school's rule beside a real class at work: the words light up as they are read while
          the photo opens from the right edge and drifts inside its frame. */}
      <section className={styles.principle} aria-labelledby="conan-principle">
        <div className={`${styles.inner} ${styles.principleGrid}`}>
          <figure className={styles.principleQuote}>
            <figcaption id="conan-principle" className={styles.sectionMark} data-motion-reveal="mask">
              {principle.source}
            </figcaption>
            <blockquote className={styles.quote}>
              <p data-scrub-words data-scrub-from="0.6" data-scrub-start="top bottom" data-scrub-end="top 85%">
                {principle.text}
              </p>
            </blockquote>
          </figure>
          <figure className={styles.principlePhoto} data-motion-surface>
            <div className={styles.principleFrame} data-img-reveal="right" data-parallax-frame="7">
              <div data-reveal-media>
                <TwoPathPhoto id={principle.photoId} sizes="(max-width: 999px) 80vw, 600px" />
              </div>
            </div>
            <figcaption className={styles.principleCaption}>{photo(principle.photoId).caption}</figcaption>
          </figure>
        </div>
      </section>

      {/* The paper is laid over the principle as a sheet (data-curtain="sheet"): the ink spread holds
          and dims while the page turns, instead of the two tones meeting at a straight edge. */}
      <section className={`${styles.section} ${styles.audiencesBand}`} aria-labelledby="conan-audiences" data-curtain="sheet">
        <div className={`${styles.inner} ${styles.audiencesGrid}`}>
          <div className={`${styles.sectionHead} ${styles.stickyHead}`}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              01 — Dành cho ai
            </p>
            <h2 id="conan-audiences" className={styles.sectionTitle} data-split>
              {audiences.title}
            </h2>
          </div>
          <ul className={styles.audiences}>
            {audiences.items.map((item, index) => (
              <li key={item.title} className={styles.audience}>
                <span className={styles.rowLine} data-draw-line aria-hidden="true" />
                <span className={styles.audienceIndex} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <h3 className={styles.audienceTitle} data-split>
                  {item.title}
                </h3>
                <p data-motion-reveal="drift">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Wide screens: the intro holds still on the left with a rolling stage counter while the
          five stages travel through the window on the right (data-hscroll on the stage list). */}
      <section
        className={styles.journey}
        aria-labelledby="conan-journey"
        data-hscroll
        data-hscroll-pace="0.86"
        data-hscroll-scrub="0.35"
        style={{ '--stage-count': journey.stages.length } as CSSProperties}
      >
        <div className={styles.journeyLayout}>
          <header className={styles.journeyIntro}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              02 — Hành trình
            </p>
            <h2 id="conan-journey" className={styles.journeyTitle} data-split>
              {journey.title}
            </h2>
            <p className={styles.journeyLead} data-motion-reveal="drift">
              {journey.lead}
            </p>
            <div className={styles.journeyMeter} aria-hidden="true">
              <span className={styles.meterCount}>
                <span className={styles.meterRoll}>
                  {journey.stages.map((stage, index) => (
                    <span key={stage.number} style={{ '--i': index } as CSSProperties}>
                      {stage.number}
                    </span>
                  ))}
                </span>
              </span>
              <span className={styles.meterTotal}>/ {pad(journey.stages.length)}</span>
              <span className={styles.meterName}>
                <span className={styles.meterRoll}>
                  {journey.stages.map((stage, index) => (
                    <span key={stage.number} style={{ '--i': index } as CSSProperties}>
                      {stage.gloss}
                    </span>
                  ))}
                </span>
              </span>
            </div>
            <ConanStageNav
              label="Các giai đoạn của hành trình"
              stages={journey.stages.map((stage) => ({ number: stage.number, gloss: stage.gloss, label: `Giai đoạn ${stage.number}: ${stage.gloss}` }))}
            />
          </header>
          <div className={styles.journeyWindow} data-cursor="Kéo" data-cursor-tone="light">
            <ol className={styles.stages} data-hscroll-track>
              {journey.stages.map((stage, index) => (
                <li key={stage.number} className={styles.stage} data-hscroll-item>
                  <span className={styles.stageBanner}>
                    <span>Giai đoạn {stage.number}</span>
                    <span className={styles.stageCount}>{stage.questions.length} câu hỏi</span>
                  </span>
                  <span className={styles.stageNumber} aria-hidden="true" data-hscroll-media>
                    {stage.number}
                  </span>
                  <h3 className={styles.stageName}>
                    <span className={styles.stageGloss}>{stage.gloss}</span>
                    <span className={styles.stageTerm} lang="en">
                      ({stage.name})
                    </span>
                  </h3>
                  <ul className={styles.questions}>
                    {stage.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                  {/* The card's foot, after the pager under a course card: how far along the five
                      stages this one is, and which comes next. */}
                  <span className={styles.stageFoot} aria-hidden="true">
                    <span className={styles.stagePips}>
                      {journey.stages.map((other, at) => (
                        <span key={other.number} data-on={at <= index ? '' : undefined} />
                      ))}
                    </span>
                    <span className={styles.stageNext}>
                      {journey.stages[index + 1] ? (
                        <>
                          Tiếp theo
                          <strong>{journey.stages[index + 1].gloss}</strong>
                        </>
                      ) : (
                        'Giai đoạn cuối'
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* The five stage names roll by once more as the journey lets go, a coda in the path colour
          between the ink of the journey and the paper of the mentors. */}
      <div className={styles.band} aria-hidden="true">
        <div className={styles.bandRow} data-marquee data-marquee-duration="40" data-velocity-skew>
          <div className={styles.bandTrack} data-marquee-track>
            {[...bandHalf, ...bandHalf].map((name, index) => (
              <span key={index} className={styles.bandWord}>
                {name}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.termRow} data-marquee="reverse" data-marquee-duration="56" lang="en">
          <div className={styles.bandTrack} data-marquee-track>
            {[...termHalf, ...termHalf].map((name, index) => (
              <span key={index} className={styles.termWord}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* data-scroll-fill: --fill runs 0 to 1 over the band, and the portraits warm into colour on it. */}
      <section className={`${styles.section} ${styles.mentorsBand}`} aria-labelledby="conan-mentors" data-scroll-fill>
        <div className={`${styles.inner} ${styles.mentorsInner}`}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              03 — Đi cùng bạn
            </p>
            <h2 id="conan-mentors" className={styles.sectionTitle} data-split>
              {mentors.title}
            </h2>
          </div>
          <MentorCards people={mentors.people} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.gallerySection}`} aria-labelledby="conan-gallery">
        <div className={styles.wideInner}>
          <PhotoGallery
            items={gallery.items}
            pace={0.12}
            head={
              <div className={`${styles.sectionHead} ${styles.galleryHead}`}>
                <p className={styles.sectionMark} data-motion-reveal="mask">
                  04 — Lớp học thật
                </p>
                <h2 id="conan-gallery" className={styles.sectionTitle} data-split>
                  {gallery.title}
                </h2>
              </div>
            }
          />
        </div>
      </section>

      {/* data-scroll-fill on the whole field: the name fills while the field rises, so it reads whole
          by the time the reader reaches the foot of the page. */}
      <section className={styles.closing} aria-labelledby="conan-closing" data-curtain data-scroll-fill>
        <div className={`${styles.inner} ${styles.closingInner}`}>
          <div className={styles.closingCopy}>
            {/* No line reveal here: the field arrives through its curtain, and the call must be on it
                from the first strip of colour, never an empty block of vermilion. */}
            <h2 id="conan-closing" className={styles.closingTitle}>
              {closing.title}
            </h2>
            <div className={styles.actions}>
              <PathLink
                path="conan"
                kind="outbound"
                placement="closing"
                className={styles.primaryCta}
                data-motion-action
                data-magnetic="0.3"
              >
                <span className={styles.ctaInner} data-magnetic-inner>
                  {conanContent.primaryCta}
                  <ArrowRight aria-hidden="true" size={18} />
                </span>
              </PathLink>
              <PathLink path="tensai" kind="door" placement="page" className={styles.crossLink}>
                {closing.crossLink.label}
              </PathLink>
            </div>
          </div>
          {/* The same people who open the page close it. */}
          <figure className={styles.closingPhoto} data-motion-surface>
            <div className={styles.closingFrame} data-img-reveal="left" data-parallax-frame="6">
              <div data-reveal-media>
                <TwoPathPhoto id={closingPhotoId} sizes="(max-width: 999px) 92vw, 560px" />
              </div>
            </div>
            <figcaption className={styles.closingCaption}>{photo(closingPhotoId).caption}</figcaption>
          </figure>
        </div>
        <p className={styles.closingMark} aria-hidden="true">
          <span className={styles.closingMarkLine}>Conan</span>
          <span className={styles.closingMarkFill}>Conan</span>
        </p>
      </section>
    </div>
  )
}
