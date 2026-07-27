import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { ATOMIC_EVIDENCE_UPDATE_SQL } from '../lib/reader-loop/evidence'

const migration = readFileSync(new URL('../workers/reader-loop-preview-migrations/0001_reader_loop_v0.sql', import.meta.url), 'utf8')

function fixture() {
  const db = new DatabaseSync(':memory:')
  db.exec(migration)
  db.exec(`
    INSERT INTO anonymous_readers VALUES ('reader', 'hash', '2026-07-28T00:00:00.000Z');
    INSERT INTO reader_questions VALUES ('question', 'reader', 'sample', 'expertise_asset', 'Question', '2026-07-28T00:00:00.000Z');
    INSERT INTO recommendation_decisions VALUES ('decision', 'reader', 'question', 'v0', '[]', 'content', '/library/article', '[]', 'reason', 'outcome', '[]', '2026-07-28T00:00:00.000Z');
    INSERT INTO reading_sessions VALUES ('session', 'reader', 'decision', 'content', '/library/article', 'opened', '2026-07-28T00:00:00.000Z', '2026-07-28T00:00:00.000Z');
    INSERT INTO reading_evidence_summaries VALUES ('evidence', 'session', 0, 0, 0, '[]', 0, '2026-07-28T00:00:00.000Z', '2026-07-28T00:00:00.000Z');
  `)
  return db
}

function apply(db: DatabaseSync, input: { visible: number; active: number; scroll: number; sections: string[]; interactions: number; at: string }) {
  return db.prepare(ATOMIC_EVIDENCE_UPDATE_SQL).run(
    input.visible,
    input.active,
    input.visible,
    input.scroll,
    JSON.stringify(input.sections),
    input.interactions,
    input.at,
    'session',
    'session',
    'reader',
  )
}

function readEvidence(db: DatabaseSync) {
  const row = db.prepare('SELECT visible_ms, active_ms, max_scroll_percent, sections_seen_json, meaningful_interaction_count FROM reading_evidence_summaries WHERE session_id = ?')
    .get('session') as Record<string, unknown>
  return { ...row }
}

test('competing evidence update orders converge monotonically in real SQLite', () => {
  const high = { visible: 8000, active: 5000, scroll: 82, sections: ['body', 'intro'], interactions: 8, at: '2026-07-28T00:02:00.000Z' }
  const low = { visible: 3000, active: 2000, scroll: 35, sections: ['intro'], interactions: 2, at: '2026-07-28T00:01:00.000Z' }
  const first = fixture()
  const second = fixture()
  try {
    apply(first, high)
    apply(first, low)
    apply(second, low)
    apply(second, high)
    assert.deepEqual(readEvidence(first), readEvidence(second))
    assert.deepEqual(readEvidence(first), {
      visible_ms: 8000,
      active_ms: 5000,
      max_scroll_percent: 82,
      sections_seen_json: '["body","intro"]',
      meaningful_interaction_count: 8,
    })
  } finally {
    first.close()
    second.close()
  }
})

test('the same atomic write rejects evidence after completion', () => {
  const db = fixture()
  try {
    db.exec("UPDATE reading_sessions SET status = 'completed' WHERE id = 'session'")
    const result = apply(db, { visible: 9000, active: 9000, scroll: 100, sections: ['after'], interactions: 99, at: '2026-07-28T00:03:00.000Z' })
    assert.equal(result.changes, 0)
    assert.deepEqual(readEvidence(db), {
      visible_ms: 0,
      active_ms: 0,
      max_scroll_percent: 0,
      sections_seen_json: '[]',
      meaningful_interaction_count: 0,
    })
  } finally {
    db.close()
  }
})
