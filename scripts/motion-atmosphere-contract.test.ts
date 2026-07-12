import assert from 'node:assert/strict'
import test from 'node:test'
import { motionProfileForPath } from '../components/site-chrome/motion-profile'

test('motion profiles keep reading calm and dark cinema alive', () => {
  assert.deepEqual(motionProfileForPath('/', 'cinema-dark'), {
    ambient: 'full',
    pointer: 'full',
    scroll: 'full',
  })
  assert.deepEqual(motionProfileForPath('/library', 'editorial-light'), {
    ambient: 'restrained',
    pointer: 'interactive',
    scroll: 'medium',
  })
  assert.deepEqual(
    motionProfileForPath(
      '/library/read/steve-jobs-2005-stanford-commencement-address',
      'editorial-light',
    ),
    { ambient: 'none', pointer: 'interactive', scroll: 'minimal' },
  )
  assert.deepEqual(motionProfileForPath('/blog/ai-khong-cuop-viec-ban', 'editorial-light'), {
    ambient: 'none',
    pointer: 'interactive',
    scroll: 'minimal',
  })
})
