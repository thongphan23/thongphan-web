import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { DossierFolio } from '@/components/dossier/DossierFolio'
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

const revealModes = ['mask', 'fade', 'drift', 'fade', 'mask'] as const

// Kept in the evidence file, hidden from the page: Conan now lives at conan.school,
// and the site only shows real photographs, never AI-generated art.
const hiddenClaimIds = new Set(['conan-maker-handoff'])

const publicActs = originStoryPublic.acts.map((act) => ({
  ...act,
  claims: act.claims.filter((claim) => !hiddenClaimIds.has(claim.id)),
  assets: act.assets.filter((asset) => !asset.generated),
}))

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

function PressCard({ asset }: { asset: PressArtifact }) {
  return (
    <a
      className={styles.pressCard}
      href={asset.publicHref}
      target="_blank"
      rel="noopener noreferrer"
      data-motion-surface
    >
      <span>Trích hồ sơ báo chí</span>
      <h3>{asset.headline}</h3>
      <p>{asset.sourceLabel}</p>
      <strong>Đọc nguồn gốc <ExternalLink aria-hidden="true" size={15} /></strong>
    </a>
  )
}

function ImageCard({
  asset,
  priority = false,
  stamped = false,
}: {
  asset: ImageArtifact
  priority?: boolean
  stamped?: boolean
}) {
  return (
    <figure className={styles.imageCard} data-motion-surface>
      <div className={styles.imageFrame}>
        <Image
          src={asset.imageUrl}
          width={asset.width}
          height={asset.height}
          alt={asset.alt}
          priority={priority}
          sizes="(max-width: 820px) 100vw, 58vw"
          style={{
            aspectRatio: `${asset.width} / ${asset.height}`,
            objectPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%`,
          }}
        />
        {stamped ? (
          <Image
            className={styles.stamp}
            src="/images/homepage/evidence-cinema-stamp-v4.png"
            width={1024}
            height={1024}
            alt=""
            aria-hidden="true"
          />
        ) : null}
      </div>
      <figcaption>
        <span>{asset.caption}</span>
        {asset.disclosure ? <small>{asset.disclosure}</small> : null}
      </figcaption>
    </figure>
  )
}

function OriginAsset({ asset }: { asset: PublicOriginAsset }) {
  if (asset.kind === 'press-card') return <PressCard asset={asset} />
  return <ImageCard asset={asset} />
}

export default function OriginStory() {
  const presentAsset = originStoryPublic.acts
    .flatMap((act) => act.assets)
    .find((asset) => asset.id === 'present-day-stage')

  if (!presentAsset || presentAsset.kind === 'press-card') {
    throw new Error('Origin story present-day portrait is unavailable')
  }

  return (
    <div className={styles.story} id="origin-story">
      <DossierFolio tone="dark" index="00" label="Chân dung và nguyên tắc" className={styles.opener}>
        <div className={styles.openerGrid} data-motion-reveal="fade">
          <ImageCard asset={presentAsset} priority stamped />
          <blockquote>
            <p>“AI không thay chuyên môn của bạn. Nó khuếch đại thứ bạn đã biết cách đóng gói.”</p>
            <span>Nguyên tắc vận hành</span>
          </blockquote>
        </div>
      </DossierFolio>

      {publicActs.map((act, index) => {
        const tone = index % 2 === 0 ? 'paper' : 'dark'
        const hasAssets = act.assets.length > 0
        return (
          <DossierFolio
            key={act.id}
            tone={tone}
            index={String(index + 1).padStart(2, '0')}
            label="Câu chuyện nguồn gốc"
            className={styles.act}
          >
            <div
              className={styles.actGrid}
              data-origin-act={act.id}
              data-has-assets={hasAssets}
              data-motion-reveal={revealModes[index]}
              id={`origin-act-${act.id}`}
            >
              <div className={styles.actCopy}>
                <header className={styles.actHeader}>
                  <p>{act.label}</p>
                  <h2>{act.title}</h2>
                </header>
                <ol className={styles.claims}>
                  {act.claims.map((claim) => (
                    <li key={claim.id} data-consequence={claim.id === 'hstl-debt' ? 'true' : undefined}>
                      <p>{claim.text}</p>
                      <ClaimSource claim={claim} />
                    </li>
                  ))}
                </ol>
              </div>
              {hasAssets ? (
                <div className={styles.assetGrid}>
                  {act.assets.map((asset) => <OriginAsset key={asset.id} asset={asset} />)}
                </div>
              ) : null}
            </div>
          </DossierFolio>
        )
      })}

      <section className={styles.closing} aria-labelledby="origin-story-closing" data-motion-reveal="fade">
        <div className={styles.closingCopy}>
          <span>Hồi tiếp theo thuộc về bạn</span>
          <h2 id="origin-story-closing">{aboutPathContent.title}</h2>
          {aboutPathContent.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className={styles.closingActions}>
          <PathDoors variant="closing" placement="closing" />
          <Link className={styles.secondaryAction} href={aboutPathContent.proofLink.href} data-motion-action>
            {aboutPathContent.proofLink.label}
          </Link>
        </div>
      </section>
    </div>
  )
}
