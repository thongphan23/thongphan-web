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
const remediationPlan = read(
  'docs/superpowers/plans/2026-07-26-r0-1-security-remediation.md',
)

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

test('Current System Audit records complete local verification and pending production gates', () => {
  assert.match(
    currentAudit,
    /R0\.1A source implementation complete through Task 8/i,
  )
  assert.match(currentAudit, /complete local release verification passed/i)
  assert.match(currentAudit, /Draft PR #2 remains pending merge/i)
  assert.match(currentAudit, /R0\.1B not started/i)
  assert.doesNotMatch(currentAudit, /Task 8 local release verification (?:has not|chưa) (?:run|chạy)/i)
  assert.match(currentAudit, /no production\s+migration/i)
  assert.match(currentAudit, /no production\s+tombstone deployment/i)
  assert.match(currentAudit, /no production\s+signup cutover/i)
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
