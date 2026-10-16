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
const PRINCIPLE_MARK = 'đóng gói'
const PRINCIPLE_AT = PRINCIPLE.indexOf(PRINCIPLE_MARK)

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
// not by flipping the ground. The stage arrives as one rounded sheet laid over the principle,
// which holds still and dims under it on wide screens (the "sheet" curtain in the signatures).
const ACT_TONE = 'dark'

// Each act is set as a different kind of document on the same twelve-column desk, so no two
// frames in a row read alike: a collage of clippings, a full-bleed broadsheet, a stamped memo, a
// timeline beside a print, and a file of records.
const ACT_LAYOUT: Record<string, string> = {
  difference: 'collage',
  attention: 'print',
  'core-product': 'quote',
  rebuilding: 'timeline',
  system: 'records',
}

const STAMP = '/images/homepage/evidence-cinema-stamp-v4.png'

const pad = (value: number) => String(value).padStart(2, '0')

// Clippings lie a little crooked on the desk.
const CLIPPING_TILTS = ['-2.2deg', '1.6deg', '-1deg'] as const

// A source label that already names its kind ("Lời kể cá nhân, …") is not prefixed with it again.
function sourceText(claim: PublicOriginClaim) {
  const kind = sourceTypeLabels[claim.sourceType]
  return claim.sourceLabel.startsWith(kind) ? claim.sourceLabel : `${kind} · ${claim.sourceLabel}`
}

// Two claims in a row from the same source name it once: the second points back to the first.
function ClaimSource({ claim, after }: { claim: PublicOriginClaim; after?: PublicOriginClaim }) {
  const label = sourceText(claim)
  if (after && after.publicHref === claim.publicHref && sourceText(after) === label) {
    return <span className={styles.sourceLabel}>Cùng nguồn với ý trước</span>
  }
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
// act would show the reader the first picture again. It is printed from the photo set's own
// present-day portrait instead: a sharp, face-on picture, shown in its own 4:5 frame and never
// wider than its native pixels, so the print is crisp at every size.
const ASSET_PHOTO: Partial<Record<string, TwoPathPhotoId>> = { 'present-day-stage': 'mentor-thong-phan' }

function ImageCard({ asset }: { asset: ImageArtifact }) {
  const photoId = ASSET_PHOTO[asset.id]
  return (
    <figure
      className={styles.imageCard}
      data-motion-surface
      data-header-ignore
      data-focus-bloom
      data-photo-bloom={photoId ? '' : undefined}
    >
      {/* The print slot is dark from the first paint, so while the picture is still opening (or
          decoding) the card shows an unexposed print, never a blank sheet of paper. */}
      <div className={styles.imageSlot} style={{ aspectRatio: photoId ? '4 / 5' : `${asset.width} / ${asset.height}` }}>
        <div className={styles.imageFrame} data-img-reveal="up" data-parallax-frame="6">
          <div className={styles.imageMedia} data-reveal-media>
            {photoId ? (
              <TwoPathPhoto id={photoId} sizes="368px" eager />
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
// shows two acts at once. Lengths are counted in holds, which the CSS sets (80svh for an act, the
// verdict its own), and differ by document: the broadsheet's push-in is held longest, the memo and
// the records shortest, so the acts do not all beat at one tempo. The last act stays held under the
// closing sheet, which the CSS lays over the stage's last screen, but only for as long as the sheet
// takes to come up, so the story never stalls on its final card.
// Each hold is played in two beats (a step marker per half): the act settles once, then its
// document moves on to its second still, so a held act is never one picture for a whole screen.
type Span = { h: number; v: number }
type Frame = { act: number; verdict: boolean; at: Span; len: Span }

const FRAME_HOLDS: Record<string, number> = { collage: 1, print: 1.725, quote: 0.8875, timeline: 1.1375, records: 0.875 }
const VERDICT_HOLDS = 1.05

const round = (value: number) => Math.round(value * 10000) / 10000
const span = ({ h, v }: Span) => `calc(${round(h)} * var(--hold) + ${round(v)} * var(--vhold))`
const add = (a: Span, b: Span): Span => ({ h: a.h + b.h, v: a.v + b.v })

const frames: Frame[] = []
publicActs.forEach((act, index) => {
  const parts = act.claims.some((claim) => claim.id === VERDICT_CLAIM) ? [false, true] : [false]
  const holds = FRAME_HOLDS[ACT_LAYOUT[act.id] ?? 'collage'] ?? 1
  for (const verdict of parts) frames.push({ act: index, verdict, at: { h: 0, v: 0 }, len: { h: verdict ? 0 : holds, v: verdict ? VERDICT_HOLDS : 0 } })
})
const framesEnd = frames.reduce((at, frame) => {
  frame.at = at
  return add(at, frame.len)
}, { h: 0, v: 0 } as Span)
// The stage is taller than its frames by the screen the last act stays held under the closing
// sheet and the stretch the sheet takes to come up over it.
const STAGE_STYLE = { '--stage': `calc(${span(framesEnd)} + 232svh)` } as CSSProperties

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
            {/* The words light up with the scroll; the pen underlines the last of them in one stroke
                once the whole line is in view, never half-drawn under a reader who has stopped. */}
            <p data-scrub-words data-scrub-end="top 60%">
              {PRINCIPLE.slice(0, PRINCIPLE_AT)}
              <span data-pen="underline" data-pen-tone="lacquer" data-pen-trigger="enter" data-pen-start="top 88%" data-pen-delay="150">
                {PRINCIPLE_MARK}
              </span>
              {PRINCIPLE.slice(PRINCIPLE_AT + PRINCIPLE_MARK.length)}
            </p>
          </blockquote>
          {/* The guide's pen rings the printed seal just outside its own printed border. */}
          <div
            className={styles.seal}
            data-speed="0.12"
            data-speed-wide
            data-spin="140"
            aria-hidden="true"
            data-pen="circle"
            data-pen-tone="lacquer"
            data-pen-inset="3%"
            data-pen-trigger="enter"
            data-pen-start="top 85%"
          >
            <Image src={STAMP} width={1024} height={1024} alt="" sizes="(min-width: 1024px) 360px, 180px" />
          </div>
        </figure>
      </section>

      <div className={styles.chapters} data-chapters data-swap data-curtain="sheet" style={STAGE_STYLE}>
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
          const layout = ACT_LAYOUT[act.id] ?? 'collage'
          const actFrame = frameIndex(index, false)
          const chapter = chapterSpan(index)
          return (
            <section
              key={act.id}
              className={styles.act}
              data-tone={ACT_TONE}
              data-has-verdict={verdict ? '' : undefined}
              data-layout={layout}
              id={`origin-act-${act.id}`}
              aria-labelledby={titleId}
              style={{ '--at': span(frames[actFrame].at) } as CSSProperties}
            >
              {/* Scroll markers: the chapter's stretch for the rail, and two steps per frame (one per
                  beat) for the stage. Without the pinned stage the chapter marker covers the section. */}
              <span
                className={styles.chapterMark}
                data-chapter
                aria-hidden="true"
                style={{ '--at': span(chapter.at), '--len': span(chapter.len) } as CSSProperties}
              />
              {frames.map((frame, k) =>
                frame.act === index
                  ? [0, 1].map((beat) => (
                      <span
                        key={`${k}-${beat}`}
                        className={styles.stepMark}
                        data-swap-step
                        aria-hidden="true"
                        style={
                          {
                            '--at': span(add(frame.at, { h: (frame.len.h * beat) / 2, v: (frame.len.v * beat) / 2 })),
                            '--len': span({ h: frame.len.h / 2, v: frame.len.v / 2 }),
                          } as CSSProperties
                        }
                      />
                    ))
                  : null,
              )}

              <div className={styles.frame} data-frame={actFrame} style={frameStyle(actFrame)}>
                <div className={styles.actGrid} data-origin-act={act.id} data-has-assets={hasAssets} data-layout={layout}>
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
                            <ClaimSource claim={claim} after={listed[listed.indexOf(claim) - 1]} />
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
                            {/* The memo of the act that cost the most is stamped by the archive. */}
                            {layout === 'quote' ? (
                              <span className={styles.memoStamp} aria-hidden="true">
                                <Image src={STAMP} width={1024} height={1024} alt="" sizes="160px" />
                              </span>
                            ) : null}
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

      {/* The story ends as a sealed dossier: a paper file with its title on a case-file tab, the two
          paths filed inside it as folders, and the archive's seal pressed at the foot. */}
      <section className={styles.closing} aria-labelledby="origin-story-closing" data-curtain>
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow} data-motion-reveal="mask">
            Hồi tiếp theo thuộc về bạn
          </p>
          <h2
            id="origin-story-closing"
            className={styles.closingTitle}
            data-split
            data-pen="arrow"
            data-pen-tone="lacquer"
            data-pen-to="[data-path-door]"
            data-pen-side="bottom,top"
            data-pen-trigger="enter"
            data-pen-start="top 75%"
            data-pen-media="(min-width: 1024px)"
          >
            {aboutPathContent.title}
          </h2>
          <div className={styles.closingCopy} data-reveal-children>
            {aboutPathContent.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className={styles.closingDoors}>
            <PathDoors variant="closing" placement="closing" />
          </div>
          <div className={styles.closingFoot}>
            <Link className={styles.proofLink} href={aboutPathContent.proofLink.href} data-motion-action>
              {aboutPathContent.proofLink.label}
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
            <div
              className={styles.closingSeal}
              aria-hidden="true"
              data-pen="circle"
              data-pen-tone="lacquer"
              data-pen-inset="4%"
              data-pen-trigger="enter"
              data-pen-start="top 90%"
              data-pen-delay="250"
            >
              <Image src={STAMP} width={1024} height={1024} alt="" sizes="200px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
