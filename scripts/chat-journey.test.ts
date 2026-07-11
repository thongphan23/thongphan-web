import assert from 'node:assert/strict'
import test from 'node:test'
import { createLocalChatTurn, splitSseEvents } from '../app/chat/chat-model'

test('local chat turns include three unique contextual recommendations', () => {
  const turn = createLocalChatTurn('Tui muốn đóng gói một sản phẩm nhỏ từ chuyên môn')

  assert.ok(turn.content.length > 30)
  assert.equal(turn.recommendations.length, 3)
  assert.equal(turn.recommendations[0].href, '/assets')
  assert.equal(new Set(turn.recommendations.map((action) => action.href)).size, 3)
  assert.ok(turn.recommendations.every((action) => action.reason.length > 12))
  assert.ok(turn.recommendations.every((action) => !action.external))
})

test('stream parser preserves complete server-sent events', () => {
  assert.deepEqual(splitSseEvents('data: {"response":"xin', '"}\n\ndata: [DONE]\n\n'), {
    events: ['data: {"response":"xin"}', 'data: [DONE]'],
    remainder: '',
  })
})
