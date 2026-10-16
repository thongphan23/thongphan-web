import type { CSSProperties } from 'react'
import { homeContent } from '@/lib/two-path-content'
import TwoPathPhoto from './TwoPathPhoto'
import home from './HomeSections.module.css'

// The letter is told in four beats, one idea per screen:
//   1. who is writing (the portrait, the title and the first sentence, lit word by word); on wide
//      screens it holds still and steps back while the next beat is laid over it,
//   2. the number (a lacquer card that rises over beat 1, holds while the debt settles line by
//      line, then steps back as the paper of the next beat slides up over it),
//   3. what he lost (one large sentence), why there are two paths and what each one is,
//   4. one sentence ("Chọn một cửa.") and one link down to the two doors that close the page, where
//      the decision is made once, then the signature.
// The guide's trail (guide-trail.ts) threads the margins of every beat through the data-trail-*
// anchors. Without the motion engine (or under reduced motion) every beat is a tall, fully lit block.
export default function FounderLetter() {
  const { letter } = homeContent
  const [lead, ...rest] = letter.paragraphs
  const [leadBefore, leadAfter] = lead.split(letter.pullQuote).map((part) => part.trim())
  const [stakes, paths] = rest.slice(0, -1)
  const last = rest[rest.length - 1]
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
      <div
        className={home.letterOpen}
        data-trail-scope="open"
        data-trail-under="slab"
        data-trail-point="9|12"
        data-trail-at="0.5 0 0 6|0 1 40 -16"
      >
        <figure
          className={home.letterPortrait}
          data-img-reveal="up"
          data-parallax-frame="5"
          data-photo-bloom
          data-trail-point="10|11"
          data-trail-at="1 0 30 -40|1 1 30 14"
        >
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

      <div className={home.debt} data-trail-scope="slab" data-trail-under="sheet2">
        {/* On the lacquer the trail turns paper white and runs above the rule, then down the
            right gutter, so it never crosses the debt lines. */}
        <div
          className={home.debtSticky}
          data-trail-cover="slab"
          data-trail-point="20|23|24"
          data-trail-at="0 0 40 22|1 0 -38 22|1 1 -38 -40"
          data-trail-tone="paper"
          data-trail-at-m="0 0 10 28|0 0 10 28|0 1 10 -20"
        >
          <blockquote className={home.debtQuote}>
            <span className={home.debtRule} data-draw-line aria-hidden="true" />
            <p>
              {debtLines.map((line, index) => (
                <span key={line} className={home.debtLine} style={{ '--line': index } as CSSProperties}>
                  <span className={home.debtLineInner}>
                    {line}
                  </span>{' '}
                </span>
              ))}
            </p>
          </blockquote>
        </div>
      </div>

      <div
        className={home.letterSheet}
        data-trail-cover="sheet2"
        data-trail-scope="sheet2"
        data-trail-point="30|47"
        data-trail-at="1 0 -38 10|1 1 -38 -10"
      >
        <div className={home.letterClose}>
          <div className={home.closeLead}>
            <p className={home.afterLead}>{leadAfter}</p>
            <div className={home.closeBody} data-trail-point="31" data-trail-at="1 1 40 24" data-trail-mobile="off">
              {stakes ? <p className={home.stakes}>{stakes}</p> : null}
              {paths ? <p className={home.stakes}>{paths}</p> : null}
            </div>
          </div>
          {/* One sentence and one link: the trail underlines the question, then runs on to the
              signature and down the page to the two doors. */}
          <div className={home.decision} data-trail-point="32" data-trail-at="0 0 -30 -22">
            <p className={home.choice} data-trail-point="46" data-trail-at="1 1 39 6" data-trail-mobile="off">
              {closingLines.map((line, index) => (
                <span
                  key={line}
                  className={home.choiceLine}
                  {...(index === 0
                    ? { 'data-trail-point': '44', 'data-trail-at': '0 1 -6 14' }
                    : { 'data-trail-point': '45', 'data-trail-at': '1 1 10 16' })}
                >
                  {line}
                </span>
              ))}
            </p>
            <a className={home.choiceLink} href="#hai-con-duong">
              <span>{homeContent.closing.eyebrow}</span>
              <span className={home.choiceLinkArrow} aria-hidden="true">
                ↓
              </span>
            </a>
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
