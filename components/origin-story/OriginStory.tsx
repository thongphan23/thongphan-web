import type { CSSProperties } from 'react'
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
// openings sit on paper. Each act is a sheet laid over the last; with motion, the paper ones open
// like a curtain as they arrive.
const toneOf = (index: number) => (index % 2 === 0 ? 'dark' : 'paper')

const pad = (value: number) => String(value).padStart(2, '0')

// Clippings lie a little crooked on the desk and drift at their own pace as the page passes.
// A pair drifts apart as it enters (the upper one rises, the lower one sinks) so the pile opens up.
const CLIPPING_TILTS = ['-2.2deg', '1.6deg', '-1deg'] as const
const CLIPPING_SPEEDS = ['0.05', '-0.05', '0.03'] as const

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

// Where the original article lives, as a reader would type it.
const hostOf = (href: string) => new URL(href).hostname.replace(/^www\./, '')

// A newspaper clipping: masthead over a double rule, the headline, and where to read the rest.
function PressCard({ asset, index }: { asset: PressArtifact; index: number }) {
  const [outlet, date] = asset.sourceLabel.split(' · ')
  return (
    <div
      className={styles.clipping}
      data-speed={CLIPPING_SPEEDS[index % CLIPPING_SPEEDS.length]}
      data-speed-wide
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
    <figure className={styles.imageCard} data-motion-surface>
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
          <div className={styles.seal} data-speed="0.12" data-speed-wide aria-hidden="true">
            <Image src="/images/homepage/evidence-cinema-stamp-v4.png" width={1024} height={1024} alt="" sizes="180px" />
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
          return (
            <section
              key={act.id}
              className={styles.act}
              data-tone={tone}
              data-curtain={tone === 'paper' ? '' : undefined}
              data-chapter
              id={`origin-act-${act.id}`}
              aria-labelledby={titleId}
            >
              <div className={styles.actGrid} data-origin-act={act.id} data-has-assets={hasAssets}>
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
                    {act.claims.map((claim) => {
                      const consequence = claim.id === 'hstl-debt'
                      return (
                        <li key={claim.id} className={styles.claim} data-consequence={consequence ? 'true' : undefined}>
                          <span className={styles.claimRule} data-draw-line aria-hidden="true" />
                          <p data-scrub-words={consequence ? '' : undefined}>{claim.text}</p>
                          <ClaimSource claim={claim} />
                        </li>
                      )
                    })}
                  </ol>
                  {hasAssets ? (
                    <div className={styles.assets} data-assets={act.assets.length}>
                      {act.assets.map((asset, assetIndex) => (
                        <OriginAsset key={asset.id} asset={asset} index={index + assetIndex} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
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
