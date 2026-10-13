import { ArrowRight } from 'lucide-react'
import { homeContent } from '@/lib/two-path-content'
import { PATH_LABELS, type Placement } from '@/lib/two-path-links'
import PathLink from './PathLink'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type PathDoorsProps = {
  // hero: two photo doors in the first screen; closing: two large buttons that end a page.
  variant: 'hero' | 'closing'
  placement: Placement
}

export default function PathDoors({ variant, placement }: PathDoorsProps) {
  if (variant === 'closing') {
    return (
      <div className={styles.closingDoors}>
        {homeContent.doors.map((door) => (
          <PathLink
            key={door.path}
            path={door.path}
            kind="door"
            placement={placement}
            className={styles.closingDoor}
            data-path-door={door.path}
            data-motion-action
          >
            <span className={styles.closingDoorText}>
              <span className={styles.closingDoorLabel}>{door.shortLabel}</span>
              <span className={styles.closingDoorTarget}>{PATH_LABELS[door.path]}</span>
            </span>
            <ArrowRight aria-hidden="true" size={24} />
          </PathLink>
        ))}
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
        >
          <TwoPathPhoto
            id={door.photoId}
            decorative
            priority
            sizes="(max-width: 767px) 46vw, 280px"
            className={styles.doorPhoto}
          />
          <span className={styles.doorShade} aria-hidden="true" />
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
