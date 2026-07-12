import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

import { extractDayContent, sourceFragmentSha256 } from './migrate-brain2-lessons.mjs'

const fixture = await readFile(new URL('./fixtures/brain2-legacy-script.js', import.meta.url), 'utf8')
const days = Array.from({ length: 21 }, (_, index) => index + 1)

const lessonMember = (day, overrides = {}) => {
  if (overrides.rawMember) return overrides.rawMember
  const key = overrides.key ?? String(day)
  const fields = overrides.fields ?? [
    `title: ${overrides.title ?? `'Synthetic lesson ${String(day).padStart(2, '0')}'`}`,
    `content: ${overrides.content ?? `\`Synthetic body ${String(day).padStart(2, '0')}.\``}`,
  ]
  return `${key}: { ${fields.join(', ')} }`
}

const legacySource = (sourceDays = days, overrides = new Map()) =>
  `const DAY_CONTENT = {\n${sourceDays
    .map((day, index) => `  ${lessonMember(day, overrides.get(index) ?? {})},`)
    .join('\n')}\n}\n`

test('extracts the 21 synthetic fixture lessons in exact day order', () => {
  const entries = extractDayContent(fixture, 'brain2-legacy-script.js')
  assert.deepEqual(entries.map(({ day }) => day), days)
  assert.deepEqual(entries[0], {
    day: 1,
    title: 'Synthetic lesson 01',
    content: 'Synthetic body 01.',
  })
  assert.equal(entries[8].title, 'Synthetic Viral lesson 09')
})

test('hashes the exact UTF-8 title-newline-content source fragment', () => {
  const entry = { day: 1, title: 'Tiêu đề', content: 'Nội dung\nUTF-8 ✓' }
  const expected = createHash('sha256')
    .update(`${entry.title}\n${entry.content}`, 'utf8')
    .digest('hex')
  assert.equal(sourceFragmentSha256(entry), expected)
})

test('rejects a missing day', () => {
  assert.throws(() => extractDayContent(legacySource(days.slice(0, -1))), /21|missing|exactly/i)
})

test('rejects duplicate days', () => {
  assert.throws(() => extractDayContent(legacySource([1, 1, ...days.slice(1, -1)])), /duplicate|order/i)
})

test('rejects out-of-range days', () => {
  assert.throws(() => extractDayContent(legacySource([...days.slice(0, -1), 22])), /range|21|day/i)
})

test('rejects computed and non-numeric day keys', () => {
  assert.throws(
    () => extractDayContent(legacySource(days, new Map([[0, { key: '[1]' }]]))),
    /computed|numeric|property/i,
  )
  assert.throws(
    () => extractDayContent(legacySource(days, new Map([[0, { key: "'1'" }]]))),
    /numeric|property/i,
  )
})

test('rejects methods in the day map', () => {
  const source = legacySource(days, new Map([[0, { rawMember: '1() { return {} }' }]]))
  assert.throws(() => extractDayContent(source), /method|property/i)
})

test('rejects calls instead of literal lesson fields', () => {
  const source = legacySource(days, new Map([[0, { title: 'makeTitle()' }]]))
  assert.throws(() => extractDayContent(source), /title|string|call/i)
})

test('rejects template substitutions', () => {
  const source = legacySource(days, new Map([[0, { content: '`Synthetic ${suffix}`' }]]))
  assert.throws(() => extractDayContent(source), /content|template|substitution/i)
})

test('rejects spreads in the lesson map or lesson objects', () => {
  assert.throws(
    () => extractDayContent(legacySource().replace('{\n', '{\n  ...extra,\n')),
    /spread|property/i,
  )
  const source = legacySource(
    days,
    new Map([[0, { fields: ["title: 'Synthetic lesson 01'", 'content: `Synthetic body 01.`', '...extra'] }]]),
  )
  assert.throws(() => extractDayContent(source), /spread|field|property/i)
})

test('rejects unknown, duplicate, or missing lesson fields', () => {
  const unknown = legacySource(
    days,
    new Map([[0, { fields: ["title: 'Synthetic lesson 01'", 'content: `Synthetic body 01.`', "summary: 'No' "] }]]),
  )
  assert.throws(() => extractDayContent(unknown), /unknown|field/i)

  const duplicate = legacySource(
    days,
    new Map([[0, { fields: ["title: 'Synthetic lesson 01'", "title: 'Again'", 'content: `Synthetic body 01.`'] }]]),
  )
  assert.throws(() => extractDayContent(duplicate), /duplicate|field/i)

  const missingTitle = legacySource(days, new Map([[0, { fields: ['content: `Synthetic body 01.`'] }]]))
  assert.throws(() => extractDayContent(missingTitle), /missing|title/i)

  const missingContent = legacySource(days, new Map([[0, { fields: ["title: 'Synthetic lesson 01'"] }]]))
  assert.throws(() => extractDayContent(missingContent), /missing|content/i)
})

test('rejects multiple top-level DAY_CONTENT declarations', () => {
  assert.throws(
    () => extractDayContent(`${legacySource()}\nconst DAY_CONTENT = {}`),
    /multiple|declaration/i,
  )
})

test('rejects nested-only DAY_CONTENT declarations', () => {
  assert.throws(() => extractDayContent(`function wrapper() {\n${legacySource()}\n}`), /DAY_CONTENT|top-level/i)
})

test('rejects lessons that are not authored in exact 1 through 21 order', () => {
  assert.throws(() => extractDayContent(legacySource([2, 1, ...days.slice(2)])), /order|expected/i)
})

test('extractor source contains no executable loading primitive', async () => {
  const implementation = await readFile(new URL('./migrate-brain2-lessons.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(implementation, /\beval\s*\(|\bvm\b|\bimport\s*\(/)
})

if (process.env.BRAIN2_LEGACY_ROOT) {
  test('extracts the explicitly supplied authoritative legacy source', async () => {
    const sourceName = join(process.env.BRAIN2_LEGACY_ROOT, 'script.js')
    const source = await readFile(sourceName, 'utf8')
    const entries = extractDayContent(source, sourceName)
    assert.equal(entries.length, 21)
    assert.deepEqual(entries.map(({ day }) => day), days)
    assert.match(entries[8].title, /Viral/i)
    assert.doesNotMatch(entries[8].title, /backlink/i)
  })
}
