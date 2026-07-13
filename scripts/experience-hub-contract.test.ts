import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const source = (path: string) => readFile(new URL(path, root), 'utf8')

function relativeLuminance(hex: string) {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? []
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

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

test('contained card media stays untransformed while the motion surface remains active', async () => {
  const [card, css] = await Promise.all([
    source('components/experience/ExperienceCard.tsx'),
    source('components/experience/ExperienceCard.module.css'),
  ])

  assert.match(card, /data-motion-surface/)
  assert.match(
    css,
    /\.card:hover\s+\.media\[data-fit=['"]contain['"]\]\s+img\s*,\s*\.card:focus-within\s+\.media\[data-fit=['"]contain['"]\]\s+img\s*\{\s*transform:\s*none;/,
  )
  assert.doesNotMatch(
    css,
    /\.media\[data-fit=['"]cover['"]\]\s+img\s*\{[^}]*transform:\s*none;/,
  )
})

test('Experience Hub muted copy uses a scoped AA paper token on both paper surfaces', async () => {
  const [tokens, pageCss, cardCss] = await Promise.all([
    source('styles/brand-tokens.css'),
    source('app/experiences/page.module.css'),
    source('components/experience/ExperienceCard.module.css'),
  ])
  const token = tokens.match(/--brand-experience-muted:\s*(#[0-9a-f]{6})/i)?.[1]

  assert.equal(token?.toLowerCase(), '#625b52')
  assert.ok(contrastRatio(token!, '#f3efe6') >= 4.5)
  assert.ok(contrastRatio(token!, '#e8decf') >= 4.5)
  assert.match(pageCss, /heroPortrait figcaption[^}]+var\(--brand-experience-muted\)/)
  assert.match(pageCss, /indexHeader p[^}]+var\(--brand-experience-muted\)/)
  assert.match(cardCss, /body dd[^}]+var\(--brand-experience-muted\)/)
})
