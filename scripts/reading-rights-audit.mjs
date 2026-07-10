import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const defaultReadRoot = join(homedir(), 'Projects/thongphan-read')

export const APPROVED_RIGHTS_STATUSES = new Set([
  'public-domain',
  'permission-confirmed',
  'licensed',
  'source-link-only',
  'blocked',
])

const FULL_BODY_STATUSES = new Set(['public-domain', 'permission-confirmed', 'licensed'])
const REPORT_HEADERS = [
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

export const publicModeForRightsStatus = (rightsStatus) => {
  if (FULL_BODY_STATUSES.has(rightsStatus)) return 'full'
  if (rightsStatus === 'blocked') return 'blocked'
  return 'source-link-only'
}

const parseTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

export const parseRightsReport = (report) => {
  const lines = report.split('\n').filter((line) => line.trim().startsWith('|'))
  assert.ok(lines.length >= 3, 'rights report must contain a Markdown table')

  const headers = parseTableRow(lines[0])
  assert.deepEqual(headers, REPORT_HEADERS, 'rights report headers changed')

  return lines.slice(2).map((line) => {
    const cells = parseTableRow(line)
    assert.equal(cells.length, REPORT_HEADERS.length, `invalid rights row: ${line}`)
    return Object.fromEntries(REPORT_HEADERS.map((header, index) => [header, cells[index]]))
  })
}

const topLevelString = (segment, field) => {
  const pattern = new RegExp(
    `^ {4}(?:"${field}"|${field}):\\s*(["'])(.*?)\\1,?\\s*$`,
    'm',
  )
  return pattern.exec(segment)?.[2]
}

export const extractSourceArticles = (source) => {
  const slugPattern = /^ {4}(?:"slug"|slug):\s*(["'])(.*?)\1,?\s*$/gm
  const matches = [...source.matchAll(slugPattern)]

  return matches.map((match, index) => {
    const segment = source.slice(match.index, matches[index + 1]?.index ?? source.length)
    const imagesStart = /^ {4}(?:"images"|images):\s*\[\s*$/m.exec(segment)
    const abilityTagsStart = /^ {4}(?:"abilityTags"|abilityTags):/m.exec(segment)
    assert.ok(imagesStart, `${match[2]} has no images array`)
    assert.ok(abilityTagsStart, `${match[2]} has no abilityTags boundary`)

    const imagesSource = segment.slice(imagesStart.index, abilityTagsStart.index)
    const media = [...imagesSource.matchAll(/^ {8}(?:"src"|src):\s*(["'])(.*?)\1,?\s*$/gm)].map(
      (mediaMatch) => mediaMatch[2],
    )
    const mediaCreditCount = [
      ...imagesSource.matchAll(/^ {8}(?:"credit"|credit):\s*(["'])(.*?)\1,?\s*$/gm),
    ].length

    return {
      slug: match[2],
      author: topLevelString(segment, 'author'),
      originalUrl: topLevelString(segment, 'url'),
      translationBodyStatus: /^ {4}(?:"sections"|sections):\s*\[/m.test(segment)
        ? 'full Vietnamese body present in legacy source'
        : 'body absent',
      mediaCount: media.length,
      localMedia: media.filter((sourceUrl) => sourceUrl.startsWith('/')).length,
      hotlinkedMedia: media.filter((sourceUrl) => /^https?:\/\//.test(sourceUrl)).length,
      mediaCreditCount,
      hasRightsMetadata: /^ {4}(?:"rightsStatus"|rightsStatus):/m.test(segment),
    }
  })
}

export const auditReadingRights = async ({
  reportPath = join(root, 'docs/reading-rights-report-2026-07-10.md'),
  readRoot = process.env.THONGPHAN_READ_ROOT ?? defaultReadRoot,
} = {}) => {
  const [report, librarySource, sheetSource] = await Promise.all([
    readFile(reportPath, 'utf8'),
    readFile(join(readRoot, 'src/library.ts'), 'utf8'),
    readFile(join(readRoot, 'src/sheetArticles.ts'), 'utf8'),
  ])
  const reportRows = parseRightsReport(report)
  const sourceRows = [
    ...extractSourceArticles(librarySource),
    ...extractSourceArticles(sheetSource),
  ]
  const errors = []
  const sourceBySlug = new Map(sourceRows.map((row) => [row.slug, row]))

  if (!/Default publication mode:\s*`source-link-only`/.test(report)) {
    errors.push('report does not declare the fail-closed default publication mode')
  }
  if (sourceRows.length !== 13) errors.push(`expected 13 source rows, found ${sourceRows.length}`)
  if (reportRows.length !== 13) errors.push(`expected 13 report rows, found ${reportRows.length}`)
  if (sourceBySlug.size !== sourceRows.length) errors.push('source contains duplicate slugs')
  if (new Set(reportRows.map((row) => row.slug)).size !== reportRows.length) {
    errors.push('report contains duplicate slugs')
  }

  for (const sourceRow of sourceRows) {
    if (sourceRow.mediaCreditCount !== sourceRow.mediaCount) {
      errors.push(`${sourceRow.slug}: ${sourceRow.mediaCount - sourceRow.mediaCreditCount} media credits missing`)
    }
    if (sourceRow.localMedia + sourceRow.hotlinkedMedia !== sourceRow.mediaCount) {
      errors.push(`${sourceRow.slug}: media source is neither local nor http(s)`)
    }
  }

  for (const row of reportRows) {
    const sourceRow = sourceBySlug.get(row.slug)
    if (!sourceRow) {
      errors.push(`${row.slug}: missing from Read source`)
      continue
    }
    if (row.author !== sourceRow.author) errors.push(`${row.slug}: author differs from Read source`)
    if (row.originalUrl !== sourceRow.originalUrl) {
      errors.push(`${row.slug}: original URL differs from Read source`)
    }
    if (row.translationBodyStatus !== sourceRow.translationBodyStatus) {
      errors.push(`${row.slug}: translation/body status differs from Read source`)
    }
    if (Number(row.mediaCount) !== sourceRow.mediaCount) {
      errors.push(`${row.slug}: media count differs from Read source`)
    }
    const expectedLocation = `${sourceRow.localMedia} local / ${sourceRow.hotlinkedMedia} hotlinked`
    if (row.mediaLocation !== expectedLocation) {
      errors.push(`${row.slug}: media location differs from Read source`)
    }
    if (!APPROVED_RIGHTS_STATUSES.has(row.rightsStatus)) {
      errors.push(`${row.slug}: invalid rightsStatus ${row.rightsStatus}`)
    }
    if (!sourceRow.hasRightsMetadata && row.rightsStatus !== 'source-link-only') {
      errors.push(`${row.slug}: no rights evidence in source, so status must fail closed`)
    }
    if (row.publicMode !== publicModeForRightsStatus(row.rightsStatus)) {
      errors.push(`${row.slug}: public mode does not match rightsStatus`)
    }
    if (!row.rightsEvidence) errors.push(`${row.slug}: rights evidence is empty`)
    if (!row.remediation) errors.push(`${row.slug}: remediation is empty`)
  }

  for (const sourceRow of sourceRows) {
    if (!reportRows.some((row) => row.slug === sourceRow.slug)) {
      errors.push(`${sourceRow.slug}: missing from rights report`)
    }
  }

  const summary = {
    sourceRows: sourceRows.length,
    reportRows: reportRows.length,
    uniqueSlugs: new Set(reportRows.map((row) => row.slug)).size,
    invalidRightsStatus: reportRows.filter((row) => !APPROVED_RIGHTS_STATUSES.has(row.rightsStatus))
      .length,
    full: reportRows.filter((row) => row.publicMode === 'full').length,
    sourceLinkOnly: reportRows.filter((row) => row.publicMode === 'source-link-only').length,
    blocked: reportRows.filter((row) => row.publicMode === 'blocked').length,
    localMedia: sourceRows.reduce((total, row) => total + row.localMedia, 0),
    hotlinkedMedia: sourceRows.reduce((total, row) => total + row.hotlinkedMedia, 0),
    mediaCreditsMissing: sourceRows.reduce(
      (total, row) => total + Math.max(0, row.mediaCount - row.mediaCreditCount),
      0,
    ),
    errors,
  }

  if (errors.length > 0) {
    throw new Error(`Reading rights audit failed:\n- ${errors.join('\n- ')}`)
  }

  return summary
}

const isMain =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) {
  const summary = await auditReadingRights()
  console.log(JSON.stringify(summary, null, 2))
}
