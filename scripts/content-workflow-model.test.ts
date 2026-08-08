import assert from 'node:assert/strict'
import test from 'node:test'

import { CONTENT_WORKFLOW_DAYS, CONAN_SCHOOL_CASE } from '../lib/content-workflow/content'
import { DAY_RESOURCES } from '../lib/content-workflow/resources'
import {
  ARTIFACT_KEYS,
  assembleRunnableWorkflow,
  canCompleteChallenge,
  createEmptyChallengeState,
  getArtifactCoverage,
  nextChallengeDay,
  validateDay,
  type ChallengeStateV2,
  type WorkflowStage,
} from '../lib/content-workflow/model'

function validStage(index: number): WorkflowStage {
  return {
    id: `stage-${index}`,
    name: `Bước ${index}`,
    input: `Đầu vào rõ ràng cho bước ${index}`,
    transformation: `Chuyển đổi chính của bước ${index}`,
    output: `Đầu ra có thể kiểm tra ${index}`,
    humanDecision: index === 2 ? 'Con người chọn phương án phù hợp nhất.' : 'Không có quyết định bổ sung.',
    qualityGate: index <= 2 ? `Cổng chất lượng ${index}` : '',
  }
}

test('curriculum exposes seven open deep lessons and usable resources', () => {
  assert.deepEqual(CONTENT_WORKFLOW_DAYS.map(({ slug }) => slug), [
    'day-01', 'day-02', 'day-03', 'day-04', 'day-05', 'day-06', 'day-07',
  ])
  assert.equal(CONAN_SCHOOL_CASE.label, 'Tình huống Conan School')
  assert.equal(CONAN_SCHOOL_CASE.isVerifiedOperatingProof, false)
  assert.match(CONAN_SCHOOL_CASE.disclosure, /thiết kế.*giảng dạy/i)

  for (const lesson of CONTENT_WORKFLOW_DAYS) {
    assert.equal(lesson.locked, false)
    assert.ok(lesson.title.length >= 20)
    assert.ok(lesson.question.endsWith('?'))
    assert.ok(lesson.problem.length >= 80)
    assert.equal(lesson.theory.length, 3)
    assert.ok(lesson.misconceptions.length >= 3)
    assert.ok(lesson.practice.length >= 4)
    assert.ok(lesson.qualityGate.length >= 3)
    assert.equal(lesson.conanCase.label, 'Tình huống Conan School')
    assert.match(lesson.conanCase.disclosure, /thiết kế.*giảng dạy/i)
    assert.equal(lesson.aiLab.duration, '20–30 phút tùy chọn')
    assert.ok(lesson.aiLab.prompt.length >= 120)
    assert.ok(DAY_RESOURCES[lesson.day].length >= 4)
    assert.ok(DAY_RESOURCES[lesson.day].every((resource) => resource.content.length >= 80))
  }
})

function readyState(): ChallengeStateV2 {
  const state = createEmptyChallengeState(new Date('2026-08-08T01:02:03.000Z'))
  state.readiness = { outcome: true, materials: true, aiAccess: true, time: true }
  state.artifacts.workflowBrief = {
    workflowName: 'Workflow tạo bài học xây doanh nghiệp',
    repeatedTask: 'Biến một khái niệm Builder thành một bài học công khai.',
    trigger: 'Khi đội ngũ chọn được một khái niệm cần xuất bản.',
    currentInputs: 'Khái niệm nguồn, ghi chú và định vị Conan School.',
    finalOutput: 'Một bài học có ví dụ, hành động và sản phẩm đầu ra.',
    outputUser: 'First-Time Builder đang học cách xây doanh nghiệp.',
    currentFriction: 'Mỗi lần viết lại bắt đầu từ trang trắng và thiếu tiêu chuẩn chung.',
    scope: 'Một bài học chữ có một hành động và một sản phẩm.',
    nonGoals: 'Không tạo video, landing page hoặc chiến dịch bán hàng.',
  }
  state.artifacts.contextPack = {
    identityBusiness: 'Conan School là cộng đồng cho First-Time Builders.',
    expertiseOffer: 'Giúp người học xây doanh nghiệp đầu tiên trong kỷ nguyên AI.',
    intendedAudience: 'Người mới bắt đầu hành trình xây doanh nghiệp.',
    knownContext: 'Học bằng cách xây và tạo sản phẩm thật sau mỗi chặng.',
    currentAssumptions: 'Người học đã dùng AI cho task nhưng chưa biết tự xây workflow.',
    voice: 'Rõ ràng, thực tế, bình tĩnh và không dạy đời.',
    mustDo: 'Dùng tiếng Việt và dẫn tới một hành động nhỏ.',
    mustNot: 'Không bịa case, kết quả, doanh thu hoặc lời chứng thực.',
    references: 'Trang chủ Conan School và ghi chú Builder Journey.',
    gaps: 'Cần bổ sung phản hồi người học sau lần chạy thử.',
  }
  state.artifacts.outputContract = {
    audience: 'First-Time Builder mới làm quen workflow.',
    purpose: 'Giúp người học hiểu một concept và tạo một sản phẩm nhỏ.',
    format: 'Bài học tự học trên web, đọc và làm trong 45–60 phút.',
    structure: 'Bài toán, concept, hiểu lầm, ví dụ, thực hành, tự kiểm.',
    mustInclude: 'Một quyết định Conan và một bản mẫu hoàn chỉnh.',
    mustAvoid: 'Không có tuyên bố thiếu nguồn hoặc thuật ngữ không giải thích.',
    qualityCriteria: 'Người mới giải thích lại được và hoàn thành artifact không cần người hướng dẫn.',
    antiExample: 'Bài viết trôi chảy nhưng chỉ có lý thuyết và không tạo được đầu ra.',
  }
  state.artifacts.workflowMap = Array.from({ length: 4 }, (_, index) => validStage(index + 1))
  state.artifacts.stepInstructions = state.artifacts.workflowMap.map((stage, index) => ({
    id: `instruction-${index + 1}`,
    stageId: stage.id,
    role: index === 1 ? 'human' : 'shared',
    purpose: `Hoàn thành ${stage.name.toLowerCase()} đúng hợp đồng đầu ra.`,
    instruction: index === 1 ? 'Đọc các phương án và chọn một phương án phù hợp.' : 'Dùng đúng bối cảnh để tạo phương án rồi chờ con người duyệt.',
    outputFormat: `Một đầu ra có nhãn cho ${stage.name.toLowerCase()}.`,
    selfCheck: 'Không thêm dữ liệu hoặc tuyên bố chưa được cung cấp.',
    handoff: 'Chuyển toàn bộ đầu ra sang bước kế tiếp.',
  }))
  state.artifacts.runnableWorkflow = assembleRunnableWorkflow(state)
  state.artifacts.testRun = {
    runInput: 'Khái niệm: workflow không phải một câu lệnh dài.',
    entries: state.artifacts.workflowMap.map((stage, index) => ({
      id: `run-${index + 1}`,
      stageId: stage.id,
      output: `Đầu ra thử nghiệm của ${stage.name}.`,
      issue: index === 1 ? 'Có hai phương án quá giống nhau.' : 'Không phát hiện lỗi đáng kể.',
      intervention: index === 1 ? 'Yêu cầu tách phương án theo mức phán đoán của con người.' : 'Giữ nguyên để chuyển bước.',
    })),
    finalContent: 'Workflow không phải một câu lệnh thật dài. Nó là một chuỗi chuyển đổi có điểm con người quyết định và tiêu chuẩn đầu ra rõ ràng.'.repeat(2),
    outputReview: 'Đầu ra đạt cấu trúc nhưng ví dụ đầu tiên còn quá chung chung.',
    failureCategory: 'instruction',
    biggestFailure: 'Hướng dẫn tạo phương án chưa nói rõ các phương án phải khác nhau ở đâu.',
    changeMade: 'Bổ sung yêu cầu ba phương án khác nhau về góc nhìn và mức độ hành động.',
    rerunResult: 'Ba phương án sau khi chạy lại đã khác nhau và con người chọn được một phương án.',
  }
  state.artifacts.workflowKit = {
    version: '1.0',
    purpose: 'Tạo bài học công khai từ một khái niệm Builder.',
    preparation: 'Hồ sơ bối cảnh, khái niệm nguồn và Hợp đồng đầu ra.',
    runGuide: 'Chuẩn bị đầu vào; chạy từng bước; dừng tại điểm quyết định; kiểm tra; ghi lần sửa.',
    commonFailures: 'Thiếu bối cảnh; phương án giống nhau; AI tự thêm claim.',
    updateTriggers: 'Cập nhật khi đổi định dạng, đối tượng hoặc phát hiện lỗi lặp lại.',
    transferBlueprint: {
      workflowName: 'Workflow biến buổi họp thành danh sách công việc',
      result: 'Biên bản ngắn cùng người phụ trách và hạn hoàn thành.',
      context: 'Mục tiêu cuộc họp, thành viên, dự án và quy ước trách nhiệm.',
      outputContract: 'Mỗi việc có hành động, chủ sở hữu và thời hạn.',
      stages: 'Nhận bản ghi; tóm tắt; tách quyết định; tách việc; kiểm tra; gửi.',
      humanDecisions: 'Con người xác nhận quyết định và người chịu trách nhiệm.',
      testPlan: 'Chạy với một cuộc họp 30 phút và đối chiếu với ghi chú của người chủ trì.',
    },
  }
  return state
}

test('empty state uses schema v2 and owns seven independent artifacts', () => {
  const first = createEmptyChallengeState()
  const second = createEmptyChallengeState()

  assert.equal(first.schemaVersion, 2)
  assert.equal(first.currentDay, 1)
  assert.deepEqual(first.completedDays, [])
  assert.deepEqual(first.readiness, { outcome: false, materials: false, aiAccess: false, time: false })
  assert.deepEqual(ARTIFACT_KEYS, [
    'workflowBrief',
    'contextPack',
    'outputContract',
    'workflowMap',
    'runnableWorkflow',
    'testRun',
    'workflowKit',
  ])
  assert.notEqual(first.completedDays, second.completedDays)
  assert.notEqual(first.artifacts.workflowMap, second.artifacts.workflowMap)
  first.artifacts.workflowMap.push(validStage(1))
  assert.deepEqual(second.artifacts.workflowMap, [])
})

test('all seven days fail closed when their artifact is empty', () => {
  const empty = createEmptyChallengeState()
  for (const day of [1, 2, 3, 4, 5, 6, 7] as const) {
    const result = validateDay(day, empty)
    assert.equal(result.valid, false, `day ${day}`)
    assert.ok(result.errors.length >= 1, `day ${day}`)
  }
})

test('each completed artifact passes its own daily gate', () => {
  const state = readyState()
  for (const day of [1, 2, 3, 4, 5, 6, 7] as const) {
    assert.equal(validateDay(day, state).valid, true, `day ${day}`)
  }
})

test('day four requires four to seven stages and at least two quality gates', () => {
  const state = readyState()
  state.artifacts.workflowMap = state.artifacts.workflowMap.slice(0, 3)
  assert.equal(validateDay(4, state).valid, false)

  state.artifacts.workflowMap = Array.from({ length: 4 }, (_, index) => ({
    ...validStage(index + 1),
    qualityGate: index === 0 ? 'Một cổng duy nhất' : '',
  }))
  assert.equal(validateDay(4, state).valid, false)

  state.artifacts.workflowMap[1].qualityGate = 'Cổng thứ hai'
  assert.equal(validateDay(4, state).valid, true)

  state.artifacts.workflowMap = Array.from({ length: 8 }, (_, index) => validStage(index + 1))
  assert.equal(validateDay(4, state).valid, false)
})

test('day five instructions cover every stage and assembly is deterministic', () => {
  const state = readyState()
  const first = assembleRunnableWorkflow(state)
  assert.equal(first, assembleRunnableWorkflow(state))
  assert.match(first, /ĐIỂM CON NGƯỜI QUYẾT ĐỊNH/)
  assert.match(first, /Không thêm dữ liệu hoặc tuyên bố chưa được cung cấp/)
  assert.match(first, /Con người thực hiện/)
  assert.match(first, new RegExp(state.artifacts.outputContract.purpose))

  state.artifacts.stepInstructions.pop()
  state.artifacts.runnableWorkflow = first
  assert.equal(validateDay(5, state).valid, false)
})

test('day six requires a logged failure, a workflow change and a rerun result', () => {
  const state = readyState()
  state.artifacts.testRun.biggestFailure = ''
  assert.equal(validateDay(6, state).valid, false)
  state.artifacts.testRun.biggestFailure = 'Hướng dẫn chưa phân biệt các phương án.'
  state.artifacts.testRun.changeMade = ''
  assert.equal(validateDay(6, state).valid, false)
  state.artifacts.testRun.changeMade = 'Bổ sung tiêu chí phân biệt.'
  state.artifacts.testRun.rerunResult = ''
  assert.equal(validateDay(6, state).valid, false)
})

test('day seven requires transfer rather than a copied content workflow', () => {
  const state = readyState()
  state.artifacts.workflowKit.transferBlueprint.workflowName = ''
  assert.equal(validateDay(7, state).valid, false)
  assert.equal(canCompleteChallenge(state), false)

  state.artifacts.workflowKit.transferBlueprint.workflowName = 'Workflow xử lý biên bản họp'
  assert.equal(validateDay(7, state).valid, true)
  assert.equal(canCompleteChallenge(state), true)
  assert.deepEqual(getArtifactCoverage(state), {
    workflowBrief: true,
    contextPack: true,
    outputContract: true,
    workflowMap: true,
    runnableWorkflow: true,
    testRun: true,
    workflowKit: true,
  })
})

test('next day recommends progress without locking open routes', () => {
  const state = createEmptyChallengeState()
  assert.equal(nextChallengeDay(state), 1)
  state.completedDays = [1, 2, 4]
  state.currentDay = 4
  assert.equal(nextChallengeDay(state), 3)
  state.completedDays = [1, 2]
  state.currentDay = 4
  assert.equal(nextChallengeDay(state), 4)
  state.completedDays = [1, 2, 3, 4, 5, 6, 7]
  assert.equal(nextChallengeDay(state), 7)
})
