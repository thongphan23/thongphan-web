import type { CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import ReelControls from './ReelControls'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

const pad = (value: number) => String(value).padStart(2, '0')

// A reel of real class photos. On wide screens the section pins: the words hold still on the left
// while the photos travel past them with the scroll and settle one at a time in the middle. On
// phones it is a native swipe row with snap points under the words.
export default function RealWorkReel() {
  const { reel } = homeContent
  return (
    <section
      className={styles.reel}
      aria-labelledby="real-work-title"
      data-hscroll
      style={{ '--reel-count': reel.photoIds.length } as CSSProperties}
    >
      <header className={styles.reelIntro}>
        <p className={styles.reelEyebrow} data-motion-reveal="drift">
          {reel.eyebrow}
        </p>
        <h2 id="real-work-title" className={styles.reelTitle} data-split>
          {reel.title}
        </h2>
        <p className={styles.reelLead} data-motion-reveal="drift">
          {reel.lead}
        </p>
        <Link href={reel.link.href} className={styles.textLink} data-motion-action>
          {reel.link.label}
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
        <ReelControls count={reel.photoIds.length} />
      </header>
      <div className={styles.reelViewport} data-cursor="Kéo" data-cursor-tone="light">
        <div className={styles.reelTrack} data-hscroll-track>
          {reel.photoIds.map((id, index) => {
            const item = photo(id)
            return (
              <figure key={id} className={styles.reelItem} data-hscroll-item>
                <div className={styles.reelFrame}>
                  <div className={styles.reelMedia} data-hscroll-media>
                    <TwoPathPhoto id={id} sizes="(max-width: 899px) 82vw, 42vw" />
                  </div>
                </div>
                <figcaption>
                  <span className={styles.reelIndex}>{pad(index + 1)}</span>
                  {item.caption ?? item.alt}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
