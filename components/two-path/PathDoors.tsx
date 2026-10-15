import { ArrowRight } from 'lucide-react'
import { homeContent } from '@/lib/two-path-content'
import { PATH_LABELS, type PathKey, type Placement } from '@/lib/two-path-links'
import PathLink from './PathLink'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type PathDoorsProps = {
  // hero: two large buttons under the first-screen question; closing: two large rows that end a page.
  variant: 'hero' | 'closing'
  placement: Placement
}

// Cursor labels for the closing panels only; on the hero pills a label would sit over the pill's
// own words, and the colour flood already says where the button goes.
const CURSOR: Record<PathKey, { label: string; tone: string }> = {
  tensai: { label: 'Vào Tensai', tone: 'lime' },
  conan: { label: 'Vào Conan', tone: 'lacquer' },
}

const pad = (value: number) => String(value).padStart(2, '0')

export default function PathDoors({ variant, placement }: PathDoorsProps) {
  if (variant === 'closing') {
    // Two panels in the path's own colour with a framed photo. In wide containers they stand side
    // by side and the one under the pointer (or keyboard focus) opens wider; narrow ones stack.
    return (
      <div className={styles.closingDoors}>
        <div className={styles.closingList}>
          {homeContent.doors.map((door, index) => (
            <PathLink
              key={door.path}
              path={door.path}
              kind="door"
              placement={placement}
              className={styles.closingDoor}
              data-path-door={door.path}
              data-cursor={CURSOR[door.path].label}
              data-cursor-tone={CURSOR[door.path].tone}
              data-motion-action
            >
              <span className={styles.closingDoorHead}>
                <span className={styles.closingDoorIndex} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <span className={styles.closingDoorLabel}>{door.shortLabel}</span>
              </span>
              <span className={styles.closingDoorPhoto} aria-hidden="true">
                <TwoPathPhoto id={door.photoId} decorative sizes="(max-width: 899px) 40vw, 22vw" />
              </span>
              <span className={styles.closingDoorFoot}>
                <span className={styles.closingDoorTarget}>{PATH_LABELS[door.path]}</span>
                <span className={styles.closingDoorDescription}>{door.description}</span>
              </span>
              <span className={styles.closingDoorArrow} aria-hidden="true">
                <ArrowRight size={24} />
              </span>
            </PathLink>
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
          data-magnetic="0.14"
        >
          <span className={styles.doorFill} aria-hidden="true" />
          <TwoPathPhoto id={door.photoId} decorative priority sizes="56px" className={styles.doorPhoto} />
          <span className={styles.doorText} data-magnetic-inner>
            <span className={styles.doorProduct}>{PATH_LABELS[door.path]}</span>
            <span className={styles.doorLabel}>{door.label}</span>
          </span>
          <span className={styles.doorArrow} aria-hidden="true">
            <ArrowRight size={22} />
          </span>
        </PathLink>
      ))}
    </nav>
  )
}
