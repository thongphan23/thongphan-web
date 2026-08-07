import {
  createEmptyChallengeState,
  type ChallengeDay,
  type ChallengeStateV1,
  type ContentJobType,
  type DraftScore,
  type PublishStatus,
} from './model'

export const CONTENT_WORKFLOW_STORAGE_KEY = 'tp.content-workflow-7days.v1'
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const MAX_TEXT_LENGTH = 20_000
const days = new Set([1, 2, 3, 4, 5, 6, 7])
const jobs = new Set<ContentJobType>(['', 'recognize-problem', 'understand-cause', 'try-next-step'])
const publishStatuses = new Set<PublishStatus>(['', 'published', 'sent'])

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

function isDay(value: unknown): value is ChallengeDay {
  return typeof value === 'number' && days.has(value)
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && !Number.isNaN(Date.parse(value))
}

function isStringRecord(value: unknown, keys: readonly string[]): value is Record<string, string> {
  return isRecord(value) && exactKeys(value, keys) && keys.every((key) => isText(value[key]))
}

function isEvidence(value: unknown): boolean {
  return isStringRecord(value, ['id', 'evidence', 'context', 'source', 'insight'])
}

function isContentJob(value: unknown): boolean {
  return isRecord(value)
    && exactKeys(value, ['selectedEvidence', 'job', 'beliefBefore', 'expectedShift', 'nextAction'])
    && isText(value.selectedEvidence)
    && typeof value.job === 'string'
    && jobs.has(value.job as ContentJobType)
    && isText(value.beliefBefore)
    && isText(value.expectedShift)
    && isText(value.nextAction)
}

function isContentBrief(value: unknown): boolean {
  const keys = [
    'businessOffer', 'customer', 'situation', 'currentBelief', 'desiredUnderstanding', 'contentJob', 'coreMessage',
    'customerEvidence', 'supportingProof', 'voiceConstraints', 'mustInclude', 'mustAvoid', 'callToAction', 'format', 'channel',
  ] as const
  return isRecord(value)
    && exactKeys(value, keys)
    && keys.every((key) => isText(value[key]))
    && jobs.has(value.contentJob as ContentJobType)
}

function isDraft(value: unknown): boolean {
  const scoreKeys = ['rightCustomer', 'rightProblem', 'oneMainIdea', 'hasEvidence', 'specific', 'nextStepFits'] as const
  if (!isRecord(value) || !exactKeys(value, ['id', 'draft', 'scores', 'revisionNote'])) return false
  if (!isText(value.id) || !isText(value.draft) || !isText(value.revisionNote) || !isRecord(value.scores)) return false
  const scores = value.scores
  return exactKeys(scores, scoreKeys)
    && scoreKeys.every((key) => [0, 1, 2].includes(scores[key] as DraftScore))
}

function isOnePager(value: unknown): boolean {
  const keys = [
    'goal', 'inputs', 'steps', 'standards', 'aiRole', 'humanRole', 'cadence', 'publishStatus',
    'publishedUrlOrNote', 'signalNote', 'selectedDraft',
  ] as const
  return isRecord(value)
    && exactKeys(value, keys)
    && keys.every((key) => isText(value[key]))
    && publishStatuses.has(value.publishStatus as PublishStatus)
}

function isPlanItem(value: unknown): boolean {
  return isRecord(value)
    && exactKeys(value, ['id', 'evidence', 'job', 'publishDate'])
    && isText(value.id)
    && isText(value.evidence)
    && typeof value.job === 'string'
    && jobs.has(value.job as ContentJobType)
    && isText(value.publishDate)
}

function isArtifacts(value: unknown): boolean {
  const keys = [
    'customerFocus', 'evidenceBank', 'evidencePlan', 'contentJob', 'contentBrief', 'workflowPrompt',
    'drafts', 'workflowFeedback', 'onePager', 'fourteenDayPlan',
  ] as const
  if (!isRecord(value) || !exactKeys(value, keys)) return false
  if (!isStringRecord(value.customerFocus, [
    'business', 'offer', 'customerGroup', 'currentSituation', 'primaryProblem', 'desiredMovement', 'focusStatement',
  ])) return false
  if (!Array.isArray(value.evidenceBank) || value.evidenceBank.length > 20 || !value.evidenceBank.every(isEvidence)) return false
  if (!isText(value.evidencePlan) || !isContentJob(value.contentJob) || !isContentBrief(value.contentBrief)) return false
  if (!isText(value.workflowPrompt) || !Array.isArray(value.drafts) || value.drafts.length !== 3 || !value.drafts.every(isDraft)) return false
  if (!isText(value.workflowFeedback) || !isOnePager(value.onePager)) return false
  return Array.isArray(value.fourteenDayPlan)
    && value.fourteenDayPlan.length <= 14
    && value.fourteenDayPlan.every(isPlanItem)
}

function isChallengeState(value: unknown): value is ChallengeStateV1 {
  if (!isRecord(value) || !exactKeys(value, ['schemaVersion', 'updatedAt', 'currentDay', 'completedDays', 'readiness', 'artifacts'])) return false
  if (value.schemaVersion !== 1 || !isIsoTimestamp(value.updatedAt) || !isDay(value.currentDay)) return false
  if (!Array.isArray(value.completedDays) || !value.completedDays.every(isDay)) return false
  if (new Set(value.completedDays).size !== value.completedDays.length) return false
  if (!isRecord(value.readiness) || !exactKeys(value.readiness, ['offer', 'customer', 'evidence', 'channel'])) return false
  if (!Object.values(value.readiness).every((item) => typeof item === 'boolean')) return false
  return isArtifacts(value.artifacts)
}

export function parseChallengeState(raw: string | null): ChallengeStateV1 {
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

export function readChallengeState(storage = browserStorage()): ChallengeStateV1 {
  if (!storage) return createEmptyChallengeState()
  try {
    return parseChallengeState(storage.getItem(CONTENT_WORKFLOW_STORAGE_KEY))
  } catch {
    return createEmptyChallengeState()
  }
}

export function writeChallengeState(state: ChallengeStateV1, storage = browserStorage()): boolean {
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
    return true
  } catch {
    return false
  }
}
