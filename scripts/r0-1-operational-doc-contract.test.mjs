import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (path) => readFileSync(join(repositoryRoot, path), 'utf8')
const workersReadme = read('workers/README.md')
const currentAudit = read('docs/discovery/CURRENT-SYSTEM-AUDIT.md')
const statusDocument = read('docs/STATUS.md')
const implementationReport = read('docs/security/R0-1-IMPLEMENTATION-REPORT.md')
const ownerChecklist = read('docs/security/R0-1-OWNER-ACTION-CHECKLIST.md')
const remediationPlan = read(
  'docs/superpowers/plans/2026-07-26-r0-1-security-remediation.md',
)

const implementationHead = '05946ce56dd8598721f196ab0e3220060f81368a'
const mergeCommit = '69666579e8ea2cf573b0681fd7cf8e2b3714752c'

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start + startMarker.length)
  assert.ok(start >= 0, `Section missing: ${startMarker}`)
  assert.ok(end > start, `Section end missing: ${endMarker}`)
  return source.slice(start, end)
}

function taskSection(source, taskNumber) {
  const start = source.indexOf(`## Task ${taskNumber}:`)
  const end = source.indexOf(`## Task ${taskNumber + 1}:`, start + 1)
  assert.ok(start >= 0, `Task ${taskNumber} missing`)
  return source.slice(start, end < 0 ? undefined : end)
}

function verificationBlock(source, taskNumber) {
  const section = taskSection(source, taskNumber)
  const verification = section.indexOf('### Verification command')
  assert.ok(verification >= 0, `Task ${taskNumber} verification command missing`)
  const match = section.slice(verification).match(/```bash\n([\s\S]*?)```/)
  assert.ok(match, `Task ${taskNumber} verification Bash block missing`)
  return match[1]
}

function parseChatScan(block) {
  const match = block.match(
    /if rg -n '([^']+)' ([^;]+); then exit 1; fi/,
  )
  assert.ok(match, 'chat negative scan missing')
  return {
    pattern: match[1],
    files: match[2].trim().split(/\s+/),
  }
}

function runRg(pattern, files, cwd = repositoryRoot) {
  return spawnSync('rg', ['-n', pattern, ...files], {
    cwd,
    encoding: 'utf8',
  })
}

test('Workers README separates implemented source from current production', () => {
  assert.match(workersReadme, /^## Implemented source contract$/m)
  assert.match(workersReadme, /^## Current production state$/m)
  assert.match(workersReadme, /migration `0003` has not been applied to production/i)
  assert.match(workersReadme, /tombstones?.{0,120}not production-deployed/is)
  assert.match(workersReadme, /truthful signup.{0,120}not production-deployed/is)
  assert.match(workersReadme, /email Worker remains undeployed/i)
  assert.match(workersReadme, /cron remains empty/i)

  const productionStart = workersReadme.indexOf('## Current production state')
  const productionEnd = workersReadme.indexOf('\n## ', productionStart + 4)
  const productionSection = workersReadme.slice(
    productionStart,
    productionEnd < 0 ? undefined : productionEnd,
  )
  assert.doesNotMatch(
    productionSection,
    /210.{0,160}(?:already|đã).{0,120}(?:quarantined_legacy|sendable\s*=\s*0)/is,
  )
})

test('Workers README delegates deployment authority and preserves the R0.1B order', () => {
  assert.match(
    workersReadme,
    /authoritative sequence is exclusively:[\s\S]{0,160}docs\/superpowers\/plans\/2026-07-26-r0-1-production-cutover\.md/i,
  )

  const sequenceStart = workersReadme.indexOf('## Trình tự triển khai R0.1B')
  const sequenceEnd = workersReadme.indexOf('\n## ', sequenceStart + 4)
  const sequenceSection = workersReadme.slice(
    sequenceStart,
    sequenceEnd < 0 ? undefined : sequenceEnd,
  )
  const expectedOrder = [
    'embed tombstone',
    'chat tombstone',
    'read-only smoke',
    'truthful signup Worker',
    'controlled synthetic signup',
    'D1 bookmark',
    'scoped apply of only migration 0003',
    'post-migration quarantine proof',
    'exact-main Pages deployment',
    'final read-only smoke',
  ]
  let previous = -1
  for (const phrase of expectedOrder) {
    const index = sequenceSection.indexOf(phrase)
    assert.ok(index > previous, `README missing or misorders: ${phrase}`)
    previous = index
  }
})

test('Current System Audit records the authoritative merged source and pending production gates', () => {
  const currentStatus = sectionBetween(currentAudit, '**Status:**', '## 2. Executive summary')

  assert.match(
    currentStatus,
    /R0\.1A source (?:has been |đã )?merged (?:into|vào) `?main`?/i,
  )
  assert.match(currentStatus, new RegExp(implementationHead))
  assert.match(currentStatus, new RegExp(mergeCommit))
  assert.match(currentStatus, /PR #2.{0,80}merged/is)
  assert.match(currentStatus, /R0\.1B not started/i)
  assert.doesNotMatch(currentStatus, /Draft PR #2 remains pending merge/i)
  assert.match(currentStatus, /no\s+production\s+migration/i)
  assert.match(currentStatus, /no\s+production\s+tombstone deployment/i)
  assert.match(currentStatus, /no\s+production\s+signup cutover/i)
  assert.match(currentStatus, /migration `0003`.{0,100}(?:not|chưa).{0,40}(?:applied|apply)/is)
  assert.match(currentStatus, /email Worker.{0,80}(?:absent|undeployed|chưa deploy)/is)
  assert.match(currentStatus, /cron.{0,40}(?:empty|rỗng)/is)
  assert.match(currentStatus, /preview.{0,80}production.{0,100}(?:unresolved|chưa giải quyết)/is)
})

test('STATUS current R0 section records R0.1B recovery in progress and incomplete cutover', () => {
  const currentR0 = sectionBetween(
    statusDocument,
    '## Thongphan Read Foundation v2 — Release 0 audit — 2026-07-26',
    '### Historical R0.1A implementation verification — superseded merge-state reporting',
  )

  assert.match(currentR0, /R0\.1B RECOVERY IN PROGRESS — CUTOVER INCOMPLETE/)
  assert.match(currentR0, new RegExp(implementationHead))
  assert.match(currentR0, new RegExp(mergeCommit))
  assert.match(currentR0, /PR #2.{0,80}merged/is)
  assert.match(currentR0, /2026-07-27T08:28:39Z/)
  assert.match(currentR0, /main.{0,100}contains R0\.1A\s+source/is)
  assert.match(currentR0, /R0\.1B cutover is incomplete/i)
  assert.match(currentR0, /embed\/chat\/signup versions are deployed/i)
  assert.match(currentR0, /official read-only recovery passed/i)
  assert.match(currentR0, /controlled signup stopped before\s+POST/is)
  assert.match(currentR0, /synthetic_count=0/)
  assert.match(currentR0, /migration (?:and|\/) Pages remain untouched/i)
  assert.match(currentR0, /R0\.H1.{0,80}(?:not started|chưa bắt đầu)/is)
  assert.match(currentR0, /R0\.2.{0,80}(?:not started|chưa bắt đầu)/is)
  assert.doesNotMatch(currentR0, /R0\.1B NOT STARTED|R0\.1B has not started/i)
  assert.doesNotMatch(currentR0, /Draft PR #2 remains pending merge/i)
  assert.doesNotMatch(currentR0, /R0\.1A (?:READY|waiting) FOR IMPLEMENTATION REVIEW/i)
})

test('Implementation Report opens with authoritative merge reconciliation', () => {
  const reconciliation = sectionBetween(
    implementationReport,
    '## R0.1A authoritative merge reconciliation',
    '## R0.1A controlled signup response and evidence cleanup correction',
  )

  assert.match(
    implementationReport,
    /^Status: R0\.1A MERGED INTO MAIN — R0\.1B NOT STARTED$/m,
  )
  assert.match(reconciliation, /https:\/\/github\.com\/thongphan23\/thongphan-web\/pull\/2/)
  assert.match(reconciliation, new RegExp(implementationHead))
  assert.match(reconciliation, new RegExp(mergeCommit))
  assert.match(reconciliation, /2026-07-27T08:28:39Z/)
  assert.match(reconciliation, /bde1778d698d9c1c0cc4e1823cc28485a3e4a8cf/)
  assert.match(reconciliation, /remote implementation branch.{0,80}deleted/is)
  assert.match(reconciliation, /no production cutover/i)
  assert.match(reconciliation, /prior report.{0,100}superseded/is)
  assert.match(reconciliation, /GitHub.{0,80}authoritative/is)
})

test('Owner Action Checklist closes only verified source and credential gates', () => {
  const completedLabels = [
    'Documentation correction PR reviewed.',
    'Documentation correction PR merged into `main`.',
    'GitHub default branch is `main`.',
    'R0.1A branch `agent/r0-1a-security-remediation` created only after the',
    'R0.1A implementation PR reviewed.',
    'R0.1A implementation PR merged into `main`.',
    'Candidate A invalid verification evidence recorded.',
    'Candidate B classified `legacy_orphaned_not_present_in_active_inventory` and',
    'Candidate B complete active-token inventory evidence recorded.',
    'Inventory scope recorded without token names or IDs: 3 User API Tokens and',
    'Zero active Workers AI/Vectorize permission match recorded.',
    'No active Cloudflare token mutation was authorized or performed.',
    'Current tracked tree and approved ignored-local configuration sanitized and',
    'Public-history exposure recorded as a residual risk without sensitive content.',
    'R0.H1 remains separate and has not been treated as an R0.1 release gate.',
  ]
  for (const label of completedLabels) {
    assert.match(
      ownerChecklist,
      new RegExp(`^- \\[x\\] ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'),
    )
  }

  const productionGates = sectionBetween(
    ownerChecklist,
    '## Production authorization gates',
    '## Negative confirmations',
  )
  assert.doesNotMatch(productionGates, /^- \[x\]/m)
  assert.match(ownerChecklist, /^## Completed non-secret evidence$/m)
  assert.match(ownerChecklist, /\| Provider \| Actor role \| Action \| UTC time \| Result \| GitHub evidence reference \|/)
  assert.match(ownerChecklist, /https:\/\/github\.com\/thongphan23\/thongphan-web\/pull\/1/)
  assert.match(ownerChecklist, /https:\/\/github\.com\/thongphan23\/thongphan-web\/pull\/2/)
})

test('documented chat verification accepts the required Worker identity', () => {
  const block = verificationBlock(remediationPlan, 4)
  const identityCommand = "rg -N -x 'name = \"thongphan-chat-api\"' wrangler.chat.toml"
  assert.match(block, new RegExp(identityCommand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

  const identity = spawnSync(
    'rg',
    ['-N', '-x', 'name = "thongphan-chat-api"', 'wrangler.chat.toml'],
    { cwd: repositoryRoot, encoding: 'utf8' },
  )
  assert.equal(identity.status, 0, identity.stderr)

  const scan = parseChatScan(block)
  assert.doesNotMatch(scan.pattern, /thongphan-chat-api/)
  for (const requiredHook of [
    'NEXT_PUBLIC_CHAT_API_URL',
    'BRAIN2_INDEX',
    'VectorizeIndex',
    'AI\\.run',
    '\\[ai\\]',
    '\\[\\[vectorize\\]\\]',
    'nodejs_compat',
    'thongphan-chat-tombstone',
  ]) {
    assert.match(scan.pattern, new RegExp(requiredHook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  const currentScan = runRg(scan.pattern, scan.files)
  assert.equal(currentScan.status, 1, currentScan.stdout)
})

test('documented chat negative scan rejects a synthetic reactivation hook', () => {
  const scan = parseChatScan(verificationBlock(remediationPlan, 4))
  const fixture = mkdtempSync(join(dirname(repositoryRoot), '.r0-1-chat-doc-'))

  try {
    writeFileSync(
      join(fixture, 'synthetic-reactivation.ts'),
      'const NEXT_PUBLIC_CHAT_API_URL = "https://invalid.example"\n',
      { mode: 0o600 },
    )
    const result = runRg(scan.pattern, ['synthetic-reactivation.ts'], fixture)
    assert.equal(result.status, 0)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
