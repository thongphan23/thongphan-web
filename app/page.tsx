import type { Metadata } from 'next'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import FieldNotes from '@/components/two-path/FieldNotes'
import FounderLetter from '@/components/two-path/FounderLetter'
import GuideZoom from '@/components/two-path/GuideZoom'
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
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroMedia}>
          <div className={styles.heroPhoto} data-motion-parallax data-parallax-max="12" data-gl-photo data-gl-delay="2.2">
            <HeroPicture id={homeContent.hero.photoId} mobileId={homeContent.hero.mobilePhotoId} />
          </div>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroCurtain} aria-hidden="true" />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy} data-scroll-out="36">
            <p className={`${styles.eyebrow} intro-fade`}>{homeContent.eyebrow}</p>
            <h1 id="home-title" className={styles.title}>
              <SplitWords text={titleLead} />{' '}
              <em>
                <SplitWords text={titleQuestion} start={wordCount(titleLead)} />
              </em>
            </h1>
          </div>
          <PathResume copy={homeContent.resume} />
          <PathDoors variant="hero" placement="door" />
        </div>
        <p className={`${styles.scrollCue} intro-fade`} aria-hidden="true">
          <span>{homeContent.hero.scrollCue}</span>
          <span className={styles.scrollCueLine} />
        </p>
      </section>

      <div className={styles.afterHero}>
        <FounderLetter />
      </div>

      <GuideZoom />

      <PathMarquee />

      <FieldNotes />

      <RealWorkReel />

      <section className={styles.closing} aria-labelledby="home-closing-title">
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
