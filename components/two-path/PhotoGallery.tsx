import { photo, type TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type PhotoGalleryProps = {
  // The first item is shown large across the grid.
  items: readonly { photoId: TwoPathPhotoId; kind: string }[]
}

// Each frame opens from a different edge so the wall reads as a sequence, not a grid.
const OPENINGS = ['center', 'up', 'right', 'up', 'left', 'up', 'right'] as const

// An editorial wall of real class photos: a wide lead, then frames of different sizes
// on a 12-column grid. Frames open as they arrive and the lead photo drifts inside its frame.
export default function PhotoGallery({ items }: PhotoGalleryProps) {
  return (
    <ul className={styles.gallery}>
      {items.map((item, index) => (
        <li key={item.photoId} className={index === 0 ? styles.galleryLead : undefined}>
          <figure className={styles.galleryFigure} data-motion-surface>
            <div
              className={styles.galleryFrame}
              data-img-reveal={OPENINGS[index % OPENINGS.length]}
              data-parallax-frame={index === 0 ? '6' : undefined}
            >
              <div className={styles.galleryMedia} data-reveal-media>
                <TwoPathPhoto
                  id={item.photoId}
                  sizes={index === 0 ? '(max-width: 1359px) 100vw, 1360px' : '(max-width: 1023px) 100vw, 680px'}
                />
              </div>
            </div>
            <figcaption>
              <span className={styles.galleryIndex}>{String(index + 1).padStart(2, '0')}</span>
              <span>
                <span className={styles.galleryKind}>{item.kind}</span>
                {photo(item.photoId).caption}
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
