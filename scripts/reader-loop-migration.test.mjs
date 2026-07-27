import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const migrations = [
  new URL('../workers/reader-loop-preview-migrations/0001_reader_loop_v0.sql', import.meta.url),
  new URL('../workers/reader-loop-preview-migrations/0002_reader_creation_rate_limit.sql', import.meta.url),
]

test('preview migration applies on an empty database and enforces evidence boundaries', () => {
  const directory = mkdtempSync(join(tmpdir(), 'reader-loop-migration-'))
  const database = join(directory, 'preview.sqlite')

  try {
    for (const migration of migrations) execFileSync('sqlite3', [database], { input: readFileSync(migration) })
    const tables = execFileSync('sqlite3', [database, "SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;"]).toString().trim().split('\n')
    assert.deepEqual(tables, [
      'anonymous_readers',
      'manual_completions',
      'next_action_decisions',
      'reader_creation_rate_limits',
      'reader_questions',
      'reading_evidence_summaries',
      'reading_sessions',
      'recommendation_decisions',
      'reflections',
    ])

    assert.throws(() => execFileSync('sqlite3', [database], {
      input: "PRAGMA foreign_keys=ON; INSERT INTO reading_sessions VALUES ('rs','missing','dec','content','/library/x','opened','now','now');",
      stdio: ['pipe', 'pipe', 'pipe'],
    }))
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
