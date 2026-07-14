import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import manifestJson from '../content/homepage/homepage-proof-assets.json'
import {
  canRunReel,
  getHomepageProofAssets,
  getHomepageReelAssets,
  toPublicProofAsset,
  validateHomepageProofManifest,
  type HomepageProofAsset,
} from '../lib/homepage-proof-assets'

const root = new URL('../', import.meta.url)

function readWebpDimensions(bytes: Buffer): { width: number; height: number } {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  const chunk = bytes.toString('ascii', 12, 16)
  if (chunk === 'VP8X') {
    return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 }
  }
  if (chunk === 'VP8L') {
    const b1 = bytes[21]
    const b2 = bytes[22]
    const b3 = bytes[23]
    const b4 = bytes[24]
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

test('homepage manifest releases only physically verified, traceable assets', async () => {
  const result = validateHomepageProofManifest(manifestJson)
  assert.deepEqual(result.issues, [])
  assert.equal(getHomepageProofAssets(manifestJson).length, 3)

  const assets = manifestJson.assets as HomepageProofAsset[]
  for (const asset of assets) {
    const bytes = await readFile(new URL(asset.derivativePath.replace(/^\//, ''), root))
    const sourceBytes = await readFile(asset.sourcePath)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.derivativeSha256)
    assert.equal(createHash('sha256').update(sourceBytes).digest('hex'), asset.sourceSha256)
    assert.deepEqual(readWebpDimensions(bytes), { width: asset.width, height: asset.height })
    assert.ok(asset.alt.length >= 20)
    assert.ok(asset.caption.length >= 20)
    assert.ok(asset.proof.length >= 40)
    assert.ok(['approved-local-source', 'approved-project-generated'].includes(asset.sourceRight.status))
  }

  assert.equal(assets.length, manifestJson.assets.length, 'every proof and reel record must pass physical verification')
})

test('film reel runs only after six approved, traceable frames are released', () => {
  assert.equal(getHomepageReelAssets(manifestJson).length >= 6, true)
  assert.equal(canRunReel(manifestJson), true)

  const seed = getHomepageProofAssets(manifestJson)[0]
  assert.ok(seed)
  const reel = Array.from({ length: 6 }, (_, index): HomepageProofAsset => ({
    ...seed,
    id: `reel-${index}`,
    kind: 'reel',
    width: 1200,
    height: 675,
  }))
  assert.equal(canRunReel({ version: 1, assets: reel }), true)
})

test('public proof DTO never serializes private paths, rights objects, or hashes', () => {
  const publicAsset = toPublicProofAsset(getHomepageProofAssets(manifestJson)[0])
  const serialized = JSON.stringify(publicAsset)
  assert.doesNotMatch(serialized, /\/Users\/|sourcePath|sourceSha256|derivativeSha256|sourceRight/)
  assert.match(publicAsset.derivativeUrl, /^\/images\/homepage\/proof\//)
})

test('manifest rejects missing focal points and undersized reel media', () => {
  const seed = getHomepageProofAssets(manifestJson)[0]
  assert.ok(seed)
  const missingFocalPoint = { ...seed, focalPoint: undefined }
  const wrongReelShape = { ...seed, id: 'bad-reel', kind: 'reel' as const, width: 640, height: 360 }
  assert.match(validateHomepageProofManifest({ version: 1, assets: [missingFocalPoint] }).issues.join('\n'), /focal point/)
  assert.match(validateHomepageProofManifest({ version: 1, assets: [wrongReelShape] }).issues.join('\n'), /dimensions/)
})

test('physical stamp is a real transparent raster, not CSS artwork', async () => {
  const bytes = await readFile(new URL('public/images/homepage/evidence-cinema-stamp-v4.png', root))
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG')
  assert.ok(bytes.readUInt32BE(16) >= 1024)
  assert.ok(bytes.readUInt32BE(20) >= 1024)
  const colorType = bytes[25]
  const hasAlpha = [4, 6].includes(colorType) || (colorType === 3 && bytes.includes(Buffer.from('tRNS')))
  assert.equal(hasAlpha, true, 'PNG must contain an alpha channel')
  assert.ok(bytes.byteLength <= 80 * 1024)
})
