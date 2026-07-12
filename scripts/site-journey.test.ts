import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  getJourneyHandoff,
  getRecommendationsForPrompt,
  journeyHandoffs,
} from '../lib/site-journey'

const root = new URL('../', import.meta.url)

async function projectSources(directory: string): Promise<string[]> {
  const absolute = new URL(`${directory}/`, root)
  const entries = await readdir(absolute, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const relative = `${directory}/${entry.name}`
    if (entry.isDirectory()) return projectSources(relative)
    return /\.(?:md|mjs|sql|ts|tsx)$/.test(entry.name) && !/\.test\.[^.]+$/.test(entry.name)
      ? [relative]
      : []
  }))
  return nested.flat()
}

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
  assert.equal(getRecommendationsForPrompt('Tui muốn xây Brain2 từ ghi chú')[0].href, '/brain2/21-ngay')
  assert.equal(getRecommendationsForPrompt('Tui muốn đóng gói một sản phẩm nhỏ')[0].href, '/assets')
  assert.equal(getRecommendationsForPrompt('Tui cần học AI có lộ trình')[0].href, '/diagnostic')
  assert.equal(getRecommendationsForPrompt('Tui cần cộng đồng cùng làm')[0].href, '/conanmaker/')
})

test('known keys return stable handoffs', () => {
  assert.equal(getJourneyHandoff('about').primary.href, '/brain2/21-ngay')
  assert.equal(getJourneyHandoff('reader').primary.href, '/assets')
})

test('public source graph contains no duplicate Brain2 detail URL or fixed 15-minute promise', async () => {
  const files = (await Promise.all(
    ['app', 'components', 'content', 'lib', 'scripts', 'workers'].map(projectSources),
  )).flat()
  const sources = await Promise.all(files.map(async (file) => ({ file, body: await readFile(new URL(file, root), 'utf8') })))
  const oldLinks = sources.filter(({ body }) => body.includes('/challenges/brain2-21-ngay')).map(({ file }) => file)
  assert.deepEqual(oldLinks, [])

  const fixedPromiseFiles = ['lib/challenges.ts', 'workers/schema.sql']
  const fixedPromiseSources = await Promise.all(fixedPromiseFiles.map((file) => readFile(new URL(file, root), 'utf8')))
  assert.doesNotMatch(fixedPromiseSources.join('\n'), /Mỗi ngày\s+15 phút|15 phút\s*(?:mỗi ngày|\/ngày)/i)
})
