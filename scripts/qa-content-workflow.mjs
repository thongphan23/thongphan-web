import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const ROOT = '/challenge/content-workflow-7days'
const STORAGE_KEY = 'tp.content-workflow-7days.v2'
const LEGACY_KEY = 'tp.content-workflow-7days.v1'
const port = Number(process.env.CONTENT_WORKFLOW_QA_PORT ?? 4174)
const configuredBase = process.env.CONTENT_WORKFLOW_QA_BASE_URL
const base = configuredBase?.replace(/\/$/, '') ?? `http://127.0.0.1:${port}`
const output = process.env.CONTENT_WORKFLOW_QA_OUTPUT_DIR ?? await mkdtemp(join(tmpdir(), 'tp-content-workflow-v2-qa-'))
let server

function assert(condition, message) { if (!condition) throw new Error(message) }
async function waitForServer(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Máy chủ QA chưa sẵn sàng: ${url}`)
}
async function fill(page, id, value) { await page.locator(`#${id}`).fill(value) }
async function settle(page) {
  await page.waitForTimeout(550)
  await page.evaluate(async () => { await document.fonts?.ready; await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))) })
}
async function inspectPage(page, name) {
  const state = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length }))
  assert(state.h1 === 1, `${name}: cần đúng một H1`)
  assert(state.overflow <= 1, `${name}: tràn ngang ${state.overflow}px`)
  assert(state.brokenImages === 0, `${name}: có ${state.brokenImages} ảnh hỏng`)
  const text = await page.locator('body').innerText()
  assert(!/(^|\s)anh(?=\s|[.,!?;:])/iu.test(text), `${name}: gọi người học là “anh”`)
  assert(!/\b(?:shared|human|failureCategory|stepInstructions)\b/.test(text), `${name}: lộ nhãn nội bộ tiếng Anh`)
  const vietnameseFirstText = text.replace(/\([^)]*\)/g, ' ')
  assert(!/\b(?:workflow|content|concept|offer|claim|founder)\b/iu.test(vietnameseFirstText), `${name}: còn thuật ngữ tiếng Anh chưa có tiếng Việt đứng trước`)
  return state
}
async function openDay(page, day) {
  const response = await page.goto(`${base}${ROOT}/day-${String(day).padStart(2, '0')}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `Ngày ${day}: HTTP ${response?.status()}`)
  await page.locator('[data-hydrated="true"]').waitFor()
}
async function completeGate(page, day) {
  await page.getByRole('button', { name: 'Kiểm tra và xác nhận hoàn thành' }).click()
  await page.getByText(`Ngày ${day} đã hoàn thành.`, { exact: false }).waitFor()
  await settle(page)
}

await mkdir(output, { recursive: true })
if (!configuredBase) {
  server = spawn('npx', ['wrangler', 'pages', 'dev', 'out', '--port', String(port), '--ip', '127.0.0.1'], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
  await waitForServer(`${base}${ROOT}`)
}

const browser = await chromium.launch({ headless: true })
const browserErrors = []
const failedResponses = []
const evidence = { base, output, workflow: [], viewports: [] }

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()) })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('response', (response) => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`) })

  let response = await page.goto(`${base}${ROOT}`, { waitUntil: 'networkidle' })
  assert(response?.ok(), `Trang tổng quan: HTTP ${response?.status()}`)
  evidence.viewports.push({ name: 'hub-1440x900', ...await inspectPage(page, 'Trang tổng quan') })
  await page.screenshot({ path: join(output, 'hub-1440x900.png'), animations: 'disabled', fullPage: true })
  for (const label of ['Tôi chọn được một đầu ra nội dung', 'Tôi có một ít dữ liệu', 'Tôi có thể dùng một công cụ', 'Tôi có thể dành 45–60 phút']) await page.getByLabel(label, { exact: false }).check()
  await page.getByRole('button', { name: 'Mở Ngày 01' }).click()
  await page.waitForURL(/day-01$/)

  await page.getByRole('button', { name: 'Kiểm tra và xác nhận hoàn thành' }).click()
  const gateError = page.getByText('Còn 1 điểm cần sửa', { exact: false })
  await gateError.waitFor()
  assert((await page.locator('body').innerText()).includes('Hoàn thành bản mô tả quy trình'), 'Ngày 1: thiếu phản hồi lỗi dễ hiểu')
  const day1 = {
    workflowName: 'Workflow tạo bài học xây doanh nghiệp', repeatedTask: 'Biến một khái niệm Builder thành một bài học công khai.', trigger: 'Khi đội ngũ chọn được một khái niệm cần xuất bản.',
    currentInputs: 'Khái niệm nguồn, ghi chú và định vị Conan School.', finalOutput: 'Một bài học có ví dụ, hành động và sản phẩm đầu ra.', outputUser: 'Người xây doanh nghiệp lần đầu.',
    currentFriction: 'Mỗi lần viết lại bắt đầu từ trang trắng.', scope: 'Một bài học chữ có một hành động và một sản phẩm.', nonGoals: 'Không tạo video hoặc chiến dịch bán hàng.',
  }
  for (const [key, value] of Object.entries(day1)) await fill(page, `field-workflowBrief-${key}`, value)
  await completeGate(page, 1); evidence.workflow.push('ngay-01-mo-ta')

  await openDay(page, 2)
  const day2 = {
    identityBusiness: 'Conan School là cộng đồng cho người xây lần đầu.', expertiseOffer: 'Giúp người học xây doanh nghiệp đầu tiên trong kỷ nguyên AI.', intendedAudience: 'Người mới bắt đầu hành trình xây doanh nghiệp.',
    knownContext: 'Học bằng cách xây và tạo sản phẩm thật.', currentAssumptions: 'Người học dùng AI theo từng việc nhưng chưa biết xây workflow.', voice: 'Rõ ràng, thực tế, bình tĩnh.',
    mustDo: 'Dùng tiếng Việt và dẫn tới một hành động nhỏ.', mustNot: 'Không bịa tình huống, kết quả hoặc lời chứng thực.', references: 'Trang chủ Conan School và ghi chú Hành trình Builder.', gaps: 'Cần phản hồi người học sau lần chạy thử.',
  }
  for (const [key, value] of Object.entries(day2)) await fill(page, `field-contextPack-${key}`, value)
  await completeGate(page, 2); evidence.workflow.push('ngay-02-boi-canh')

  await openDay(page, 3)
  const day3 = {
    audience: 'Người mới làm quen với thiết kế workflow.', purpose: 'Hiểu một concept và tạo một sản phẩm nhỏ.', format: 'Bài học tự học trên web trong 45–60 phút.', structure: 'Bài toán, lý thuyết, hiểu lầm, ví dụ, thực hành và tự kiểm.',
    mustInclude: 'Một quyết định Conan và một bản mẫu hoàn chỉnh.', mustAvoid: 'Tuyên bố thiếu nguồn hoặc thuật ngữ không giải thích.', qualityCriteria: 'Người mới giải thích lại được và hoàn thành sản phẩm không cần người hướng dẫn.', antiExample: 'Bài trôi chảy nhưng chỉ có lý thuyết và không tạo đầu ra.',
  }
  for (const [key, value] of Object.entries(day3)) await fill(page, `field-outputContract-${key}`, value)
  await completeGate(page, 3); evidence.workflow.push('ngay-03-hop-dong')

  await openDay(page, 4)
  await page.getByRole('button', { name: 'Tạo bốn bước khởi đầu' }).click()
  for (let index = 0; index < 4; index += 1) {
    const fields = { name: `Bước ${index + 1}`, input: `Đầu vào rõ ràng của bước ${index + 1}`, transformation: `Chuyển đổi cần làm ở bước ${index + 1}`, output: `Đầu ra kiểm tra được của bước ${index + 1}`, humanDecision: index === 1 ? 'Con người chọn phương án phù hợp.' : 'Không có quyết định bổ sung.', qualityGate: index < 2 ? `Cổng chất lượng ${index + 1}` : '' }
    for (const [key, value] of Object.entries(fields)) await fill(page, `field-workflowMap-${index}-${key}`, value)
  }
  await completeGate(page, 4)
  await page.screenshot({ path: join(output, 'workbench-day04-1440x900.png'), animations: 'disabled', fullPage: true })
  evidence.workflow.push('ngay-04-ban-do')

  await openDay(page, 5)
  await page.getByRole('button', { name: 'Tạo thẻ theo bản đồ' }).click()
  for (let index = 0; index < 4; index += 1) {
    await page.locator(`#field-stepInstructions-${index}-role`).selectOption(index === 1 ? 'human' : 'shared')
    const fields = { purpose: `Hoàn thành bước ${index + 1} đúng hợp đồng.`, instruction: 'Dùng dữ liệu được cung cấp, tạo phương án rồi chờ con người duyệt.', outputFormat: 'Một đầu ra có nhãn rõ ràng.', selfCheck: 'Không thêm dữ liệu hoặc tuyên bố chưa được cung cấp.', handoff: 'Chuyển toàn bộ đầu ra sang bước tiếp theo.' }
    for (const [key, value] of Object.entries(fields)) await fill(page, `field-stepInstructions-${index}-${key}`, value)
  }
  await page.getByRole('button', { name: 'Ghép thành Quy trình có thể chạy' }).click()
  const workflowBefore = await page.locator('#field-runnableWorkflow').inputValue()
  assert(workflowBefore.length > 1000, 'Ngày 5: workflow được ghép quá ngắn')
  await page.getByRole('button', { name: 'Sao chép quy trình' }).click()
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('NGUYÊN TẮC AN TOÀN'), 'Ngày 5: sao chép workflow thất bại')
  await completeGate(page, 5)
  await page.reload({ waitUntil: 'networkidle' }); await page.locator('[data-hydrated="true"]').waitFor()
  assert(await page.locator('#field-runnableWorkflow').inputValue() === workflowBefore, 'Ngày 5: dữ liệu không còn sau khi tải lại')
  evidence.workflow.push('ngay-05-phan-vai-ghep-sao-chep-luu')

  await openDay(page, 6)
  await fill(page, 'field-testRun-runInput', 'Khái niệm: workflow không phải một câu lệnh dài.')
  await page.getByRole('button', { name: 'Tạo nhật ký theo từng bước' }).click()
  for (let index = 0; index < 4; index += 1) {
    for (const [key, value] of Object.entries({ output: `Đầu ra thử nghiệm của bước ${index + 1}.`, issue: index === 1 ? 'Các phương án còn quá giống nhau.' : 'Không phát hiện lỗi đáng kể.', intervention: index === 1 ? 'Yêu cầu tách theo góc nhìn.' : 'Giữ nguyên để chuyển bước.' })) await fill(page, `field-testRun-entries-${index}-${key}`, value)
  }
  await fill(page, 'field-testRun-finalContent', 'Workflow không phải một câu lệnh dài. Nó là chuỗi chuyển đổi có điểm con người quyết định và tiêu chuẩn đầu ra rõ ràng. Người mới có thể dùng bản đồ để tự chạy và quan sát nơi workflow bị vỡ.')
  await fill(page, 'field-testRun-outputReview', 'Đầu ra đạt cấu trúc nhưng ví dụ đầu tiên còn chung.')
  await page.locator('#field-testRun-failureCategory').selectOption('instruction')
  await fill(page, 'field-testRun-biggestFailure', 'Hướng dẫn chưa nói các phương án phải khác nhau ở đâu.')
  await fill(page, 'field-testRun-changeMade', 'Bổ sung yêu cầu khác nhau về góc nhìn và mức hành động.')
  await fill(page, 'field-testRun-rerunResult', 'Các phương án sau khi chạy lại đã phân biệt rõ.')
  await completeGate(page, 6); evidence.workflow.push('ngay-06-chay-thu-sua-chay-lai')

  await openDay(page, 7)
  const kit = { version: '1.0', purpose: 'Tạo bài học công khai từ một khái niệm Builder.', preparation: 'Hồ sơ bối cảnh, khái niệm nguồn và Hợp đồng đầu ra.', runGuide: 'Chuẩn bị đầu vào; chạy từng bước; dừng tại điểm quyết định; kiểm tra; ghi lần sửa.', commonFailures: 'Thiếu bối cảnh; phương án giống nhau; AI tự thêm tuyên bố.', updateTriggers: 'Cập nhật khi đổi định dạng, đối tượng hoặc phát hiện lỗi lặp lại.' }
  for (const [key, value] of Object.entries(kit)) await fill(page, `field-workflowKit-${key}`, value)
  const transfer = { workflowName: 'Workflow xử lý biên bản họp', result: 'Danh sách việc có người phụ trách và hạn.', context: 'Mục tiêu họp, thành viên và dự án.', outputContract: 'Mỗi việc có hành động, chủ sở hữu và thời hạn.', stages: 'Nhận bản ghi; tóm tắt; tách quyết định; tách việc; kiểm tra; gửi.', humanDecisions: 'Con người xác nhận quyết định và người chịu trách nhiệm.', testPlan: 'Chạy với một cuộc họp 30 phút và đối chiếu ghi chú.' }
  for (const [key, value] of Object.entries(transfer)) await fill(page, `field-workflowKit-transferBlueprint-${key}`, value)
  await completeGate(page, 7)
  await page.getByText('7/7 sản phẩm đạt').waitFor()
  await page.screenshot({ path: join(output, 'completion-day07-1440x900.png'), animations: 'disabled', fullPage: true })
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tải tệp Markdown' }).click()
  const download = await downloadPromise
  assert(download.suggestedFilename().startsWith('bo-workflow-7-ngay-'), 'Ngày 7: tên tệp xuất sai')
  const downloadPath = await download.path(); assert(downloadPath, 'Ngày 7: không đọc được tệp tải')
  const markdown = await readFile(downloadPath, 'utf8')
  assert(markdown.includes('Workflow xử lý biên bản họp'), 'Ngày 7: thiếu Bản thiết kế chuyển giao trong tệp xuất')
  assert(markdown.includes('## Nhật ký chạy thử'), 'Ngày 7: thiếu Nhật ký chạy thử trong tệp xuất')
  await page.getByRole('button', { name: 'Sao chép Bộ quy trình' }).click()
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('Bộ quy trình 7 ngày'), 'Ngày 7: sao chép bộ quy trình thất bại')
  evidence.workflow.push('ngay-07-dong-goi-xuat-sao-chep')

  await page.evaluate(([legacy]) => localStorage.setItem(legacy, '{"schemaVersion":1}'), [LEGACY_KEY])
  await page.getByRole('button', { name: 'Đặt lại' }).click(); await page.getByRole('button', { name: 'Giữ lại' }).click()
  assert(await page.evaluate((key) => Boolean(localStorage.getItem(key)), STORAGE_KEY), 'Giữ lại đã xóa dữ liệu')
  await page.getByRole('button', { name: 'Đặt lại' }).click(); await page.getByRole('button', { name: 'Xóa và về trang đầu' }).click(); await page.waitForURL(new RegExp(`${ROOT}$`))
  assert(await page.evaluate(([current, legacy]) => localStorage.getItem(current) === null && localStorage.getItem(legacy) === null, [STORAGE_KEY, LEGACY_KEY]), 'Đặt lại chưa xóa đúng v1 và v2')
  evidence.workflow.push('dat-lai-v1-v2')
  await context.close()

  for (const viewport of [{ name: 'desktop-1280x800', width: 1280, height: 800 }, { name: 'mobile-390x844', width: 390, height: 844 }, { name: 'mobile-320x568', width: 320, height: 568 }]) {
    const responsiveContext = await browser.newContext({ viewport })
    const responsivePage = await responsiveContext.newPage()
    response = await responsivePage.goto(`${base}${ROOT}/day-04`, { waitUntil: 'networkidle' })
    assert(response?.ok(), `${viewport.name}: HTTP ${response?.status()}`)
    await responsivePage.locator('[data-hydrated="true"]').waitFor()
    evidence.viewports.push({ ...viewport, ...await inspectPage(responsivePage, viewport.name) })
    await responsivePage.screenshot({ path: join(output, `${viewport.name}.png`), animations: 'disabled', fullPage: true })
    await responsiveContext.close()
  }

  assert(browserErrors.length === 0, `Lỗi trình duyệt: ${browserErrors.join(' | ')}`)
  assert(failedResponses.length === 0, `Phản hồi lỗi: ${failedResponses.join(' | ')}`)
  evidence.browserErrors = browserErrors; evidence.failedResponses = failedResponses
  await writeFile(join(output, 'report.json'), `${JSON.stringify(evidence, null, 2)}\n`)
  console.log(`Content Workflow QA v2 passed: ${output}`)
} finally {
  await browser.close()
  if (server && !server.killed) server.kill('SIGTERM')
}
