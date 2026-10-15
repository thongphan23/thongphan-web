import type { CSSProperties } from 'react'
import { photo, type TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type GalleryItem = { photoId: TwoPathPhotoId; kind: string }

type PhotoGalleryProps = {
  // The first item is shown large across the wall; the rest alternate between two columns.
  items: readonly GalleryItem[]
}

// Each frame opens from a different edge so the wall reads as a sequence, not a grid.
const OPENINGS = ['center', 'left', 'right', 'left', 'right', 'left', 'right'] as const

function GalleryFigure({ item, index }: { item: GalleryItem; index: number }) {
  const lead = index === 0
  return (
    <figure className={styles.galleryFigure} data-motion-surface>
      <div
        className={styles.galleryFrame}
        data-img-reveal={OPENINGS[index % OPENINGS.length]}
        data-parallax-frame={lead ? '6' : undefined}
      >
        <div className={styles.galleryMedia} data-reveal-media>
          <TwoPathPhoto
            id={item.photoId}
            sizes={lead ? '(max-width: 639px) 84vw, (max-width: 1359px) 100vw, 1360px' : '(max-width: 639px) 84vw, (max-width: 899px) 50vw, 760px'}
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
  )
}

// An editorial wall of real class photos: a wide lead, then a broad and a narrow column that
// drift apart as they pass (data-speed on the narrow one, wide screens only). On phones every
// frame joins one swipe rail in reading order (--gallery-order).
export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [lead, ...rest] = items
  const columns = [0, 1].map((column) =>
    rest.map((item, at) => ({ item, index: at + 1 })).filter((_, at) => at % 2 === column),
  )
  return (
    <div className={styles.gallery}>
      {lead ? (
        <div className={styles.galleryLead}>
          <GalleryFigure item={lead} index={0} />
        </div>
      ) : null}
      <div className={styles.galleryColumns}>
        {columns.map((column, columnIndex) => (
          <ul
            key={columnIndex}
            className={styles.galleryColumn}
            data-speed={columnIndex === 1 ? '-0.08' : undefined}
            data-speed-wide={columnIndex === 1 ? '' : undefined}
          >
            {column.map(({ item, index }) => (
              <li key={item.photoId} style={{ '--gallery-order': index } as CSSProperties}>
                <GalleryFigure item={item} index={index} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
