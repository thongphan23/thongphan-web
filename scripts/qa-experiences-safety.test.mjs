import assert from 'node:assert/strict'
import { mkdir, rm, symlink } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { chromium } from 'playwright'
import {
  inspectExperiencePage,
  qaOutputRoot,
  resolveQaOutputDir,
  waitForImages,
} from './qa-experiences-core.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

test('QA output resolver accepts only its dedicated temp root or descendants', async () => {
  assert.equal(await resolveQaOutputDir(), qaOutputRoot)
  assert.equal(await resolveQaOutputDir(join(qaOutputRoot, 'run-1')), join(qaOutputRoot, 'run-1'))
  assert.equal(
    await resolveQaOutputDir(join(tmpdir(), 'thongphan-experience-hub-qa', 'run-alias')),
    join(qaOutputRoot, 'run-alias'),
  )

  for (const unsafe of [
    tmpdir(),
    homedir(),
    repoRoot,
    dirname(repoRoot),
    join(tmpdir(), 'outside-experience-qa'),
    join(qaOutputRoot, '..', 'escape'),
    'relative/output',
  ]) {
    await assert.rejects(() => resolveQaOutputDir(unsafe), /QA output|dedicated|traversal|absolute|outside/i)
  }
})

test('QA output resolver rejects a descendant symlink that escapes the dedicated root', async () => {
  await mkdir(qaOutputRoot, { recursive: true })
  const link = join(qaOutputRoot, `.escape-${process.pid}`)
  await rm(link, { recursive: true, force: true })
  await symlink(tmpdir(), link)
  try {
    await assert.rejects(() => resolveQaOutputDir(join(link, 'run')), /symlink|outside|dedicated/i)
  } finally {
    await rm(link, { force: true })
  }
})

test('rendered visibility probe catches content hidden by ancestor opacity', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
    await page.setContent(`
      <article data-experience-id="probe">
        <h2>Visible card title</h2>
        <div style="opacity: 0"><p>Hidden by ancestor opacity</p></div>
      </article>
    `)
    const state = await inspectExperiencePage(page)
    assert.deepEqual(state.hiddenExperienceCards, [])
    assert.equal(state.unreadyExperienceContent.length, 1)
    assert.equal(state.unreadyExperienceContent[0].tag, 'P')
  } finally {
    await browser.close()
  }
})

test('image readiness waits for decode and rejects zero-dimension images', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent('<img alt="broken" src="data:image/png;base64,broken">')
    await assert.rejects(() => waitForImages(page), /image|dimension|decode|ready/i)
  } finally {
    await browser.close()
  }
})
