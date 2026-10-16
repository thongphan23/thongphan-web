import { Fragment, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import PathDoors from '@/components/two-path/PathDoors'
import TwoPathPhoto from '@/components/two-path/TwoPathPhoto'
import {
  originStoryPublic,
  type PublicOriginAsset,
  type PublicOriginClaim,
} from '@/lib/origin-story-evidence'
import { aboutPathContent } from '@/lib/two-path-content'
import type { TwoPathPhotoId } from '@/lib/two-path-photos'
import styles from './OriginStory.module.css'

type PressArtifact = Extract<PublicOriginAsset, { kind: 'press-card' }>
type ImageArtifact = Exclude<PublicOriginAsset, { kind: 'press-card' }>

const sourceTypeLabels: Record<PublicOriginClaim['sourceType'], string> = {
  'personal-account': 'Lời kể cá nhân',
  'owned-archive': 'Tư liệu sở hữu',
  'public-press': 'Nguồn báo chí',
  'system-record': 'Bản ghi hệ thống',
}

const PRINCIPLE = '“AI không thay chuyên môn của bạn. Nó khuếch đại thứ bạn đã biết cách đóng gói.”'

// Kept in the evidence file, hidden from the page: Conan now lives at conan.school,
// and the site only shows real photographs, never AI-generated art.
const hiddenClaimIds = new Set(['conan-maker-handoff'])

// The evidence file cites some claims and clippings in more than one act; the page tells each
// one once, in the first act that needs it.
const toldClaims = new Set<string>()
const shownAssets = new Set<string>()
const publicActs = originStoryPublic.acts.map((act) => {
  const claims = act.claims.filter((claim) => !hiddenClaimIds.has(claim.id) && !toldClaims.has(claim.id))
  const assets = act.assets.filter((asset) => !asset.generated && !shownAssets.has(asset.id))
  claims.forEach((claim) => toldClaims.add(claim.id))
  assets.forEach((asset) => shownAssets.add(asset.id))
  return { ...act, claims, assets }
})

// The principle and the closing choice sit on paper; the five acts share one dark stage, so the
// story reads as one place and the move from act to act is carried by the numerals and the rail,
// not by flipping the ground. Only the first act needs an entrance: it is laid over the paper
// principle as a rounded sheet (the default curtain in the motion signatures).
const ACT_TONE = 'dark'

const pad = (value: number) => String(value).padStart(2, '0')

// Clippings lie a little crooked on the desk.
const CLIPPING_TILTS = ['-2.2deg', '1.6deg', '-1deg'] as const

function ClaimSource({ claim }: { claim: PublicOriginClaim }) {
  // A source label that already names its kind ("Lời kể cá nhân, …") is not prefixed with it again.
  const kind = sourceTypeLabels[claim.sourceType]
  const label = claim.sourceLabel.startsWith(kind) ? claim.sourceLabel : `${kind} · ${claim.sourceLabel}`
  if (!claim.publicHref) return <span className={styles.sourceLabel}>{label}</span>
  if (claim.publicHref.startsWith('https://')) {
    return (
      <a className={styles.sourceLink} href={claim.publicHref} target="_blank" rel="noopener noreferrer">
        {label} <ExternalLink aria-hidden="true" size={13} />
      </a>
    )
  }
  if (claim.publicHref === '/conanmaker/') {
    return <a className={styles.sourceLink} href={claim.publicHref}>{label}</a>
  }
  return <Link className={styles.sourceLink} href={claim.publicHref}>{label}</Link>
}

// The cost of the third act breaks out of the two-column rhythm: after the act's claims it is held
// alone on the screen, the one line on the page that is allowed to be that large, until the next
// act is laid over it.
const VERDICT_CLAIM = 'hstl-debt'
// The verdict's own ten years, counted off beside it while it is held; shown only while the
// proof-backed line still names them, so the figure can never drift from its source.
const VERDICT_YEARS = { phrase: 'Mười năm', count: '10' }

// The verdict is set as its first sentence, very large, over the rest of the line; split on the
// sentence break so a long line never wraps mid-phrase.
const verdictLines = (text: string) => {
  const at = text.search(/[.!?]\s/)
  return at < 0 ? [text] : [text.slice(0, at + 1), text.slice(at + 2)]
}

// The lead's last word (the debt itself) is circled in lacquer; it is split off here so the line
// still comes whole from the evidence file.
function VerdictLead({ line }: { line: string }) {
  const parts = line.match(/^(.*\s)(\S+?)([.!?…]*)$/)
  if (!parts) return <span className={styles.verdictLead}>{line}</span>
  return (
    <span className={styles.verdictLead}>
      {parts[1]}
      <span className={styles.verdictMark}>{parts[2]}</span>
      {parts[3]}
    </span>
  )
}

// Where the original article lives, as a reader would type it.
const hostOf = (href: string) => new URL(href).hostname.replace(/^www\./, '')

// A newspaper clipping: masthead over a double rule, the headline, and where to read the rest.
function PressCard({ asset, index }: { asset: PressArtifact; index: number }) {
  const [outlet, date] = asset.sourceLabel.split(' · ')
  return (
    <div
      className={styles.clipping}
      data-header-ignore
      style={{ '--tilt': CLIPPING_TILTS[index % CLIPPING_TILTS.length] } as CSSProperties}
    >
      <a
        className={styles.pressCard}
        href={asset.publicHref}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Đọc báo"
        data-cursor-tone="lacquer"
      >
        <span className={styles.masthead}>
          <span className={styles.outlet}>{outlet}</span>
          {date ? <span className={styles.pressDate}>{date}</span> : null}
        </span>
        <span className={styles.kicker}>Trích hồ sơ báo chí</span>
        <h3 className={styles.headline}>{asset.headline}</h3>
        <span className={styles.readOriginal}>
          <span className={styles.readLabel}>
            Đọc bài gốc <ExternalLink aria-hidden="true" size={14} />
          </span>
          <span className={styles.host}>{hostOf(asset.publicHref)}</span>
        </span>
      </a>
    </div>
  )
}

// An act with no clipping or photograph still gets an artifact: its first claim is pinned up as a
// note on the same paper, with its own source beneath it, so no act leaves an empty column.
function NoteCard({ claim, label, index }: { claim: PublicOriginClaim; label: string; index: number }) {
  return (
    <div
      className={styles.clipping}
      data-header-ignore
      style={{ '--tilt': CLIPPING_TILTS[index % CLIPPING_TILTS.length] } as CSSProperties}
    >
      <div className={styles.noteCard}>
        <span className={styles.kicker}>Trích hồ sơ · {label}</span>
        <p className={styles.noteText}>{claim.text}</p>
        <ClaimSource claim={claim} />
      </div>
    </div>
  )
}

// The evidence file's present-day print is cut from the same session as the hero portrait, so the
// act would show the reader the first picture again. It is shown with the photo set's own
// present-day hall instead, a different moment, printed square on the speaker (its focal point):
// he stays sharp and large, and the hall, softened for the audience's privacy, falls behind him.
const ASSET_PHOTO: Partial<Record<string, TwoPathPhotoId>> = { 'present-day-stage': 'home-hero' }

function ImageCard({ asset }: { asset: ImageArtifact }) {
  const photoId = ASSET_PHOTO[asset.id]
  return (
    <figure className={styles.imageCard} data-motion-surface data-header-ignore data-focus-bloom>
      {/* The print slot is dark from the first paint, so while the picture is still opening (or
          decoding) the card shows an unexposed print, never a blank sheet of paper. */}
      <div className={styles.imageSlot} style={{ aspectRatio: photoId ? '1 / 1' : `${asset.width} / ${asset.height}` }}>
        <div className={styles.imageFrame} data-img-reveal="up" data-parallax-frame="6">
          <div className={styles.imageMedia} data-reveal-media>
            {photoId ? (
              <TwoPathPhoto id={photoId} sizes="(max-width: 1099px) 92vw, 44vw" eager />
            ) : (
              <Image
                src={asset.imageUrl}
                width={asset.width}
                height={asset.height}
                alt={asset.alt}
                sizes="(max-width: 1099px) 92vw, 44vw"
                loading="eager"
                style={{ objectPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%` }}
              />
            )}
          </div>
        </div>
      </div>
      <figcaption>
        <span>{asset.caption}</span>
        {asset.disclosure ? <small>{asset.disclosure}</small> : null}
      </figcaption>
    </figure>
  )
}

function OriginAsset({ asset, index }: { asset: PublicOriginAsset; index: number }) {
  if (asset.kind === 'press-card') return <PressCard asset={asset} index={index} />
  return <ImageCard asset={asset} />
}

// The pinned stage (wide screens with motion): the acts share one screen and the scroll is cut
// into frames, one per act plus one for the verdict. Each frame holds the screen for its stretch of
// scroll and the next one only takes over once the reader has had all of it, so no frame ever
// shows two acts at once. Lengths are counted in holds, which the CSS sets (an act frame holds for
// one, the verdict for its own). The last act holds as long as the others, then scrolls away in the
// flow with the closing sheet right behind it, so the sheet never lands on a half-read act.
type Span = { h: number; v: number }
type Frame = { act: number; verdict: boolean; at: Span; len: Span }

const round = (value: number) => Math.round(value * 100) / 100
const span = ({ h, v }: Span) => `calc(${round(h)} * var(--hold) + ${round(v)} * var(--vhold))`
const add = (a: Span, b: Span): Span => ({ h: a.h + b.h, v: a.v + b.v })

const frames: Frame[] = []
publicActs.forEach((act, index) => {
  const parts = act.claims.some((claim) => claim.id === VERDICT_CLAIM) ? [false, true] : [false]
  for (const verdict of parts) frames.push({ act: index, verdict, at: { h: 0, v: 0 }, len: { h: verdict ? 0 : 1, v: verdict ? 1 : 0 } })
})
const framesEnd = frames.reduce((at, frame) => {
  frame.at = at
  return add(at, frame.len)
}, { h: 0, v: 0 } as Span)
// The stage is one screen taller than its frames: the last one is still on screen while it leaves.
const STAGE_STYLE = { '--stage': `calc(${span(framesEnd)} + 100svh)` } as CSSProperties

const frameIndex = (act: number, verdict: boolean) => frames.findIndex((frame) => frame.act === act && frame.verdict === verdict)
const frameStyle = (index: number) => ({ '--i': index, '--at': span(frames[index].at) }) as CSSProperties
// A chapter runs from its first frame to the end of its last.
const chapterSpan = (act: number) => {
  const own = frames.filter((frame) => frame.act === act)
  return { at: own[0].at, len: own.reduce((total, frame) => add(total, frame.len), { h: 0, v: 0 } as Span) }
}

export default function OriginStory() {
  return (
    <div className={styles.story} id="origin-story">
      <section className={styles.prologue} data-tone="paper" data-curtain aria-labelledby="origin-principle">
        <figure className={styles.prologueInner}>
          <figcaption id="origin-principle" className={styles.prologueMark} data-motion-reveal="mask">
            00 — Nguyên tắc vận hành
          </figcaption>
          <blockquote className={styles.principle}>
            <p data-scrub-words>{PRINCIPLE}</p>
          </blockquote>
          <div className={styles.seal} data-speed="0.12" data-speed-wide data-spin="140" aria-hidden="true">
            <Image src="/images/homepage/evidence-cinema-stamp-v4.png" width={1024} height={1024} alt="" sizes="(min-width: 1024px) 360px, 180px" />
          </div>
        </figure>
      </section>

      <div className={styles.chapters} data-chapters data-swap style={STAGE_STYLE}>
        {/* Reading progress: a pill pinned to the bottom of the screen while the acts pass (a slim
            index in the right margin on wide screens). The number and title roll to the act being
            read; each segment fills as it is read. */}
        <nav
          className={styles.rail}
          data-chapter-rail
          aria-label="Tiến độ năm hồi"
          style={{ '--count': publicActs.length } as CSSProperties}
        >
          <div className={styles.railPill}>
            <span className={styles.railRoll} aria-hidden="true">
              <span className={styles.railNumbers}>
                {publicActs.map((act, index) => (
                  <span key={act.id}>{pad(index + 1)}</span>
                ))}
              </span>
            </span>
            <span className={styles.railTotal} aria-hidden="true">/ {pad(publicActs.length)}</span>
            <span className={`${styles.railRoll} ${styles.railTitleRoll}`} aria-hidden="true">
              <span className={styles.railTitles}>
                {publicActs.map((act) => (
                  <span key={act.id}>{act.title}</span>
                ))}
              </span>
            </span>
            <ol className={styles.railSegments}>
              {publicActs.map((act) => (
                <li key={act.id}>
                  <a
                    href={`#origin-act-${act.id}`}
                    data-chapter-link
                    data-cursor="Đến hồi"
                    aria-label={`${act.label}: ${act.title}`}
                  >
                    <span className={styles.segmentTrack}>
                      <span className={styles.segmentFill} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {publicActs.map((act, index) => {
          const verdict = act.claims.find((claim) => claim.id === VERDICT_CLAIM)
          // The first claim of an act with nothing to show becomes its note (and leaves the list).
          const note = act.assets.length === 0 ? act.claims.find((claim) => claim !== verdict) : undefined
          const hasAssets = act.assets.length > 0 || Boolean(note)
          const listed = act.claims.filter((claim) => claim !== verdict && claim !== note)
          const titleId = `origin-act-${act.id}-title`
          // Every second act is mirrored on wide screens, so the evidence changes sides down the page.
          const mirrored = index % 2 === 1
          const actFrame = frameIndex(index, false)
          const chapter = chapterSpan(index)
          return (
            <section
              key={act.id}
              className={styles.act}
              data-tone={ACT_TONE}
              data-curtain={index === 0 ? '' : undefined}
              data-has-verdict={verdict ? '' : undefined}
              data-mirror={mirrored ? '' : undefined}
              id={`origin-act-${act.id}`}
              aria-labelledby={titleId}
              style={{ '--at': span(frames[actFrame].at) } as CSSProperties}
            >
              {/* Scroll markers: the chapter's stretch for the rail, and one step per frame for the
                  stage. Without the pinned stage the chapter marker simply covers the section. */}
              <span
                className={styles.chapterMark}
                data-chapter
                aria-hidden="true"
                style={{ '--at': span(chapter.at), '--len': span(chapter.len) } as CSSProperties}
              />
              {frames.map((frame, k) =>
                frame.act === index ? (
                  <span
                    key={k}
                    className={styles.stepMark}
                    data-swap-step
                    aria-hidden="true"
                    style={{ '--at': span(frame.at), '--len': span(frame.len) } as CSSProperties}
                  />
                ) : null,
              )}

              <div className={styles.frame} data-frame={actFrame} style={frameStyle(actFrame)}>
                <div
                  className={styles.actGrid}
                  data-origin-act={act.id}
                  data-has-assets={hasAssets}
                  data-dense={listed.length > 2 ? '' : undefined}
                  data-mirror-grid={mirrored ? '' : undefined}
                >
                  <header className={styles.actHeader} data-focus-bloom>
                    <p className={styles.actLabel}>{act.label}</p>
                    <div className={styles.actTitleRow}>
                      <p className={styles.numeral} data-chapter-numeral aria-hidden="true">
                        <span className={styles.numeralOutline}>{pad(index + 1)}</span>
                        <span className={styles.numeralFill}>{pad(index + 1)}</span>
                      </p>
                      <h2 id={titleId} data-split>
                        {act.title}
                      </h2>
                    </div>
                  </header>

                  <div className={styles.actBody}>
                    <ol className={styles.claims}>
                      {act.claims.map((claim) =>
                        claim === verdict || claim === note ? null : (
                          <li
                            key={claim.id}
                            className={styles.claim}
                            style={{ '--n': listed.indexOf(claim) } as CSSProperties}
                          >
                            <span className={styles.claimRule} data-draw-line aria-hidden="true" />
                            <p>{claim.text}</p>
                            <ClaimSource claim={claim} />
                          </li>
                        ),
                      )}
                    </ol>
                    {hasAssets ? (
                      <div className={styles.assets} data-assets={act.assets.length || 1}>
                        {act.assets.map((asset, assetIndex) => (
                          <div
                            key={asset.id}
                            className={styles.assetCard}
                            style={{ '--n': assetIndex } as CSSProperties}
                          >
                            <OriginAsset asset={asset} index={index + assetIndex} />
                          </div>
                        ))}
                        {note ? (
                          <div className={styles.assetCard}>
                            <NoteCard claim={note} label={act.label} index={index} />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {verdict ? (
                <div
                  className={`${styles.frame} ${styles.verdictStage}`}
                  data-frame={frameIndex(index, true)}
                  data-scrub-stage
                  style={frameStyle(frameIndex(index, true))}
                >
                  <div className={styles.verdictHold}>
                    {/* Ten years are counted off while the line is held; the rest of the line only
                        lands once the count has reached them. */}
                    <div
                      className={`${styles.claim} ${styles.verdict}`}
                      data-scroll-count={verdict.text.includes(VERDICT_YEARS.phrase) ? '' : undefined}
                      data-count-from="1"
                      data-count-start="top top"
                      data-count-end="top -40%"
                    >
                      <span className={styles.claimRule} data-draw-line aria-hidden="true" />
                      {verdict.text.includes(VERDICT_YEARS.phrase) ? (
                        <div className={styles.verdictClock} aria-hidden="true">
                          <span className={styles.clockLabel}>
                            Năm <span className={styles.clockValue} data-count-value>{VERDICT_YEARS.count}</span> / {VERDICT_YEARS.count}
                          </span>
                          <span className={styles.clockTrack}>
                            <span className={styles.clockFill} />
                          </span>
                        </div>
                      ) : null}
                      <p>
                        {/* Keyed by position, so the sentence itself is not repeated in the payload. */}
                        {verdictLines(verdict.text).map((line, lineIndex) => (
                          <Fragment key={lineIndex}>
                            {lineIndex ? ' ' : null}
                            {lineIndex ? (
                              <span className={styles.verdictRest}>{line}</span>
                            ) : (
                              <VerdictLead line={line} />
                            )}
                          </Fragment>
                        ))}
                      </p>
                      <ClaimSource claim={verdict} />
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>

      <section className={styles.closing} aria-labelledby="origin-story-closing" data-curtain>
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow} data-motion-reveal="mask">
            Hồi tiếp theo thuộc về bạn
          </p>
          <h2 id="origin-story-closing" className={styles.closingTitle} data-split>
            {aboutPathContent.title}
          </h2>
          <div className={styles.closingCopy} data-reveal-children>
            {aboutPathContent.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className={styles.closingDoors}>
            <PathDoors variant="closing" placement="closing" />
          </div>
          <Link className={styles.proofLink} href={aboutPathContent.proofLink.href} data-motion-action>
            {aboutPathContent.proofLink.label}
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
