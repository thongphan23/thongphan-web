import Image from 'next/image'
import type { CSSProperties } from 'react'
import { photo, type TwoPathPhoto as Photo, type TwoPathPhotoId } from '@/lib/two-path-photos'

function focalStyle(item: Photo): CSSProperties | undefined {
  return item.focal ? { objectPosition: `${item.focal.x * 100}% ${item.focal.y * 100}%` } : undefined
}

type TwoPathPhotoProps = {
  id: TwoPathPhotoId
  sizes: string
  className?: string
  priority?: boolean
  // Below-the-fold photos on the home page: fetched right after the first screen at low priority, so a
  // fast scroll never meets an empty frame, without competing with the hero for bandwidth.
  eager?: boolean
  // Decorative photos sit inside a link or next to text that already says what they show.
  decorative?: boolean
}

export default function TwoPathPhoto({ id, sizes, className, priority = false, eager = false, decorative = false }: TwoPathPhotoProps) {
  const item = photo(id)
  return (
    <Image
      src={item.src}
      width={item.width}
      height={item.height}
      alt={decorative ? '' : item.alt}
      sizes={sizes}
      className={className}
      priority={priority}
      {...(eager && !priority ? { loading: 'eager' as const, fetchPriority: 'low' as const } : {})}
      style={focalStyle(item)}
    />
  )
}

type HeroPictureProps = {
  id: TwoPathPhotoId
  mobileId: TwoPathPhotoId
  className?: string
}

// Art-directed hero: a portrait crop below 768px, the wide frame above. Loaded eagerly as the LCP image;
// the page CSS owns object-position per breakpoint.
export function HeroPicture({ id, mobileId, className }: HeroPictureProps) {
  const wide = photo(id)
  const narrow = photo(mobileId)
  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={narrow.src} width={narrow.width} height={narrow.height} />
      <img
        src={wide.src}
        alt={wide.alt}
        width={wide.width}
        height={wide.height}
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
    </picture>
  )
}
