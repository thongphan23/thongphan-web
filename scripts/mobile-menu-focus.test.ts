import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveMenuKeyAction } from '../components/site-chrome/mobile-menu-focus'

test('Escape requests one close action', () => {
  assert.equal(
    resolveMenuKeyAction({ key: 'Escape', shiftKey: false, activeIndex: 2, itemCount: 5 }),
    'close',
  )
})

test('Tab wraps the last item to the first and Shift+Tab wraps the first to the last', () => {
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: 4, itemCount: 5 }),
    'focus-first',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: true, activeIndex: 0, itemCount: 5 }),
    'focus-last',
  )
})

test('Tab keeps focus on a middle item and ignores unrelated keys', () => {
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: 2, itemCount: 5 }),
    'none',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Enter', shiftKey: false, activeIndex: 4, itemCount: 5 }),
    'none',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: 0, itemCount: 5 }),
    'none',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: true, activeIndex: 2, itemCount: 5 }),
    'none',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: true, activeIndex: 4, itemCount: 5 }),
    'none',
  )
})

test('Tab entering from outside chooses the correct edge', () => {
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: -1, itemCount: 5 }),
    'focus-first',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: true, activeIndex: -1, itemCount: 5 }),
    'focus-last',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: 8, itemCount: 5 }),
    'focus-first',
  )
})

test('an empty menu never requests a focus move', () => {
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: -1, itemCount: 0 }),
    'none',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: true, activeIndex: -1, itemCount: 0 }),
    'none',
  )
})

test('a one-item menu loops both Tab directions onto that item', () => {
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: false, activeIndex: 0, itemCount: 1 }),
    'focus-first',
  )
  assert.equal(
    resolveMenuKeyAction({ key: 'Tab', shiftKey: true, activeIndex: 0, itemCount: 1 }),
    'focus-last',
  )
})
