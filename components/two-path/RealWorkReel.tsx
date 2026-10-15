import type { CSSProperties } from 'react'
import { ArrowRight, MoveHorizontal } from 'lucide-react'
import Link from 'next/link'
import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import ReelControls from './ReelControls'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'
import home from './HomeSections.module.css'

const pad = (value: number) => String(value).padStart(2, '0')

// Lines may only break between the title's short sentences, never inside one.
const keepSentences = (text: string) =>
  text
    .split('. ')
    .map((sentence) => sentence.replaceAll(' ', '\u00a0'))
    .join('. ')

// A reel of real class photos. On wide screens the section pins: the words hold still on the left
// while the photos travel past them with the scroll and settle one at a time in the middle. On
// phones it is a native swipe row with snap points under the words. The pace keeps the pinned
// stretch to well under the track's width, so the later photos are not buried under a long hold.
export default function RealWorkReel() {
  const { reel } = homeContent
  return (
    <section
      className={`${styles.reel} ${home.reel}`}
      aria-labelledby="real-work-title"
      data-hscroll
      data-hscroll-pace="0.42"
      style={{ '--reel-count': reel.photoIds.length } as CSSProperties}
    >
      <header className={`${styles.reelIntro} ${home.reelIntro}`}>
        <p className={`${styles.reelEyebrow} ${home.reelEyebrow}`} data-motion-reveal="drift">
          {reel.eyebrow}
        </p>
        <h2 id="real-work-title" className={`${styles.reelTitle} ${home.reelTitle}`} data-split>
          {keepSentences(reel.title)}
        </h2>
        <p className={`${styles.reelLead} ${home.reelLead}`} data-motion-reveal="drift">
          {reel.lead}
        </p>
        <Link href={reel.link.href} className={styles.textLink} data-motion-action>
          {reel.link.label}
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
        <ReelControls count={reel.photoIds.length} />
      </header>
      <div className={`${styles.reelViewport} ${home.reelViewportHome}`} data-cursor="Kéo" data-cursor-tone="light">
        <div className={`${styles.reelTrack} ${home.reelTrackHome}`} data-hscroll-track>
          {reel.photoIds.map((id, index) => {
            const item = photo(id)
            return (
              <figure key={id} className={`${styles.reelItem} ${home.reelItem}`} data-hscroll-item>
                <div className={styles.reelFrame}>
                  <div className={`${styles.reelMedia} ${home.reelMediaHome}`} data-hscroll-media>
                    <TwoPathPhoto id={id} eager sizes="(max-width: 899px) 82vw, 64vw" />
                  </div>
                </div>
                <figcaption className={`${home.reelCaption}`}>
                  <span className={`${styles.reelIndex} ${home.reelIndexHome}`}>{pad(index + 1)}</span>
                  {item.caption ?? item.alt}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
      {/* The row can be pulled; say so, once, in words the reader's device understands. */}
      <p className={home.reelHint} aria-hidden="true">
        <span className={home.reelHintArrows}>
          <MoveHorizontal size={20} />
        </span>
        <span className={home.reelHintFine}>{reel.hint.fine}</span>
        <span className={home.reelHintTouch}>{reel.hint.touch}</span>
      </p>
    </section>
  )
}
