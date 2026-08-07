export type ChallengeDay = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ReadinessKey = 'offer' | 'customer' | 'evidence' | 'channel'
export type ContentJobType = '' | 'recognize-problem' | 'understand-cause' | 'try-next-step'
export type DraftScore = 0 | 1 | 2
export type PublishStatus = '' | 'published' | 'sent'

export type CustomerFocus = {
  business: string
  offer: string
  customerGroup: string
  currentSituation: string
  primaryProblem: string
  desiredMovement: string
  focusStatement: string
}

export type EvidenceItem = {
  id: string
  evidence: string
  context: string
  source: string
  insight: string
}

export type ContentJob = {
  selectedEvidence: string
  job: ContentJobType
  beliefBefore: string
  expectedShift: string
  nextAction: string
}

export type ContentBrief = {
  businessOffer: string
  customer: string
  situation: string
  currentBelief: string
  desiredUnderstanding: string
  contentJob: ContentJobType
  coreMessage: string
  customerEvidence: string
  supportingProof: string
  voiceConstraints: string
  mustInclude: string
  mustAvoid: string
  callToAction: string
  format: string
  channel: string
}

export type DraftScores = {
  rightCustomer: DraftScore
  rightProblem: DraftScore
  oneMainIdea: DraftScore
  hasEvidence: DraftScore
  specific: DraftScore
  nextStepFits: DraftScore
}

export type DraftReview = {
  id: string
  draft: string
  scores: DraftScores
  revisionNote: string
}

export type OnePager = {
  goal: string
  inputs: string
  steps: string
  standards: string
  aiRole: string
  humanRole: string
  cadence: string
  publishStatus: PublishStatus
  publishedUrlOrNote: string
  signalNote: string
  selectedDraft: string
}

export type FourteenDayPlanItem = {
  id: string
  evidence: string
  job: ContentJobType
  publishDate: string
}

export type ChallengeArtifacts = {
  customerFocus: CustomerFocus
  evidenceBank: EvidenceItem[]
  evidencePlan: string
  contentJob: ContentJob
  contentBrief: ContentBrief
  workflowPrompt: string
  drafts: DraftReview[]
  workflowFeedback: string
  onePager: OnePager
  fourteenDayPlan: FourteenDayPlanItem[]
}

export type ChallengeStateV1 = {
  schemaVersion: 1
  updatedAt: string
  currentDay: ChallengeDay
  completedDays: ChallengeDay[]
  readiness: Record<ReadinessKey, boolean>
  artifacts: ChallengeArtifacts
}

export type ValidationError = { field: string; message: string }
export type DayValidation = { valid: boolean; errors: ValidationError[] }

export const ARTIFACT_KEYS = [
  'customerFocus',
  'evidenceBank',
  'contentJob',
  'contentBrief',
  'workflowPrompt',
  'reviewedDrafts',
  'onePager',
  'fourteenDayPlan',
] as const

export type ArtifactKey = (typeof ARTIFACT_KEYS)[number]
export type ArtifactCoverage = Record<ArtifactKey, boolean>

const emptyScores = (): DraftScores => ({
  rightCustomer: 0,
  rightProblem: 0,
  oneMainIdea: 0,
  hasEvidence: 0,
  specific: 0,
  nextStepFits: 0,
})

export function createEmptyChallengeState(now = new Date()): ChallengeStateV1 {
  return {
    schemaVersion: 1,
    updatedAt: now.toISOString(),
    currentDay: 1,
    completedDays: [],
    readiness: { offer: false, customer: false, evidence: false, channel: false },
    artifacts: {
      customerFocus: {
        business: '', offer: '', customerGroup: '', currentSituation: '', primaryProblem: '', desiredMovement: '', focusStatement: '',
      },
      evidenceBank: [],
      evidencePlan: '',
      contentJob: { selectedEvidence: '', job: '', beliefBefore: '', expectedShift: '', nextAction: '' },
      contentBrief: {
        businessOffer: '', customer: '', situation: '', currentBelief: '', desiredUnderstanding: '', contentJob: '', coreMessage: '', customerEvidence: '', supportingProof: '', voiceConstraints: '', mustInclude: '', mustAvoid: '', callToAction: '', format: '', channel: '',
      },
      workflowPrompt: '',
      drafts: Array.from({ length: 3 }, (_, index) => ({
        id: `draft-${index + 1}`,
        draft: '',
        scores: emptyScores(),
        revisionNote: '',
      })),
      workflowFeedback: '',
      onePager: {
        goal: '', inputs: '', steps: '', standards: '', aiRole: '', humanRole: '', cadence: '', publishStatus: '', publishedUrlOrNote: '', signalNote: '', selectedDraft: '',
      },
      fourteenDayPlan: [],
    },
  }
}

function hasText(value: string, minimum = 3): boolean {
  return value.trim().length >= minimum
}

function error(field: string, message: string): ValidationError {
  return { field, message }
}

function validEvidence(item: EvidenceItem): boolean {
  return hasText(item.evidence, 8) && hasText(item.context) && hasText(item.source) && hasText(item.insight, 8)
}

export function draftScore(draft: DraftReview): number {
  return Object.values(draft.scores).reduce<number>((total, score) => total + score, 0)
}

export function isReviewedDraft(draft: DraftReview): boolean {
  return hasText(draft.draft, 40)
    && hasText(draft.revisionNote, 12)
    && draftScore(draft) >= 9
    && Object.values(draft.scores).every((score) => score > 0)
}

export function getArtifactCoverage(state: ChallengeStateV1): ArtifactCoverage {
  const focus = state.artifacts.customerFocus
  const job = state.artifacts.contentJob
  const brief = state.artifacts.contentBrief
  const onePager = state.artifacts.onePager
  return {
    customerFocus: [focus.business, focus.offer, focus.customerGroup, focus.currentSituation, focus.primaryProblem, focus.desiredMovement, focus.focusStatement].every((value) => hasText(value)),
    evidenceBank: state.artifacts.evidenceBank.filter(validEvidence).length >= 5,
    contentJob: job.job !== '' && [job.selectedEvidence, job.beliefBefore, job.expectedShift, job.nextAction].every((value) => hasText(value)),
    contentBrief: [brief.businessOffer, brief.customer, brief.situation, brief.currentBelief, brief.desiredUnderstanding, brief.coreMessage, brief.customerEvidence, brief.voiceConstraints, brief.callToAction, brief.format, brief.channel].every((value) => hasText(value)),
    workflowPrompt: hasText(state.artifacts.workflowPrompt, 200),
    reviewedDrafts: state.artifacts.drafts.filter(isReviewedDraft).length >= 2,
    onePager: [onePager.goal, onePager.inputs, onePager.steps, onePager.standards, onePager.aiRole, onePager.humanRole, onePager.cadence].every((value) => hasText(value)),
    fourteenDayPlan: state.artifacts.fourteenDayPlan.filter((item) => hasText(item.evidence) && item.job !== '').length >= 6,
  }
}

const requiredCompletionArtifacts: readonly ArtifactKey[] = [
  'customerFocus',
  'evidenceBank',
  'contentBrief',
  'workflowPrompt',
  'reviewedDrafts',
  'onePager',
]

export function canCompleteChallenge(state: ChallengeStateV1): boolean {
  const coverage = getArtifactCoverage(state)
  return Object.values(coverage).filter(Boolean).length >= 6
    && requiredCompletionArtifacts.every((key) => coverage[key])
}

export function validateDay(day: ChallengeDay, state: ChallengeStateV1): DayValidation {
  const errors: ValidationError[] = []
  const { artifacts } = state

  if (day === 1) {
    const fields: Array<[keyof CustomerFocus, string]> = [
      ['business', 'Ghi business hoặc dự án sẽ dùng.'],
      ['offer', 'Ghi một offer cụ thể.'],
      ['customerGroup', 'Chọn một nhóm khách hàng cụ thể.'],
      ['currentSituation', 'Mô tả hoàn cảnh đang xảy ra.'],
      ['primaryProblem', 'Nêu vấn đề cụ thể.'],
      ['desiredMovement', 'Nêu chuyển dịch khách hàng muốn đạt tới.'],
      ['focusStatement', 'Hoàn thành câu Customer Focus.'],
    ]
    for (const [field, message] of fields) {
      if (!hasText(artifacts.customerFocus[field])) errors.push(error(`customerFocus.${field}`, message))
    }
  }

  if (day === 2) {
    const validRows = artifacts.evidenceBank.filter(validEvidence)
    if (validRows.length < 3) errors.push(error('evidenceBank', 'Thêm ít nhất ba evidence thật.'))
    if (validRows.length < 5 && !hasText(artifacts.evidencePlan, 12)) {
      errors.push(error('evidencePlan', 'Ghi kế hoạch cụ thể để tìm thêm evidence còn thiếu.'))
    }
  }

  if (day === 3) {
    if (artifacts.contentJob.job === '') errors.push(error('contentJob.job', 'Chọn đúng một Content Job.'))
    for (const [field, message] of [
      ['selectedEvidence', 'Chọn một evidence làm đầu vào.'],
      ['beliefBefore', 'Ghi cách hiểu hiện tại của khách hàng.'],
      ['expectedShift', 'Ghi điều muốn khách hàng hiểu khác đi.'],
      ['nextAction', 'Ghi một hành động nhỏ tiếp theo.'],
    ] as const) {
      if (!hasText(artifacts.contentJob[field])) errors.push(error(`contentJob.${field}`, message))
    }
  }

  if (day === 4) {
    const requiredBriefFields: Array<[keyof ContentBrief, string]> = [
      ['businessOffer', 'Ghi business hoặc offer.'],
      ['customer', 'Ghi customer cụ thể.'],
      ['situation', 'Ghi hoàn cảnh hiện tại.'],
      ['currentBelief', 'Ghi điều customer đang nghĩ.'],
      ['desiredUnderstanding', 'Ghi điều content muốn họ hiểu.'],
      ['contentJob', 'Chọn Content Job.'],
      ['coreMessage', 'Khóa một ý chính.'],
      ['customerEvidence', 'Đưa customer evidence vào brief.'],
      ['voiceConstraints', 'Ghi giới hạn giọng điệu.'],
      ['callToAction', 'Ghi hành động tiếp theo.'],
      ['format', 'Chọn định dạng hoặc độ dài.'],
      ['channel', 'Chọn kênh xuất bản.'],
    ]
    for (const [field, message] of requiredBriefFields) {
      if (!hasText(artifacts.contentBrief[field])) errors.push(error(`contentBrief.${field}`, message))
    }
  }

  if (day === 5 && !hasText(artifacts.workflowPrompt, 200)) {
    errors.push(error('workflowPrompt', 'Tạo và đọc lại Content Workflow Prompt trước khi tiếp tục.'))
  }

  if (day === 6 && artifacts.drafts.filter(isReviewedDraft).length < 2) {
    errors.push(error('drafts', 'Cần ít nhất hai draft đạt 9/12, không điểm 0 và có quyết định sửa.'))
  }

  if (day === 7) {
    if (!canCompleteChallenge(state)) errors.push(error('artifacts', 'Hoàn thành sáu artifact bắt buộc trước khi đóng gói.'))
    if (artifacts.onePager.publishStatus === '') errors.push(error('onePager.publishStatus', 'Xác nhận đã đăng hoặc gửi content tới người thật.'))
    if (!hasText(artifacts.onePager.publishedUrlOrNote, 8)) errors.push(error('onePager.publishedUrlOrNote', 'Ghi URL hoặc cách anh đã đưa content tới người thật.'))
    if (!hasText(artifacts.onePager.signalNote, 8)) errors.push(error('onePager.signalNote', 'Ghi một signal ban đầu, kể cả khi không có phản ứng như dự đoán.'))
  }

  return { valid: errors.length === 0, errors }
}

export function nextChallengeDay(state: ChallengeStateV1): ChallengeDay {
  const firstIncomplete = ([1, 2, 3, 4, 5, 6, 7] as const).find((day) => !state.completedDays.includes(day))
  return firstIncomplete ?? 7
}

function section(label: string, value: string): string {
  return `${label}:\n${value.trim() || '[CHƯA CÓ DỮ LIỆU]'}`
}

export function assembleWorkflowPrompt(state: ChallengeStateV1): string {
  const brief = state.artifacts.contentBrief
  return `CONTENT WORKFLOW PROMPT v1

FLOW: BRIEF → 3 GÓC KHAI THÁC → OUTLINE → DRAFT → SELF-CHECK → REVISION REQUEST

Bạn là trợ lý Content Workflow cho business của tôi. Hãy dùng đúng dữ liệu trong brief, chỉ ra phần còn thiếu và không tự bịa customer evidence.

BƯỚC 1 — KIỂM TRA BRIEF
Không viết bài nếu thiếu customer, Content Job, ý chính hoặc evidence. Nêu ngắn gọn phần còn mơ hồ.

BƯỚC 2 — ĐỀ XUẤT 3 GÓC KHAI THÁC
Với mỗi góc, ghi luận điểm, cách mở bài và lý do phù hợp với customer cùng Content Job.

BƯỚC 3 — ĐIỂM CON NGƯỜI QUYẾT ĐỊNH
CHỜ TÔI CHỌN MỘT GÓC. Không tự chọn thay tôi.

BƯỚC 4 — OUTLINE
Tạo outline gồm hook, tình huống, cách hiểu hiện tại, luận điểm mới, evidence, kết luận và hành động tiếp theo.

BƯỚC 5 — DRAFT
Viết theo đúng định dạng, kênh và giới hạn giọng điệu trong brief.

BƯỚC 6 — SELF-CHECK
Kiểm tra: đúng customer; một ý chính; claim có evidence; giọng điệu phù hợp; CTA phù hợp Content Job.

BƯỚC 7 — REVISION REQUEST
Đề xuất một vòng sửa và ghi rõ điểm còn chưa chắc chắn. Không tự thêm số liệu, câu chuyện hoặc trích dẫn không có trong brief.

CONTENT BRIEF
${section('Business/offer', brief.businessOffer)}
${section('Customer', brief.customer)}
${section('Hoàn cảnh', brief.situation)}
${section('Điều họ đang nghĩ', brief.currentBelief)}
${section('Điều muốn họ hiểu', brief.desiredUnderstanding)}
${section('Content Job', brief.contentJob)}
${section('Ý chính', brief.coreMessage)}
${section('Customer evidence', brief.customerEvidence)}
${section('Bằng chứng hỗ trợ', brief.supportingProof)}
${section('Giọng điệu', brief.voiceConstraints)}
${section('Phải có', brief.mustInclude)}
${section('Phải tránh', brief.mustAvoid)}
${section('Hành động tiếp theo', brief.callToAction)}
${section('Định dạng', brief.format)}
${section('Kênh', brief.channel)}`
}
