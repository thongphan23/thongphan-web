import type { CSSProperties } from 'react'
import { photo, type TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type GalleryItem = { photoId: TwoPathPhotoId; kind: string }

type PhotoGalleryProps = {
  // The first item is shown large across the wall; the rest fill three columns in order.
  items: readonly GalleryItem[]
}

// Each frame opens from a different edge so the wall reads as a sequence, not a grid.
const OPENINGS = ['center', 'up', 'right', 'up', 'left', 'up', 'right'] as const

// The three columns scroll at different speeds (data-speed, the engine's parallax), so the
// wall shears as it passes. The first column keeps pace with the page.
const COLUMN_SPEEDS = [undefined, '-0.14', '0.06'] as const

// Wide-screen frame shapes per column, alternated so no two neighbours share a ratio.
const COLUMN_RATIOS = [
  ['4 / 3', '4 / 5'],
  ['4 / 5', '4 / 3'],
  ['4 / 3', '4 / 5'],
] as const

function GalleryFigure({ item, index, ratio }: { item: GalleryItem; index: number; ratio?: string }) {
  const lead = index === 0
  return (
    <figure
      className={styles.galleryFigure}
      data-motion-surface
      style={ratio ? ({ '--gallery-ratio-wide': ratio } as CSSProperties) : undefined}
    >
      <div
        className={styles.galleryFrame}
        data-img-reveal={OPENINGS[index % OPENINGS.length]}
        data-parallax-frame={lead ? '6' : undefined}
      >
        <div className={styles.galleryMedia} data-reveal-media>
          <TwoPathPhoto
            id={item.photoId}
            sizes={lead ? '(max-width: 1359px) 100vw, 1360px' : '(max-width: 1023px) 100vw, 440px'}
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

// An editorial wall of real class photos: a wide lead, then three columns that drift apart.
export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [lead, ...rest] = items
  const perColumn = Math.ceil(rest.length / COLUMN_SPEEDS.length)
  const columns = COLUMN_SPEEDS.map((_, column) => rest.slice(column * perColumn, (column + 1) * perColumn))
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
            data-speed={COLUMN_SPEEDS[columnIndex]}
            data-speed-wide={COLUMN_SPEEDS[columnIndex] ? '' : undefined}
          >
            {column.map((item, row) => (
              <li key={item.photoId}>
                <GalleryFigure
                  item={item}
                  index={1 + columnIndex * perColumn + row}
                  ratio={COLUMN_RATIOS[columnIndex]?.[row]}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
