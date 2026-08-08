import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const ROOT = '/challenge/content-workflow-7days'
const STORAGE_KEY = 'tp.content-workflow-7days.v1'
const port = Number(process.env.CONTENT_WORKFLOW_QA_PORT ?? 4174)
const configuredBase = process.env.CONTENT_WORKFLOW_QA_BASE_URL
const base = configuredBase?.replace(/\/$/, '') ?? `http://127.0.0.1:${port}`
const output = process.env.CONTENT_WORKFLOW_QA_OUTPUT_DIR
  ?? await mkdtemp(join(tmpdir(), 'tp-content-workflow-qa-'))
let server

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`QA server did not become ready: ${url}`)
}

async function fill(page, id, value) {
  await page.locator(`#${id}`).fill(value)
}

async function settle(page) {
  await page.waitForTimeout(600)
  await page.evaluate(async () => {
    await document.fonts?.ready
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

async function inspectPage(page, name) {
  const state = await page.evaluate(() => ({
    h1Count: document.querySelectorAll('h1').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  }))
  assert(state.h1Count === 1, `${name}: expected exactly one H1`)
  assert(state.overflow <= 1, `${name}: horizontal overflow ${state.overflow}px`)
  assert(state.brokenImages === 0, `${name}: ${state.brokenImages} broken images`)
  return state
}

function assertVietnameseText(visibleText, name) {
  const textWithoutEnglishGlosses = visibleText.replace(/\([^)]*\)/g, ' ')
  const nakedEnglishTerms = [
    'artifact', 'assembly ledger', 'brief', 'business', 'clipboard', 'content',
    'copy', 'customer', 'draft', 'evidence', 'export', 'feedback', 'flow',
    'founder', 'inbox', 'input', 'job', 'localstorage', 'marketing', 'markdown',
    'offer', 'one-page', 'outline', 'output', 'prompt', 'quality gate',
    'readiness', 'review', 'revision request', 'run', 'sales call', 'self-check',
    'signal', 'social', 'starter kit', 'testimonial', 'viral', 'workbook',
    'workflow',
  ]
  const leakedTerms = nakedEnglishTerms.filter((term) =>
    new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(textWithoutEnglishGlosses),
  )
  assert(leakedTerms.length === 0, `${name}: naked English terms: ${leakedTerms.join(', ')}`)
  assert(!/(^|\s)anh(?=\s|[.,!?;:])/iu.test(visibleText), `${name}: learner is addressed as “anh” instead of “bạn”`)
}

async function assertVietnameseLearnerCopy(page, name) {
  assertVietnameseText(await page.locator('body').innerText(), name)
}

async function openDay(page, day) {
  const response = await page.goto(`${base}${ROOT}/day-${String(day).padStart(2, '0')}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `day ${day}: HTTP ${response?.status()}`)
  await page.locator('[data-hydrated="true"]').waitFor()
  await assertVietnameseLearnerCopy(page, `day ${day}`)
}

async function completeGate(page, day) {
  await page.getByRole('button', { name: /Kiểm tra điều kiện hoàn thành|Xác nhận hoàn thành ngày/ }).click()
  await page.getByText(`Ngày ${day} đã hoàn thành theo tiêu chí cấu trúc.`, { exact: false }).waitFor()
  await settle(page)
  await assertVietnameseLearnerCopy(page, `day ${day} completed`)
}

await mkdir(output, { recursive: true })

if (!configuredBase) {
  server = spawn('npx', ['wrangler', 'pages', 'dev', 'out', '--port', String(port), '--ip', '127.0.0.1'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await waitForServer(`${base}${ROOT}`)
}

const browser = await chromium.launch({ headless: true })
const browserErrors = []
const failedResponses = []
const evidence = { base, output, viewports: [], workflow: [] }

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()) })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`)
  })

  let response = await page.goto(`${base}${ROOT}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `hub: HTTP ${response?.status()}`)
  evidence.viewports.push({ name: 'hub-1440x900', ...await inspectPage(page, 'hub-1440x900') })
  await assertVietnameseLearnerCopy(page, 'hub')
  await page.screenshot({ path: join(output, 'hub-1440x900.png'), animations: 'disabled' })
  for (const label of [
    'Tôi biết doanh nghiệp và sản phẩm nào sẽ dùng.',
    'Tôi chọn được một nhóm khách hàng có thật.',
    'Tôi có hoặc biết cách tìm bằng chứng khách hàng.',
    'Tôi có một kênh để đưa nội dung tới người thật.',
  ]) await page.getByLabel(label, { exact: false }).check()
  await page.getByRole('button', { name: 'Mở Ngày 01' }).click()
  await page.waitForURL(/day-01$/)
  await assertVietnameseLearnerCopy(page, 'day 1')

  const dayOne = {
    'field-customerFocus-business': 'Studio tư vấn vận hành nội dung',
    'field-customerFocus-offer': 'Gói thiết kế quy trình nội dung cho người sáng lập',
    'field-customerFocus-customerGroup': 'Người sáng lập doanh nghiệp dịch vụ đang tự duyệt nội dung',
    'field-customerFocus-currentSituation': 'Có dữ liệu khách hàng nhưng đội ngũ viết bài thiếu nhất quán',
    'field-customerFocus-primaryProblem': 'Mỗi bài bắt đầu lại từ đầu và phụ thuộc vào người sáng lập',
    'field-customerFocus-desiredMovement': 'Có quy trình lặp lại để giao việc và duyệt chất lượng',
    'field-customerFocus-focusStatement': 'Tôi tạo nội dung cho người sáng lập doanh nghiệp dịch vụ, khi họ đang tự duyệt mọi bài, muốn giao việc nhất quán, nhưng bị kẹt bởi việc thiếu bằng chứng khách hàng và tiêu chuẩn rõ ràng.',
  }
  for (const [id, value] of Object.entries(dayOne)) await fill(page, id, value)
  await completeGate(page, 1)
  evidence.workflow.push('day-01-complete')

  await openDay(page, 2)
  for (let index = 4; index <= 5; index += 1) await page.getByRole('button', { name: 'Thêm bằng chứng' }).click()
  for (let index = 1; index <= 5; index += 1) {
    await fill(page, `field-evidence-${index}-evidence`, `Khách hàng ${index} nói rằng họ mất nhiều giờ vì mỗi bài lại phải giải thích bản giao việc từ đầu.`)
    await fill(page, `field-evidence-${index}-context`, `Phỏng vấn sau dự án số ${index}`)
    await fill(page, `field-evidence-${index}-source`, `Ghi chú cuộc gọi ngày 0${index}/08/2026`)
    await fill(page, `field-evidence-${index}-insight`, 'Vấn đề cốt lõi là thiếu một quy trình ra quyết định có thể dùng lại.')
  }
  await completeGate(page, 2)
  evidence.workflow.push('day-02-five-evidence')

  await openDay(page, 3)
  await fill(page, 'field-contentJob-selectedEvidence', 'Mỗi bài lại phải giải thích bản giao việc từ đầu.')
  await page.locator('#field-contentJob-job').selectOption('understand-cause')
  await fill(page, 'field-contentJob-beliefBefore', 'Họ nghĩ vấn đề là người viết chưa đủ giỏi.')
  await fill(page, 'field-contentJob-expectedShift', 'Họ hiểu rằng đầu vào và tiêu chuẩn chưa được đóng gói thành quy trình.')
  await fill(page, 'field-contentJob-nextAction', 'Viết lại một bản giao việc nội dung có đủ quyết định.')
  await completeGate(page, 3)
  evidence.workflow.push('day-03-complete')

  await openDay(page, 4)
  const brief = {
    businessOffer: 'Gói thiết kế quy trình nội dung cho người sáng lập', customer: 'Người sáng lập doanh nghiệp dịch vụ',
    situation: 'Đang tự duyệt mọi bài và phải giải thích lại từ đầu', currentBelief: 'Người viết chưa đủ giỏi',
    desiredUnderstanding: 'Quy trình thiếu quyết định mới là nút thắt', coreMessage: 'Câu lệnh không cứu được một bản giao việc thiếu quyết định',
    customerEvidence: 'Năm cuộc gọi đều nhắc việc phải giải thích bản giao việc lại từ đầu', supportingProof: 'So sánh một bản giao việc mơ hồ với một bản đủ khách hàng, nhiệm vụ và tiêu chí',
    voiceConstraints: 'Thẳng, cụ thể, không khoa trương', mustInclude: 'Một câu nói thật của khách hàng và một bước hành động',
    mustAvoid: 'Không hứa lan truyền hoặc tự động hóa hoàn toàn', callToAction: 'Tự kiểm tra bản giao việc gần nhất bằng bảng kiểm',
    format: 'Bài 700–900 chữ', channel: 'Facebook cá nhân',
  }
  for (const [key, value] of Object.entries(brief)) await fill(page, `field-contentBrief-${key}`, value)
  await page.locator('#field-contentBrief-contentJob').selectOption('understand-cause')
  await completeGate(page, 4)
  await page.screenshot({ path: join(output, 'workbench-day04-1440x900.png'), animations: 'disabled' })
  evidence.workflow.push('day-04-complete')

  await openDay(page, 5)
  await page.getByRole('button', { name: 'Lắp câu lệnh từ bản giao việc ngày 1–4' }).click()
  const promptBeforeRefresh = await page.locator('#field-workflowPrompt').inputValue()
  assert(promptBeforeRefresh.length > 500, 'day 5: assembled prompt is unexpectedly short')
  await page.getByRole('button', { name: 'Sao chép câu lệnh chính' }).click()
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('Câu lệnh không cứu được'), 'day 5: clipboard did not receive prompt')
  await completeGate(page, 5)
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('[data-hydrated="true"]').waitFor()
  assert(await page.locator('#field-workflowPrompt').inputValue() === promptBeforeRefresh, 'day 5: prompt did not persist after refresh')
  evidence.workflow.push('day-05-assemble-copy-resume')

  await openDay(page, 6)
  const draftSets = page.locator('fieldset').filter({ hasText: /Lần chạy 0[12]/ })
  for (let index = 0; index < 2; index += 1) {
    const row = draftSets.nth(index)
    await row.locator('textarea').nth(0).fill(`Bản nội dung ${index + 1}: Một câu lệnh dài không sửa được bản giao việc thiếu bằng chứng khách hàng. Hãy bắt đầu bằng khách hàng, nhiệm vụ nội dung và tiêu chuẩn đầu ra cụ thể trước khi yêu cầu AI viết.`)
    for (const score of await row.locator('select').all()) await score.selectOption('2')
    await row.locator('textarea').nth(1).fill('Giữ luận điểm chính, thêm câu nói thật của khách hàng và làm bước tiếp theo cụ thể hơn.')
  }
  await fill(page, 'field-workflowFeedback', 'AI giữ cấu trúc tốt nhưng dễ làm luận điểm rộng. Quy trình cần bắt buộc nguồn bằng chứng và bước tự đánh giá trước khi xuất bản.')
  await completeGate(page, 6)
  evidence.workflow.push('day-06-two-reviewed-drafts')

  await openDay(page, 7)
  const onePager = {
    selectedDraft: 'Bản nội dung 2 sau khi chỉnh sửa', goal: 'Tạo nội dung đúng khách hàng và giảm vòng duyệt của người sáng lập',
    inputs: 'Trọng tâm khách hàng, ngân hàng bằng chứng, nhiệm vụ nội dung và bản giao việc', steps: 'Chọn bằng chứng → khóa nhiệm vụ → viết bản giao việc → chạy câu lệnh → tự đánh giá → sửa',
    standards: 'Đúng người, đúng vấn đề, một ý chính, có bằng chứng, cụ thể, hành động phù hợp', aiRole: 'Tạo ba hướng triển khai theo bản giao việc và phản biện luận điểm',
    humanRole: 'Chọn bằng chứng, duyệt luận điểm, chấm chất lượng và quyết định xuất bản', cadence: 'Hai lần mỗi tuần',
    publishedUrlOrNote: 'Đã gửi trực tiếp cho ba khách hàng cũ qua thư điện tử', signalNote: 'Hai người phản hồi rằng ví dụ đúng tình huống họ đang gặp.',
  }
  for (const [key, value] of Object.entries(onePager)) await fill(page, `field-onePager-${key}`, value)
  await page.locator('#field-onePager-publishStatus').selectOption('sent')
  for (let index = 1; index <= 6; index += 1) {
    await page.getByRole('button', { name: 'Thêm đề mục' }).click()
    await fill(page, `field-plan-${index}-evidence`, `Bằng chứng ưu tiên ${index}`)
    await page.locator(`#field-plan-${index}-job`).selectOption(index % 2 ? 'recognize-problem' : 'understand-cause')
    await page.locator('input[type="date"]').nth(index - 1).fill(`2026-08-${String(9 + index).padStart(2, '0')}`)
  }
  await completeGate(page, 7)
  await page.getByText('7/7').first().waitFor()
  await page.locator('#starter-kit-title').scrollIntoViewIfNeeded()
  await settle(page)
  await page.screenshot({ path: join(output, 'completion-day07-1440x900.png'), animations: 'disabled' })
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tải bộ tài liệu (.md)' }).click()
  const download = await downloadPromise
  assert(download.suggestedFilename().endsWith('.md'), 'day 7: export filename is not Markdown')
  const downloadPath = await download.path()
  assert(downloadPath, 'day 7: export has no readable path')
  const markdown = await readFile(downloadPath, 'utf8')
  assert(markdown.includes('Studio tư vấn vận hành nội dung'), 'day 7: export omitted learner data')
  assert(markdown.includes('Bộ khởi đầu quy trình nội dung'), 'day 7: export omitted title')
  assertVietnameseText(markdown, 'day 7 exported document')
  await page.getByRole('button', { name: 'Sao chép bộ tài liệu' }).click()
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('Bộ khởi đầu quy trình nội dung'), 'day 7: copy starter kit failed')
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: async () => { throw new Error('forced clipboard denial') },
    })
  })
  await page.getByRole('button', { name: 'Sao chép bộ tài liệu' }).click()
  const manualCopy = page.getByLabel('Nội dung bộ khởi đầu để sao chép thủ công')
  await manualCopy.waitFor({ state: 'visible' })
  const manualSelection = await manualCopy.evaluate((element) => {
    const field = element
    return {
      focused: document.activeElement === field,
      selectionStart: field.selectionStart,
      selectionEnd: field.selectionEnd,
      valueLength: field.value.length,
    }
  })
  assert(manualSelection.focused, 'day 7: manual copy fallback is not focused')
  assert(manualSelection.selectionStart === 0, 'day 7: manual copy fallback does not select from the start')
  assert(manualSelection.selectionEnd === manualSelection.valueLength, 'day 7: manual copy fallback does not select all text')
  await assertVietnameseLearnerCopy(page, 'day 7 clipboard fallback')
  evidence.workflow.push('day-07-complete-export-copy-fallback')

  await page.getByRole('button', { name: 'Đặt lại' }).click()
  await page.getByRole('button', { name: 'Giữ lại' }).click()
  assert(await page.evaluate((key) => Boolean(localStorage.getItem(key)), STORAGE_KEY), 'reset dialog: keep action removed data')
  await page.getByRole('button', { name: 'Đặt lại' }).click()
  await page.getByRole('button', { name: 'Xóa và về trang đầu' }).click()
  await page.waitForURL(new RegExp(`${ROOT}$`))
  assert(await page.evaluate((key) => localStorage.getItem(key) === null, STORAGE_KEY), 'reset: versioned storage key remains')
  evidence.workflow.push('reset-confirmed')
  await context.close()

  for (const viewport of [
    { name: 'desktop-1280x800', width: 1280, height: 800 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-320x568', width: 320, height: 568 },
  ]) {
    const responsiveContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
    const responsivePage = await responsiveContext.newPage()
    response = await responsivePage.goto(`${base}${ROOT}/day-04`, { waitUntil: 'networkidle' })
    assert(response?.ok(), `${viewport.name}: HTTP ${response?.status()}`)
    await responsivePage.locator('[data-hydrated="true"]').waitFor()
    evidence.viewports.push({ ...viewport, ...await inspectPage(responsivePage, viewport.name) })
    await responsivePage.screenshot({ path: join(output, `${viewport.name}.png`), animations: 'disabled' })
    await responsiveContext.close()
  }

  assert(browserErrors.length === 0, `browser console/page errors: ${browserErrors.join(' | ')}`)
  assert(failedResponses.length === 0, `failed responses: ${failedResponses.join(' | ')}`)
  evidence.browserErrors = browserErrors
  evidence.failedResponses = failedResponses
  await writeFile(join(output, 'report.json'), `${JSON.stringify(evidence, null, 2)}\n`)
  console.log(`Content Workflow QA passed: ${output}`)
} finally {
  await browser.close()
  if (server && !server.killed) server.kill('SIGTERM')
}
