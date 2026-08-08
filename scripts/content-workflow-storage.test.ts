import assert from 'node:assert/strict'
import test from 'node:test'

import { buildStarterKitMarkdown, starterKitFilename } from '../lib/content-workflow/export'
import { assembleRunnableWorkflow, createEmptyChallengeState, type ChallengeStateV2 } from '../lib/content-workflow/model'
import {
  CONTENT_WORKFLOW_LEGACY_STORAGE_KEY,
  CONTENT_WORKFLOW_STORAGE_KEY,
  clearChallengeState,
  parseChallengeState,
  readChallengeState,
  writeChallengeState,
  type StorageLike,
} from '../lib/content-workflow/storage'

function populatedState(): ChallengeStateV2 {
  const state = createEmptyChallengeState(new Date('2026-08-08T01:02:03.000Z'))
  state.currentDay = 6
  state.completedDays = [1, 2, 3, 4, 5]
  state.readiness = { outcome: true, materials: true, aiAccess: true, time: true }
  state.artifacts.workflowBrief = {
    workflowName: '<script>alert("x")</script> Workflow bài học',
    repeatedTask: 'Biến một khái niệm thành bài học.', trigger: 'Khi chọn được khái niệm.',
    currentInputs: 'Khái niệm, ghi chú.', finalOutput: 'Bài học hoàn chỉnh.', outputUser: 'First-Time Builder.',
    currentFriction: 'Bắt đầu từ trang trắng.', scope: 'Một bài học chữ.', nonGoals: 'Không tạo video.',
  }
  state.artifacts.contextPack = {
    identityBusiness: 'Conan School', expertiseOffer: 'Giúp người mới xây doanh nghiệp.', intendedAudience: 'First-Time Builder.',
    knownContext: 'Học bằng cách xây.', currentAssumptions: 'Đã dùng AI theo từng task.', voice: 'Rõ ràng, thực tế.',
    mustDo: 'Dùng tiếng Việt.', mustNot: 'Không bịa thông tin.', references: 'Trang chủ Conan School.', gaps: 'Cần phản hồi sau khi thử.',
  }
  state.artifacts.outputContract = {
    audience: 'Người mới.', purpose: 'Hiểu concept và làm được.', format: 'Bài học web.', structure: 'Bài toán, lý thuyết, thực hành.',
    mustInclude: 'Ví dụ và sản phẩm.', mustAvoid: 'Thuật ngữ không giải thích.', qualityCriteria: 'Tự làm không cần hướng dẫn.', antiExample: 'Chỉ có lý thuyết.',
  }
  state.artifacts.workflowMap = Array.from({ length: 4 }, (_, index) => ({
    id: `stage-${index + 1}`, name: `Bước ${index + 1}`, input: 'Đầu vào rõ ràng.', transformation: 'Thao tác chuyển đổi.',
    output: 'Đầu ra kiểm tra được.', humanDecision: index === 1 ? 'Con người chọn phương án.' : 'Không có quyết định thêm.',
    qualityGate: index < 2 ? `Cổng ${index + 1}` : '',
  }))
  state.artifacts.stepInstructions = state.artifacts.workflowMap.map((stage, index) => ({
    id: `instruction-${index + 1}`, stageId: stage.id, role: index === 1 ? 'human' : 'shared',
    purpose: 'Hoàn thành đúng bước.', instruction: 'Dùng dữ liệu được cung cấp để xử lý.',
    outputFormat: 'Một đoạn có nhãn.', selfCheck: 'Không thêm thông tin.', handoff: 'Chuyển toàn bộ sang bước sau.',
  }))
  state.artifacts.runnableWorkflow = assembleRunnableWorkflow(state)
  state.artifacts.testRun = {
    runInput: 'Một khái niệm mẫu.',
    entries: state.artifacts.workflowMap.map((stage, index) => ({ id: `run-${index + 1}`, stageId: stage.id, output: 'Đầu ra thử nghiệm.', issue: 'Một vấn đề được ghi nhận.', intervention: 'Một can thiệp rõ ràng.' })),
    finalContent: 'Đây là đầu ra cuối cùng đủ dài để người dùng đọc, kiểm tra và so sánh với hợp đồng đầu ra đã đặt ra từ trước.'.repeat(2),
    outputReview: 'Đạt cấu trúc nhưng ví dụ còn chung.', failureCategory: 'instruction', biggestFailure: 'Hướng dẫn còn quá rộng.',
    changeMade: 'Bổ sung tiêu chí phân biệt.', rerunResult: 'Kết quả chạy lại rõ ràng hơn.',
  }
  state.artifacts.workflowKit = {
    version: '1.0', purpose: 'Tạo bài học.', preparation: 'Chuẩn bị khái niệm và bối cảnh.', runGuide: 'Chạy từng bước và dừng để duyệt.',
    commonFailures: 'Thiếu bối cảnh.', updateTriggers: 'Đổi khi đối tượng thay đổi.',
    transferBlueprint: {
      workflowName: 'Workflow xử lý biên bản họp', result: 'Danh sách việc có người phụ trách.', context: 'Dự án và thành viên.',
      outputContract: 'Mỗi việc có chủ sở hữu.', stages: 'Nhận, tách, kiểm, gửi.', humanDecisions: 'Xác nhận người chịu trách nhiệm.', testPlan: 'Thử với một cuộc họp.',
    },
  }
  return state
}

class MemoryStorage implements StorageLike {
  data = new Map<string, string>()
  calls: Array<[method: string, key: string]> = []
  getItem(key: string) { this.calls.push(['get', key]); return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.calls.push(['set', key]); this.data.set(key, value) }
  removeItem(key: string) { this.calls.push(['remove', key]); this.data.delete(key) }
}

test('schema v2 uses a new isolated key and round-trips exactly', () => {
  assert.equal(CONTENT_WORKFLOW_STORAGE_KEY, 'tp.content-workflow-7days.v2')
  assert.equal(CONTENT_WORKFLOW_LEGACY_STORAGE_KEY, 'tp.content-workflow-7days.v1')
  const state = populatedState()
  assert.deepEqual(parseChallengeState(JSON.stringify(state)), state)
})

test('parser fails closed for malformed, legacy, duplicate or unsafe data', () => {
  const state = populatedState()
  const invalidValues: unknown[] = [
    null, [], { ...state, schemaVersion: 1 }, { ...state, updatedAt: 'not-a-date' }, { ...state, currentDay: 8 },
    { ...state, completedDays: [1, 1] }, { ...state, readiness: { outcome: true } }, { ...state, unexpected: true },
    { ...state, artifacts: { ...state.artifacts, unexpected: true } },
    { ...state, artifacts: { ...state.artifacts, workflowMap: Array.from({ length: 8 }, () => state.artifacts.workflowMap[0]) } },
    { ...state, artifacts: { ...state.artifacts, runnableWorkflow: 'x'.repeat(20_001) } },
    { ...state, artifacts: { ...state.artifacts, workflowBrief: { ...state.artifacts.workflowBrief, scope: 12 } } },
  ]
  for (const invalid of invalidValues) {
    const parsed = parseChallengeState(JSON.stringify(invalid))
    assert.equal(parsed.schemaVersion, 2)
    assert.equal(parsed.currentDay, 1)
    assert.deepEqual(parsed.completedDays, [])
  }
  assert.equal(parseChallengeState('{broken').currentDay, 1)
})

test('read and write touch v2 only, while reset clears v1 and v2 explicitly', () => {
  const storage = new MemoryStorage()
  const state = populatedState()
  storage.data.set(CONTENT_WORKFLOW_LEGACY_STORAGE_KEY, '{"schemaVersion":1}')
  assert.equal(writeChallengeState(state, storage), true)
  assert.deepEqual(storage.calls, [['set', CONTENT_WORKFLOW_STORAGE_KEY]])
  assert.deepEqual(readChallengeState(storage), state)
  assert.deepEqual(storage.calls.at(-1), ['get', CONTENT_WORKFLOW_STORAGE_KEY])
  assert.equal(clearChallengeState(storage), true)
  assert.deepEqual(storage.calls.slice(-2), [['remove', CONTENT_WORKFLOW_STORAGE_KEY], ['remove', CONTENT_WORKFLOW_LEGACY_STORAGE_KEY]])
  assert.equal(storage.data.size, 0)
})

test('storage failures never throw and return safe status values', () => {
  const broken: StorageLike = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') }, removeItem() { throw new Error('blocked') } }
  assert.doesNotThrow(() => readChallengeState(broken))
  assert.equal(readChallengeState(broken).currentDay, 1)
  assert.equal(writeChallengeState(populatedState(), broken), false)
  assert.equal(clearChallengeState(broken), false)
})

test('Markdown export contains seven artifacts, transfer blueprint and safe text', () => {
  const markdown = buildStarterKitMarkdown(populatedState())
  for (const heading of [
    'Bản mô tả quy trình', 'Hồ sơ bối cảnh', 'Hợp đồng đầu ra', 'Bản đồ quy trình',
    'Quy trình có thể chạy', 'Nhật ký chạy thử', 'Bộ quy trình hoàn chỉnh', 'Bản thiết kế chuyển giao',
  ]) assert.match(markdown, new RegExp(`## ${heading}`))
  assert.doesNotMatch(markdown, /<script>/i)
  assert.match(markdown, /&lt;script&gt;/)
  assert.match(markdown, /Dữ liệu được tải từ trình duyệt/)
  assert.doesNotMatch(markdown, /failureCategory|stepInstructions|shared/)
  assert.match(markdown, /Lỗi ở hướng dẫn/)
  assert.match(markdown, /AI và con người cùng làm/)
})

test('filename is deterministic, UTC-safe and filesystem friendly', () => {
  assert.equal(starterKitFilename(new Date('2026-08-08T01:02:03.456Z')), 'bo-workflow-7-ngay-2026-08-08T01-02-03Z.md')
})
