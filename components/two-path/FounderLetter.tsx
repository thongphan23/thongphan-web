import type { CSSProperties } from 'react'
import { homeContent } from '@/lib/two-path-content'
import { PATH_LABELS, type PathKey } from '@/lib/two-path-links'
import PathLink from './PathLink'
import TwoPathPhoto from './TwoPathPhoto'
import home from './HomeSections.module.css'

// The letter is told in four beats, one idea per screen:
//   1. who is writing (the portrait, the title and the first sentence, lit word by word); on wide
//      screens it holds still and steps back while the next beat is laid over it,
//   2. the number (a lacquer card that rises over beat 1, holds while the debt settles line by
//      line, then steps back as the paper of the next beat slides up over it),
//   3. what he lost (one large sentence) and why there are two paths,
//   4. one decision: "Chọn một cửa." over two large rows, each with its own button, then the
//      signature.
// Without the motion engine (or under reduced motion) every beat is simply a tall, fully lit block.
const PATH_ORDER: PathKey[] = ['tensai', 'conan']
const pad = (value: number) => String(value).padStart(2, '0')

export default function FounderLetter() {
  const { letter } = homeContent
  const [lead, ...rest] = letter.paragraphs
  const [leadBefore, leadAfter] = lead.split(letter.pullQuote).map((part) => part.trim())
  const [stakes, paths] = rest.slice(0, -1)
  const last = rest[rest.length - 1]
  // "Nếu bạn đi làm, ... . Nếu bạn đang hoặc muốn kinh doanh, ..." becomes one row per path.
  const pathRows = (paths ?? '').split(/(?<=\.)\s+(?=Nếu)/).filter(Boolean)
  const closingLines = last.split(/(?<=\.)\s+/).filter(Boolean)
  // The debt is set as display lines: one per sentence, a long sentence halved at its middle word.
  const debtLines = letter.pullQuote
    .split(/(?<=\.)\s+/)
    .flatMap((sentence) => {
      const words = sentence.split(' ')
      if (words.length <= 4) return [sentence]
      const half = Math.floor(words.length / 2)
      return [words.slice(0, half).join(' '), words.slice(half).join(' ')]
    })

  return (
    <section className={home.letter} aria-labelledby="founder-letter-title">
      <div className={home.letterOpen}>
        <figure className={home.letterPortrait} data-img-reveal="up" data-parallax-frame="5" data-photo-bloom>
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

      <div className={home.debt}>
        <div className={home.debtSticky}>
          <blockquote className={home.debtQuote}>
            <span className={home.debtRule} data-draw-line aria-hidden="true" />
            <p>
              {debtLines.map((line, index) => (
                <span key={line} className={home.debtLine} style={{ '--line': index } as CSSProperties}>
                  <span className={home.debtLineInner}>{line}</span>{' '}
                </span>
              ))}
            </p>
          </blockquote>
        </div>
      </div>

      <div className={home.letterSheet}>
        <div className={home.letterClose}>
          <div className={home.closeLead}>
            <p className={home.afterLead}>{leadAfter}</p>
            {stakes ? <p className={home.stakes}>{stakes}</p> : null}
          </div>
          {/* One decision: the question, then one row per path. The button is the row's link and
              its hit area covers the whole row, so the row itself is the target on touch too. */}
          <div className={home.decision} role="group" aria-labelledby="letter-choice">
            <p id="letter-choice" className={home.choice}>
              {/* The guide's pen underlines the question itself once the row below can be read. */}
              {closingLines.map((line, index) => (
                <span
                  key={line}
                  className={home.choiceLine}
                  {...(index === 0 && closingLines.length > 1
                    ? { 'data-pen': 'underline', 'data-pen-tone': 'lacquer', 'data-pen-start': 'top 78%', 'data-pen-end': 'top 52%' }
                    : {})}
                >
                  {line}
                </span>
              ))}
            </p>
            {pathRows.length ? (
              <ol className={home.pathRows} data-reveal-children data-stagger="0.14">
                {pathRows.map((row, index) => {
                  const path = PATH_ORDER[index] ?? 'tensai'
                  const door = homeContent.doors.find((item) => item.path === path)
                  return (
                    <li key={row} className={home.pathRow} data-path={path}>
                      <span className={home.pathIndex} aria-hidden="true">
                        {pad(index + 1)}
                      </span>
                      <h3 className={home.pathTitle}>{door?.label ?? PATH_LABELS[path]}</h3>
                      <p className={home.pathText}>{row}</p>
                      <PathLink
                        path={path}
                        kind="door"
                        placement="door"
                        className={home.pathCta}
                        data-motion-action
                      >
                        <span>{letter.pathCta[path]}</span>
                        <span className={home.pathCtaArrow} aria-hidden="true">
                          →
                        </span>
                      </PathLink>
                    </li>
                  )
                })}
              </ol>
            ) : null}
            <p className={home.signature} data-motion-reveal="drift">
              <span className={home.signatureLine} data-draw-line aria-hidden="true" />
              <span className={home.signatureName}>{letter.signature}</span>
              <span className={home.signatureRole}>{letter.signatureRole}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
