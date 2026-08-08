export type ChallengeDay = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ReadinessKey = 'outcome' | 'materials' | 'aiAccess' | 'time'
export type StepRole = '' | 'human' | 'ai' | 'shared' | 'tool'
export type TestFailureCategory = '' | 'context' | 'input' | 'instruction' | 'handoff' | 'role' | 'gate' | 'contract'

export type WorkflowBrief = {
  workflowName: string
  repeatedTask: string
  trigger: string
  currentInputs: string
  finalOutput: string
  outputUser: string
  currentFriction: string
  scope: string
  nonGoals: string
}

export type ContextPack = {
  identityBusiness: string
  expertiseOffer: string
  intendedAudience: string
  knownContext: string
  currentAssumptions: string
  voice: string
  mustDo: string
  mustNot: string
  references: string
  gaps: string
}

export type OutputContract = {
  audience: string
  purpose: string
  format: string
  structure: string
  mustInclude: string
  mustAvoid: string
  qualityCriteria: string
  antiExample: string
}

export type WorkflowStage = {
  id: string
  name: string
  input: string
  transformation: string
  output: string
  humanDecision: string
  qualityGate: string
}

export type StepInstruction = {
  id: string
  stageId: string
  role: StepRole
  purpose: string
  instruction: string
  outputFormat: string
  selfCheck: string
  handoff: string
}

export type TestRunEntry = {
  id: string
  stageId: string
  output: string
  issue: string
  intervention: string
}

export type TestRun = {
  runInput: string
  entries: TestRunEntry[]
  finalContent: string
  outputReview: string
  failureCategory: TestFailureCategory
  biggestFailure: string
  changeMade: string
  rerunResult: string
}

export type TransferBlueprint = {
  workflowName: string
  result: string
  context: string
  outputContract: string
  stages: string
  humanDecisions: string
  testPlan: string
}

export type WorkflowKit = {
  version: string
  purpose: string
  preparation: string
  runGuide: string
  commonFailures: string
  updateTriggers: string
  transferBlueprint: TransferBlueprint
}

export type ChallengeArtifactsV2 = {
  workflowBrief: WorkflowBrief
  contextPack: ContextPack
  outputContract: OutputContract
  workflowMap: WorkflowStage[]
  stepInstructions: StepInstruction[]
  runnableWorkflow: string
  testRun: TestRun
  workflowKit: WorkflowKit
}

export type ChallengeStateV2 = {
  schemaVersion: 2
  updatedAt: string
  currentDay: ChallengeDay
  completedDays: ChallengeDay[]
  readiness: Record<ReadinessKey, boolean>
  artifacts: ChallengeArtifactsV2
}

export type ValidationError = { field: string; message: string }
export type DayValidation = { valid: boolean; errors: ValidationError[] }

export const ARTIFACT_KEYS = [
  'workflowBrief',
  'contextPack',
  'outputContract',
  'workflowMap',
  'runnableWorkflow',
  'testRun',
  'workflowKit',
] as const

export type ArtifactKey = (typeof ARTIFACT_KEYS)[number]
export type ArtifactCoverage = Record<ArtifactKey, boolean>

export function createEmptyChallengeState(now = new Date()): ChallengeStateV2 {
  return {
    schemaVersion: 2,
    updatedAt: now.toISOString(),
    currentDay: 1,
    completedDays: [],
    readiness: { outcome: false, materials: false, aiAccess: false, time: false },
    artifacts: {
      workflowBrief: {
        workflowName: '', repeatedTask: '', trigger: '', currentInputs: '', finalOutput: '', outputUser: '', currentFriction: '', scope: '', nonGoals: '',
      },
      contextPack: {
        identityBusiness: '', expertiseOffer: '', intendedAudience: '', knownContext: '', currentAssumptions: '', voice: '', mustDo: '', mustNot: '', references: '', gaps: '',
      },
      outputContract: {
        audience: '', purpose: '', format: '', structure: '', mustInclude: '', mustAvoid: '', qualityCriteria: '', antiExample: '',
      },
      workflowMap: [],
      stepInstructions: [],
      runnableWorkflow: '',
      testRun: {
        runInput: '', entries: [], finalContent: '', outputReview: '', failureCategory: '', biggestFailure: '', changeMade: '', rerunResult: '',
      },
      workflowKit: {
        version: '', purpose: '', preparation: '', runGuide: '', commonFailures: '', updateTriggers: '',
        transferBlueprint: { workflowName: '', result: '', context: '', outputContract: '', stages: '', humanDecisions: '', testPlan: '' },
      },
    },
  }
}

function hasText(value: unknown, minimum = 3): value is string {
  return typeof value === 'string' && value.trim().length >= minimum
}

function error(field: string, message: string): ValidationError {
  return { field, message }
}

function allText<T extends object>(value: T, keys: readonly (keyof T)[]): boolean {
  return keys.every((key) => hasText(value[key]))
}

function validWorkflowBrief(value: WorkflowBrief): boolean {
  return allText(value, ['workflowName', 'repeatedTask', 'trigger', 'currentInputs', 'finalOutput', 'outputUser', 'currentFriction', 'scope', 'nonGoals'])
}

function validContextPack(value: ContextPack): boolean {
  return allText(value, ['identityBusiness', 'expertiseOffer', 'intendedAudience', 'knownContext', 'currentAssumptions', 'voice', 'mustDo', 'mustNot', 'references', 'gaps'])
}

function validOutputContract(value: OutputContract): boolean {
  return allText(value, ['audience', 'purpose', 'format', 'structure', 'mustInclude', 'mustAvoid', 'qualityCriteria', 'antiExample'])
}

function validStage(value: WorkflowStage): boolean {
  return allText(value, ['id', 'name', 'input', 'transformation', 'output', 'humanDecision'])
}

function validWorkflowMap(stages: WorkflowStage[]): boolean {
  if (stages.length < 4 || stages.length > 7 || !stages.every(validStage)) return false
  if (new Set(stages.map(({ id }) => id)).size !== stages.length) return false
  return stages.filter(({ qualityGate }) => hasText(qualityGate)).length >= 2
}

function validStepInstructions(state: ChallengeStateV2): boolean {
  const { workflowMap, stepInstructions } = state.artifacts
  if (!validWorkflowMap(workflowMap) || stepInstructions.length !== workflowMap.length) return false
  if (new Set(stepInstructions.map(({ id }) => id)).size !== stepInstructions.length) return false
  const stageIds = new Set(workflowMap.map(({ id }) => id))
  const coveredIds = new Set(stepInstructions.map(({ stageId }) => stageId))
  if (coveredIds.size !== stageIds.size || [...coveredIds].some((id) => !stageIds.has(id))) return false
  return stepInstructions.every((item) => item.role !== '' && allText(item, ['id', 'stageId', 'purpose', 'instruction', 'outputFormat', 'selfCheck', 'handoff']))
}

function validRunnableWorkflow(state: ChallengeStateV2): boolean {
  const normalizedWorkflow = state.artifacts.runnableWorkflow.toLocaleLowerCase('vi')
  return validStepInstructions(state)
    && hasText(state.artifacts.runnableWorkflow, 300)
    && state.artifacts.workflowMap.every(({ name }) => normalizedWorkflow.includes(name.toLocaleLowerCase('vi')))
}

function validTestRun(state: ChallengeStateV2): boolean {
  const { testRun, workflowMap } = state.artifacts
  if (!validRunnableWorkflow(state) || testRun.entries.length !== workflowMap.length) return false
  const stageIds = new Set(workflowMap.map(({ id }) => id))
  const coveredIds = new Set(testRun.entries.map(({ stageId }) => stageId))
  return coveredIds.size === stageIds.size
    && [...coveredIds].every((id) => stageIds.has(id))
    && testRun.entries.every((entry) => allText(entry, ['id', 'stageId', 'output', 'issue', 'intervention']))
    && hasText(testRun.runInput, 8)
    && hasText(testRun.finalContent, 100)
    && hasText(testRun.outputReview, 8)
    && testRun.failureCategory !== ''
    && hasText(testRun.biggestFailure, 8)
    && hasText(testRun.changeMade, 8)
    && hasText(testRun.rerunResult, 8)
}

function validWorkflowKit(state: ChallengeStateV2): boolean {
  const { workflowKit, workflowBrief } = state.artifacts
  const transfer = workflowKit.transferBlueprint
  return validTestRun(state)
    && allText(workflowKit, ['version', 'purpose', 'preparation', 'runGuide', 'commonFailures', 'updateTriggers'])
    && allText(transfer, ['workflowName', 'result', 'context', 'outputContract', 'stages', 'humanDecisions', 'testPlan'])
    && transfer.workflowName.trim().toLocaleLowerCase('vi') !== workflowBrief.workflowName.trim().toLocaleLowerCase('vi')
}

export function getArtifactCoverage(state: ChallengeStateV2): ArtifactCoverage {
  return {
    workflowBrief: validWorkflowBrief(state.artifacts.workflowBrief),
    contextPack: validContextPack(state.artifacts.contextPack),
    outputContract: validOutputContract(state.artifacts.outputContract),
    workflowMap: validWorkflowMap(state.artifacts.workflowMap),
    runnableWorkflow: validRunnableWorkflow(state),
    testRun: validTestRun(state),
    workflowKit: validWorkflowKit(state),
  }
}

export function canCompleteChallenge(state: ChallengeStateV2): boolean {
  return Object.values(getArtifactCoverage(state)).every(Boolean)
}

export function validateDay(day: ChallengeDay, state: ChallengeStateV2): DayValidation {
  const coverage = getArtifactCoverage(state)
  const errors: ValidationError[] = []
  const dayArtifact: Record<ChallengeDay, ArtifactKey> = {
    1: 'workflowBrief', 2: 'contextPack', 3: 'outputContract', 4: 'workflowMap', 5: 'runnableWorkflow', 6: 'testRun', 7: 'workflowKit',
  }
  const messages: Record<ChallengeDay, string> = {
    1: 'Hoàn thành bản mô tả quy trình với một công việc lặp lại, đầu vào, đầu ra và phạm vi rõ ràng.',
    2: 'Hoàn thành hồ sơ bối cảnh bằng dữ liệu, nhận định hoặc tài liệu bạn đang có.',
    3: 'Hoàn thành hợp đồng đầu ra để biết thế nào là một kết quả đạt yêu cầu.',
    4: 'Tạo từ bốn đến bảy bước, mỗi bước đủ đầu vào và đầu ra, cùng ít nhất hai cổng chất lượng.',
    5: 'Viết hướng dẫn cho từng bước và tạo bản quy trình có thể chạy được.',
    6: 'Ghi đầy đủ lần chạy thử, lỗi lớn nhất, thay đổi đã làm và kết quả chạy lại.',
    7: 'Đóng gói quy trình và chứng minh khả năng chuyển cấu trúc sang một công việc khác.',
  }
  if (!coverage[dayArtifact[day]]) errors.push(error(dayArtifact[day], messages[day]))
  if (day === 7 && !canCompleteChallenge(state)) {
    errors.push(error('artifacts', 'Hoàn thành đủ bảy sản phẩm để đóng gói quy trình.'))
  }
  return { valid: errors.length === 0, errors }
}

export function nextChallengeDay(state: ChallengeStateV2): ChallengeDay {
  if (!state.completedDays.includes(state.currentDay)) return state.currentDay
  const firstIncomplete = ([1, 2, 3, 4, 5, 6, 7] as const).find((day) => !state.completedDays.includes(day))
  return firstIncomplete ?? 7
}

function section(label: string, value: string): string {
  return `${label}:\n${value.trim() || '[CHƯA CÓ DỮ LIỆU]'}`
}

function stepRoleLabel(role: StepRole): string {
  return ({ human: 'Con người thực hiện', ai: 'AI thực hiện', shared: 'AI và con người cùng làm', tool: 'Công cụ thực hiện', '': '' } as const)[role]
}

export function assembleRunnableWorkflow(state: ChallengeStateV2): string {
  const { workflowBrief: brief, contextPack: context, outputContract: contract, workflowMap, stepInstructions } = state.artifacts
  const instructions = workflowMap.map((stage, index) => {
    const item = stepInstructions.find((instruction) => instruction.stageId === stage.id)
    return `BƯỚC ${index + 1} — ${stage.name.toLocaleUpperCase('vi')}
${section('Vai trò thực hiện', stepRoleLabel(item?.role ?? ''))}
${section('Mục đích', item?.purpose ?? '')}
${section('Đầu vào', stage.input)}
${section('Cách thực hiện', item?.instruction ?? '')}
${section('Đầu ra', stage.output)}
${section('Định dạng đầu ra', item?.outputFormat ?? '')}
${section('Tự kiểm tra', item?.selfCheck ?? '')}
${section('Cổng chất lượng', stage.qualityGate)}
${section('Bàn giao', item?.handoff ?? '')}
${stage.humanDecision.trim() ? `ĐIỂM CON NGƯỜI QUYẾT ĐỊNH:\n${stage.humanDecision.trim()}` : ''}`
  }).join('\n\n')

  return `QUY TRÌNH CÓ THỂ CHẠY (RUNNABLE WORKFLOW) — ${brief.workflowName || '[CHƯA ĐẶT TÊN]'}

NGUYÊN TẮC AN TOÀN
Chỉ dùng dữ liệu trong hồ sơ bối cảnh và đầu vào được cung cấp. Không thêm dữ liệu hoặc tuyên bố chưa được cung cấp. Nếu thiếu dữ liệu quan trọng, hãy nêu rõ phần thiếu và hỏi lại trước khi tiếp tục.

KẾT QUẢ CẦN TẠO
${section('Mục đích', contract.purpose)}
${section('Người sử dụng đầu ra', contract.audience)}
${section('Định dạng', contract.format)}
${section('Cấu trúc', contract.structure)}
${section('Phải có', contract.mustInclude)}
${section('Phải tránh', contract.mustAvoid)}
${section('Tiêu chí chất lượng', contract.qualityCriteria)}
${section('Ví dụ không đạt', contract.antiExample)}

HỒ SƠ BỐI CẢNH
${section('Doanh nghiệp hoặc dự án', context.identityBusiness)}
${section('Chuyên môn hoặc sản phẩm', context.expertiseOffer)}
${section('Người nhận', context.intendedAudience)}
${section('Điều đã biết', context.knownContext)}
${section('Nhận định hiện tại', context.currentAssumptions)}
${section('Giọng điệu', context.voice)}
${section('Phải làm', context.mustDo)}
${section('Không được làm', context.mustNot)}
${section('Tài liệu tham chiếu', context.references)}
${section('Khoảng trống cần xác nhận', context.gaps)}

QUY TRÌNH THỰC HIỆN
${instructions}`
}

const stepRoles = new Set<StepRole>(['', 'human', 'ai', 'shared', 'tool'])
const failureCategories = new Set<TestFailureCategory>(['', 'context', 'input', 'instruction', 'handoff', 'role', 'gate', 'contract'])
const challengeDays = new Set<ChallengeDay>([1, 2, 3, 4, 5, 6, 7])

export function isChallengeStateV2(value: unknown): value is ChallengeStateV2 {
  if (!value || typeof value !== 'object') return false
  const state = value as ChallengeStateV2
  if (state.schemaVersion !== 2 || !hasText(state.updatedAt, 10) || !challengeDays.has(state.currentDay)) return false
  if (!Array.isArray(state.completedDays) || state.completedDays.some((day) => !challengeDays.has(day))) return false
  if (!state.readiness || typeof state.readiness !== 'object') return false
  if (!(['outcome', 'materials', 'aiAccess', 'time'] as const).every((key) => typeof state.readiness[key] === 'boolean')) return false
  const artifacts = state.artifacts
  if (!artifacts || typeof artifacts !== 'object') return false
  if (!artifacts.workflowBrief || !artifacts.contextPack || !artifacts.outputContract || !artifacts.testRun || !artifacts.workflowKit) return false
  if (!Array.isArray(artifacts.workflowMap) || artifacts.workflowMap.length > 7) return false
  if (!Array.isArray(artifacts.stepInstructions) || artifacts.stepInstructions.length > 7) return false
  if (typeof artifacts.runnableWorkflow !== 'string') return false
  if (!artifacts.workflowMap.every((stage) => stage && typeof stage === 'object' && ['id', 'name', 'input', 'transformation', 'output', 'humanDecision', 'qualityGate'].every((key) => typeof stage[key as keyof WorkflowStage] === 'string'))) return false
  if (!artifacts.stepInstructions.every((item) => item && typeof item === 'object' && stepRoles.has(item.role) && ['id', 'stageId', 'purpose', 'instruction', 'outputFormat', 'selfCheck', 'handoff'].every((key) => typeof item[key as keyof StepInstruction] === 'string'))) return false
  if (!Array.isArray(artifacts.testRun.entries) || artifacts.testRun.entries.length > 7 || !failureCategories.has(artifacts.testRun.failureCategory)) return false
  return true
}
