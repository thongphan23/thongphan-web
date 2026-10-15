import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

// "Người [photo] dẫn đường": the positioning line with a small window between its words. When
// the motion engine runs, the section starts one screen up, beneath the letter sheet before it
// (data-zoom-under), pins, and is uncovered as the sheet lifts off; then the window opens until
// the class photo fills the screen. Without the engine (or under reduced motion) the line sits
// above the full photo.
export default function GuideZoom() {
  const { guide } = homeContent
  const item = photo(guide.photoId)
  return (
    <section className={styles.guide} aria-labelledby="guide-title" data-zoom-reveal data-zoom-under>
      <div className={styles.guideStage} data-zoom-stage>
        <h2 id="guide-title" className={styles.guideTitle}>
          <span className={styles.guideWord} data-zoom-left>
            {guide.lead}
          </span>{' '}
          <span className={styles.guideSlot} data-zoom-slot aria-hidden="true" />{' '}
          <em className={styles.guideWord} data-zoom-right>
            {guide.tail}
          </em>
        </h2>
        <figure className={styles.guideMedia} data-zoom-media>
          <span className={styles.guideImage} data-zoom-image>
            <TwoPathPhoto id={guide.photoId} sizes="100vw" />
          </span>
          <span className={styles.guideScrim} aria-hidden="true" data-zoom-after />
          <figcaption className={styles.guideCaption} data-zoom-after>
            <span className={styles.guideCaptionMark}>Thông Phan · {guide.lead.toLowerCase()} {guide.tail}</span>
            <span>{item.caption ?? item.alt}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
