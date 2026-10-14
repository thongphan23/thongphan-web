import { homeContent } from '@/lib/two-path-content'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

// The letter reads like a page: the first paragraph lights up word by word as it scrolls
// through, the rest arrive one by one, and the portrait stays beside it on wide screens.
export default function FounderLetter() {
  const { letter } = homeContent
  const [lead, ...rest] = letter.paragraphs
  return (
    <section className={styles.letter} aria-labelledby="founder-letter-title">
      <div className={styles.letterInner}>
        <div className={styles.letterAside}>
          <figure className={styles.letterPortrait} data-img-reveal="up" data-parallax-frame="5">
            <span className={styles.revealMedia} data-reveal-media>
              <TwoPathPhoto id={letter.portraitId} sizes="(max-width: 1023px) 60vw, 380px" />
            </span>
          </figure>
        </div>
        <div className={styles.letterBody}>
          <h2 id="founder-letter-title" className={styles.letterTitle} data-split>
            {letter.title}
          </h2>
          <p className={styles.letterLead} data-scrub-words>
            {lead}
          </p>
          <div className={styles.letterRest} data-reveal-children data-stagger="0.14">
            {rest.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className={styles.signature} data-motion-reveal="drift">
            <span className={styles.signatureLine} data-draw-line aria-hidden="true" />
            <span className={styles.signatureName}>{letter.signature}</span>
            <span className={styles.signatureRole}>{letter.signatureRole}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
