import type { CSSProperties } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import SplitWords, { wordCount } from '@/components/motion/SplitWords'
import HeroPointer from '@/components/origin-story/HeroPointer'
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
      <section className={styles.hero} aria-labelledby="about-title" data-cursor="Cuộn" data-cursor-tone="light">
        <HeroPointer />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-scroll-out="18">
            <p className={`${styles.eyebrow} intro-fade`}>Hồ sơ nguồn gốc</p>
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
                data-cursor="Đọc"
                data-cursor-tone="lacquer"
              >
                <span className={styles.startInner} data-magnetic-inner>
                  Bắt đầu câu chuyện
                  <ArrowDown aria-hidden="true" size={18} />
                </span>
              </a>
            </div>
          </div>

          <figure className={styles.portrait}>
            <div className={`${styles.portraitFrame} intro-clip`} data-hero-frame>
              {/* The cut-out stands in a pool of lacquer light; the frame's only edge is an
                  elliptical fade, so no rectangle can show at any size or pointer position. The
                  drift layer carries the pointer response; the photo inside it keeps its own
                  parallax, so the two never fight over one transform. */}
              <span className={styles.portraitGlow} aria-hidden="true" />
              <div className={styles.portraitDrift}>
                <div className={styles.portraitPhoto} data-motion-parallax data-parallax-max="10">
                  <TwoPathPhoto id="home-stage-hero" sizes="(max-width: 899px) 92vw, 48vw" className={styles.portraitImage} priority />
                </div>
              </div>
              <span className={styles.portraitShade} aria-hidden="true" />
              <span className={styles.portraitTorch} aria-hidden="true" />
            </div>
          </figure>
        </div>

        <nav className={styles.acts} aria-label="Năm hồi của câu chuyện">
          <ol className={styles.actList}>
            {originStoryPublic.acts.map((act, index) => (
              // The acts arrive with the first screen, one after another once the headline has risen.
              <li key={act.id} className="intro-fade" style={{ '--intro-delay': `${0.55 + index * 0.06}s` } as CSSProperties}>
                <a
                  className={styles.actLink}
                  href={`#origin-act-${act.id}`}
                  data-cursor-tone="lacquer"
                >
                  <span className={styles.actRule} aria-hidden="true" />
                  <span className={styles.actNumber}>
                    <span className={styles.actDigits}>
                      <span className={styles.actRoll} data-n={pad(index + 1)}>
                        {pad(index + 1)}
                      </span>
                    </span>
                  </span>
                  <span className={styles.actTitle}>{act.title}</span>
                  <ArrowUpRight className={styles.actArrow} aria-hidden="true" size={22} />
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
