import manifestJson from '@/content/homepage/homepage-proof-assets.json'

export type HomepageProofAsset = {
  id: string
  kind: 'proof' | 'reel'
  sourcePath: string
  sourceSha256: string
  sourceRight: {
    status: 'approved-local-source'
    basis: string
  }
  derivativePath: string
  derivativeSha256: string
  width: number
  height: number
  focalPoint: { x: number; y: number }
  alt: string
  caption: string
  proof: string
  href: string
}

export type HomepageProofManifest = {
  version: number
  assets: HomepageProofAsset[]
}

export type HomepageProofPublicAsset = Pick<
  HomepageProofAsset,
  'id' | 'width' | 'height' | 'focalPoint' | 'alt' | 'caption' | 'proof' | 'href'
> & {
  derivativeUrl: string
  provenance: string
}

const sha256 = /^[a-f0-9]{64}$/
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function validateHomepageProofManifest(input: unknown): { issues: string[] } {
  const manifest = input as Partial<HomepageProofManifest> | null
  const issues: string[] = []
  if (manifest?.version !== 1) issues.push('manifest version must be 1')
  if (!Array.isArray(manifest?.assets)) return { issues: [...issues, 'assets must be an array'] }

  const ids = new Set<string>()
  for (const [index, asset] of manifest.assets.entries()) {
    const key = asset?.id || `asset ${index}`
    if (!asset?.id || ids.has(asset.id)) issues.push(`${key}: id must be present and unique`)
    ids.add(asset?.id)
    if (!['proof', 'reel'].includes(asset?.kind)) issues.push(`${key}: invalid kind`)
    if (!asset?.sourcePath || !sha256.test(asset?.sourceSha256 ?? '')) issues.push(`${key}: invalid source trace`)
    if (asset?.sourceRight?.status !== 'approved-local-source' || !asset?.sourceRight?.basis) issues.push(`${key}: source right is not approved`)
    if (!asset?.derivativePath?.startsWith('/public/images/homepage/')) issues.push(`${key}: derivative must stay in the homepage asset directory`)
    if (!sha256.test(asset?.derivativeSha256 ?? '')) issues.push(`${key}: invalid derivative hash`)
    const dimensionsAreValid = asset?.kind === 'reel'
      ? (asset?.width === 1200 && asset?.height === 675) || (asset?.width === 720 && asset?.height === 405)
      : asset?.width === 1200 && asset?.height === 800
    if (!dimensionsAreValid) issues.push(`${key}: invalid ${asset?.kind ?? 'unknown'} derivative dimensions`)
    if (
      !isFiniteNumber(asset?.focalPoint?.x) ||
      !isFiniteNumber(asset?.focalPoint?.y) ||
      asset.focalPoint.x < 0 || asset.focalPoint.x > 100 ||
      asset.focalPoint.y < 0 || asset.focalPoint.y > 100
    ) issues.push(`${key}: invalid focal point`)
    if (!asset?.alt || !asset?.caption || !asset?.proof || !asset?.href) issues.push(`${key}: editorial fields are incomplete`)
  }
  return { issues }
}

export function getHomepageProofAssets(input: unknown): HomepageProofAsset[] {
  const manifest = input as HomepageProofManifest
  return Array.isArray(manifest?.assets) ? manifest.assets.filter((asset) => asset.kind === 'proof') : []
}

export function getHomepageReelAssets(input: unknown): HomepageProofAsset[] {
  const manifest = input as HomepageProofManifest
  return Array.isArray(manifest?.assets) ? manifest.assets.filter((asset) => asset.kind === 'reel') : []
}

export function canRunReel(input: unknown): boolean {
  const manifest = input as HomepageProofManifest
  if (validateHomepageProofManifest(input).issues.length > 0) return false
  return manifest.assets.filter((asset) => asset.kind === 'reel').length >= 6
}

export function toPublicProofAsset(asset: HomepageProofAsset): HomepageProofPublicAsset {
  return {
    id: asset.id,
    derivativeUrl: asset.derivativePath.replace(/^\/public/, ''),
    width: asset.width,
    height: asset.height,
    focalPoint: asset.focalPoint,
    alt: asset.alt,
    caption: asset.caption,
    proof: asset.proof,
    href: asset.href,
    provenance: asset.sourceRight.basis,
  }
}

const validation = validateHomepageProofManifest(manifestJson)
if (validation.issues.length > 0 || getHomepageProofAssets(manifestJson).length < 3) {
  throw new Error(`Homepage proof release gate failed: ${validation.issues.join('; ') || 'fewer than three proof assets'}`)
}

export const homepageProofAssets = getHomepageProofAssets(manifestJson)
export const homepageProofPublicAssets = homepageProofAssets.map(toPublicProofAsset)
export const homepageReelPublicAssets = getHomepageReelAssets(manifestJson).map(toPublicProofAsset)
export const homepageCanRunReel = canRunReel(manifestJson)
