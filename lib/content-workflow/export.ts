import { draftScore, type ChallengeStateV1 } from './model'

function safe(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function line(label: string, value: string): string {
  return `- **${label}:** ${safe(value.trim()) || '_Chưa hoàn thành_'}`
}

function block(value: string): string {
  const text = safe(value.trim()) || '_Chưa hoàn thành_'
  return text.split('\n').map((row) => `    ${row}`).join('\n')
}

export function buildStarterKitMarkdown(state: ChallengeStateV1): string {
  const { artifacts } = state
  const focus = artifacts.customerFocus
  const job = artifacts.contentJob
  const brief = artifacts.contentBrief
  const onePager = artifacts.onePager
  const evidenceRows = artifacts.evidenceBank.length === 0
    ? '_Chưa có evidence._'
    : artifacts.evidenceBank.map((item, index) => [
      `### Evidence ${index + 1}`,
      line('Bằng chứng', item.evidence),
      line('Hoàn cảnh', item.context),
      line('Nguồn', item.source),
      line('Có thể hiểu', item.insight),
    ].join('\n')).join('\n\n')
  const draftRows = artifacts.drafts.map((draft, index) => [
    `### Draft ${index + 1} — ${draftScore(draft)}/12`,
    block(draft.draft),
    '',
    line('Quyết định sửa', draft.revisionNote),
  ].join('\n')).join('\n\n')
  const planRows = artifacts.fourteenDayPlan.length === 0
    ? '_Chưa có đề mục._'
    : artifacts.fourteenDayPlan.map((item, index) =>
      `${index + 1}. ${safe(item.evidence)} — ${safe(item.job)}${item.publishDate ? ` — ${safe(item.publishDate)}` : ''}`,
    ).join('\n')

  return `# Content Workflow Starter Kit v1.0

> Dữ liệu được xuất từ trình duyệt của người học. Hãy giữ file này ở nơi an toàn và tự xác minh mọi claim trước khi xuất bản.

## Customer Focus Card

${line('Business', focus.business)}
${line('Offer', focus.offer)}
${line('Customer', focus.customerGroup)}
${line('Hoàn cảnh', focus.currentSituation)}
${line('Vấn đề', focus.primaryProblem)}
${line('Chuyển dịch', focus.desiredMovement)}
${line('Customer Focus', focus.focusStatement)}

## Customer Voice Mini Bank

${evidenceRows}

## Content Job Card

${line('Evidence đã chọn', job.selectedEvidence)}
${line('Content Job', job.job)}
${line('Niềm tin trước', job.beliefBefore)}
${line('Chuyển dịch mong muốn', job.expectedShift)}
${line('Hành động tiếp theo', job.nextAction)}

## Reusable Content Brief

${line('Business/offer', brief.businessOffer)}
${line('Customer', brief.customer)}
${line('Hoàn cảnh', brief.situation)}
${line('Điều họ đang nghĩ', brief.currentBelief)}
${line('Điều muốn họ hiểu', brief.desiredUnderstanding)}
${line('Content Job', brief.contentJob)}
${line('Ý chính', brief.coreMessage)}
${line('Customer evidence', brief.customerEvidence)}
${line('Bằng chứng hỗ trợ', brief.supportingProof)}
${line('Giọng điệu', brief.voiceConstraints)}
${line('Phải có', brief.mustInclude)}
${line('Phải tránh', brief.mustAvoid)}
${line('CTA', brief.callToAction)}
${line('Định dạng', brief.format)}
${line('Kênh', brief.channel)}

## Content Workflow Prompt v1

${block(artifacts.workflowPrompt)}

## Drafts đã review

${draftRows}

${line('Workflow Feedback Log', artifacts.workflowFeedback)}

## Content Workflow One-Pager

${line('Mục tiêu', onePager.goal)}
${line('Đầu vào', onePager.inputs)}
${line('Các bước', onePager.steps)}
${line('Tiêu chuẩn', onePager.standards)}
${line('AI làm', onePager.aiRole)}
${line('Con người làm', onePager.humanRole)}
${line('Nhịp dùng', onePager.cadence)}
${line('Trạng thái dùng ngoài đời', onePager.publishStatus)}
${line('URL hoặc ghi chú', onePager.publishedUrlOrNote)}
${line('Signal ban đầu', onePager.signalNote)}

## Kế hoạch content 14 ngày

${planRows}
`
}

export function starterKitFilename(now = new Date()): string {
  const stamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z').replaceAll(':', '-')
  return `content-workflow-starter-kit-${stamp}.md`
}
