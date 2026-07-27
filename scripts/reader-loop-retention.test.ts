import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { EXPIRED_READER_CLEANUP_SQL } from '../lib/reader-loop/retention'

test('expired reader cleanup removes the complete child graph in foreign-key-safe order', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(readFileSync(new URL('../workers/reader-loop-preview-migrations/0001_reader_loop_v0.sql', import.meta.url), 'utf8'))
  db.exec(readFileSync(new URL('../workers/reader-loop-preview-migrations/0002_reader_creation_rate_limit.sql', import.meta.url), 'utf8'))
  db.exec(readFileSync(new URL('../workers/reader-loop-preview-migrations/0003_reader_caller_expiry.sql', import.meta.url), 'utf8'))
  db.exec(`
    INSERT INTO anonymous_readers VALUES ('old-reader', 'old-hash', '2026-07-19T00:00:00.000Z');
    INSERT INTO reader_questions VALUES ('q', 'old-reader', 'custom', NULL, 'Một câu hỏi', '2026-07-19T00:00:00.000Z');
    INSERT INTO recommendation_decisions VALUES ('dec', 'old-reader', 'q', 'v', '[]', 'content', '/library/x', '[]', 'reason', 'outcome', '[]', '2026-07-19T00:00:00.000Z');
    INSERT INTO reading_sessions VALUES ('session', 'old-reader', 'dec', 'content', '/library/x', 'completed', '2026-07-19T00:00:00.000Z', '2026-07-19T00:00:00.000Z');
    INSERT INTO reading_evidence_summaries VALUES ('evidence', 'session', 1, 1, 1, '[]', 1, '2026-07-19T00:00:00.000Z', '2026-07-19T00:00:00.000Z');
    INSERT INTO manual_completions VALUES ('completion', 'session', '2026-07-19T00:00:00.000Z');
    INSERT INTO reflections VALUES ('reflection', 'session', 'takeaway', 'next', '2026-07-19T00:00:00.000Z');
    INSERT INTO next_action_decisions VALUES ('action', 'session', 'v', 'do_action', 'label', '/read', 'reason', '[]', '[]', '2026-07-19T00:00:00.000Z');
    INSERT INTO anonymous_readers VALUES ('fresh-reader', 'fresh-hash', '2026-07-28T00:00:00.000Z');
  `)

  db.exec('BEGIN')
  for (const statement of EXPIRED_READER_CLEANUP_SQL) db.prepare(statement).run('2026-07-21T00:00:00.000Z')
  db.exec('COMMIT')

  for (const table of [
    'reader_questions', 'recommendation_decisions', 'reading_sessions', 'reading_evidence_summaries',
    'manual_completions', 'reflections', 'next_action_decisions',
  ]) {
    const result = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number } | undefined
    assert.equal(result?.count, 0, table)
  }
  assert.deepEqual(db.prepare('SELECT id FROM anonymous_readers').all().map((row) => ({ ...row })), [{ id: 'fresh-reader' }])
})
