import type { CSSProperties } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import OriginStory from '@/components/origin-story/OriginStory'
import JsonLd from '@/components/seo/JsonLd'
import TwoPathPhoto from '@/components/two-path/TwoPathPhoto'
import { originStoryPublic } from '@/lib/origin-story-evidence'
import { buildAboutPageStructuredData, createPageMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = createPageMetadata({
  title: 'Về Thông Phan: người dẫn đường đã đi sai đủ nhiều',
  description:
    'Năm hồi về khác biệt, sự chú ý, cái giá phải trả, cách học lại và hệ thống đang chạy, rồi vì sao Thông chia làm hai con đường cho người đi làm và người kinh doanh.',
  pathname: '/about',
  image: '/images/homepage/proof/thong-stage-3x2-v1.webp',
})

// The admission is the point of the headline, so it is set apart in italics.
const titleHead = 'Tui là người dẫn đường, vì tui'
const titleAccent = 'đã đi sai đủ nhiều.'

const pad = (value: number) => String(value).padStart(2, '0')

export default function AboutPage() {
  return (
    <div className={styles.page} data-motion-stage>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-scroll-out="18">
            <div className={`${styles.heroMeta} intro-fade`}>
              <span className={styles.eyebrow}>Hồ sơ nguồn gốc</span>
              <span className={styles.folio}>Thông Phan · Người dẫn đường</span>
            </div>
            <h1 id="about-title" className={styles.title}>
              <SplitWords text={titleHead} />{' '}
              <em>
                <SplitWords text={titleAccent} start={wordCount(titleHead)} />
              </em>
            </h1>
            <div className={`${styles.heroFoot} intro-fade`}>
              <p className={styles.lead}>
                Không phải một bản thành tích. Đây là năm hồi được kể bằng nguồn báo chí, lời kể cá nhân, hình ảnh có
                quyền sử dụng và những hệ thống đang chạy.
              </p>
              <a
                className={styles.startCta}
                href="#origin-story"
                data-motion-action
                data-magnetic="0.25"
              >
                <span className={styles.startInner} data-magnetic-inner>
                  Bắt đầu câu chuyện
                  <ArrowDown aria-hidden="true" size={18} />
                </span>
              </a>
            </div>
          </div>

          <figure className={styles.portrait}>
            <div className={`${styles.portraitFrame} intro-clip`}>
              <div className={styles.portraitPhoto} data-motion-parallax data-parallax-max="10" data-gl-photo data-gl-delay="2.2">
                <TwoPathPhoto id="founder-portrait" sizes="(max-width: 899px) 92vw, 52vw" className={styles.portraitImage} priority />
              </div>
            </div>
            <figcaption className={`${styles.portraitCaption} intro-fade`}>
              <span>Thông Phan</span>
              <span>Người dẫn đường</span>
            </figcaption>
          </figure>
        </div>

        <nav className={styles.acts} aria-label="Năm hồi của câu chuyện">
          <ol className={styles.actList}>
            {originStoryPublic.acts.map((act, index) => (
              // The acts arrive with the first screen, one after another once the headline has risen.
              <li key={act.id} className="intro-fade" style={{ '--intro-delay': `${1.15 + index * 0.08}s` } as CSSProperties}>
                <a className={styles.actLink} href={`#origin-act-${act.id}`}>
                  <span className={styles.actRule} aria-hidden="true" />
                  <span className={styles.actNumber}>{pad(index + 1)}</span>
                  <span className={styles.actTitle}>{act.title}</span>
                  <ArrowUpRight className={styles.actArrow} aria-hidden="true" size={16} />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <OriginStory />
      <JsonLd data={buildAboutPageStructuredData()} />
    </div>
  )
}
