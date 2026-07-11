import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getJourneyHandoff,
  getRecommendationsForPrompt,
  journeyHandoffs,
} from '../lib/site-journey'

test('every handoff has one primary and no duplicate destinations', () => {
  for (const handoff of Object.values(journeyHandoffs)) {
    const actions = [handoff.primary, ...handoff.secondary]

    assert.ok(actions.length >= 2 && actions.length <= 3)
    assert.equal(new Set(actions.map((action) => action.href)).size, actions.length)

    for (const action of actions) {
      assert.ok(action.label.trim().length > 3)
      assert.ok(action.label.trim().length <= 24, `${action.label} is too long for a route handoff`)
      assert.ok(action.reason.trim().length > 12)
      assert.match(action.href, /^(?:\/|https:\/\/)/)
    }
  }
})

test('prompt intent selects a reasoned canonical route', () => {
  assert.equal(getRecommendationsForPrompt('Tui chưa biết bắt đầu từ đâu')[0].href, '/diagnostic')
  assert.equal(getRecommendationsForPrompt('Tui muốn xây Brain2 từ ghi chú')[0].href, '/challenges/brain2-21-ngay')
  assert.equal(getRecommendationsForPrompt('Tui muốn đóng gói một sản phẩm nhỏ')[0].href, '/assets')
  assert.equal(getRecommendationsForPrompt('Tui cần học AI có lộ trình')[0].href, '/diagnostic')
  assert.equal(getRecommendationsForPrompt('Tui cần cộng đồng cùng làm')[0].href, '/conanmaker/')
})

test('known keys return stable handoffs', () => {
  assert.equal(getJourneyHandoff('about').primary.href, '/diagnostic')
  assert.equal(getJourneyHandoff('reader').primary.href, '/assets')
})
