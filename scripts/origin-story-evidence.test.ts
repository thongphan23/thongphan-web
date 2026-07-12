import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import manifest from '../content/proof/origin-story-evidence.json'
import blogCoverManifest from '../content/proof/blog-cover-ideas-travel.json'
import {
  getPublicOriginStory,
  validateOriginStoryEvidence,
  type OriginStoryAsset,
  type OriginStoryManifest,
} from '../lib/origin-story-evidence'

const ROOT = new URL('../', import.meta.url)
const ACT_ORDER = ['difference', 'attention', 'core-product', 'rebuilding', 'system']
const ACT_TITLES = [
  'Dám khác biệt.',
  'Khi sự chú ý mở cửa.',
  'Thắng truyền thông, thua sản phẩm.',
  'Học lại bằng những lần flop.',
  'Không bỏ phí thêm một bài học nào.',
]
const SOURCE_TYPES = new Set(['personal-account', 'owned-archive', 'public-press', 'system-record'])
const DEBT_PHRASE = 'Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'

function readWebpDimensions(bytes: Buffer): { width: number; height: number } {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  const chunk = bytes.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 }
  if (chunk === 'VP8L') {
    const [b1, b2, b3, b4] = [bytes[21], bytes[22], bytes[23], bytes[24]]
    return {
      width: 1 + b1 + ((b2 & 0x3f) << 8),
      height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
    }
  }
  const marker = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20)
  assert.ok(marker >= 0, 'lossy WebP frame marker is missing')
  return {
    width: bytes.readUInt16LE(marker + 3) & 0x3fff,
    height: bytes.readUInt16LE(marker + 5) & 0x3fff,
  }
}

test('origin evidence is exactly five ordered acts with reviewed permitted claim references', () => {
  const typedManifest = manifest as OriginStoryManifest
  assert.deepEqual(validateOriginStoryEvidence(typedManifest).issues, [])
  assert.deepEqual(typedManifest.acts.map((act) => act.id), ACT_ORDER)
  assert.deepEqual(typedManifest.acts.map((act) => act.title), ACT_TITLES)
  assert.equal(typedManifest.acts.length, 5)

  const claims = new Map(typedManifest.claims.map((claim) => [claim.id, claim]))
  assert.equal(claims.size, typedManifest.claims.length)
  for (const act of typedManifest.acts) {
    assert.ok(act.claimIds.length >= 1)
    for (const claimId of act.claimIds) {
      const claim = claims.get(claimId)
      assert.ok(claim, `${act.id} references missing claim ${claimId}`)
      assert.equal(claim.reviewStatus, 'approved')
      assert.equal(claim.displayPermission, 'public-summary')
      assert.ok(SOURCE_TYPES.has(claim.sourceType))
      assert.match(claim.reviewedAt, /^2026-\d{2}-\d{2}$/)
      assert.ok(claim.sourceLocation.length >= 8)
    }
  }

  assert.equal(JSON.stringify(typedManifest).split(DEBT_PHRASE).length - 1, 1)
  const debt = typedManifest.claims.find((claim) => claim.text === DEBT_PHRASE)
  assert.equal(debt?.sourceType, 'personal-account')
  assert.doesNotMatch(debt?.text ?? '', /kiểm toán|đã tất toán|đã trả hết/i)

  const requiredClaimIds = [
    'hstl-nine-months-living',
    'hstl-attention-opportunities',
    'hstl-communication-outpaced-product',
    'rebuild-pattern-and-trust',
  ]
  for (const claimId of requiredClaimIds) assert.ok(claims.has(claimId), `missing Task 10 claim ${claimId}`)
  assert.deepEqual(typedManifest.acts[1].claimIds, ['hstl-press-experience', 'hstl-attention-opportunities'])
  assert.deepEqual(typedManifest.acts[2].claimIds, [
    'hstl-communication-outpaced-product',
    'hstl-transfer',
    'hstl-debt',
  ])
})

test('public DTO strips private review fields, hashes and local paths', () => {
  const publicStory = getPublicOriginStory(manifest)
  assert.deepEqual(publicStory.acts.map((act) => act.id), ACT_ORDER)
  const serialized = JSON.stringify(publicStory)
  assert.doesNotMatch(serialized, /\/Users\/|sourceLocation|sha256|reviewStatus|reviewedAt|displayPermission|sourcePath|prompt/i)
  assert.equal(serialized.split(DEBT_PHRASE).length - 1, 1)
  assert.ok(publicStory.acts.every((act) => act.claims.length === act.claimIds.length))
})

test('evidence gate rejects unreviewed claims, unknown references and generated history', () => {
  const unreviewed = structuredClone(manifest) as OriginStoryManifest
  unreviewed.claims[0].reviewStatus = 'pending' as never
  assert.match(validateOriginStoryEvidence(unreviewed).issues.join('\n'), /not approved/)

  const missingClaim = structuredClone(manifest) as OriginStoryManifest
  missingClaim.acts[0].claimIds = ['missing-claim']
  assert.match(validateOriginStoryEvidence(missingClaim).issues.join('\n'), /unknown claim/)

  const generatedHistory = structuredClone(manifest) as OriginStoryManifest
  generatedHistory.acts[0].assetIds = ['brain2-challenge-metaphor']
  assert.match(validateOriginStoryEvidence(generatedHistory).issues.join('\n'), /historical acts may use press typography only/)

  const generatedRebuild = structuredClone(manifest) as OriginStoryManifest
  generatedRebuild.acts[3].assetIds = ['brain2-challenge-metaphor']
  assert.match(validateOriginStoryEvidence(generatedRebuild).issues.join('\n'), /generated metaphor is reserved for the system act/)

  const bypassTitle = structuredClone(manifest) as OriginStoryManifest
  bypassTitle.acts[0].title = 'CNN Travel xác nhận sáu nhà hàng.'
  ;(bypassTitle.acts[0] as unknown as Record<string, unknown>).privateNote = '/Users/rio/private'
  const bypassIssues = validateOriginStoryEvidence(bypassTitle).issues.join('\n')
  assert.match(bypassIssues, /canonical title/)
  assert.match(bypassIssues, /unknown field/)
})

test('evidence gate is total and rejects private or secret-like text before public DTO creation', () => {
  const malformed = structuredClone(manifest) as unknown as Record<string, unknown>
  malformed.claims = [null]
  malformed.assets = [null]
  malformed.acts = [{ id: 'difference', label: null, title: null, claimIds: {}, assetIds: [] }]
  assert.doesNotThrow(() => validateOriginStoryEvidence(malformed))
  assert.ok(validateOriginStoryEvidence(malformed).issues.length > 0)

  const privateText = structuredClone(manifest) as OriginStoryManifest
  privateText.claims[0].text = `See /Users/rio/private/${'a'.repeat(64)}`
  const pressAsset = privateText.assets.find((asset) => asset.kind === 'press-card')
  assert.ok(pressAsset)
  pressAsset.headline = 'access_token=do-not-publish'
  const privateIssues = validateOriginStoryEvidence(privateText).issues.join('\n')
  assert.match(privateIssues, /private or secret-like text/)
  assert.throws(() => getPublicOriginStory(privateText), /evidence gate failed/)
})

test('historical acts use press typography only and local image derivatives verify physically', async () => {
  const typedManifest = manifest as OriginStoryManifest
  const assets = new Map(typedManifest.assets.map((asset) => [asset.id, asset]))
  for (const act of typedManifest.acts.slice(0, 3)) {
    for (const assetId of act.assetIds) {
      const asset = assets.get(assetId)
      assert.ok(asset, `${act.id} references missing asset ${assetId}`)
      assert.equal(asset.kind, 'press-card')
      assert.equal(asset.generated, false)
      assert.equal(asset.historical, true)
    }
  }

  for (const asset of typedManifest.assets as OriginStoryAsset[]) {
    if (asset.kind === 'press-card') {
      assert.match(asset.publicHref, /^https:\/\//)
      continue
    }
    const bytes = await readFile(new URL(asset.derivativePath.replace(/^\//, ''), ROOT))
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256)
    assert.deepEqual(readWebpDimensions(bytes), { width: asset.width, height: asset.height })
    assert.ok(asset.focalPoint.x >= 0 && asset.focalPoint.x <= 100)
    assert.ok(asset.focalPoint.y >= 0 && asset.focalPoint.y <= 100)
    if (asset.generated) {
      assert.equal(asset.kind, 'generated-metaphor')
      assert.ok(asset.disclosure)
      assert.match(asset.disclosure, /ẩn dụ biên tập.*ImageGen/i)
      assert.equal(asset.sourceLocation, 'content/proof/challenge-visual.json')
    }
  }
})

test('normalized viral article uses a physically verified text-free generated cover', async () => {
  assert.equal(blogCoverManifest.kind, 'generated-editorial-asset')
  assert.equal(blogCoverManifest.rights.status, 'approved-project-generated')
  assert.match(blogCoverManifest.promptSummary, /no readable text, numbers, logos or faces/i)
  const bytes = await readFile(new URL(blogCoverManifest.derivativePath.replace(/^\//, ''), ROOT))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), blogCoverManifest.derivativeSha256)
  assert.deepEqual(readWebpDimensions(bytes), { width: blogCoverManifest.width, height: blogCoverManifest.height })
  const article = await readFile(new URL('content/blog/40-bai-viral-tui-hoc-duoc-gi.md', ROOT), 'utf8')
  assert.match(article, new RegExp(blogCoverManifest.derivativePath.replace(/^\/public/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.doesNotMatch(article, /cover-40-bai-viral\.png/)
})

test('public articles remove unsupported changing claims and retain verified source links', async () => {
  const paths = [
    'content/blog/10-nam-lam-marketing-toi-hoc-duoc-gi.md',
    'content/blog/ai-khong-cuop-viec-ban.md',
    'content/blog/xay-brain2-voi-obsidian.md',
    'content/blog/40-bai-viral-tui-hoc-duoc-gi.md',
    'content/library/14-thang-flop-la-nguyen-lieu.md',
    'content/library/40-bai-viral-80k-shares-doc-nhu-du-lieu.md',
    'content/library/mau-hook-tu-trai-nghiem-that.md',
    'content/library/sang-to-giua-hon-loan-ai.md',
    'app/blog/[slug]/BlogArticle.tsx',
    'app/blog/[slug]/BlogPostClient.tsx',
  ]
  const sources = await Promise.all(paths.map((path) => readFile(new URL(path, ROOT), 'utf8')))
  const combined = sources.join('\n')
  assert.doesNotMatch(combined, /CNN Travel|VTV3|60\s*triệu\/ngày|2,847|7,200\+|2,000\+|5,000\+|1,000\+|1000\+|600\+|600\s+người|40\+|80k\+|100\+\s*bài|15k|8k|85\s*triệu|6\s+nhà\s+hàng|80%\s+công\s+việc|20-50\s+đô|15\s*phút(?:\/ngày|\s+để|\s+gom)|10x\s+nhanh|5x\s+nhanh/i)
  assert.doesNotMatch(combined, /tui đã tắt Hoa Sơn Tửu Lầu sau khi nó đạt đỉnh/i)
  assert.doesNotMatch(combined, /người dám làm khác biệt mới thắng|phân bổ vốn tốt hơn/i)
  assert.match(sources[1], /khác biệt mở cửa[\s\S]*sản phẩm cốt lõi giữ cửa/i)
  assert.match(sources[0], /Dừng không xóa hậu quả[\s\S]*sản phẩm cốt lõi/i)

  const pressLinks = [
    'https://kenh14.vn/xa-hoi/vao-tuu-lau-du-dai-hoi-vo-lam-o-quan-kiem-hiep-doc-dao-nhat-sai-gon-2015052008464959.chn',
    'https://vnexpress.net/quan-an-phong-cach-kiem-hiep-o-sai-gon-3287251.html',
    'https://ovietnam.vietnamnews.vn/a-weird-spot-for-beer-and-wuxia-style-chat-post283518.html',
  ]
  for (const article of sources.slice(0, 2)) {
    for (const href of pressLinks) assert.match(article, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(sources[1], /thời lượng thay đổi theo độ sâu của từng bài/i)
  assert.match(sources[2], /thời lượng thay đổi theo độ sâu của từng bài/i)
  assert.match(sources[2], /Tuần 1\s*[—:-][^]*Tuần 2\s*[—:-][^]*Tuần 3\s*[—:-]/)
  assert.doesNotMatch(sources[2], /Tuần 4:/)
})

test('proof stack publishes a concise source ledger without mutable scorekeeping', async () => {
  const source = await readFile(new URL('content/library/proof-stack-thong-phan-2026.md', ROOT), 'utf8')
  assert.match(source, /## Một câu chuyện cần nhiều lớp bằng chứng/)
  assert.match(source, /báo chí.*trải nghiệm/i)
  assert.match(source, /lời kể cá nhân.*nợ/i)
  assert.match(source, /system record|bản ghi hệ thống/i)
  assert.doesNotMatch(source, /40\+|80k\+|600\+|40 bài viral, 80k/i)
  assert.doesNotMatch(source, /manifest|typography|visual/i)
})
