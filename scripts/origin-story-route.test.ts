import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { originStoryPublic } from '../lib/origin-story-evidence'

const ROOT = new URL('../', import.meta.url)
const DEBT_PHRASE = 'Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'

async function source(path: string) {
  return readFile(new URL(path, ROOT), 'utf8')
}

test('about consumes exactly five evidence-backed acts without factual component bypass', async () => {
  const [page, story] = await Promise.all([
    source('app/about/page.tsx'),
    source('components/origin-story/OriginStory.tsx'),
  ])
  assert.deepEqual(originStoryPublic.acts.map((act) => act.id), [
    'difference',
    'attention',
    'core-product',
    'rebuilding',
    'system',
  ])
  assert.equal(
    originStoryPublic.acts.flatMap((act) => act.assets).filter((asset) => asset.id === 'present-day-stage').length,
    1,
  )
  assert.equal(JSON.stringify(originStoryPublic).split(DEBT_PHRASE).length - 1, 1)
  assert.match(page, /<OriginStory\s*\/>/)
  assert.match(story, /originStoryPublic\.acts\.map/)
  assert.match(story, /data-origin-act=\{act\.id\}/)
  assert.match(story, /act\.claims\.map/)
  assert.match(story, /act\.assets\.map/)
  assert.doesNotMatch(`${page}\n${story}`, /Hơn 2 tỷ|Mười năm sau|CNN Travel|VTV3|6 nhà hàng/)
  assert.doesNotMatch(page, /const chapters|chapterGrid|proofGrid|aboutProof/)
})

test('origin film uses truthful artifact branches and only Act 5 may render the generated metaphor', async () => {
  const story = await source('components/origin-story/OriginStory.tsx')
  assert.match(story, /asset\.kind === ['"]press-card['"]/)
  assert.match(story, /target="_blank"/)
  assert.match(story, /rel="noopener noreferrer"/)
  assert.match(story, /<Image/)
  assert.match(story, /asset\.focalPoint\.x/)
  assert.match(story, /asset\.focalPoint\.y/)
  assert.match(story, /asset\.disclosure/)
  for (const act of originStoryPublic.acts.slice(0, 3)) {
    assert.ok(act.assets.every((asset) => asset.kind === 'press-card'))
  }
  assert.ok(originStoryPublic.acts[4].assets.some((asset) => asset.kind === 'generated-metaphor'))
})

test('about closes with one tracked Brain2 primary action and one untracked proof action', async () => {
  const [story, tracked] = await Promise.all([
    source('components/origin-story/OriginStory.tsx'),
    source('components/origin-story/OriginStoryTrackedLink.tsx'),
  ])
  assert.equal((story.match(/href="\/brain2\/21-ngay"/g) ?? []).length, 1)
  assert.equal((story.match(/href="\/library\/proof-stack-thong-phan-2026"/g) ?? []).length, 1)
  assert.match(story, /<OriginStoryTrackedLink[\s\S]*href="\/brain2\/21-ngay"/)
  assert.match(tracked, /origin_story_brain2_clicked/)
  assert.equal((tracked.match(/origin_story_brain2_clicked/g) ?? []).length, 1)
  assert.doesNotMatch(tracked, /detail:|eventDetail|claim|visitor/)
  assert.doesNotMatch(story, /<OriginStoryTrackedLink[^>]*proof-stack/)
})

test('about keeps one outer heading path, no nested main and removes the stale metric source', async () => {
  const [page, story, storyCss, dossierHeader] = await Promise.all([
    source('app/about/page.tsx'),
    source('components/origin-story/OriginStory.tsx'),
    source('components/origin-story/OriginStory.module.css'),
    source('components/dossier/DossierHeader.tsx'),
  ])
  assert.equal((dossierHeader.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((`${page}\n${story}`.match(/<h1\b/g) ?? []).length, 0)
  assert.equal((`${page}\n${story}`.match(/<main\b/g) ?? []).length, 0)
  assert.ok(existsSync(new URL('../components/origin-story/OriginStory.module.css', import.meta.url)))
  assert.match(
    storyCss,
    /\.act\[data-tone=['"]dark['"]\]\s+\.actHeader h2\s*\{[^}]*color:\s*var\(--cinema-paper\)/s,
  )
  assert.match(storyCss, /\.story\s*\{[^}]*scroll-margin-top:\s*5rem/s)
  assert.equal(existsSync(new URL('../content/proof/about-proof.json', import.meta.url)), false)
  assert.equal(existsSync(new URL('../lib/about-proof.ts', import.meta.url)), false)
})
