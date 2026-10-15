import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

const formatter = new Intl.NumberFormat('vi-VN')

// Two checked numbers side by side, then the room they came from as one wide photo.
export default function FieldNotes() {
  const { fieldNotes } = homeContent
  return (
    <section className={styles.fieldNotes} aria-labelledby="field-notes-title">
      <div className={styles.sectionInner}>
        <h2 id="field-notes-title" className={styles.sectionTitle} data-split>
          {fieldNotes.title}
        </h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldCards} data-reveal-children data-stagger="0.16">
            {fieldNotes.cards.map((card) => (
              <article key={card.claimId} className={styles.fieldCard}>
                {/* The claim text below already states the number, so the counter is visual only. */}
                <p className={styles.fieldStat} aria-hidden="true">
                  <span data-count={card.stat.value}>{formatter.format(card.stat.value)}</span>
                  {card.stat.suffix}
                  <span className={styles.fieldStatLabel}>{card.stat.label}</span>
                </p>
                <span className={styles.fieldRule} data-draw-line aria-hidden="true" />
                <p className={styles.fieldClaim}>{card.text}</p>
                <Link href={card.href} className={styles.textLink} data-motion-action>
                  {card.linkLabel}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </article>
            ))}
          </div>
          <figure className={styles.fieldPhoto} data-motion-surface>
            <div className={styles.fieldPhotoFrame} data-img-reveal="left" data-parallax-frame="7">
              <span className={styles.revealMedia} data-reveal-media>
                <TwoPathPhoto id={fieldNotes.photoId} sizes="(max-width: 899px) 100vw, 92vw" />
              </span>
            </div>
            <figcaption data-motion-reveal>{photo(fieldNotes.photoId).caption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
