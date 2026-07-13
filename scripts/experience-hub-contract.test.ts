import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const source = (path: string) => readFile(new URL(path, root), 'utf8')

test('Experience Hub renders the filtered registry with one canonical action per card', async () => {
  const [page, card] = await Promise.all([
    source('app/experiences/page.tsx'),
    source('components/experience/ExperienceCard.tsx'),
  ])

  assert.match(page, /alternates:\s*\{\s*canonical:\s*['"]\/experiences['"]\s*\}/)
  assert.match(page, /getPublishedExperiences\(\{\s*includeLearn:\s*learnPublicEnabled\s*\}\)/)
  assert.match(page, /<DossierHeader/)
  assert.match(page, /<ExperienceCard/)
  assert.match(page, /journeyKey="experiences"/)
  assert.match(card, /data-experience-id=\{experience\.id\}/)
  assert.match(card, /data-fit=\{experience\.media\.fit\}/)
  assert.match(card, /style=\{\{ objectPosition: experience\.media\.position \}\}/)
  assert.match(card, /experience\.durationLabel/)
  assert.match(card, /experience\.access\.label/)
  assert.match(card, /experience\.output/)
  assert.equal((card.match(/<Link\b/g) ?? []).length, 1)
})

test('Experience Hub uses real tracked images and no handmade illustration', async () => {
  const files = await Promise.all([
    source('app/experiences/page.tsx'),
    source('components/experience/ExperienceCard.tsx'),
    source('app/experiences/page.module.css'),
    source('components/experience/ExperienceCard.module.css'),
  ])
  const body = files.join('\n')
  assert.match(body, /from ['"]next\/image['"]/)
  assert.doesNotMatch(body, /<svg\b|createLucideIcon|emoji|CSS art/i)
})
