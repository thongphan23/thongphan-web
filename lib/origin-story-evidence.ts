import manifestJson from '../content/proof/origin-story-evidence.json'

export type OriginStorySourceType = 'personal-account' | 'owned-archive' | 'public-press' | 'system-record'
export type OriginStoryActId = 'difference' | 'attention' | 'core-product' | 'rebuilding' | 'system'

export interface OriginStoryClaim {
  id: string
  text: string
  category: string
  sourceType: OriginStorySourceType
  sourceLocation: string
  publicHref?: string
  sourceLabel: string
  reviewedAt: string
  reviewStatus: 'approved'
  displayPermission: 'public-summary'
}

export interface OriginStoryPressAsset {
  id: string
  kind: 'press-card'
  historical: true
  generated: false
  sourceType: 'public-press'
  publicHref: string
  sourceLabel: string
  headline: string
}

export interface OriginStoryImageAsset {
  id: string
  kind: 'owned-image' | 'generated-metaphor'
  historical: false
  generated: boolean
  sourceType: 'owned-archive' | 'system-record'
  sourceLocation: string
  derivativePath: string
  sha256: string
  width: number
  height: number
  focalPoint: { x: number; y: number }
  alt: string
  caption: string
  disclosure?: string
}

export type OriginStoryAsset = OriginStoryPressAsset | OriginStoryImageAsset

export interface OriginStoryAct {
  id: OriginStoryActId
  label: string
  title: string
  claimIds: string[]
  assetIds: string[]
}

export interface OriginStoryManifest {
  version: 1
  storyId: string
  claims: OriginStoryClaim[]
  assets: OriginStoryAsset[]
  acts: OriginStoryAct[]
}

export type PublicOriginClaim = Pick<
  OriginStoryClaim,
  'id' | 'text' | 'category' | 'sourceType' | 'sourceLabel' | 'publicHref'
>

export type PublicOriginAsset =
  | Pick<OriginStoryPressAsset, 'id' | 'kind' | 'historical' | 'generated' | 'publicHref' | 'sourceLabel' | 'headline'>
  | Pick<OriginStoryImageAsset, 'id' | 'kind' | 'historical' | 'generated' | 'width' | 'height' | 'focalPoint' | 'alt' | 'caption' | 'disclosure'> & {
      imageUrl: string
    }

export interface PublicOriginAct extends OriginStoryAct {
  claims: PublicOriginClaim[]
  assets: PublicOriginAsset[]
}

export interface PublicOriginStory {
  storyId: string
  acts: PublicOriginAct[]
}

const ACT_CONTRACT: ReadonlyArray<{ id: OriginStoryActId; label: string; title: string }> = [
  { id: 'difference', label: 'Hồi 01', title: 'Dám khác biệt.' },
  { id: 'attention', label: 'Hồi 02', title: 'Khi sự chú ý mở cửa.' },
  { id: 'core-product', label: 'Hồi 03', title: 'Thắng truyền thông, thua sản phẩm.' },
  { id: 'rebuilding', label: 'Hồi 04', title: 'Học lại bằng những lần flop.' },
  { id: 'system', label: 'Hồi 05', title: 'Không bỏ phí thêm một bài học nào.' },
]
const ACT_ORDER = ACT_CONTRACT.map((act) => act.id)
const SOURCE_TYPES = new Set<OriginStorySourceType>(['personal-account', 'owned-archive', 'public-press', 'system-record'])
const SHA256 = /^[a-f0-9]{64}$/
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/
const DEBT_PHRASE = 'Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'
const PRIVATE_PUBLIC_DATA = /(?:\/Users\/|\/(?:private|protected)(?:\/|\\)|\b[a-f0-9]{64}\b|\b(?:api|access|session|brevo)[_-]?(?:key|secret|token|code)\s*[:=]|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i
const SENSITIVE_QUERY_KEY = /(?:token|key|secret|code|email|auth|session)/i

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const asString = (value: unknown): string => typeof value === 'string' ? value : ''

const reportUnknownFields = (
  value: UnknownRecord,
  allowed: ReadonlySet<string>,
  scope: string,
  issues: string[],
) => {
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) issues.push(`${scope}: unknown field ${field}`)
  }
}

const checkPublicText = (value: unknown, scope: string, issues: string[]) => {
  if (typeof value === 'string' && PRIVATE_PUBLIC_DATA.test(value)) {
    issues.push(`${scope}: private or secret-like text is not public-safe`)
  }
}

const finitePercent = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
)

const safePublicHref = (value: unknown): value is string => {
  if (typeof value !== 'string' || PRIVATE_PUBLIC_DATA.test(value) || value.includes('\\')) return false
  try {
    const internal = value.startsWith('/')
    if (internal && value.startsWith('//')) return false
    const url = internal ? new URL(value, 'https://thongphan.com') : new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return false
    if (internal && url.origin !== 'https://thongphan.com') return false
    for (const key of url.searchParams.keys()) {
      if (SENSITIVE_QUERY_KEY.test(key)) return false
    }
    return true
  } catch {
    return false
  }
}

const nonEmptyStrings = (value: unknown): value is string[] => (
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0)
)

export function validateOriginStoryEvidence(input: unknown): { issues: string[] } {
  const issues: string[] = []
  if (!isRecord(input)) return { issues: ['manifest must be an object'] }
  const manifest = input
  reportUnknownFields(manifest, new Set(['version', 'storyId', 'claims', 'assets', 'acts']), 'manifest', issues)
  if (manifest.version !== 1) issues.push('manifest version must be 1')
  if (!asString(manifest.storyId).trim()) issues.push('storyId is required')
  checkPublicText(manifest.storyId, 'storyId', issues)
  if (!Array.isArray(manifest.claims)) issues.push('claims must be an array')
  if (!Array.isArray(manifest.assets)) issues.push('assets must be an array')
  if (!Array.isArray(manifest.acts)) issues.push('acts must be an array')
  if (issues.length > 0) return { issues }

  const claims = manifest.claims as unknown[]
  const claimRecords: UnknownRecord[] = []
  const claimIds = new Set<string>()
  const claimFields = new Set(['id', 'text', 'category', 'sourceType', 'sourceLocation', 'publicHref', 'sourceLabel', 'reviewedAt', 'reviewStatus', 'displayPermission'])
  for (const [index, value] of claims.entries()) {
    const fallback = `claim ${index}`
    if (!isRecord(value)) {
      issues.push(`${fallback}: claim must be an object`)
      continue
    }
    const claim = value
    claimRecords.push(claim)
    const id = asString(claim.id)
    const key = id || fallback
    reportUnknownFields(claim, claimFields, key, issues)
    if (!id || claimIds.has(id)) issues.push(`${key}: claim id must be present and unique`)
    if (id) claimIds.add(id)
    if (!asString(claim.text).trim() || !asString(claim.category).trim()) issues.push(`${key}: claim copy is incomplete`)
    if (!SOURCE_TYPES.has(claim.sourceType as OriginStorySourceType)) issues.push(`${key}: source type is invalid`)
    if (!asString(claim.sourceLocation).trim() || !asString(claim.sourceLabel).trim()) issues.push(`${key}: source trace is incomplete`)
    if (claim.publicHref !== undefined && !safePublicHref(claim.publicHref)) issues.push(`${key}: public href is unsafe`)
    if (!REVIEW_DATE.test(asString(claim.reviewedAt))) issues.push(`${key}: reviewedAt is invalid`)
    if (claim.reviewStatus !== 'approved') issues.push(`${key}: claim is not approved`)
    if (claim.displayPermission !== 'public-summary') issues.push(`${key}: claim is not permitted for display`)
    checkPublicText(claim.id, key, issues)
    checkPublicText(claim.text, key, issues)
    checkPublicText(claim.category, key, issues)
    checkPublicText(claim.sourceLabel, key, issues)
  }

  const debtClaims = claimRecords.filter((claim) => claim.text === DEBT_PHRASE)
  if (debtClaims.length !== 1) issues.push('approved debt phrase must appear exactly once')
  if (debtClaims[0]?.sourceType !== 'personal-account') issues.push('debt phrase must remain a personal account')

  const assets = manifest.assets as unknown[]
  const assetRecords = new Map<string, UnknownRecord>()
  const assetIds = new Set<string>()
  const pressFields = new Set(['id', 'kind', 'historical', 'generated', 'sourceType', 'publicHref', 'sourceLabel', 'headline'])
  const imageFields = new Set(['id', 'kind', 'historical', 'generated', 'sourceType', 'sourceLocation', 'derivativePath', 'sha256', 'width', 'height', 'focalPoint', 'alt', 'caption', 'disclosure'])
  for (const [index, value] of assets.entries()) {
    const fallback = `asset ${index}`
    if (!isRecord(value)) {
      issues.push(`${fallback}: asset must be an object`)
      continue
    }
    const asset = value
    const id = asString(asset.id)
    const key = id || fallback
    if (!id || assetIds.has(id)) issues.push(`${key}: asset id must be present and unique`)
    if (id) {
      assetIds.add(id)
      assetRecords.set(id, asset)
    }
    if (!SOURCE_TYPES.has(asset.sourceType as OriginStorySourceType)) issues.push(`${key}: asset source type is invalid`)
    if (asset.kind === 'press-card') {
      reportUnknownFields(asset, pressFields, key, issues)
      if (!asset.historical || asset.generated || asset.sourceType !== 'public-press') issues.push(`${key}: press card provenance is invalid`)
      if (!safePublicHref(asset.publicHref) || !asString(asset.publicHref).startsWith('https://')) issues.push(`${key}: press href is invalid`)
      if (!asString(asset.sourceLabel).trim() || !asString(asset.headline).trim()) issues.push(`${key}: press display fields are incomplete`)
      checkPublicText(asset.sourceLabel, key, issues)
      checkPublicText(asset.headline, key, issues)
      continue
    }
    reportUnknownFields(asset, imageFields, key, issues)
    if (asset.kind !== 'owned-image' && asset.kind !== 'generated-metaphor') {
      issues.push(`${key}: asset kind is invalid`)
      continue
    }
    if (asset.historical || asset.generated !== (asset.kind === 'generated-metaphor')) issues.push(`${key}: image history/generated flags are invalid`)
    if (asset.kind === 'owned-image' && asset.sourceType !== 'owned-archive') issues.push(`${key}: owned image source is invalid`)
    if (asset.kind === 'generated-metaphor' && asset.sourceType !== 'system-record') issues.push(`${key}: generated metaphor source is invalid`)
    if (!asString(asset.sourceLocation).trim()) issues.push(`${key}: source location is missing`)
    if (!asString(asset.derivativePath).startsWith('/public/images/')) issues.push(`${key}: derivative path is invalid`)
    if (!SHA256.test(asString(asset.sha256))) issues.push(`${key}: derivative hash is invalid`)
    if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || Number(asset.width) < 1 || Number(asset.height) < 1) issues.push(`${key}: dimensions are invalid`)
    const focalPoint = isRecord(asset.focalPoint) ? asset.focalPoint : null
    if (!focalPoint || !finitePercent(focalPoint.x) || !finitePercent(focalPoint.y)) issues.push(`${key}: focal point is invalid`)
    if (!asString(asset.alt).trim() || !asString(asset.caption).trim()) issues.push(`${key}: image display fields are incomplete`)
    if (asset.kind === 'generated-metaphor' && !/ẩn dụ biên tập.*ImageGen/i.test(asString(asset.disclosure))) issues.push(`${key}: generated metaphor disclosure is missing`)
    checkPublicText(asset.alt, key, issues)
    checkPublicText(asset.caption, key, issues)
    checkPublicText(asset.disclosure, key, issues)
  }

  const acts = manifest.acts as unknown[]
  if (acts.length !== ACT_ORDER.length || acts.some((act, index) => !isRecord(act) || act.id !== ACT_ORDER[index])) {
    issues.push('acts must follow the canonical five-act order')
  }
  const referencedClaims = new Set<string>()
  const actFields = new Set(['id', 'label', 'title', 'claimIds', 'assetIds'])
  for (const [index, value] of acts.entries()) {
    const fallback = `act ${index}`
    if (!isRecord(value)) {
      issues.push(`${fallback}: act must be an object`)
      continue
    }
    const act = value
    const id = asString(act.id)
    const key = id || fallback
    const contract = ACT_CONTRACT[index]
    reportUnknownFields(act, actFields, key, issues)
    if (!asString(act.label).trim() || !asString(act.title).trim()) issues.push(`${key}: act display fields are incomplete`)
    if (contract && act.label !== contract.label) issues.push(`${key}: label must match the canonical act contract`)
    if (contract && act.title !== contract.title) issues.push(`${key}: title must match the canonical title`)
    checkPublicText(act.label, key, issues)
    checkPublicText(act.title, key, issues)
    const claimIdsForAct = nonEmptyStrings(act.claimIds) ? act.claimIds : []
    const assetIdsForAct = nonEmptyStrings(act.assetIds) ? act.assetIds : []
    if (claimIdsForAct.length === 0) issues.push(`${key}: claimIds must be non-empty`)
    if (assetIdsForAct.length === 0) issues.push(`${key}: assetIds must be non-empty`)
    if (new Set(claimIdsForAct).size !== claimIdsForAct.length) issues.push(`${key}: claim references must be unique`)
    if (new Set(assetIdsForAct).size !== assetIdsForAct.length) issues.push(`${key}: asset references must be unique`)
    for (const claimId of claimIdsForAct) {
      referencedClaims.add(claimId)
      if (!claimIds.has(claimId)) issues.push(`${key}: unknown claim ${claimId}`)
    }
    for (const assetId of assetIdsForAct) {
      const asset = assetRecords.get(assetId)
      if (!asset) issues.push(`${key}: unknown asset ${assetId}`)
      if (index < 3 && asset && (asset.kind !== 'press-card' || asset.generated)) {
        issues.push(`${key}: historical acts may use press typography only`)
      }
      if (asset?.kind === 'generated-metaphor' && id !== 'system') {
        issues.push(`${key}: generated metaphor is reserved for the system act`)
      }
    }
  }
  for (const claimId of claimIds) {
    if (!referencedClaims.has(claimId)) issues.push(`${claimId}: approved claim is orphaned`)
  }
  return { issues }
}

function toPublicAsset(asset: OriginStoryAsset): PublicOriginAsset {
  if (asset.kind === 'press-card') {
    return {
      id: asset.id,
      kind: asset.kind,
      historical: asset.historical,
      generated: asset.generated,
      publicHref: asset.publicHref,
      sourceLabel: asset.sourceLabel,
      headline: asset.headline,
    }
  }
  return {
    id: asset.id,
    kind: asset.kind,
    historical: asset.historical,
    generated: asset.generated,
    imageUrl: asset.derivativePath.replace(/^\/public/, ''),
    width: asset.width,
    height: asset.height,
    focalPoint: { x: asset.focalPoint.x, y: asset.focalPoint.y },
    alt: asset.alt,
    caption: asset.caption,
    ...(asset.disclosure ? { disclosure: asset.disclosure } : {}),
  }
}

export function getPublicOriginStory(input: unknown): PublicOriginStory {
  const validation = validateOriginStoryEvidence(input)
  if (validation.issues.length > 0) throw new Error(`Origin story evidence gate failed: ${validation.issues.join('; ')}`)
  const manifest = input as OriginStoryManifest
  const claims = new Map(manifest.claims.map((claim) => [claim.id, claim]))
  const assets = new Map(manifest.assets.map((asset) => [asset.id, asset]))
  const publicStory: PublicOriginStory = {
    storyId: manifest.storyId,
    acts: manifest.acts.map((act) => ({
      id: act.id,
      label: act.label,
      title: act.title,
      claimIds: [...act.claimIds],
      assetIds: [...act.assetIds],
      claims: act.claimIds.map((claimId) => {
        const claim = claims.get(claimId) as OriginStoryClaim
        return {
          id: claim.id,
          text: claim.text,
          category: claim.category,
          sourceType: claim.sourceType,
          sourceLabel: claim.sourceLabel,
          ...(claim.publicHref ? { publicHref: claim.publicHref } : {}),
        }
      }),
      assets: act.assetIds.map((assetId) => toPublicAsset(assets.get(assetId) as OriginStoryAsset)),
    })),
  }
  const serialized = JSON.stringify(publicStory)
  if (PRIVATE_PUBLIC_DATA.test(serialized) || /"(?:sourceLocation|sha256|reviewStatus|reviewedAt|displayPermission|sourcePath|prompt)"/.test(serialized)) {
    throw new Error('Origin story public DTO failed the private-data postcondition')
  }
  return publicStory
}

const validation = validateOriginStoryEvidence(manifestJson)
if (validation.issues.length > 0) throw new Error(`Origin story release gate failed: ${validation.issues.join('; ')}`)

export const originStoryPublic = getPublicOriginStory(manifestJson)
