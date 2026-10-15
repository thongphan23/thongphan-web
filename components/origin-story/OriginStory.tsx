import { Fragment, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import PathDoors from '@/components/two-path/PathDoors'
import {
  originStoryPublic,
  type PublicOriginAsset,
  type PublicOriginClaim,
} from '@/lib/origin-story-evidence'
import { aboutPathContent } from '@/lib/two-path-content'
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

// The low points (the leap, the debt, the system that came out of it) sit in the dark; the
// openings sit on paper. Each act is a sheet laid over the last.
const toneOf = (index: number) => (index % 2 === 0 ? 'dark' : 'paper')

// With motion, each act arrives its own way (see curtains in the motion signatures), so five
// changes of tone never repeat one trick: the first dark act opens like an iris, the first paper
// one turns over the act before it like a page, the cost sweeps in from the edge, the rebuilding
// is laid over the held cost (data-sheet-over, below), and the system opens as a plain sheet.
const ENTRANCES = ['iris', 'sheet', 'wipe', '', ''] as const

const pad = (value: number) => String(value).padStart(2, '0')

// Clippings lie a little crooked on the desk.
const CLIPPING_TILTS = ['-2.2deg', '1.6deg', '-1deg'] as const

function ClaimSource({ claim }: { claim: PublicOriginClaim }) {
  const label = `${sourceTypeLabels[claim.sourceType]} · ${claim.sourceLabel}`
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

function ImageCard({ asset }: { asset: ImageArtifact }) {
  return (
    <figure className={styles.imageCard} data-motion-surface data-header-ignore data-focus-bloom>
      <div
        className={styles.imageFrame}
        data-img-reveal="up"
        data-parallax-frame="6"
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      >
        <div className={styles.imageMedia} data-reveal-media>
          <Image
            src={asset.imageUrl}
            width={asset.width}
            height={asset.height}
            alt={asset.alt}
            sizes="(max-width: 1023px) 92vw, 52vw"
            style={{ objectPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%` }}
          />
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

      <div className={styles.chapters} data-chapters>
        {/* Reading progress: a pill pinned to the bottom of the screen while the acts pass.
            The number and title roll to the act being read; each segment fills as it is read. */}
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
                  <a href={`#origin-act-${act.id}`} data-chapter-link aria-label={`${act.label}: ${act.title}`}>
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
          const tone = toneOf(index)
          const hasAssets = act.assets.length > 0
          const titleId = `origin-act-${act.id}-title`
          const verdict = act.claims.find((claim) => claim.id === VERDICT_CLAIM)
          const overVerdict = publicActs[index - 1]?.claims.some((claim) => claim.id === VERDICT_CLAIM)
          const stacked = act.assets.length > 1
          return (
            <section
              key={act.id}
              className={styles.act}
              data-tone={tone}
              data-curtain={overVerdict ? undefined : ENTRANCES[index % ENTRANCES.length]}
              data-sheet-over={overVerdict ? '' : undefined}
              data-has-verdict={verdict ? '' : undefined}
              data-chapter
              id={`origin-act-${act.id}`}
              aria-labelledby={titleId}
            >
              <div className={styles.actGrid} data-origin-act={act.id} data-has-assets={hasAssets} data-stacked={stacked}>
                <header className={styles.actHeader}>
                  <p className={styles.actLabel}>{act.label}</p>
                  <p className={styles.numeral} data-chapter-numeral aria-hidden="true">
                    <span className={styles.numeralOutline}>{pad(index + 1)}</span>
                    <span className={styles.numeralFill}>{pad(index + 1)}</span>
                  </p>
                  <h2 id={titleId} data-split>
                    {act.title}
                  </h2>
                </header>

                <div className={styles.actBody}>
                  <ol className={styles.claims}>
                    {act.claims.map((claim) =>
                      claim === verdict ? null : (
                        <li key={claim.id} className={styles.claim}>
                          <span className={styles.claimRule} data-draw-line aria-hidden="true" />
                          <p>{claim.text}</p>
                          <ClaimSource claim={claim} />
                        </li>
                      ),
                    )}
                  </ol>
                  {/* On wide screens the evidence holds its own column: each piece stays on screen
                      while the act is read, and a second clipping slides up over the first. */}
                  {hasAssets ? (
                    <div
                      className={styles.assets}
                      data-assets={act.assets.length}
                      data-stack={stacked ? '' : undefined}
                      data-stack-media="(min-width: 1024px)"
                      data-stack-scale="0.94"
                      data-stack-opacity="0.55"
                    >
                      {act.assets.map((asset, assetIndex) => (
                        <Fragment key={asset.id}>
                          {assetIndex > 0 ? <span className={styles.stackMark} data-stack-mark aria-hidden="true" /> : null}
                          <div
                            className={styles.stackCard}
                            data-stack-card
                            style={{ '--stack-i': assetIndex } as CSSProperties}
                          >
                            <OriginAsset asset={asset} index={index + assetIndex} />
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              {verdict ? (
                <div className={styles.verdictStage} data-scrub-stage>
                  <div className={styles.verdictHold} data-sheet-under>
                    <div className={`${styles.claim} ${styles.verdict}`}>
                      <span className={styles.claimRule} data-draw-line aria-hidden="true" />
                      {verdict.text.includes(VERDICT_YEARS.phrase) ? (
                        <div
                          className={styles.verdictClock}
                          data-scroll-count
                          data-count-from="1"
                          data-count-start="top 45%"
                          data-count-end="top -25%"
                          aria-hidden="true"
                        >
                          <span className={styles.clockLabel}>
                            Năm <span className={styles.clockValue} data-count-value>{VERDICT_YEARS.count}</span> / {VERDICT_YEARS.count}
                          </span>
                          <span className={styles.clockTrack}>
                            <span className={styles.clockFill} />
                          </span>
                        </div>
                      ) : null}
                      <p data-scrub-words data-scrub-from="0.5" data-scrub-start="top 45%" data-scrub-end="top -25%">
                        {verdictLines(verdict.text).map((line, lineIndex) => (
                          <Fragment key={line}>
                            {lineIndex ? ' ' : null}
                            <span className={lineIndex ? styles.verdictRest : styles.verdictLead}>{line}</span>
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
