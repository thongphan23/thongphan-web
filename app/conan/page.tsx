import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import JsonLd from '@/components/seo/JsonLd'
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

export default function ConanPage() {
  const { principle, audiences, journey, gallery, mentors, closing } = conanContent
  const bandHalf = Array.from({ length: BAND_REPEAT }, () => journey.stages.map((stage) => stage.name)).flat()
  return (
    <div className={`${twoPath.branch} ${styles.page}`} data-path="conan" data-motion-stage>
      <PathMemory path="conan" />
      <JsonLd data={buildBranchPageStructuredData({ name: 'Conan School', description, pathname: '/conan' })} />

      <section className={styles.hero} aria-labelledby="conan-title">
        <div className={styles.heroMedia}>
          <div className={styles.heroPhoto} data-motion-parallax data-parallax-max="12" data-gl-photo data-gl-delay="2.4">
            <HeroPicture id={conanContent.heroPhotoId} mobileId={conanContent.heroMobilePhotoId} className={styles.heroPicture} />
          </div>
          <div className={styles.heroShade} aria-hidden="true" />
          {/* Load: the room is first seen through the letters of "Conan", then the camera flies
              through the stem of the a and the ink falls away (page.module.css, heroMask). */}
          <div className={styles.heroMask} aria-hidden="true" />
        </div>
        <div className={styles.heroContent} data-scroll-out="22">
          <div>
            <p className={`${styles.eyebrow} intro-fade`} style={{ '--intro-delay': '1.35s' } as CSSProperties}>
              {conanContent.eyebrow}
            </p>
            <h1 id="conan-title" className={styles.title} style={{ '--intro-base': '1.45s' } as CSSProperties}>
              <SplitWords text={titleHead} />{' '}
              <em>
                <SplitWords text={accent} start={wordCount(titleHead)} />
              </em>
            </h1>
          </div>
          <div className={styles.heroAside}>
            <p className={`${styles.lead} intro-fade`} style={{ '--intro-delay': '1.75s' } as CSSProperties}>
              {conanContent.lead}
            </p>
            <div className={`${styles.actions} intro-fade`} style={{ '--intro-delay': '1.9s' } as CSSProperties}>
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
              <p data-scrub-words>{principle.text}</p>
            </blockquote>
          </figure>
          <figure className={styles.principlePhoto} data-motion-surface>
            <div className={styles.principleFrame} data-img-reveal="right" data-parallax-frame="7">
              <div data-reveal-media>
                <TwoPathPhoto id={principle.photoId} sizes="(max-width: 999px) 80vw, 440px" />
              </div>
            </div>
            <figcaption className={styles.principleCaption}>{photo(principle.photoId).caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="conan-audiences">
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
      </div>

      {/* Wide screens: the intro holds still on the left with a rolling stage counter while the
          five stages travel through the window on the right (data-hscroll on the stage list). */}
      <section
        className={styles.journey}
        aria-labelledby="conan-journey"
        data-hscroll
        data-hscroll-pace="1.7"
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
                  {journey.stages.map((stage) => (
                    <span key={stage.number}>{stage.number}</span>
                  ))}
                </span>
              </span>
              <span className={styles.meterTotal}>/ {pad(journey.stages.length)}</span>
              <span className={styles.meterName}>
                <span className={styles.meterRoll}>
                  {journey.stages.map((stage) => (
                    <span key={stage.number}>{stage.name}</span>
                  ))}
                </span>
              </span>
              <span className={styles.journeyProgress}>
                <span />
              </span>
            </div>
          </header>
          <div className={styles.journeyWindow}>
            <ol className={styles.stages} data-hscroll-track>
              {journey.stages.map((stage) => (
                <li key={stage.number} className={styles.stage} data-hscroll-item>
                  <span className={styles.stageNumber} aria-hidden="true" data-hscroll-media>
                    {stage.number}
                  </span>
                  <h3 className={styles.stageName}>{stage.name}</h3>
                  <ul className={styles.questions}>
                    {stage.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="conan-gallery">
        <div className={styles.wideInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              03 — Lớp học thật
            </p>
            <h2 id="conan-gallery" className={styles.sectionTitle} data-split>
              {gallery.title}
            </h2>
          </div>
          <PhotoGallery items={gallery.items} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.mentorsBand}`} aria-labelledby="conan-mentors">
        <div className={`${styles.inner} ${styles.mentorsInner}`}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionMark} data-motion-reveal="mask">
              04 — Người dẫn đường
            </p>
            <h2 id="conan-mentors" className={styles.sectionTitle} data-split>
              {mentors.title}
            </h2>
          </div>
          <MentorCards people={mentors.people} />
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="conan-closing" data-curtain>
        <div className={`${styles.inner} ${styles.closingInner}`}>
          <h2 id="conan-closing" className={styles.closingTitle} data-split>
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
        <p className={styles.closingMark} aria-hidden="true" data-speed="-0.12">
          Conan
        </p>
      </section>
    </div>
  )
}
