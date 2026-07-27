import assert from 'node:assert/strict'
import test from 'node:test'
import {
  READER_LOOP_POLICY_VERSION,
  SAMPLE_QUESTIONS,
  recommendReading,
} from '../lib/reader-loop/recommendation'

test('five sample questions produce deterministic repository-backed recommendations', () => {
  for (const sample of SAMPLE_QUESTIONS) {
    const first = recommendReading(sample.id, sample.label)
    const second = recommendReading(sample.id, sample.label)

    assert.deepEqual(first, second)
    assert.equal(first.policyVersion, READER_LOOP_POLICY_VERSION)
    assert.match(first.primary.url, /^\/library\/[a-z0-9-]+$/)
    assert.ok(first.reason.length > 20)
    assert.ok(first.expectedOutcome.length > 20)
    assert.ok(first.reasonCodes.length > 0)
    assert.ok(first.alternatives.length <= 2)
  }
})

test('custom question uses keyword rules and keeps one stable fallback', () => {
  const ai = recommendReading('custom', 'Tôi ngợp vì có quá nhiều công cụ AI')
  assert.equal(ai.primary.id, 'ai-overload-map')

  const fallback = recommendReading('custom', 'Tôi chưa gọi tên được điều đang mắc kẹt')
  assert.equal(fallback.primary.id, 'expertise-system-map')
  assert.ok(fallback.unknowns.includes('Câu hỏi chưa khớp một nhu cầu mẫu rõ ràng.'))
})

test('primary recommendation is excluded from alternatives', () => {
  const result = recommendReading(SAMPLE_QUESTIONS[0].id, SAMPLE_QUESTIONS[0].label)
  assert.ok(result.alternatives.every((item) => item.id !== result.primary.id))
})
