import { homeContent } from '@/lib/two-path-content'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

// The letter reads like a page: the opening lights up word by word as it scrolls through, the
// debt breaks out of it as a pull quote, the middle reads as one column of large type, and the
// stage photo stays beside it on wide screens.
export default function FounderLetter() {
  const { letter } = homeContent
  const [lead, ...rest] = letter.paragraphs
  const [leadBefore, leadAfter] = lead.split(letter.pullQuote).map((part) => part.trim())
  const middle = rest.slice(0, -1)
  const last = rest[rest.length - 1]
  return (
    <section className={styles.letter} aria-labelledby="founder-letter-title">
      <div className={styles.letterInner}>
        <div className={styles.letterAside}>
          <figure className={styles.letterPortrait} data-img-reveal="up" data-parallax-frame="5">
            <span className={styles.revealMedia} data-reveal-media>
              <TwoPathPhoto id={letter.portraitId} sizes="(max-width: 1023px) 86vw, 520px" />
            </span>
          </figure>
        </div>
        <div className={styles.letterBody}>
          <h2 id="founder-letter-title" className={styles.letterTitle} data-split>
            {letter.title}
          </h2>
          <p className={styles.letterLead} data-scrub-words data-scrub-from="0.72" data-scrub-end="top 64%">
            {leadBefore}
          </p>
          <blockquote className={styles.letterPull}>
            <span className={styles.letterPullRule} data-draw-line aria-hidden="true" />
            <p data-split>{letter.pullQuote}</p>
          </blockquote>
          <p className={styles.letterLead} data-motion-reveal="drift">
            {leadAfter}
          </p>
          <div className={styles.letterRest} data-reveal-children data-stagger="0.14">
            {middle.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className={styles.letterLast} data-motion-reveal="drift">
            {last}
          </p>
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
