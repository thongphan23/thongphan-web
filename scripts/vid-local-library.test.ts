import assert from 'node:assert/strict'
import test from 'node:test'
import {
  emptyLocalLibrary,
  readLocalLibrary,
  recordProgress,
  saveLocalLibrary,
  toggleWatchLater,
} from '../lib/vid/local-library'

class MemoryStorage implements Storage {
  readonly data = new Map<string, string>()
  failWrites = false
  get length() { return this.data.size }
  clear() { this.data.clear() }
  getItem(key: string) { return this.data.get(key) ?? null }
  key(index: number) { return [...this.data.keys()][index] ?? null }
  removeItem(key: string) { this.data.delete(key) }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error('quota')
    this.data.set(key, value)
  }
}

test('corrupt or stale local state fails closed', () => {
  const storage = new MemoryStorage()
  storage.setItem('thongphan.vid.library.v1', '{broken')
  assert.deepEqual(readLocalLibrary(storage), emptyLocalLibrary())
  storage.setItem('thongphan.vid.library.v1', JSON.stringify({ version: 2, progress: [], watchLater: [] }))
  assert.deepEqual(readLocalLibrary(storage), emptyLocalLibrary())
})

test('progress keeps only meaningful unfinished entries and caps history', () => {
  let state = emptyLocalLibrary()
  state = recordProgress(state, { slug: 'short', seconds: 9, duration: 100, updatedAt: 1 })
  assert.equal(state.progress.length, 0)
  state = recordProgress(state, { slug: 'watching', seconds: 30, duration: 100, updatedAt: 2 })
  assert.equal(state.progress[0]?.slug, 'watching')
  state = recordProgress(state, { slug: 'watching', seconds: 95, duration: 100, updatedAt: 3 })
  assert.equal(state.progress.length, 0)

  for (let index = 0; index < 105; index += 1) {
    state = recordProgress(state, { slug: `video-${index}`, seconds: 20, duration: 100, updatedAt: index })
  }
  assert.equal(state.progress.length, 100)
  assert.equal(state.progress[0]?.slug, 'video-104')
})

test('watch later is unique, bounded and storage failures are reported', () => {
  let state = emptyLocalLibrary()
  state = toggleWatchLater(state, 'one')
  state = toggleWatchLater(state, 'one')
  assert.deepEqual(state.watchLater, [])
  for (let index = 0; index < 205; index += 1) state = toggleWatchLater(state, `video-${index}`)
  assert.equal(state.watchLater.length, 200)

  const storage = new MemoryStorage()
  storage.failWrites = true
  assert.equal(saveLocalLibrary(storage, state), false)
})
