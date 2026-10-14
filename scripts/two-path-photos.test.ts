import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'
import { photo, twoPathPhotos } from '../lib/two-path-photos'
import { conanContent, homeContent, tensaiContent } from '../lib/two-path-content'

// Reads the canvas size straight from the WebP header (lossy VP8, lossless VP8L, extended VP8X).
function webpSize(buf: Buffer) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF')
  assert.equal(buf.toString('ascii', 8, 12), 'WEBP')
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  const bits = buf.readUInt32LE(21)
  return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
}

test('every manifest photo exists, matches its dimensions, fits budget and is described', async () => {
  for (const [id, p] of Object.entries(twoPathPhotos)) {
    assert.equal(p.id, id)
    const file = new URL(`../public${p.src}`, import.meta.url)
    const [buf, info] = await Promise.all([readFile(file), stat(file)])
    assert.deepEqual(webpSize(buf), { width: p.width, height: p.height }, p.id)
    assert.ok(info.size <= p.budgetBytes, `${p.id} ${info.size} > ${p.budgetBytes}`)
    assert.ok(p.alt.trim().length > 8, `${p.id} alt`)
    assert.ok(p.source.trim().length > 0, `${p.id} source`)
    if (p.faces === 'consent-confirmed') {
      assert.match(p.consentNote ?? '', /^Thông xác nhận ngày \d{2}\/\d{2}\/\d{4}: .+/, p.id)
    }
    if (p.focal) {
      assert.ok(p.focal.x >= 0 && p.focal.x <= 1 && p.focal.y >= 0 && p.focal.y <= 1, `${p.id} focal`)
    }
  }
})

test('budgets follow the spec per photo role', () => {
  const kb = 1024
  for (const p of Object.values(twoPathPhotos)) {
    const limit = p.id.includes('hero')
      ? 180 * kb
      : p.id.startsWith('gallery-')
        ? 120 * kb
        : p.id.startsWith('mentor-')
          ? 60 * kb
          : 140 * kb
    assert.ok(p.budgetBytes <= limit, `${p.id} budget ${p.budgetBytes} > ${limit}`)
  }
  assert.deepEqual([photo('home-hero').width, photo('home-hero').height], [1920, 1080])
  assert.deepEqual([photo('home-hero-mobile').width, photo('home-hero-mobile').height], [900, 1125])
  for (const id of Object.keys(twoPathPhotos)) {
    if (!id.startsWith('gallery-')) continue
    const p = twoPathPhotos[id as keyof typeof twoPathPhotos]
    assert.equal(p.width * 3, p.height * 4, `${id} must be 4:3`)
  }
})

test('face status matches who is in the frame', () => {
  assert.equal(photo('home-hero').faces, 'blurred')
  assert.equal(photo('home-hero-mobile').faces, 'blurred')
  for (const id of ['founder-portrait', 'door-tensai', 'mentor-thong-phan'] as const) {
    assert.equal(photo(id).faces, 'thong-only', id)
  }
  for (const id of ['tensai-map', 'tensai-lesson'] as const) assert.equal(photo(id).faces, 'none', id)
  // Conan School group photos stay gated until Thông confirms consent; never silently downgraded.
  for (const id of ['door-conan', 'conan-hero', 'conan-hero-mobile', 'field-content-class', 'mentor-dac-nguyen'] as const) {
    assert.ok(['pending-owner-consent', 'consent-confirmed'].includes(photo(id).faces), id)
  }
})

test('every photo id referenced by page content exists in the manifest', () => {
  const ids = [
    ...homeContent.doors.map((door) => door.photoId),
    homeContent.letter.portraitId,
    homeContent.fieldNotes.photoId,
    homeContent.guide.photoId,
    ...homeContent.reel.photoIds,
    tensaiContent.heroPhotoId,
    tensaiContent.method.photoId,
    conanContent.heroPhotoId,
    ...conanContent.gallery.photoIds,
    ...conanContent.mentors.people.map((person) => person.photoId),
  ]
  for (const id of ids) assert.ok(id in twoPathPhotos, id)
})
