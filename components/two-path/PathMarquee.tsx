import { homeContent } from '@/lib/two-path-content'
import home from './HomeSections.module.css'

// Each half of a track must be wider than the widest screen, so the words repeat
// before the track is doubled for the seamless -50% loop.
const REPEAT = 4

// Two strips of tape, one per path, tilted against each other and drifting in opposite directions
// (faster when the page is scrolled fast). They only repeat the two door labels, so the whole band
// is hidden from assistive tech.
export default function PathMarquee() {
  return (
    <div className={home.tapes} aria-hidden="true">
      {homeContent.marquee.map((row, rowIndex) => {
        const half = Array.from({ length: REPEAT }, () => row.words).flat()
        return (
          <div
            key={row.path}
            className={home.tape}
            data-path={row.path}
            data-marquee={rowIndex % 2 ? 'reverse' : ''}
            data-marquee-duration="42"
            data-velocity-skew
          >
            <div className={home.tapeTrack} data-marquee-track>
              {[...half, ...half].map((word, index) => (
                <span key={index} className={index % 2 ? home.tapeProduct : home.tapeWord}>
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
