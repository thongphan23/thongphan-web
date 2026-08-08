import assert from 'node:assert/strict'
import test from 'node:test'

import { CONTENT_WORKFLOW_DAYS, SIMULATED_CASE } from '../lib/content-workflow/content'
import {
  ARTIFACT_KEYS,
  assembleWorkflowPrompt,
  canCompleteChallenge,
  createEmptyChallengeState,
  getArtifactCoverage,
  nextChallengeDay,
  validateDay,
  type ChallengeStateV1,
} from '../lib/content-workflow/model'

function readyState(): ChallengeStateV1 {
  const state = createEmptyChallengeState()
  state.artifacts.customerFocus = {
    business: 'Studio tư vấn vận hành nội dung',
    offer: 'Gói thiết kế hệ thống content 6 tuần',
    customerGroup: 'Founder công ty dịch vụ có đội content nhỏ',
    currentSituation: 'Đăng đều nhưng founder vẫn phải sửa gần như mọi bài',
    primaryProblem: 'Đội ngũ thiếu customer evidence và tiêu chuẩn chung',
    desiredMovement: 'Tạo bài đúng người mà không cần founder viết lại',
    focusStatement: 'Tôi tạo content cho founder công ty dịch vụ có đội content nhỏ, khi họ đăng đều nhưng vẫn phải sửa gần như mọi bài, muốn đội ngũ tự tạo bài đúng người nhưng đang thiếu customer evidence và tiêu chuẩn chung.',
  }
  state.artifacts.evidenceBank = Array.from({ length: 5 }, (_, index) => ({
    id: `evidence-${index + 1}`,
    evidence: `Khách hàng nói thật về vấn đề số ${index + 1}`,
    context: `Cuộc trao đổi bán hàng ${index + 1}`,
    source: index < 3 ? 'Sales call' : 'Inbox',
    insight: 'Founder vẫn là nút thắt duyệt nội dung.',
  }))
  state.artifacts.evidencePlan = 'Phỏng vấn thêm hai khách hàng trong tuần này.'
  state.artifacts.contentJob = {
    selectedEvidence: state.artifacts.evidenceBank[0].evidence,
    job: 'understand-cause',
    beliefBefore: 'Nhân viên chưa đủ giỏi nên bài viết luôn yếu.',
    expectedShift: 'Thiếu brief và evidence mới là nguyên nhân cần xử lý trước.',
    nextAction: 'Audit ba bài founder phải sửa nhiều nhất.',
  }
  state.artifacts.contentBrief = {
    businessOffer: state.artifacts.customerFocus.offer,
    customer: state.artifacts.customerFocus.customerGroup,
    situation: state.artifacts.customerFocus.currentSituation,
    currentBelief: state.artifacts.contentJob.beliefBefore,
    desiredUnderstanding: state.artifacts.contentJob.expectedShift,
    contentJob: state.artifacts.contentJob.job,
    coreMessage: 'Brief yếu làm founder trở thành nút thắt sửa bài.',
    customerEvidence: state.artifacts.evidenceBank[0].evidence,
    supportingProof: 'Ba bài gần nhất đều bị sửa lại phần luận điểm và ví dụ.',
    voiceConstraints: 'Thẳng, cụ thể, không dạy đời.',
    mustInclude: 'Một câu khách hàng và một bước audit.',
    mustAvoid: 'Không bịa số liệu hoặc hứa tăng doanh thu.',
    callToAction: 'Chọn ba bài gần nhất để audit.',
    format: 'Bài viết 700 chữ',
    channel: 'Facebook',
  }
  return state
}

function addReviewedDrafts(state: ChallengeStateV1, count = 2): ChallengeStateV1 {
  for (let index = 0; index < count; index += 1) {
    state.artifacts.drafts[index] = {
      ...state.artifacts.drafts[index],
      draft: `Bản content ${index + 1} có luận điểm, evidence và bước tiếp theo rõ ràng.`,
      scores: {
        rightCustomer: 2,
        rightProblem: 2,
        oneMainIdea: 2,
        hasEvidence: 1,
        specific: 1,
        nextStepFits: 1,
      },
      revisionNote: 'Giảm phần giải thích và đưa câu khách hàng lên sớm hơn.',
    }
  }
  return state
}

test('curriculum exposes exactly seven open lesson routes with one complete daily contract', () => {
  assert.deepEqual(CONTENT_WORKFLOW_DAYS.map(({ slug }) => slug), [
    'day-01',
    'day-02',
    'day-03',
    'day-04',
    'day-05',
    'day-06',
    'day-07',
  ])
  assert.deepEqual(CONTENT_WORKFLOW_DAYS.map(({ day }) => day), [1, 2, 3, 4, 5, 6, 7])

  for (const lesson of CONTENT_WORKFLOW_DAYS) {
    assert.equal(lesson.locked, false)
    assert.ok(lesson.title.length >= 20)
    assert.ok(lesson.question.endsWith('?'))
    assert.ok(lesson.threshold.length >= 40)
    assert.ok(lesson.artifact.length >= 10)
    assert.ok(lesson.learn.length >= 2)
    assert.ok(lesson.see.body.length >= 40)
    assert.equal(lesson.see.label, 'Tình huống mô phỏng')
    assert.ok(lesson.do.length >= 1)
    assert.ok(lesson.qualityGate.length >= 1)
    assert.ok(lesson.minimum.length >= 20)
  }
})

test('simulated case is explicitly labeled and never presented as real proof', () => {
  assert.equal(SIMULATED_CASE.label, 'Tình huống mô phỏng')
  assert.equal(SIMULATED_CASE.isRealCustomerProof, false)
  assert.match(SIMULATED_CASE.disclosure, /không phải.*khách hàng thật/i)
})

test('empty state is fresh, bounded and does not share mutable arrays', () => {
  const first = createEmptyChallengeState()
  const second = createEmptyChallengeState()

  assert.equal(first.schemaVersion, 1)
  assert.equal(first.currentDay, 1)
  assert.deepEqual(first.completedDays, [])
  assert.equal(first.artifacts.drafts.length, 3)
  assert.notEqual(first.completedDays, second.completedDays)
  assert.notEqual(first.artifacts.drafts, second.artifacts.drafts)

  const mutableDays = first.completedDays as ChallengeStateV1['completedDays']
  mutableDays.push(1)
  first.artifacts.evidenceBank.push({
    id: 'one', evidence: 'one', context: 'one', source: 'one', insight: 'one',
  })
  assert.deepEqual(second.completedDays, [])
  assert.deepEqual(second.artifacts.evidenceBank, [])
})

test('each day fails closed until its minimum gate is met', () => {
  const empty = createEmptyChallengeState()
  for (const day of [1, 2, 3, 4, 5, 6, 7] as const) {
    const result = validateDay(day, empty)
    assert.equal(result.valid, false, `day ${day}`)
    assert.ok(result.errors.length >= 1, `day ${day}`)
  }

  const state = readyState()
  assert.equal(validateDay(1, state).valid, true)
  assert.equal(validateDay(2, state).valid, true)
  assert.equal(validateDay(3, state).valid, true)
  assert.equal(validateDay(4, state).valid, true)

  state.artifacts.workflowPrompt = assembleWorkflowPrompt(state)
  assert.equal(validateDay(5, state).valid, true)

  addReviewedDrafts(state)
  assert.equal(validateDay(6, state).valid, true)
})

test('day two accepts the corrective minimum but full evidence coverage still requires five rows', () => {
  const state = readyState()
  state.artifacts.evidenceBank = state.artifacts.evidenceBank.slice(0, 3)
  assert.equal(validateDay(2, state).valid, true)
  assert.equal(getArtifactCoverage(state).evidenceBank, false)

  state.artifacts.evidencePlan = ''
  assert.equal(validateDay(2, state).valid, false)
})

test('day six requires two structurally reviewed drafts at 9/12 with no zero score', () => {
  const state = readyState()
  state.artifacts.workflowPrompt = assembleWorkflowPrompt(state)
  addReviewedDrafts(state, 1)
  assert.equal(validateDay(6, state).valid, false)

  addReviewedDrafts(state, 2)
  assert.equal(validateDay(6, state).valid, true)

  state.artifacts.drafts[1].scores.hasEvidence = 0
  state.artifacts.drafts[1].scores.nextStepFits = 2
  assert.equal(validateDay(6, state).valid, false)
})

test('prompt assembly is deterministic and preserves the human decision point', () => {
  const state = readyState()
  const prompt = assembleWorkflowPrompt(state)

  assert.equal(prompt, assembleWorkflowPrompt(state))
  assert.match(prompt, /BẢN GIAO VIỆC → 3 GÓC KHAI THÁC → DÀN Ý → BẢN NHÁP → TỰ KIỂM TRA → YÊU CẦU CHỈNH SỬA/)
  assert.match(prompt, /CHỜ TÔI CHỌN MỘT GÓC/)
  assert.match(prompt, /Không tự thêm số liệu, câu chuyện hoặc trích dẫn/)
  assert.match(prompt, new RegExp(state.artifacts.contentBrief.coreMessage))
})

test('day five cannot pass with a placeholder prompt assembled from an empty brief', () => {
  const state = createEmptyChallengeState()
  state.artifacts.workflowPrompt = assembleWorkflowPrompt(state)
  assert.equal(validateDay(5, state).valid, false)
  assert.ok(validateDay(5, state).errors.some(({ field }) => field.startsWith('contentBrief.')))
})

test('completion keeps the six-of-eight rule but Day 7 also requires six continuation items', () => {
  assert.deepEqual(ARTIFACT_KEYS, [
    'customerFocus',
    'evidenceBank',
    'contentJob',
    'contentBrief',
    'workflowPrompt',
    'reviewedDrafts',
    'onePager',
    'fourteenDayPlan',
  ])

  const state = readyState()
  state.artifacts.workflowPrompt = assembleWorkflowPrompt(state)
  addReviewedDrafts(state)
  state.artifacts.onePager = {
    goal: 'Tạo content giúp founder nhìn ra nguyên nhân thật của nút thắt sửa bài.',
    inputs: 'Customer Focus, evidence, Content Job và Reusable Brief.',
    steps: 'Chọn evidence; điền brief; chạy prompt; chọn góc; chấm; sửa; đưa ra thực tế.',
    standards: 'Đúng người; một ý chính; có evidence; có bước tiếp theo.',
    aiRole: 'Kiểm tra brief, gợi ý góc, outline, draft và self-check.',
    humanRole: 'Chọn evidence, xác minh claim, sửa theo gu và quyết định đăng.',
    cadence: 'Ba content mỗi tuần.',
    publishStatus: 'sent',
    publishedUrlOrNote: 'Đã gửi cho ba khách hàng phù hợp.',
    signalNote: 'Một khách hàng hỏi cách audit brief hiện tại.',
    selectedDraft: 'Bản content 1',
  }

  const coverage = getArtifactCoverage(state)
  assert.equal(Object.values(coverage).filter(Boolean).length, 7)
  assert.equal(canCompleteChallenge(state), true)
  assert.equal(validateDay(7, state).valid, false)
  assert.ok(validateDay(7, state).errors.some(({ field }) => field === 'fourteenDayPlan'))

  state.artifacts.fourteenDayPlan = Array.from({ length: 6 }, (_, index) => ({
    id: `plan-${index + 1}`,
    evidence: `Evidence ưu tiên ${index + 1}`,
    job: index % 2 === 0 ? 'recognize-problem' : 'understand-cause',
    publishDate: `2026-08-${String(index + 10).padStart(2, '0')}`,
  }))
  assert.equal(validateDay(7, state).valid, true)

  state.artifacts.evidenceBank = state.artifacts.evidenceBank.slice(0, 4)
  assert.equal(canCompleteChallenge(state), false)
  assert.equal(validateDay(7, state).valid, false)
})

test('next day recommends progress without creating route locks', () => {
  const state = createEmptyChallengeState()
  assert.equal(nextChallengeDay(state), 1)
  state.completedDays = [1, 2, 4]
  state.currentDay = 4
  assert.equal(nextChallengeDay(state), 3)
  state.completedDays = [1, 2, 3, 4, 5, 6, 7]
  assert.equal(nextChallengeDay(state), 7)
})

test('resume keeps an unfinished current day before falling back to the first incomplete day', () => {
  const state = createEmptyChallengeState()
  state.completedDays = [1, 2]
  state.currentDay = 4

  assert.equal(nextChallengeDay(state), 4)

  state.completedDays = [1, 2, 4]
  assert.equal(nextChallengeDay(state), 3)
})
