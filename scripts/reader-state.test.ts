import assert from 'node:assert/strict'
import test from 'node:test'

import {
  COMPLETED_STORAGE_KEY,
  SAVED_STORAGE_KEY,
  capabilitiesForPublication,
  parseStoredSlugs,
  toggleStoredSlug,
  writeStoredSlugs,
} from '../lib/reader-state'

test('reader storage uses the approved local-only keys', () => {
  assert.equal(SAVED_STORAGE_KEY, 'tp:library:saved:v1')
  assert.equal(COMPLETED_STORAGE_KEY, 'tp:library:completed:v1')
})

test('stored slugs fail closed on corrupt input and normalize unique strings', () => {
  assert.deepEqual(parseStoredSlugs(null), [])
  assert.deepEqual(parseStoredSlugs('{bad json'), [])
  assert.deepEqual(parseStoredSlugs('{"slug":true}'), [])
  assert.deepEqual(parseStoredSlugs('["b", "a", "b", 1, ""]'), ['a', 'b'])
})

test('bookmark toggle is deterministic and immutable', () => {
  const initial = ['alpha']
  assert.deepEqual(toggleStoredSlug(initial, 'beta'), ['alpha', 'beta'])
  assert.deepEqual(toggleStoredSlug(initial, 'alpha'), [])
  assert.deepEqual(initial, ['alpha'])
})

test('storage writes fail closed without forcing a false bookmark state', () => {
  const values: string[] = []
  const availableStorage = {
    setItem(_key: string, value: string) {
      values.push(value)
    },
  }
  const blockedStorage = {
    setItem() {
      throw new Error('storage unavailable')
    },
  }

  assert.equal(writeStoredSlugs(availableStorage, ['saved-note']), true)
  assert.deepEqual(values, ['["saved-note"]'])
  assert.equal(writeStoredSlugs(blockedStorage, []), false)
})

test('source-link summaries never expose full-reader capabilities', () => {
  assert.deepEqual(capabilitiesForPublication('summary', 0), {
    audio: false,
    completion: false,
    elapsed: false,
    focus: false,
    progress: false,
  })
  assert.deepEqual(capabilitiesForPublication('full', 1), {
    audio: true,
    completion: true,
    elapsed: true,
    focus: true,
    progress: true,
  })
})
