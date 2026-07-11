import assert from 'node:assert/strict'
import test from 'node:test'
import {
  diagnosticLevels,
  getDiagnosticLevel,
} from '../app/diagnostic/diagnostic-model'

test('diagnostic score boundaries stay unchanged', () => {
  assert.deepEqual(diagnosticLevels.map((level) => level.min), [0, 9, 13, 17, 19])
  assert.equal(getDiagnosticLevel(8).min, 0)
  assert.equal(getDiagnosticLevel(9).min, 9)
  assert.equal(getDiagnosticLevel(13).min, 13)
  assert.equal(getDiagnosticLevel(17).min, 17)
  assert.equal(getDiagnosticLevel(19).min, 19)
})

test('each result exposes three unique reasoned recommendations', () => {
  for (const level of diagnosticLevels) {
    assert.equal(level.recommendations.length, 3)
    assert.equal(new Set(level.recommendations.map((action) => action.href)).size, 3)
    assert.ok(level.recommendations.every((action) => action.reason.length > 12))
  }
})

test('advanced levels use the local Conan bridge', () => {
  assert.equal(diagnosticLevels[3].recommendations[0].href, '/conanmaker/')
  assert.equal(diagnosticLevels[4].recommendations[0].href, '/conanmaker/')
  assert.ok(diagnosticLevels.flatMap((level) => level.recommendations).every((action) => action.href !== 'https://com.conan.school'))
})
