import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const source = (path) => readFile(new URL(path, root), 'utf8')

test('Brain2 restoration remains gated on written and visual approval in related Experience docs', async () => {
  const [status, plan, brain2Spec] = await Promise.all([
    source('docs/STATUS.md'),
    source('docs/superpowers/plans/2026-07-13-thongphan-experience-hub-foundation.md'),
    source('docs/superpowers/specs/2026-07-13-brain2-content-restoration-learning-studio-design.md'),
  ])

  assert.match(brain2Spec, /Status: awaiting written-spec and visual-target approval/)
  assert.doesNotMatch(plan, /already approved dedicated spec and visual target/i)
  assert.match(plan, /awaiting written-spec and visual-target approval/i)
  assert.match(status, /Brain2 content-restoration spec and visual target remain awaiting written and visual approval/i)
})
