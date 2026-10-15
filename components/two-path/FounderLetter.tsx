import { homeContent } from '@/lib/two-path-content'
import { PATH_LABELS, type PathKey } from '@/lib/two-path-links'
import TwoPathPhoto from './TwoPathPhoto'
import home from './HomeSections.module.css'

// The letter is told in four beats, one idea per screen:
//   1. who is writing (the portrait, the title and the first sentence, lit word by word),
//   2. the number (a lacquer band that holds the screen while the debt lights up word by word),
//   3. what he lost (one large sentence),
//   4. what he chose: the two paths as two ruled rows, the closing line, the signature.
// Without the motion engine (or under reduced motion) every beat is simply a tall, fully lit block.
const PATH_ORDER: PathKey[] = ['tensai', 'conan']

export default function FounderLetter() {
  const { letter } = homeContent
  const [lead, ...rest] = letter.paragraphs
  const [leadBefore, leadAfter] = lead.split(letter.pullQuote).map((part) => part.trim())
  const [stakes, paths] = rest.slice(0, -1)
  const last = rest[rest.length - 1]
  // "Nếu bạn đi làm, ... . Nếu bạn đang hoặc muốn kinh doanh, ..." becomes one row per path.
  const pathRows = (paths ?? '').split(/(?<=\.)\s+(?=Nếu)/).filter(Boolean)
  const closingLines = last.split(/(?<=\.)\s+/).filter(Boolean)

  return (
    <section className={home.letter} aria-labelledby="founder-letter-title">
      <div className={home.letterOpen}>
        <figure className={home.letterPortrait} data-img-reveal="up" data-parallax-frame="5">
          <span className={home.letterPortraitMedia} data-reveal-media>
            <TwoPathPhoto id={letter.portraitId} eager sizes="(max-width: 899px) 86vw, 36rem" />
          </span>
        </figure>
        <div className={home.letterOpenBody}>
          <h2 id="founder-letter-title" className={home.letterTitle} data-split>
            {letter.title}
          </h2>
          <p className={home.letterLead} data-scrub-words data-scrub-from="0.3" data-scrub-end="top 60%">
            {leadBefore}
          </p>
        </div>
      </div>

      <div className={home.debt} data-scrub-stage>
        <div className={home.debtSticky}>
          <blockquote className={home.debtQuote}>
            <span className={home.debtRule} data-draw-line aria-hidden="true" />
            <p data-scrub-words data-scrub-from="0.2" data-scrub-start="top 25%" data-scrub-end="bottom 100%">
              {letter.pullQuote}
            </p>
          </blockquote>
          <span className={home.debtProgress} aria-hidden="true" />
        </div>
      </div>

      <div className={home.letterClose}>
        <p className={home.afterLead} data-motion-reveal="drift">
          {leadAfter}
        </p>
        {stakes ? (
          <p className={home.stakes} data-motion-reveal="drift">
            {stakes}
          </p>
        ) : null}
        {pathRows.length ? (
          <div className={home.pathRows} data-reveal-children data-stagger="0.16">
            {pathRows.map((row, index) => {
              const path = PATH_ORDER[index] ?? 'tensai'
              return (
                <p key={row} className={home.pathRow} data-path={path}>
                  <span className={home.pathTag} aria-hidden="true">
                    {PATH_LABELS[path]}
                  </span>
                  <span className={home.pathText}>{row}</span>
                </p>
              )
            })}
          </div>
        ) : null}
        <p className={home.choice} data-motion-reveal="drift">
          {closingLines.map((line) => (
            <span key={line} className={home.choiceLine}>
              {line}
            </span>
          ))}
        </p>
        <p className={home.signature} data-motion-reveal="drift">
          <span className={home.signatureLine} data-draw-line aria-hidden="true" />
          <span className={home.signatureName}>{letter.signature}</span>
          <span className={home.signatureRole}>{letter.signatureRole}</span>
        </p>
      </div>
    </section>
  )
}
