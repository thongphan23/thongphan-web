import { photo, type TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type PhotoGalleryProps = {
  // The first item is shown large across the grid.
  items: readonly { photoId: TwoPathPhotoId; kind: string }[]
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  return (
    <ul className={styles.gallery}>
      {items.map((item, index) => (
        <li key={item.photoId} className={index === 0 ? styles.galleryLead : undefined}>
          <figure className={styles.galleryFigure} data-motion-surface>
            <TwoPathPhoto
              id={item.photoId}
              sizes={index === 0 ? '(max-width: 1199px) 100vw, 1200px' : '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px'}
            />
            <figcaption>
              <span className={styles.galleryKind}>{item.kind}</span>
              {photo(item.photoId).caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
