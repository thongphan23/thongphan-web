import { homeContent } from '@/lib/two-path-content'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

export default function FounderLetter() {
  const { letter } = homeContent
  return (
    <section className={styles.letter} aria-labelledby="founder-letter-title">
      <div className={styles.letterInner}>
        <div className={styles.letterHead}>
          <h2 id="founder-letter-title" className={styles.letterTitle} data-motion-reveal="mask">
            {letter.title}
          </h2>
          <figure className={styles.letterPortrait}>
            <TwoPathPhoto id={letter.portraitId} sizes="(max-width: 1023px) 60vw, 360px" />
          </figure>
        </div>
        <div className={styles.letterBody} data-motion-reveal="drift">
          {letter.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className={styles.signature}>{letter.signature}</p>
        </div>
      </div>
    </section>
  )
}
