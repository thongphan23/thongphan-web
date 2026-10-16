import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'
import home from './HomeSections.module.css'

const formatter = new Intl.NumberFormat('vi-VN')

// Two checked numbers, each on its own ruled row with the name of the number set beside it, then
// the room they came from as one wide band of photo running to the edges of the screen.
export default function FieldNotes() {
  const { fieldNotes } = homeContent
  return (
    <section className={`${styles.fieldNotes} ${home.stats}`} aria-labelledby="field-notes-title">
      <div className={`${styles.sectionInner} ${home.statsInner}`}>
        <h2 id="field-notes-title" className={`${styles.sectionTitle} ${home.statsTitle}`} data-split>
          {fieldNotes.title}
        </h2>
        <div className={home.statRows} data-trail-point="60|61" data-trail-at="1 0 28 0|1 1 28 0">
          {fieldNotes.cards.map((card) => (
            <article key={card.claimId} className={home.statRow}>
              <span className={home.statRule} data-draw-line aria-hidden="true" />
              {/* The claim text below already states the number, so the counter is visual only. */}
              <p className={home.stat} aria-hidden="true">
                <span className={home.statNumber}>
                  <span data-count={card.stat.value}>{formatter.format(card.stat.value)}</span>
                  {card.stat.suffix}
                </span>
                <span className={home.statLabel}>{card.stat.label}</span>
              </p>
              <div className={home.statBody} data-motion-reveal="drift">
                <p className={home.statClaim}>{card.text}</p>
                <Link href={card.href} className={styles.textLink} data-motion-action>
                  {card.linkLabel}
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <figure
        className={home.statPhoto}
        data-motion-surface
        data-photo-bloom
        data-trail-point="62|63"
        data-trail-at="1 0 62 -14|1 1 62 0"
      >
        <div className={home.statPhotoFrame} data-img-reveal="left" data-parallax-frame="7">
          <span className={styles.revealMedia} data-reveal-media>
            <TwoPathPhoto id={fieldNotes.photoId} eager sizes="100vw" />
          </span>
        </div>
        <figcaption className={home.statCaption} data-motion-reveal>
          {photo(fieldNotes.photoId).caption}
        </figcaption>
      </figure>
    </section>
  )
}
