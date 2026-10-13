import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import MentorCards from '@/components/two-path/MentorCards'
import PathLink from '@/components/two-path/PathLink'
import PathMemory from '@/components/two-path/PathMemory'
import PhotoGallery from '@/components/two-path/PhotoGallery'
import { HeroPicture } from '@/components/two-path/TwoPathPhoto'
import twoPath from '@/components/two-path/TwoPath.module.css'
import { conanContent } from '@/lib/two-path-content'
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

export default function ConanPage() {
  const { principle, audiences, journey, gallery, mentors, closing } = conanContent
  return (
    <div className={`${twoPath.branch} ${styles.page}`} data-path="conan" data-motion-tempo="calm">
      <PathMemory path="conan" />
      <JsonLd data={buildBranchPageStructuredData({ name: 'Conan School', description, pathname: '/conan' })} />

      <section className={styles.hero} aria-labelledby="conan-title">
        <div className={styles.heroMedia}>
          <HeroPicture id={conanContent.heroPhotoId} mobileId={conanContent.heroMobilePhotoId} className={styles.heroPicture} />
          <div className={styles.heroShade} aria-hidden="true" />
        </div>
        <div className={styles.heroContent}>
          <div>
            <p className={styles.eyebrow}>{conanContent.eyebrow}</p>
            <h1 id="conan-title" className={styles.title}>
              {conanContent.title}
            </h1>
          </div>
          <div>
            <p className={styles.lead}>{conanContent.lead}</p>
            <div className={styles.actions}>
              <PathLink path="conan" kind="outbound" placement="hero" className={styles.primaryCta} data-motion-action>
                {conanContent.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </PathLink>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.principle} aria-label={principle.source}>
        <figure className={styles.inner}>
          <blockquote className={styles.quote} data-motion-reveal="mask">
            <p>{principle.text}</p>
          </blockquote>
          <figcaption className={styles.quoteSource}>{principle.source}</figcaption>
        </figure>
      </section>

      <section className={styles.section} aria-labelledby="conan-audiences">
        <div className={styles.inner}>
          <h2 id="conan-audiences" className={styles.sectionTitle} data-motion-reveal="mask">
            {audiences.title}
          </h2>
          <ul className={styles.audiences}>
            {audiences.items.map((item) => (
              <li key={item.title} className={styles.audience} data-motion-reveal="drift">
                <h3 className={styles.audienceTitle}>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.journeyBand}`} aria-labelledby="conan-journey">
        <div className={styles.inner}>
          <h2 id="conan-journey" className={styles.sectionTitle} data-motion-reveal="mask">
            {journey.title}
          </h2>
          <p className={styles.sectionLead}>{journey.lead}</p>
          <ol className={styles.stages}>
            {journey.stages.map((stage) => (
              <li key={stage.number} className={styles.stage} data-motion-reveal="drift">
                <span className={styles.stageNumber} aria-hidden="true">
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
      </section>

      <section className={styles.section} aria-labelledby="conan-gallery">
        <div className={styles.wideInner}>
          <h2 id="conan-gallery" className={styles.sectionTitle} data-motion-reveal="mask">
            {gallery.title}
          </h2>
          <PhotoGallery items={gallery.items} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.mentorsBand}`} aria-labelledby="conan-mentors">
        <div className={styles.inner}>
          <h2 id="conan-mentors" className={styles.sectionTitle} data-motion-reveal="mask">
            {mentors.title}
          </h2>
          <MentorCards people={mentors.people} />
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="conan-closing">
        <div className={styles.inner}>
          <h2 id="conan-closing" className={styles.closingTitle} data-motion-reveal="mask">
            {closing.title}
          </h2>
          <div className={styles.actions}>
            <PathLink path="conan" kind="outbound" placement="closing" className={styles.primaryCta} data-motion-action>
              {conanContent.primaryCta}
              <ArrowRight aria-hidden="true" size={18} />
            </PathLink>
            <PathLink path="tensai" kind="door" placement="page" className={styles.crossLink}>
              {closing.crossLink.label}
            </PathLink>
          </div>
        </div>
      </section>
    </div>
  )
}
