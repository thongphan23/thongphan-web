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

  const scenarioB = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await scenarioB.newPage()
  watch(mobilePage, 'scenario-b-mobile')
  await mobilePage.goto(`${baseUrl}/read/`, { waitUntil: 'networkidle' })
  await mobilePage.locator('input[value="custom"]').check()
  await mobilePage.getByLabel('Viết ngắn điều anh/chị đang mắc kẹt').fill('Tôi cần một hướng nhỏ để biến việc học thành đầu ra hữu ích.')
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  assert.ok(overflow <= 1, `mobile page overflows horizontally by ${overflow}px`)
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'scenario-b-mobile-custom-question.png'), fullPage: true })
  await mobilePage.getByRole('button', { name: /Nhận một bài để bắt đầu/ }).click()
  await mobilePage.getByRole('heading', { name: 'Cấu trúc note sống' }).waitFor()
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'scenario-b-mobile-recommendation.png'), fullPage: true })
  await mobilePage.getByRole('button', { name: /Đọc bài này/ }).click()
  await mobilePage.waitForURL(/\/library\/cau-truc-note-song\?readerLoopSession=/)
  const scenarioBSession = new URL(mobilePage.url()).searchParams.get('readerLoopSession')
  assert.ok(scenarioBSession, 'Scenario B must create a reading session')
  await mobilePage.reload({ waitUntil: 'networkidle' })
  assert.equal(new URL(mobilePage.url()).searchParams.get('readerLoopSession'), scenarioBSession, 'Scenario B refresh must retain the session')
  const scenarioBComplete = mobilePage.getByRole('button', { name: /Đánh dấu đã đọc xong/ })
  await scenarioBComplete.scrollIntoViewIfNeeded()
  await scenarioBComplete.click()
  await mobilePage.getByLabel('Điều quan trọng nhất rút ra').fill('Ghi chép chỉ có giá trị khi được nối vào một đầu ra cụ thể.')
  await mobilePage.getByLabel('Bước dự định làm tiếp').fill('Tạo một note sống từ việc tôi đang làm hôm nay.')
  await mobilePage.getByRole('button', { name: /Lưu phản tư và nhận bước tiếp theo/ }).click()
  await mobilePage.getByRole('heading', { name: 'Tạo một note sống từ việc đang làm' }).waitFor()
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'scenario-b-mobile-refresh-resume-complete.png'), fullPage: false })
  await scenarioB.close()

  const scenarioC = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const returnPage = await scenarioC.newPage()
  watch(returnPage, 'scenario-c')
  await returnPage.goto(`${baseUrl}/read/`, { waitUntil: 'networkidle' })
  await returnPage.locator('input[value="ai_overload"]').check()
  await returnPage.getByRole('button', { name: /Nhận một bài để bắt đầu/ }).click()
  await returnPage.getByRole('heading', { name: 'Bản đồ bắt đầu nếu anh em đang sợ AI' }).waitFor()
  await returnPage.getByRole('button', { name: /Đọc bài này/ }).click()
  await returnPage.waitForURL(/\/library\/ban-do-bat-dau-neu-anh-em-dang-so-ai\?readerLoopSession=/)
  const scenarioCSession = new URL(returnPage.url()).searchParams.get('readerLoopSession')
  assert.ok(scenarioCSession, 'Scenario C must create a reading session')
  await returnPage.getByRole('button', { name: /Đánh dấu đã đọc xong/ }).waitFor()
  await returnPage.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.55)))
  await returnPage.waitForTimeout(5500)
  await returnPage.goto(`${baseUrl}/read/`, { waitUntil: 'networkidle' })
  await returnPage.getByRole('heading', { name: 'Mạch đọc trước vẫn còn đây.' }).waitFor()
  const resumedCoverage = await returnPage.getByText(/^Đã đi qua \d+% bài đọc\.$/).textContent()
  assert.match(resumedCoverage ?? '', /^Đã đi qua (?:[1-9]|[1-9]\d|100)% bài đọc\.$/, 'Scenario C must resume persisted non-zero coverage')
  await returnPage.screenshot({ path: path.join(screenshotDir, 'scenario-c-incomplete-return.png'), fullPage: false })
  await returnPage.getByRole('link', { name: /Tiếp tục đọc/ }).click()
  await returnPage.waitForURL(new RegExp(`readerLoopSession=${scenarioCSession}`))
  const scenarioCComplete = returnPage.getByRole('button', { name: /Đánh dấu đã đọc xong/ })
  await scenarioCComplete.scrollIntoViewIfNeeded()
  await scenarioCComplete.click()
  await returnPage.getByLabel('Điều quan trọng nhất rút ra').fill('Tôi nên chọn một việc thật thay vì tiếp tục gom thêm công cụ AI.')
  await returnPage.getByLabel('Bước dự định làm tiếp').fill('Chọn một việc lặp lại để AI hỗ trợ trong tuần này.')
  await returnPage.getByRole('button', { name: /Lưu phản tư và nhận bước tiếp theo/ }).click()
  await returnPage.getByRole('heading', { name: 'Chọn một việc lặp lại để AI hỗ trợ' }).waitFor()
  await returnPage.screenshot({ path: path.join(screenshotDir, 'scenario-c-continue-complete.png'), fullPage: false })
  await scenarioC.close()

  const unplannedErrors = unexpectedErrors.filter((message) => !message.includes('status of 503 (Service Unavailable)'))
  assert.deepEqual(unplannedErrors, [], `browser errors:\n${unplannedErrors.join('\n')}`)
  console.log(`Reader Loop browser QA passed at ${baseUrl}`)
  console.log('Scenario A PASS: sample → recommendation → read → completion → reflection → next action')
  console.log('Scenario B PASS: custom → recommendation → refresh/resume → completion')
  console.log('Scenario C PASS: incomplete → return → continue → complete')
  console.log(`Screenshots: ${screenshotDir}`)
} finally {
  await browser.close()
}
