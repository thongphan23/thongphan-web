import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

export default function FieldNotes() {
  const { fieldNotes } = homeContent
  return (
    <section className={styles.fieldNotes} aria-labelledby="field-notes-title">
      <div className={styles.sectionInner}>
        <h2 id="field-notes-title" className={styles.sectionTitle} data-motion-reveal="mask">
          {fieldNotes.title}
        </h2>
        <div className={styles.fieldGrid}>
          <figure className={styles.fieldPhoto} data-motion-surface>
            <TwoPathPhoto id={fieldNotes.photoId} sizes="(max-width: 899px) 100vw, 58vw" />
            <figcaption>{photo(fieldNotes.photoId).caption}</figcaption>
          </figure>
          <div className={styles.fieldCards}>
            {fieldNotes.cards.map((card) => (
              <article key={card.claimId} className={styles.fieldCard} data-motion-reveal="drift">
                <p>{card.text}</p>
                <Link href={card.href} className={styles.textLink} data-motion-action>
                  {card.linkLabel}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
