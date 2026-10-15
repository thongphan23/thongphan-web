import type { Metadata } from 'next'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import FieldNotes from '@/components/two-path/FieldNotes'
import FounderLetter from '@/components/two-path/FounderLetter'
import GuideZoom from '@/components/two-path/GuideZoom'
import HeroStageFx from '@/components/two-path/HeroStageFx'
import PathDoors from '@/components/two-path/PathDoors'
import PathMarquee from '@/components/two-path/PathMarquee'
import PathResume from '@/components/two-path/PathResume'
import RealWorkReel from '@/components/two-path/RealWorkReel'
import { HeroPicture } from '@/components/two-path/TwoPathPhoto'
import { homeContent } from '@/lib/two-path-content'
import { createPageMetadata } from '@/lib/seo'
import styles from './home.module.css'

export const metadata: Metadata = createPageMetadata({
  title: 'Thông Phan — Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI',
  description:
    'Người đi làm học dùng AI cho việc thật mỗi ngày cùng Tensai. Người đang hoặc muốn kinh doanh xây doanh nghiệp trong kỷ nguyên AI cùng Conan School.',
  pathname: '/',
  image: '/images/two-path/home-hero.webp',
})

// The question after the first sentence is set in italics on its own line.
const titleBreak = homeContent.title.indexOf('. ') + 1
const titleLead = homeContent.title.slice(0, titleBreak)
const titleQuestion = homeContent.title.slice(titleBreak + 1)

export default function HomePage() {
  return (
    <div className={styles.page} data-motion-stage>
      {/* The stage: Thông stands in front of his own name. The engine (signatures.ts) moves the
          layers and the light with the pointer and parts the name as the reader scrolls away. */}
      <section className={styles.hero} aria-labelledby="home-title" data-stage>
        <HeroStageFx />
        <div className={styles.stage} aria-hidden="true">
          <span className={styles.stageAura} data-stage-aura="tensai" />
          <span className={styles.stageAura} data-stage-aura="conan" />
          <p className={styles.masthead} data-stage-depth="-0.5">
            <span className={styles.mastheadPart} data-stage-part="left">
              <span className={styles.mastheadWord}>Thông</span>
            </span>
            <span className={styles.mastheadPart} data-stage-part="right">
              <span className={styles.mastheadWord}>Phan</span>
            </span>
          </p>
        </div>
        <div className={styles.stagePerson} data-stage-depth="1">
          <div className={styles.stagePersonInner} data-stage-person>
            <HeroPicture id={homeContent.hero.photoId} mobileId={homeContent.hero.mobilePhotoId} className={styles.stagePicture} />
            <span className={styles.stageSpot} aria-hidden="true" />
            <span className={styles.stageLamp} aria-hidden="true" />
            <span className={styles.stageLight} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.stageFloor} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroCopy} data-scroll-out="24">
            <p className={`${styles.eyebrow} intro-fade`}>{homeContent.eyebrow}</p>
            <h1 id="home-title" className={styles.title}>
              <span className={styles.titleLead}>
                <SplitWords text={titleLead} />
              </span>{' '}
              <em>
                <SplitWords text={titleQuestion} start={wordCount(titleLead)} />
              </em>
            </h1>
          </div>
          <PathDoors variant="hero" placement="door" />
          <div className={styles.resumeDock}>
            <PathResume copy={homeContent.resume} />
          </div>
        </div>
        <p className={`${styles.scrollCue} intro-fade`} aria-hidden="true">
          <span>{homeContent.hero.scrollCue}</span>
          <span className={styles.scrollCueLine} />
        </p>
      </section>

      <div className={styles.afterHero} data-curtain="sheet">
        <FounderLetter />
      </div>

      <GuideZoom />

      <PathMarquee />

      <FieldNotes />

      <RealWorkReel />

      <section className={styles.closing} aria-labelledby="home-closing-title" data-curtain>
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow} data-motion-reveal="mask">
            {homeContent.closing.eyebrow}
          </p>
          <h2 id="home-closing-title" className={styles.closingTitle} data-split>
            {homeContent.closing.title}
          </h2>
          <PathDoors variant="closing" placement="closing" />
        </div>
      </section>
    </div>
  )
}
