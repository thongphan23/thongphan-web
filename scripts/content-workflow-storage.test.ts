import assert from 'node:assert/strict'
import test from 'node:test'

import { buildStarterKitMarkdown, starterKitFilename } from '../lib/content-workflow/export'
import { createEmptyChallengeState, type ChallengeStateV1 } from '../lib/content-workflow/model'
import {
  CONTENT_WORKFLOW_STORAGE_KEY,
  clearChallengeState,
  parseChallengeState,
  readChallengeState,
  writeChallengeState,
  type StorageLike,
} from '../lib/content-workflow/storage'

function populatedState(): ChallengeStateV1 {
  const state = createEmptyChallengeState(new Date('2026-08-08T01:02:03.000Z'))
  state.currentDay = 5
  state.completedDays = [1, 2, 3, 4]
  state.readiness = { offer: true, customer: true, evidence: true, channel: true }
  state.artifacts.customerFocus = {
    business: 'Studio Mộc',
    offer: 'Gói hệ thống thông điệp',
    customerGroup: 'Founder công ty dịch vụ có đội content nhỏ',
    currentSituation: 'Founder vẫn phải sửa gần hết bài',
    primaryProblem: 'Thiếu evidence và tiêu chuẩn chung',
    desiredMovement: 'Đội ngũ tự tạo content đúng người',
    focusStatement: 'Tôi tạo content cho founder công ty dịch vụ có đội content nhỏ khi họ vẫn phải sửa gần hết bài.',
  }
  state.artifacts.evidenceBank = [{
    id: 'evidence-1',
    evidence: '“Thuê người viết rồi nhưng vẫn phải sửa hết.”',
    context: 'Sales call tháng 7',
    source: 'Sales call',
    insight: 'Founder đang là nút thắt duyệt bài.',
  }]
  state.artifacts.evidencePlan = 'Phỏng vấn thêm bốn khách hàng.'
  state.artifacts.contentJob = {
    selectedEvidence: state.artifacts.evidenceBank[0].evidence,
    job: 'understand-cause',
    beliefBefore: 'Nhân viên viết chưa đủ tốt.',
    expectedShift: 'Brief thiếu evidence mới là nguyên nhân cần sửa trước.',
    nextAction: 'Audit ba brief gần nhất.',
  }
  state.artifacts.contentBrief = {
    businessOffer: 'Gói hệ thống thông điệp',
    customer: 'Founder công ty dịch vụ',
    situation: 'Vẫn phải sửa gần hết bài',
    currentBelief: 'Nhân viên viết chưa đủ tốt',
    desiredUnderstanding: 'Brief thiếu evidence là nguyên nhân gốc',
    contentJob: 'understand-cause',
    coreMessage: 'Brief yếu biến founder thành nút thắt.',
    customerEvidence: state.artifacts.evidenceBank[0].evidence,
    supportingProof: 'Ba brief gần nhất không ghi evidence.',
    voiceConstraints: 'Thẳng, cụ thể.',
    mustInclude: 'Một câu khách hàng.',
    mustAvoid: 'Không bịa số liệu.',
    callToAction: 'Audit ba brief.',
    format: 'Bài 700 chữ',
    channel: 'Facebook',
  }
  state.artifacts.workflowPrompt = 'CONTENT WORKFLOW PROMPT\n'.repeat(20)
  state.artifacts.drafts[0].draft = 'Bản draft đầu tiên có evidence và luận điểm rõ ràng.'
  state.artifacts.drafts[0].revisionNote = 'Đưa evidence lên trước phần giải thích.'
  state.artifacts.drafts[1].draft = 'Bản draft thứ hai có một bước hành động cụ thể.'
  state.artifacts.drafts[1].revisionNote = 'Rút ngắn CTA và làm rõ customer.'
  state.artifacts.workflowFeedback = 'AI thường giải thích dài; cần đưa evidence lên sớm.'
  state.artifacts.onePager = {
    goal: 'Tạo content giúp founder hiểu nguyên nhân.',
    inputs: 'Customer Focus, evidence, Content Job và brief.',
    steps: 'Chọn evidence; điền brief; chạy prompt; chọn góc; sửa.',
    standards: 'Đúng người; một ý; có evidence.',
    aiRole: 'Kiểm tra brief, gợi ý góc, outline và draft.',
    humanRole: 'Chọn evidence, xác minh claim và quyết định đăng.',
    cadence: 'Ba content mỗi tuần.',
    publishStatus: 'sent',
    publishedUrlOrNote: 'Đã gửi cho ba khách hàng.',
    signalNote: 'Một người hỏi xin mẫu audit.',
    selectedDraft: 'Draft 1',
  }
  state.artifacts.fourteenDayPlan = [{
    id: 'plan-1', evidence: 'Một câu hỏi từ sales call', job: 'recognize-problem', publishDate: '2026-08-10',
  }]
  return state
}

class MemoryStorage implements StorageLike {
  data = new Map<string, string>()
  calls: Array<[method: string, key: string]> = []

  getItem(key: string): string | null {
    this.calls.push(['get', key])
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.calls.push(['set', key])
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.calls.push(['remove', key])
    this.data.delete(key)
  }
}

test('storage key is stable and parser round-trips an exact valid state', () => {
  assert.equal(CONTENT_WORKFLOW_STORAGE_KEY, 'tp.content-workflow-7days.v1')
  const state = populatedState()
  assert.deepEqual(parseChallengeState(JSON.stringify(state)), state)
})

test('parser fails closed for malformed, stale or structurally unsafe data', () => {
  const state = populatedState()
  const invalidValues: unknown[] = [
    null,
    [],
    { ...state, schemaVersion: 2 },
    { ...state, updatedAt: 'not-a-date' },
    { ...state, currentDay: 8 },
    { ...state, completedDays: [1, 1] },
    { ...state, completedDays: [0, 1] },
    { ...state, readiness: { offer: true } },
    { ...state, unexpected: true },
    { ...state, artifacts: { ...state.artifacts, unexpected: true } },
    { ...state, artifacts: { ...state.artifacts, evidenceBank: Array.from({ length: 21 }, () => state.artifacts.evidenceBank[0]) } },
    { ...state, artifacts: { ...state.artifacts, drafts: state.artifacts.drafts.slice(0, 2) } },
    { ...state, artifacts: { ...state.artifacts, fourteenDayPlan: Array.from({ length: 15 }, () => state.artifacts.fourteenDayPlan[0]) } },
    { ...state, artifacts: { ...state.artifacts, workflowPrompt: 'x'.repeat(20_001) } },
    { ...state, artifacts: { ...state.artifacts, customerFocus: { ...state.artifacts.customerFocus, offer: 12 } } },
  ]

  for (const invalid of invalidValues) {
    const parsed = parseChallengeState(typeof invalid === 'string' ? invalid : JSON.stringify(invalid))
    assert.equal(parsed.schemaVersion, 1)
    assert.equal(parsed.currentDay, 1)
    assert.deepEqual(parsed.completedDays, [])
  }

  assert.deepEqual(parseChallengeState('{broken'), createEmptyChallengeState(new Date(parseChallengeState('{broken').updatedAt)))
})

test('read, write and clear touch exactly the approved key', () => {
  const storage = new MemoryStorage()
  const state = populatedState()

  assert.equal(writeChallengeState(state, storage), true)
  assert.deepEqual(storage.calls, [['set', CONTENT_WORKFLOW_STORAGE_KEY]])
  assert.deepEqual(readChallengeState(storage), state)
  assert.deepEqual(storage.calls.at(-1), ['get', CONTENT_WORKFLOW_STORAGE_KEY])
  assert.equal(clearChallengeState(storage), true)
  assert.deepEqual(storage.calls.at(-1), ['remove', CONTENT_WORKFLOW_STORAGE_KEY])
  assert.equal(storage.data.size, 0)
})

test('storage failures never throw and return safe status values', () => {
  const broken: StorageLike = {
    getItem() { throw new Error('blocked') },
    setItem() { throw new Error('quota') },
    removeItem() { throw new Error('blocked') },
  }

  assert.doesNotThrow(() => readChallengeState(broken))
  assert.equal(readChallengeState(broken).currentDay, 1)
  assert.equal(writeChallengeState(populatedState(), broken), false)
  assert.equal(clearChallengeState(broken), false)
})

test('Markdown export has all eight artifact sections and neutralizes HTML-like input', () => {
  const state = populatedState()
  state.artifacts.customerFocus.business = '<script>alert("x")</script> Studio Mộc'
  const markdown = buildStarterKitMarkdown(state)

  for (const heading of [
    'Customer Focus Card',
    'Customer Voice Mini Bank',
    'Content Job Card',
    'Reusable Content Brief',
    'Content Workflow Prompt v1',
    'Drafts đã review',
    'Content Workflow One-Pager',
    'Kế hoạch content 14 ngày',
  ]) {
    assert.match(markdown, new RegExp(`## ${heading}`))
  }
  assert.doesNotMatch(markdown, /<script>/i)
  assert.match(markdown, /&lt;script&gt;/)
  assert.match(markdown, /Dữ liệu được xuất từ trình duyệt/)
})

test('filename is deterministic, UTC-safe and filesystem friendly', () => {
  assert.equal(
    starterKitFilename(new Date('2026-08-08T01:02:03.456Z')),
    'content-workflow-starter-kit-2026-08-08T01-02-03Z.md',
  )
})
