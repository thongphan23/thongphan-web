import type { Metadata } from 'next'
import FieldNotes from '@/components/two-path/FieldNotes'
import FounderLetter from '@/components/two-path/FounderLetter'
import PathDoors from '@/components/two-path/PathDoors'
import PathResume from '@/components/two-path/PathResume'
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
    <div className={styles.page} data-motion-tempo="calm">
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroMedia}>
          <div className={styles.heroPhoto} data-motion-parallax data-parallax-max="12">
            <HeroPicture id={homeContent.hero.photoId} mobileId={homeContent.hero.mobilePhotoId} />
          </div>
          <div className={styles.heroShade} aria-hidden="true" />
        </div>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{homeContent.eyebrow}</p>
          <h1 id="home-title" className={styles.title}>
            {titleLead} <em>{titleQuestion}</em>
          </h1>
          <PathResume copy={homeContent.resume} />
          <PathDoors variant="hero" placement="door" />
        </div>
      </section>

      <div className={styles.afterHero}>
        <FounderLetter />
      </div>

      <FieldNotes />

      <section className={styles.closing} aria-labelledby="home-closing-title">
        <div className={styles.closingInner}>
          <h2 id="home-closing-title" className={styles.closingTitle} data-motion-reveal="mask">
            {homeContent.closing.title}
          </h2>
          <PathDoors variant="closing" placement="closing" />
        </div>
      </section>
    </div>
  )
}
