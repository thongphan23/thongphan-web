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
// phones it is a native swipe row with snap points under the words. The pace gives each photo
// some 400px of scroll, under one flick of the wheel, so a flick always reaches the next photo;
// data-hscroll-snap then aims the glide at that photo's resting point, so it lands centred in one
// movement (a single notch of the wheel steps one photo), and the short scrub keeps the row
// arriving with the scroll instead of trailing it.
export default function RealWorkReel() {
  const { reel } = homeContent
  return (
    <section
      className={`${styles.reel} ${home.reel}`}
      aria-labelledby="real-work-title"
      data-hscroll
      data-hscroll-pace="0.5"
      data-hscroll-scrub="0.4"
      data-hscroll-snap
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
      </header>
      {/* The row and its controls share one box: pinned, the arrows sit on either side of the photo
          at rest, next to the neighbour they bring in, and the counter sits under the row. The
          controls stay outside the viewport, which is what the mouse drag listens on. */}
      <div className={home.reelStage}>
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
        <ReelControls count={reel.photoIds.length} />
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
