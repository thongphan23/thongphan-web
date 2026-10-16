import { homeContent } from '@/lib/two-path-content'
import { photo } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'
import home from './HomeSections.module.css'

// "Người [photo] dẫn đường": the positioning line with a small window between its words. Where the
// browser can drive animation from scroll (HomeSections.module.css), the stage sticks to the screen
// and the window opens from the first frame of the pin: the faces in the room sit in the slot, grow
// to a framed print and the words part to make room. No script is involved, so nothing is pinned
// by the engine and nothing can shift the layout. Without that (or under reduced motion) the line
// sits above the full photo.
export default function GuideZoom() {
  const { guide } = homeContent
  const item = photo(guide.photoId)
  return (
    <section className={`${styles.guide} ${home.guide}`} aria-labelledby="guide-title">
      <div className={`${styles.guideStage} ${home.guideStage}`}>
        <h2 id="guide-title" className={`${styles.guideTitle} ${home.guideTitle}`}>
          <span className={`${styles.guideWord} ${home.guideLeft}`}>{guide.lead}</span>{' '}
          <span className={`${styles.guideSlot} ${home.guideSlot}`} aria-hidden="true" />{' '}
          <em
            className={`${styles.guideWord} ${home.guideRight}`}
            data-pen="underline"
            data-pen-tone="lacquer"
            data-pen-start="top 90%"
            data-pen-end="top 30%"
          >
            {guide.tail}
          </em>
        </h2>
        <figure className={`${styles.guideMedia} ${home.guideMedia}`} data-photo-bloom>
          <span className={`${styles.guideImage} ${home.guideImage}`}>
            <TwoPathPhoto id={guide.photoId} eager sizes="100vw" />
          </span>
          <span className={`${styles.guideScrim} ${home.guideScrim}`} aria-hidden="true" />
          <figcaption className={`${styles.guideCaption} ${home.guideCaption}`}>
            <span className={`${styles.guideCaptionMark} ${home.guideCaptionMark}`}>Thông Phan · {guide.lead.toLowerCase()} {guide.tail}</span>
            <span>{item.caption ?? item.alt}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
