import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  chmodSync,
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const scopedConfigPath = join(repositoryRoot, 'wrangler.r0-1b-email-integrity.toml')
const emailConfigPath = join(repositoryRoot, 'wrangler.brain2-email.toml')
const expectedMigration = 'workers/migrations/0003_r0_1_email_integrity.sql'
const wranglerPath = join(repositoryRoot, 'node_modules/.bin/wrangler')

function arrayTableBodies(source, tableName) {
  const bodies = []
  let current = null

  for (const line of source.split(/\r?\n/)) {
    const header = line.trim().match(/^\[\[([^\]]+)\]\]$/)
    if (header) {
      current = header[1] === tableName ? [] : null
      if (current) bodies.push(current)
      continue
    }
    if (current) current.push(line)
  }

  return bodies.map((lines) => lines.join('\n'))
}

function stringAssignment(source, key) {
  const matches = [
    ...source.matchAll(new RegExp(`^\\s*${key}\\s*=\\s*["']([^"']+)["']\\s*$`, 'gm')),
  ]
  assert.equal(matches.length, 1, `expected one ${key} assignment`)
  return matches[0][1]
}

function runWrangler(args, fixtureRoot) {
  const result = spawnSync(wranglerPath, args, {
    cwd: fixtureRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      WRANGLER_SEND_METRICS: 'false',
    },
    maxBuffer: 8 * 1024 * 1024,
  })

  assert.equal(
    result.status,
    0,
    `Wrangler failed: ${args.join(' ')}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  )
  return `${result.stdout}\n${result.stderr}`
}

function gitPorcelain() {
  const result = spawnSync('git', ['status', '--porcelain=v1', '-z'], {
    cwd: repositoryRoot,
    encoding: 'buffer',
  })
  assert.equal(result.status, 0)
  return result.stdout
}

test('migration-only config has exact D1 parity and exact file discovery', () => {
  const scopedConfig = readFileSync(scopedConfigPath, 'utf8')
  const emailConfig = readFileSync(emailConfigPath, 'utf8')
  const scopedBindings = arrayTableBodies(scopedConfig, 'd1_databases')
  const emailBindings = arrayTableBodies(emailConfig, 'd1_databases')

  assert.equal(scopedBindings.length, 1)
  assert.equal(emailBindings.length, 1)
  for (const key of ['binding', 'database_name', 'database_id']) {
    assert.equal(
      stringAssignment(scopedBindings[0], key),
      stringAssignment(emailBindings[0], key),
      `${key} must match the production D1 binding`,
    )
  }

  const emailMigrationTable = emailBindings[0].match(
    /^\s*migrations_table\s*=\s*["']([^"']+)["']\s*$/m,
  )?.[1]
  const scopedMigrationTable = scopedBindings[0].match(
    /^\s*migrations_table\s*=\s*["']([^"']+)["']\s*$/m,
  )?.[1]
  assert.equal(scopedMigrationTable, emailMigrationTable)
  assert.equal(stringAssignment(scopedBindings[0], 'migrations_dir'), 'workers/migrations')
  assert.equal(stringAssignment(scopedBindings[0], 'migrations_pattern'), expectedMigration)
  assert.doesNotMatch(expectedMigration, /[*?\[\]{}]/)
})

test('migration-only config has no Worker runtime or deployment surface', () => {
  const scopedConfig = readFileSync(scopedConfigPath, 'utf8')

  assert.match(scopedConfig, /migration-scope control/i)
  assert.match(scopedConfig, /not a Worker runtime or deployment config/i)
  assert.doesNotMatch(scopedConfig, /^\s*(?:name|main|workers_dev|preview_urls)\s*=/m)
  assert.doesNotMatch(
    scopedConfig,
    /^\s*(?:\[\[routes\]\]|\[triggers\]|\[ai\]|\[vars\]|\[\[vectorize\]\]|\[\[kv_namespaces\]\]|\[\[r2_buckets\]\]|\[\[services\]\]|\[\[queues\.(?:producers|consumers)\]\]|\[\[analytics_engine_datasets\]\]|\[\[ratelimits\]\])/m,
  )
})

test('no executable deploy command uses the migration-only config', () => {
  const tracked = spawnSync('git', ['ls-files', '-co', '--exclude-standard'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
  assert.equal(tracked.status, 0)

  for (const relativePath of tracked.stdout.trim().split('\n').filter(Boolean)) {
    if (relativePath === 'scripts/r0-1b-d1-migration-scope.test.mjs') continue
    let source
    try {
      source = readFileSync(join(repositoryRoot, relativePath), 'utf8')
    } catch {
      continue
    }
    assert.doesNotMatch(
      source,
      /wrangler\s+(?:deploy|pages\s+deploy)[^\n]*wrangler\.r0-1b-email-integrity\.toml/i,
      `migration-only config used as deploy target in ${relativePath}`,
    )
  }
})

test('pinned Wrangler applies 0003 without discovering a synthetic 0004', () => {
  const startingStatus = gitPorcelain()
  const fixtureRoot = mkdtempSync(join(dirname(repositoryRoot), '.r0-1b-d1-scope-'))
  chmodSync(fixtureRoot, 0o700)

  try {
    const migrationsDirectory = join(fixtureRoot, 'migrations')
    const persistenceDirectory = join(fixtureRoot, 'state')
    mkdirSync(migrationsDirectory, { mode: 0o700 })
    mkdirSync(persistenceDirectory, { mode: 0o700 })
    copyFileSync(join(repositoryRoot, 'workers/schema.sql'), join(fixtureRoot, 'schema.sql'))
    copyFileSync(
      join(repositoryRoot, 'workers/migrations/0002_brain2_access_and_email_campaign.sql'),
      join(migrationsDirectory, '0002_brain2_access_and_email_campaign.sql'),
    )

    const commonConfig = [
      '[[d1_databases]]',
      'binding = "DB"',
      'database_name = "r0-1b-scope-fixture"',
      'database_id = "00000000-0000-0000-0000-000000000003"',
      'migrations_dir = "migrations"',
    ]
    const broadConfigPath = join(fixtureRoot, 'wrangler.broad.toml')
    const scopedFixtureConfigPath = join(fixtureRoot, 'wrangler.scoped.toml')
    writeFileSync(broadConfigPath, `${commonConfig.join('\n')}\n`, { mode: 0o600 })
    writeFileSync(
      scopedFixtureConfigPath,
      `${commonConfig.join('\n')}\nmigrations_pattern = "migrations/0003_r0_1_email_integrity.sql"\n`,
      { mode: 0o600 },
    )

    runWrangler([
      'd1', 'execute', 'r0-1b-scope-fixture', '--local', '--config', broadConfigPath,
      '--persist-to', persistenceDirectory, '--file', join(fixtureRoot, 'schema.sql'),
    ], fixtureRoot)
    runWrangler([
      'd1', 'migrations', 'apply', 'r0-1b-scope-fixture', '--local',
      '--config', broadConfigPath, '--persist-to', persistenceDirectory,
    ], fixtureRoot)

    copyFileSync(
      join(repositoryRoot, 'workers/migrations/0003_r0_1_email_integrity.sql'),
      join(migrationsDirectory, '0003_r0_1_email_integrity.sql'),
    )
    writeFileSync(
      join(migrationsDirectory, '0004_synthetic_later_migration.sql'),
      'CREATE TABLE synthetic_later_migration (id INTEGER PRIMARY KEY) STRICT;\n',
      { mode: 0o600 },
    )

    const scopedBefore = runWrangler([
      'd1', 'migrations', 'list', 'r0-1b-scope-fixture', '--local',
      '--config', scopedFixtureConfigPath, '--persist-to', persistenceDirectory,
    ], fixtureRoot)
    assert.match(scopedBefore, /0003_r0_1_email_integrity\.sql/)
    assert.doesNotMatch(scopedBefore, /0004_synthetic_later_migration\.sql/)

    const scopedApply = runWrangler([
      'd1', 'migrations', 'apply', 'r0-1b-scope-fixture', '--local',
      '--config', scopedFixtureConfigPath, '--persist-to', persistenceDirectory,
    ], fixtureRoot)
    assert.match(scopedApply, /0003_r0_1_email_integrity\.sql/)
    assert.doesNotMatch(scopedApply, /0004_synthetic_later_migration\.sql/)

    const scopedAfter = runWrangler([
      'd1', 'migrations', 'list', 'r0-1b-scope-fixture', '--local',
      '--config', scopedFixtureConfigPath, '--persist-to', persistenceDirectory,
    ], fixtureRoot)
    assert.doesNotMatch(scopedAfter, /0003_r0_1_email_integrity\.sql/)

    const broadAfter = runWrangler([
      'd1', 'migrations', 'list', 'r0-1b-scope-fixture', '--local',
      '--config', broadConfigPath, '--persist-to', persistenceDirectory,
    ], fixtureRoot)
    assert.match(broadAfter, /0004_synthetic_later_migration\.sql/)
    assert.doesNotMatch(broadAfter, /0003_r0_1_email_integrity\.sql/)

    const schemaEvidence = runWrangler([
      'd1', 'execute', 'r0-1b-scope-fixture', '--local', '--config', broadConfigPath,
      '--persist-to', persistenceDirectory, '--json', '--command',
      "SELECT COUNT(*) AS integrity_column_count FROM pragma_table_info('email_queue') WHERE name IN ('audience_state','sendable'); SELECT COUNT(*) AS synthetic_table_count FROM sqlite_master WHERE type='table' AND name='synthetic_later_migration';",
    ], fixtureRoot)
    assert.match(schemaEvidence, /"integrity_column_count"\s*:\s*2/)
    assert.match(schemaEvidence, /"synthetic_table_count"\s*:\s*0/)
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }

  assert.deepEqual(gitPorcelain(), startingStatus)
})
