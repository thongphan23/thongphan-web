import { homeContent } from '@/lib/two-path-content'
import styles from './TwoPath.module.css'

// Each half of a track must be wider than the widest screen, so the words repeat
// before the track is doubled for the seamless -50% loop.
const REPEAT = 4

// Two bands of type that drift in opposite directions and speed up with scroll velocity.
// They only repeat the two door labels, so the whole band is hidden from assistive tech.
export default function PathMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      {homeContent.marquee.map((row, rowIndex) => {
        const half = Array.from({ length: REPEAT }, () => row.words).flat()
        return (
          <div
            key={row.path}
            className={styles.marqueeRow}
            data-path={row.path}
            data-marquee={rowIndex % 2 ? 'reverse' : ''}
            data-marquee-duration="46"
            data-velocity-skew
          >
            <div className={styles.marqueeTrack} data-marquee-track>
              {[...half, ...half].map((word, index) => (
                <span key={index} className={index % 2 ? styles.marqueeProduct : styles.marqueeWord}>
                  {word}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
