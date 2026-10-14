import { ArrowRight } from 'lucide-react'
import { homeContent } from '@/lib/two-path-content'
import { PATH_LABELS, type PathKey, type Placement } from '@/lib/two-path-links'
import PathLink from './PathLink'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type PathDoorsProps = {
  // hero: two photo doors in the first screen; closing: two large rows that end a page.
  variant: 'hero' | 'closing'
  placement: Placement
}

const CURSOR: Record<PathKey, { label: string; tone: string }> = {
  tensai: { label: 'Vào Tensai', tone: 'lime' },
  conan: { label: 'Vào Conan', tone: 'lacquer' },
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function PathDoors({ variant, placement }: PathDoorsProps) {
  if (variant === 'closing') {
    // Wide containers show editorial rows with a photo that follows the pointer;
    // narrow ones (phones, the About sidebar) fall back to two solid buttons.
    return (
      <div className={styles.closingDoors} data-hover-reveal>
        <div className={styles.closingList}>
          {homeContent.doors.map((door, index) => (
            <PathLink
              key={door.path}
              path={door.path}
              kind="door"
              placement={placement}
              className={styles.closingDoor}
              data-path-door={door.path}
              data-hover-item={door.path}
              data-cursor={CURSOR[door.path].label}
              data-cursor-tone={CURSOR[door.path].tone}
              data-motion-action
            >
              <span className={styles.closingDoorIndex} aria-hidden="true">
                {pad(index + 1)}
              </span>
              <span className={styles.closingDoorText}>
                <span className={styles.closingDoorLabel}>{door.shortLabel}</span>
                <span className={styles.closingDoorTarget}>{PATH_LABELS[door.path]}</span>
              </span>
              <span className={styles.closingDoorDescription}>{door.description}</span>
              <span className={styles.closingDoorArrow} aria-hidden="true">
                <ArrowRight size={24} />
              </span>
            </PathLink>
          ))}
        </div>
        <div className={styles.closingFloat} data-hover-float aria-hidden="true">
          {homeContent.doors.map((door) => (
            <span key={door.path} className={styles.closingFloatMedia} data-hover-media={door.path}>
              <TwoPathPhoto id={door.photoId} decorative sizes="18rem" />
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <nav className={styles.doors} aria-label="Chọn con đường của bạn">
      {homeContent.doors.map((door) => (
        <PathLink
          key={door.path}
          path={door.path}
          kind="door"
          placement={placement}
          className={styles.door}
          data-path-door={door.path}
          data-tilt="5"
          data-cursor={CURSOR[door.path].label}
          data-cursor-tone={CURSOR[door.path].tone}
        >
          <TwoPathPhoto
            id={door.photoId}
            decorative
            priority
            sizes="(max-width: 767px) 46vw, 320px"
            className={styles.doorPhoto}
          />
          <span className={styles.doorShade} aria-hidden="true" />
          <span className={styles.doorGlare} aria-hidden="true" />
          <span className={styles.doorText}>
            <span className={styles.doorProduct}>{PATH_LABELS[door.path]}</span>
            <span className={styles.doorLabel}>{door.label}</span>
            <span className={styles.doorDescription}>{door.description}</span>
            <ArrowRight className={styles.doorArrow} aria-hidden="true" size={22} />
          </span>
        </PathLink>
      ))}
    </nav>
  )
}
