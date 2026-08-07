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

async function openDay(page, day) {
  const response = await page.goto(`${base}${ROOT}/day-${String(day).padStart(2, '0')}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `day ${day}: HTTP ${response?.status()}`)
  await page.locator('[data-hydrated="true"]').waitFor()
}

async function completeGate(page, day) {
  await page.getByRole('button', { name: /Quality Gate|Xác nhận hoàn thành ngày/ }).click()
  await page.getByText(`Ngày ${day} đã hoàn thành theo tiêu chí cấu trúc.`, { exact: false }).waitFor()
  await settle(page)
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
  await page.screenshot({ path: join(output, 'hub-1440x900.png'), animations: 'disabled' })
  for (const label of [
    'Tôi biết business/offer nào sẽ dùng.',
    'Tôi chọn được một nhóm khách hàng có thật.',
    'Tôi có hoặc biết cách tìm customer evidence.',
    'Tôi có một kênh để đưa content tới người thật.',
  ]) await page.getByLabel(label, { exact: false }).check()
  await page.getByRole('button', { name: 'Mở Ngày 01' }).click()
  await page.waitForURL(/day-01$/)

  const dayOne = {
    'field-customerFocus-business': 'Studio tư vấn vận hành nội dung',
    'field-customerFocus-offer': 'Gói thiết kế Content Workflow cho founder',
    'field-customerFocus-customerGroup': 'Founder doanh nghiệp dịch vụ đang tự duyệt content',
    'field-customerFocus-currentSituation': 'Có dữ liệu khách hàng nhưng team viết bài thiếu nhất quán',
    'field-customerFocus-primaryProblem': 'Mỗi bài bắt đầu lại từ đầu và phụ thuộc vào người sáng lập',
    'field-customerFocus-desiredMovement': 'Có quy trình lặp lại để giao việc và duyệt chất lượng',
    'field-customerFocus-focusStatement': 'Tôi tạo content cho founder doanh nghiệp dịch vụ, khi họ đang tự duyệt mọi bài, muốn giao việc nhất quán, nhưng bị kẹt bởi việc thiếu customer evidence và tiêu chuẩn rõ ràng.',
  }
  for (const [id, value] of Object.entries(dayOne)) await fill(page, id, value)
  await completeGate(page, 1)
  evidence.workflow.push('day-01-complete')

  await openDay(page, 2)
  for (let index = 4; index <= 5; index += 1) await page.getByRole('button', { name: 'Thêm evidence' }).click()
  for (let index = 1; index <= 5; index += 1) {
    await fill(page, `field-evidence-${index}-evidence`, `Khách hàng ${index} nói rằng họ mất nhiều giờ vì mỗi bài lại phải giải thích brief từ đầu.`)
    await fill(page, `field-evidence-${index}-context`, `Phỏng vấn sau dự án số ${index}`)
    await fill(page, `field-evidence-${index}-source`, `Ghi chú cuộc gọi ngày 0${index}/08/2026`)
    await fill(page, `field-evidence-${index}-insight`, 'Vấn đề cốt lõi là thiếu một quy trình ra quyết định có thể dùng lại.')
  }
  await completeGate(page, 2)
  evidence.workflow.push('day-02-five-evidence')

  await openDay(page, 3)
  await fill(page, 'field-contentJob-selectedEvidence', 'Mỗi bài lại phải giải thích brief từ đầu.')
  await page.locator('#field-contentJob-job').selectOption('understand-cause')
  await fill(page, 'field-contentJob-beliefBefore', 'Họ nghĩ vấn đề là người viết chưa đủ giỏi.')
  await fill(page, 'field-contentJob-expectedShift', 'Họ hiểu rằng đầu vào và tiêu chuẩn chưa được đóng gói thành workflow.')
  await fill(page, 'field-contentJob-nextAction', 'Viết lại một Content Brief có đủ quyết định.')
  await completeGate(page, 3)
  evidence.workflow.push('day-03-complete')

  await openDay(page, 4)
  const brief = {
    businessOffer: 'Gói thiết kế Content Workflow cho founder', customer: 'Founder doanh nghiệp dịch vụ',
    situation: 'Đang tự duyệt mọi bài và phải giải thích lại từ đầu', currentBelief: 'Người viết chưa đủ giỏi',
    desiredUnderstanding: 'Workflow thiếu quyết định mới là nút thắt', coreMessage: 'Prompt không cứu được một brief thiếu quyết định',
    customerEvidence: 'Năm cuộc gọi đều nhắc việc phải giải thích brief lại từ đầu', supportingProof: 'So sánh một brief mơ hồ với một brief đủ customer, job và gate',
    voiceConstraints: 'Thẳng, cụ thể, không khoa trương', mustInclude: 'Một customer quote và một bước hành động',
    mustAvoid: 'Không hứa viral hoặc tự động hóa hoàn toàn', callToAction: 'Tự kiểm tra brief gần nhất bằng checklist',
    format: 'Bài 700–900 chữ', channel: 'Facebook cá nhân',
  }
  for (const [key, value] of Object.entries(brief)) await fill(page, `field-contentBrief-${key}`, value)
  await page.locator('#field-contentBrief-contentJob').selectOption('understand-cause')
  await completeGate(page, 4)
  await page.screenshot({ path: join(output, 'workbench-day04-1440x900.png'), animations: 'disabled' })
  evidence.workflow.push('day-04-complete')

  await openDay(page, 5)
  await page.getByRole('button', { name: 'Lắp prompt từ Brief ngày 1–4' }).click()
  const promptBeforeRefresh = await page.locator('#field-workflowPrompt').inputValue()
  assert(promptBeforeRefresh.length > 500, 'day 5: assembled prompt is unexpectedly short')
  await page.getByRole('button', { name: 'Copy Master Prompt' }).click()
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('Prompt không cứu được'), 'day 5: clipboard did not receive prompt')
  await completeGate(page, 5)
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('[data-hydrated="true"]').waitFor()
  assert(await page.locator('#field-workflowPrompt').inputValue() === promptBeforeRefresh, 'day 5: prompt did not persist after refresh')
  evidence.workflow.push('day-05-assemble-copy-resume')

  await openDay(page, 6)
  const draftSets = page.locator('fieldset').filter({ hasText: /Run 0[12]/ })
  for (let index = 0; index < 2; index += 1) {
    const row = draftSets.nth(index)
    await row.locator('textarea').nth(0).fill(`Bản content ${index + 1}: Một prompt dài không sửa được brief thiếu customer evidence. Hãy bắt đầu bằng customer, Content Job và tiêu chuẩn đầu ra cụ thể trước khi yêu cầu AI viết.`)
    for (const score of await row.locator('select').all()) await score.selectOption('2')
    await row.locator('textarea').nth(1).fill('Giữ luận điểm chính, thêm customer quote thật và làm bước tiếp theo cụ thể hơn.')
  }
  await fill(page, 'field-workflowFeedback', 'AI giữ cấu trúc tốt nhưng dễ làm claim rộng. Workflow cần bắt buộc nguồn evidence và bước self-review trước khi xuất bản.')
  await completeGate(page, 6)
  evidence.workflow.push('day-06-two-reviewed-drafts')

  await openDay(page, 7)
  const onePager = {
    selectedDraft: 'Bản content 2 sau revision', goal: 'Tạo content đúng customer và giảm vòng duyệt của founder',
    inputs: 'Customer Focus, Evidence Bank, Content Job, Reusable Brief', steps: 'Chọn evidence → khóa job → viết brief → chạy prompt → tự review → sửa',
    standards: 'Đúng người, đúng vấn đề, một ý chính, có evidence, cụ thể, CTA phù hợp', aiRole: 'Tạo ba hướng triển khai theo brief và phản biện claim',
    humanRole: 'Chọn evidence, duyệt claim, chấm chất lượng và quyết định xuất bản', cadence: 'Hai lần mỗi tuần',
    publishedUrlOrNote: 'Đã gửi trực tiếp cho ba khách hàng cũ qua email', signalNote: 'Hai người phản hồi rằng ví dụ đúng tình huống họ đang gặp.',
  }
  for (const [key, value] of Object.entries(onePager)) await fill(page, `field-onePager-${key}`, value)
  await page.locator('#field-onePager-publishStatus').selectOption('sent')
  for (let index = 1; index <= 6; index += 1) {
    await page.getByRole('button', { name: 'Thêm đề mục' }).click()
    await fill(page, `field-plan-${index}-evidence`, `Evidence ưu tiên ${index}`)
    await page.locator(`#field-plan-${index}-job`).selectOption(index % 2 ? 'recognize-problem' : 'understand-cause')
    await page.locator('input[type="date"]').nth(index - 1).fill(`2026-08-${String(9 + index).padStart(2, '0')}`)
  }
  await completeGate(page, 7)
  await page.getByText('7/7').first().waitFor()
  await page.locator('#starter-kit-title').scrollIntoViewIfNeeded()
  await settle(page)
  await page.screenshot({ path: join(output, 'completion-day07-1440x900.png'), animations: 'disabled' })
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Markdown' }).click()
  const download = await downloadPromise
  assert(download.suggestedFilename().endsWith('.md'), 'day 7: export filename is not Markdown')
  const downloadPath = await download.path()
  assert(downloadPath, 'day 7: export has no readable path')
  const markdown = await readFile(downloadPath, 'utf8')
  assert(markdown.includes('Studio tư vấn vận hành nội dung'), 'day 7: export omitted learner data')
  assert(markdown.includes('Content Workflow Starter Kit'), 'day 7: export omitted title')
  await page.getByRole('button', { name: 'Copy Starter Kit' }).click()
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('Content Workflow Starter Kit'), 'day 7: copy starter kit failed')
  evidence.workflow.push('day-07-complete-export-copy')

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
