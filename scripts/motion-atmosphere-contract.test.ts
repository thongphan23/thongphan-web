import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { motionProfileForPath } from '../components/site-chrome/motion-profile'

const root = new URL('../', import.meta.url)

async function readProjectFile(path: string) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw error
  }
}

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

test('motion atmosphere has one guarded pointer runtime with teardown', async () => {
  const source = await readProjectFile('components/site-chrome/MotionAtmosphere.tsx')

  assert.match(source, /matchMedia\('\(prefers-reduced-motion:\s*reduce\)'\)/)
  assert.match(source, /matchMedia\('\(hover:\s*hover\) and \(pointer:\s*fine\)'\)/)
  assert.match(source, /requestAnimationFrame/)
  assert.match(source, /visibilitychange/)
  assert.match(source, /removeEventListener\('pointermove'/)
  assert.match(source, /aria-hidden="true"/)
  assert.match(source, /data-page-visible/)
})
