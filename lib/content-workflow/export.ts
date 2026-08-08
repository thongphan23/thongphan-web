import type { ChallengeStateV2, StepRole, TestFailureCategory } from './model'

const roleLabels: Record<Exclude<StepRole, ''>, string> = {
  human: 'Con người thực hiện', ai: 'AI thực hiện', shared: 'AI và con người cùng làm', tool: 'Công cụ thực hiện',
}
const failureLabels: Record<Exclude<TestFailureCategory, ''>, string> = {
  context: 'Lỗi ở bối cảnh', input: 'Lỗi ở đầu vào', instruction: 'Lỗi ở hướng dẫn', handoff: 'Lỗi khi bàn giao',
  role: 'Lỗi phân vai', gate: 'Lỗi ở cổng chất lượng', contract: 'Lỗi ở hợp đồng đầu ra',
}

function safe(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
function line(label: string, value: string): string {
  return `- **${label}:** ${safe(value.trim()) || '_Chưa hoàn thành_'}`
}
function block(value: string): string {
  return (safe(value.trim()) || '_Chưa hoàn thành_').split('\n').map((row) => `    ${row}`).join('\n')
}

export function buildStarterKitMarkdown(state: ChallengeStateV2): string {
  const { workflowBrief: brief, contextPack: context, outputContract: contract, workflowMap, stepInstructions, runnableWorkflow, testRun, workflowKit } = state.artifacts
  const stages = workflowMap.length === 0 ? '_Chưa có bước._' : workflowMap.map((stage, index) => {
    const instruction = stepInstructions.find((item) => item.stageId === stage.id)
    return [`### Bước ${index + 1}: ${safe(stage.name)}`, line('Đầu vào', stage.input), line('Chuyển đổi', stage.transformation), line('Đầu ra', stage.output), line('Quyết định của con người', stage.humanDecision), line('Cổng chất lượng', stage.qualityGate), line('Vai trò', instruction?.role ? roleLabels[instruction.role] : ''), line('Hướng dẫn', instruction?.instruction ?? ''), line('Tự kiểm tra', instruction?.selfCheck ?? '')].join('\n')
  }).join('\n\n')
  const runEntries = testRun.entries.length === 0 ? '_Chưa chạy thử._' : testRun.entries.map((entry, index) => [`### Bước thử ${index + 1}`, line('Đầu ra', entry.output), line('Vấn đề', entry.issue), line('Can thiệp', entry.intervention)].join('\n')).join('\n\n')
  const transfer = workflowKit.transferBlueprint

  return `# Bộ quy trình 7 ngày v${safe(workflowKit.version || '1.0')}

> Dữ liệu được tải từ trình duyệt của bạn. Hãy giữ tệp này ở nơi an toàn và tự xác minh mọi thông tin trước khi sử dụng hoặc xuất bản.

## Bản mô tả quy trình

${line('Tên quy trình', brief.workflowName)}
${line('Công việc lặp lại', brief.repeatedTask)}
${line('Điểm kích hoạt', brief.trigger)}
${line('Đầu vào hiện có', brief.currentInputs)}
${line('Đầu ra cuối', brief.finalOutput)}
${line('Người dùng đầu ra', brief.outputUser)}
${line('Vướng mắc hiện tại', brief.currentFriction)}
${line('Phạm vi', brief.scope)}
${line('Không làm', brief.nonGoals)}

## Hồ sơ bối cảnh

${line('Doanh nghiệp hoặc dự án', context.identityBusiness)}
${line('Chuyên môn hoặc sản phẩm', context.expertiseOffer)}
${line('Người nhận', context.intendedAudience)}
${line('Điều đã biết', context.knownContext)}
${line('Nhận định hiện tại', context.currentAssumptions)}
${line('Giọng điệu', context.voice)}
${line('Phải làm', context.mustDo)}
${line('Không được làm', context.mustNot)}
${line('Tài liệu tham chiếu', context.references)}
${line('Khoảng trống', context.gaps)}

## Hợp đồng đầu ra

${line('Người dùng', contract.audience)}
${line('Mục đích', contract.purpose)}
${line('Định dạng', contract.format)}
${line('Cấu trúc', contract.structure)}
${line('Phải có', contract.mustInclude)}
${line('Phải tránh', contract.mustAvoid)}
${line('Tiêu chí chất lượng', contract.qualityCriteria)}
${line('Ví dụ không đạt', contract.antiExample)}

## Bản đồ quy trình

${stages}

## Quy trình có thể chạy

${block(runnableWorkflow)}

## Nhật ký chạy thử

${line('Đầu vào thử', testRun.runInput)}
${runEntries}

${line('Đánh giá đầu ra', testRun.outputReview)}
${line('Loại lỗi chính', testRun.failureCategory ? failureLabels[testRun.failureCategory] : '')}
${line('Lỗi lớn nhất', testRun.biggestFailure)}
${line('Thay đổi đã làm', testRun.changeMade)}
${line('Kết quả chạy lại', testRun.rerunResult)}

## Bộ quy trình hoàn chỉnh

${line('Phiên bản', workflowKit.version)}
${line('Mục đích', workflowKit.purpose)}
${line('Chuẩn bị', workflowKit.preparation)}
${line('Cách chạy', workflowKit.runGuide)}
${line('Lỗi thường gặp', workflowKit.commonFailures)}
${line('Khi nào cần cập nhật', workflowKit.updateTriggers)}

## Bản thiết kế chuyển giao

${line('Quy trình mới', transfer.workflowName)}
${line('Kết quả', transfer.result)}
${line('Bối cảnh', transfer.context)}
${line('Hợp đồng đầu ra', transfer.outputContract)}
${line('Các bước', transfer.stages)}
${line('Điểm con người quyết định', transfer.humanDecisions)}
${line('Kế hoạch chạy thử', transfer.testPlan)}
`
}

export function starterKitFilename(now = new Date()): string {
  const stamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z').replaceAll(':', '-')
  return `bo-workflow-7-ngay-${stamp}.md`
}
