import type { CSSProperties, ReactNode } from 'react'
import { photo, type TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type GalleryItem = { photoId: TwoPathPhotoId; kind: string }

type PhotoGalleryProps = {
  // In reading order. Without the light table the first one leads, larger than the rest.
  items: readonly GalleryItem[]
  // The section's heading. It stands above the photos, and on the light table it heads the left
  // column above the counter, so the table opens with its own title.
  head?: ReactNode
}

const pad = (value: number) => String(value).padStart(2, '0')

// A light table of real class photos. On wide screens with motion, lightTable (signatures.ts) pins
// it: each photo slides up over the last inside one large frame while the counter rolls, the
// caption swaps and the contact sheet marks the photo in view; a thumbnail glides to its photo.
// Otherwise the photos stand in sequence: a swipe rail on phones, a lead over a grid above that.
export default function PhotoGallery({ items, head }: PhotoGalleryProps) {
  return (
    <div className={styles.gallery} data-light-table style={{ '--gallery-count': items.length } as CSSProperties}>
      {head ? <div className={styles.lightHead}>{head}</div> : null}
      <ol className={styles.galleryList}>
        {items.map((item, index) => (
          <li key={item.photoId} className={styles.galleryItem} data-light-item>
            <figure className={styles.galleryFigure} data-motion-surface>
              <div className={styles.galleryClip} data-light-clip>
                <div className={styles.galleryFrame} data-img-reveal={index === 0 ? 'center' : 'up'}>
                  <div className={styles.galleryMedia} data-reveal-media>
                    <div className={styles.galleryShift} data-light-media>
                      <TwoPathPhoto
                        id={item.photoId}
                        sizes="(max-width: 639px) 84vw, (max-width: 899px) 100vw, 920px"
                      />
                    </div>
                  </div>
                  <span className={styles.galleryShade} data-light-shade aria-hidden="true" />
                </div>
              </div>
              <figcaption>
                <span className={styles.galleryIndex}>{pad(index + 1)}</span>
                <span>
                  <span className={styles.galleryKind}>{item.kind}</span>
                  {photo(item.photoId).caption}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      {/* Light table only: the rolling counter and the contact sheet. */}
      <p className={styles.lightCounter} aria-hidden="true">
        <span className={styles.lightRoll}>
          {items.map((item, index) => (
            <span key={item.photoId}>{pad(index + 1)}</span>
          ))}
        </span>
        <span className={styles.lightTotal}>/ {pad(items.length)}</span>
      </p>
      <ol className={styles.lightSheet} aria-label="Chọn ảnh lớp học">
        {items.map((item, index) => (
          <li key={item.photoId}>
            <button
              type="button"
              className={styles.lightThumb}
              data-light-thumb={index}
              aria-label={`Ảnh ${pad(index + 1)}: ${photo(item.photoId).caption}`}
            >
              <TwoPathPhoto id={item.photoId} sizes="96px" decorative />
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
