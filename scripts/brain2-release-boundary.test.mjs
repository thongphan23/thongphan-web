import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n')

test('protected Brain2 lessons cannot enter the public repository', () => {
  const forbidden = tracked.filter((path) =>
    /^content\/brain2\/(?:private|protected)\//.test(path) ||
    /^content\/brain2\/public\/ngay-(?:0[8-9]|1\d|2[01])\.json$/.test(path),
  )
  assert.deepEqual(forbidden, [])
})

test('gitignore rejects private Brain2 source and secret variants', async () => {
  const gitignore = await readFile('.gitignore', 'utf8')
  for (const pattern of ['.dev.vars*', '.env*', 'brain2-private/', 'private-content/', '*.brain2-private.json']) {
    assert.ok(gitignore.includes(pattern), pattern)
  }
})
