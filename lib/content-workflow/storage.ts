import {
  createEmptyChallengeState,
  type ChallengeDay,
  type ChallengeStateV2,
  type StepRole,
  type TestFailureCategory,
} from './model'

export const CONTENT_WORKFLOW_STORAGE_KEY = 'tp.content-workflow-7days.v2'
export const CONTENT_WORKFLOW_LEGACY_STORAGE_KEY = 'tp.content-workflow-7days.v1'
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const MAX_TEXT_LENGTH = 20_000
const days = new Set<ChallengeDay>([1, 2, 3, 4, 5, 6, 7])
const roles = new Set<StepRole>(['', 'human', 'ai', 'shared', 'tool'])
const failures = new Set<TestFailureCategory>(['', 'context', 'input', 'instruction', 'handoff', 'role', 'gate', 'contract'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length && actual.every((key, index) => key === expected[index])
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.length <= MAX_TEXT_LENGTH
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && !Number.isNaN(Date.parse(value))
}

function isStringRecord(value: unknown, keys: readonly string[]): boolean {
  return isRecord(value) && exactKeys(value, keys) && keys.every((key) => isText(value[key]))
}

function isWorkflowStage(value: unknown): boolean {
  return isStringRecord(value, ['id', 'name', 'input', 'transformation', 'output', 'humanDecision', 'qualityGate'])
}

function isStepInstruction(value: unknown): boolean {
  return isRecord(value)
    && exactKeys(value, ['id', 'stageId', 'role', 'purpose', 'instruction', 'outputFormat', 'selfCheck', 'handoff'])
    && ['id', 'stageId', 'purpose', 'instruction', 'outputFormat', 'selfCheck', 'handoff'].every((key) => isText(value[key]))
    && typeof value.role === 'string'
    && roles.has(value.role as StepRole)
}

function isTestRunEntry(value: unknown): boolean {
  return isStringRecord(value, ['id', 'stageId', 'output', 'issue', 'intervention'])
}

function isTestRun(value: unknown): boolean {
  return isRecord(value)
    && exactKeys(value, ['runInput', 'entries', 'finalContent', 'outputReview', 'failureCategory', 'biggestFailure', 'changeMade', 'rerunResult'])
    && ['runInput', 'finalContent', 'outputReview', 'biggestFailure', 'changeMade', 'rerunResult'].every((key) => isText(value[key]))
    && typeof value.failureCategory === 'string'
    && failures.has(value.failureCategory as TestFailureCategory)
    && Array.isArray(value.entries)
    && value.entries.length <= 7
    && value.entries.every(isTestRunEntry)
}

function isWorkflowKit(value: unknown): boolean {
  return isRecord(value)
    && exactKeys(value, ['version', 'purpose', 'preparation', 'runGuide', 'commonFailures', 'updateTriggers', 'transferBlueprint'])
    && ['version', 'purpose', 'preparation', 'runGuide', 'commonFailures', 'updateTriggers'].every((key) => isText(value[key]))
    && isStringRecord(value.transferBlueprint, ['workflowName', 'result', 'context', 'outputContract', 'stages', 'humanDecisions', 'testPlan'])
}

function isArtifacts(value: unknown): boolean {
  if (!isRecord(value) || !exactKeys(value, ['workflowBrief', 'contextPack', 'outputContract', 'workflowMap', 'stepInstructions', 'runnableWorkflow', 'testRun', 'workflowKit'])) return false
  if (!isStringRecord(value.workflowBrief, ['workflowName', 'repeatedTask', 'trigger', 'currentInputs', 'finalOutput', 'outputUser', 'currentFriction', 'scope', 'nonGoals'])) return false
  if (!isStringRecord(value.contextPack, ['identityBusiness', 'expertiseOffer', 'intendedAudience', 'knownContext', 'currentAssumptions', 'voice', 'mustDo', 'mustNot', 'references', 'gaps'])) return false
  if (!isStringRecord(value.outputContract, ['audience', 'purpose', 'format', 'structure', 'mustInclude', 'mustAvoid', 'qualityCriteria', 'antiExample'])) return false
  if (!Array.isArray(value.workflowMap) || value.workflowMap.length > 7 || !value.workflowMap.every(isWorkflowStage)) return false
  if (!Array.isArray(value.stepInstructions) || value.stepInstructions.length > 7 || !value.stepInstructions.every(isStepInstruction)) return false
  return isText(value.runnableWorkflow) && isTestRun(value.testRun) && isWorkflowKit(value.workflowKit)
}

function isChallengeState(value: unknown): value is ChallengeStateV2 {
  if (!isRecord(value) || !exactKeys(value, ['schemaVersion', 'updatedAt', 'currentDay', 'completedDays', 'readiness', 'artifacts'])) return false
  if (value.schemaVersion !== 2 || !isIsoTimestamp(value.updatedAt) || typeof value.currentDay !== 'number' || !days.has(value.currentDay as ChallengeDay)) return false
  if (!Array.isArray(value.completedDays) || !value.completedDays.every((day) => typeof day === 'number' && days.has(day as ChallengeDay))) return false
  if (new Set(value.completedDays).size !== value.completedDays.length) return false
  if (!isRecord(value.readiness) || !exactKeys(value.readiness, ['outcome', 'materials', 'aiAccess', 'time']) || !Object.values(value.readiness).every((item) => typeof item === 'boolean')) return false
  return isArtifacts(value.artifacts)
}

export function parseChallengeState(raw: string | null): ChallengeStateV2 {
  if (raw === null) return createEmptyChallengeState()
  try {
    const parsed: unknown = JSON.parse(raw)
    return isChallengeState(parsed) ? parsed : createEmptyChallengeState()
  } catch {
    return createEmptyChallengeState()
  }
}

function browserStorage(): StorageLike | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage
}

export function readChallengeState(storage = browserStorage()): ChallengeStateV2 {
  if (!storage) return createEmptyChallengeState()
  try {
    return parseChallengeState(storage.getItem(CONTENT_WORKFLOW_STORAGE_KEY))
  } catch {
    return createEmptyChallengeState()
  }
}

export function writeChallengeState(state: ChallengeStateV2, storage = browserStorage()): boolean {
  if (!storage || !isChallengeState(state)) return false
  try {
    storage.setItem(CONTENT_WORKFLOW_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearChallengeState(storage = browserStorage()): boolean {
  if (!storage) return false
  try {
    storage.removeItem(CONTENT_WORKFLOW_STORAGE_KEY)
    storage.removeItem(CONTENT_WORKFLOW_LEGACY_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
