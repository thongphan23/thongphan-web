import { homeContent } from '@/lib/two-path-content'
import home from './HomeSections.module.css'

// Each half of the track must be wider than the widest screen, so the pairs repeat
// before the track is doubled for the seamless -50% loop.
const REPEAT = 3

// One flat ticker band between the guide and the field notes: each visitor's situation leads to its
// path ("Tôi đi làm → Tensai", "Tôi kinh doanh → Conan School"). The type is cream on ink and only
// the path names carry their accent, so the band speaks the page's colour roles instead of adding two
// more surfaces. It drifts faster when the page is scrolled fast. It only repeats the two door labels,
// so the whole band is hidden from assistive tech.
export default function PathMarquee() {
  const pairs = homeContent.marquee.map((row) => ({ path: row.path, situation: row.words[0], product: row.words[1] }))
  const half = Array.from({ length: REPEAT }, () => pairs).flat()
  return (
    <div className={home.tapes} aria-hidden="true">
      <div className={home.tape} data-marquee="" data-marquee-duration="46" data-velocity-skew>
        <div className={home.tapeTrack} data-marquee-track>
          {[...half, ...half].map((pair, index) => (
            <span key={index} className={home.tapePair} data-path={pair.path}>
              <span className={home.tapeWord}>{pair.situation}</span>
              <span className={home.tapeArrow}>→</span>
              <span className={home.tapeProduct}>{pair.product}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
