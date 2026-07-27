import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = (process.env.READER_LOOP_BASE_URL || 'http://localhost:3010').replace(/\/$/, '')
const screenshotDir = path.resolve(process.env.READER_LOOP_SCREENSHOT_DIR || '.tmp/reader-loop-browser-qa')
await mkdir(screenshotDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const unexpectedErrors = []

function watch(page, label) {
  page.on('pageerror', (error) => unexpectedErrors.push(`${label}: pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') unexpectedErrors.push(`${label}: console: ${message.text()}`)
  })
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await desktop.newPage()
  watch(page, 'desktop')

  await page.goto(`${baseUrl}/library/`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(screenshotDir, 'source-library-desktop.png'), fullPage: true })

  await page.goto(`${baseUrl}/read/`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Một bài đọc đúng lúc.' }).waitFor()
  await page.getByText('Hiện tại anh/chị đang muốn giải quyết điều gì nhất?').waitFor()
  await page.screenshot({ path: path.join(screenshotDir, 'reader-loop-desktop-question.png'), fullPage: true })

  await page.getByRole('button', { name: /Nhận một bài để bắt đầu/ }).click()
  await page.getByRole('heading', { name: 'Tài sản số của người có chuyên môn' }).waitFor()
  await page.screenshot({ path: path.join(screenshotDir, 'reader-loop-desktop-recommendation.png'), fullPage: true })

  await page.getByRole('button', { name: /Đọc bài này/ }).click()
  await page.waitForURL(/\/library\/[^?]+\?readerLoopSession=/)
  await page.getByRole('heading', { name: 'Tài sản số của người có chuyên môn' }).first().waitFor()
  const article = page.locator('article').first()
  assert.equal(await article.count(), 1, 'canonical article must remain present')

  const completionButton = page.getByRole('button', { name: /Đánh dấu đã đọc xong/ })
  await completionButton.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  await completionButton.click()
  await page.getByLabel('Điều quan trọng nhất rút ra').fill('Một tài sản chuyên môn cần giải quyết một vấn đề đủ hẹp và có bằng chứng rõ.')
  await page.getByLabel('Bước dự định làm tiếp').fill('Viết phác thảo tài sản đầu tiên trong 30 phút.')
  await page.getByRole('button', { name: /Lưu phản tư và nhận bước tiếp theo/ }).click()
  await page.getByRole('heading', { name: 'Chọn một tài sản nhỏ để kiểm chứng' }).waitFor()
  await page.screenshot({ path: path.join(screenshotDir, 'reader-loop-desktop-complete.png'), fullPage: false })

  await page.getByRole('link', { name: /Xem evidence/ }).click()
  await page.waitForURL(/\/read\/inspector/)
  for (const label of [
    'Question', 'Candidate recommendations', 'Selected recommendation', 'Reason codes',
    'Reading evidence', 'Manual completion', 'Reflection', 'Next-action decision',
  ]) await page.getByText(new RegExp(label)).first().waitFor()
  await page.getByText('Người đọc đã chủ động xác nhận.').waitFor()
  await page.screenshot({ path: path.join(screenshotDir, 'reader-loop-desktop-inspector.png'), fullPage: true })

  await page.goBack({ waitUntil: 'networkidle' })
  await page.route('**/v1/reading-sessions/**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': baseUrl },
      body: JSON.stringify({ error: { code: 'QA_FORCED_FAILURE' } }),
    })
  })
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.getByRole('heading', { name: 'Tài sản số của người có chuyên môn', level: 1 }).isVisible(), true, 'article must remain readable when Reader Loop API fails')
  const apiFailureAlert = page.getByRole('alert').filter({ hasText: 'Nội dung bài vẫn đọc được' })
  await apiFailureAlert.waitFor()
  await apiFailureAlert.scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(screenshotDir, 'reader-loop-api-failure-article-readable.png'), fullPage: false })
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobile.newPage()
  watch(mobilePage, 'mobile')
  await mobilePage.goto(`${baseUrl}/read/`, { waitUntil: 'networkidle' })
  await mobilePage.locator('input[value="custom"]').check()
  await mobilePage.getByLabel('Viết ngắn điều anh/chị đang mắc kẹt').fill('Tôi cần một hướng nhỏ để biến việc học thành đầu ra hữu ích.')
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  assert.ok(overflow <= 1, `mobile page overflows horizontally by ${overflow}px`)
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'reader-loop-mobile-custom-question.png'), fullPage: true })
  await mobilePage.getByRole('button', { name: /Nhận một bài để bắt đầu/ }).click()
  await mobilePage.getByText(/^Gợi ý để bắt đầu ·/).waitFor()
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'reader-loop-mobile-recommendation.png'), fullPage: true })
  await mobile.close()

  const unplannedErrors = unexpectedErrors.filter((message) => !message.includes('status of 503 (Service Unavailable)'))
  assert.deepEqual(unplannedErrors, [], `browser errors:\n${unplannedErrors.join('\n')}`)
  console.log(`Reader Loop browser QA passed at ${baseUrl}`)
  console.log(`Screenshots: ${screenshotDir}`)
} finally {
  await browser.close()
}
