import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readRoot = process.env.THONGPHAN_READ_ROOT ?? join(homedir(), 'Projects/thongphan-read')
const reportPath = join(root, 'docs/reading-rights-report-2026-07-10.md')

const approvedRightsStatuses = new Set([
  'public-domain',
  'permission-confirmed',
  'licensed',
  'source-link-only',
  'blocked',
])
const fullBodyStatuses = new Set(['public-domain', 'permission-confirmed', 'licensed'])

const parseTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

const parseRightsRows = (report) => {
  const tableLines = report
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))

  assert.ok(tableLines.length >= 3, 'rights report must contain a Markdown table')

  const headers = parseTableRow(tableLines[0])
  const expectedHeaders = [
    'slug',
    'author',
    'originalUrl',
    'translationBodyStatus',
    'mediaCount',
    'mediaLocation',
    'rightsStatus',
    'rightsEvidence',
    'publicMode',
    'remediation',
  ]
  assert.deepEqual(headers, expectedHeaders)

  return tableLines.slice(2).map((line) =>
    Object.fromEntries(headers.map((header, index) => [header, parseTableRow(line)[index]])),
  )
}

test('source rights gate rejects missing, unknown, or evidence-free full-publication claims', async () => {
  const auditModule = await import(
    pathToFileURL(join(root, 'scripts/reading-rights-audit.mjs')).href
  )
  const failClosed = {
    rightsStatus: 'source-link-only',
    publicMode: 'source-link-only',
  }

  assert.deepEqual(auditModule.publicationDecisionForSourceRights(), failClosed)
  assert.deepEqual(
    auditModule.publicationDecisionForSourceRights({
      rightsStatus: 'unknown',
      rightsEvidence: 'License record 123',
    }),
    failClosed,
  )
  assert.deepEqual(
    auditModule.publicationDecisionForSourceRights({
      rightsStatus: 'licensed',
      rightsEvidence: '',
    }),
    failClosed,
  )
  assert.deepEqual(
    auditModule.publicationDecisionForSourceRights({
      rightsStatus: 'permission-confirmed',
      rightsEvidence: 'unknown',
    }),
    failClosed,
  )
  assert.deepEqual(
    auditModule.publicationDecisionForSourceRights({
      rightsStatus: 'licensed',
      rightsEvidence: 'License record 123',
    }),
    { rightsStatus: 'licensed', publicMode: 'full' },
  )
})

test('rights report locks exactly 13 fail-closed reading rows', async () => {
  const report = await readFile(reportPath, 'utf8')
  const rows = parseRightsRows(report)

  assert.match(report, /Default publication mode:\s*`source-link-only`/)
  assert.equal(rows.length, 13)
  assert.equal(new Set(rows.map((row) => row.slug)).size, 13)

  for (const row of rows) {
    assert.ok(row.slug, 'every rights row needs a slug')
    assert.ok(row.author, `${row.slug} needs an author`)
    assert.match(row.originalUrl, /^https:\/\//, `${row.slug} needs an original URL`)
    assert.ok(row.translationBodyStatus, `${row.slug} needs a translation/body status`)
    assert.match(row.mediaCount, /^\d+$/, `${row.slug} needs a numeric media count`)
    assert.match(
      row.mediaLocation,
      /^\d+ local \/ \d+ hotlinked$/,
      `${row.slug} needs local/hotlinked media counts`,
    )
    assert.ok(approvedRightsStatuses.has(row.rightsStatus), `${row.slug} has invalid rightsStatus`)
    assert.ok(row.rightsEvidence, `${row.slug} needs rights evidence`)
    assert.ok(row.remediation, `${row.slug} needs remediation`)

    if (row.publicMode === 'full') {
      assert.ok(
        fullBodyStatuses.has(row.rightsStatus),
        `${row.slug} cannot publish a full body for ${row.rightsStatus}`,
      )
    } else if (row.rightsStatus === 'blocked') {
      assert.equal(row.publicMode, 'blocked')
    } else {
      assert.equal(row.publicMode, 'source-link-only')
    }
  }
})

test('legacy Read markup and crawler files remain noindex until retirement', async () => {
  const [html, robots, headers] = await Promise.all([
    readFile(join(readRoot, 'index.html'), 'utf8'),
    readFile(join(readRoot, 'public/robots.txt'), 'utf8'),
    readFile(join(readRoot, 'public/_headers'), 'utf8'),
  ])

  assert.match(
    html,
    /<meta\s+name=["']robots["']\s+content=["']noindex, nofollow["']\s*\/?>/i,
  )
  assert.equal(robots, 'User-agent: *\nDisallow: /\n')
  assert.match(headers, /^\/\*\s*$/m)
  assert.match(headers, /^\s+X-Robots-Tag:\s*noindex, nofollow\s*$/im)
})
