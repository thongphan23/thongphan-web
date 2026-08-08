import { draftScore, type ChallengeStateV1, type ContentJobType, type PublishStatus } from './model'

const contentJobLabels: Record<Exclude<ContentJobType, ''>, string> = {
  'recognize-problem': 'Nhận ra vấn đề',
  'understand-cause': 'Hiểu nguyên nhân',
  'try-next-step': 'Thử bước tiếp theo',
}

const publishStatusLabels: Record<Exclude<PublishStatus, ''>, string> = {
  published: 'Đã đăng công khai',
  sent: 'Đã gửi trực tiếp',
}

function contentJobLabel(value: ContentJobType): string {
  return value ? contentJobLabels[value] : ''
}

function publishStatusLabel(value: PublishStatus): string {
  return value ? publishStatusLabels[value] : ''
}

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
    ? '_Chưa có bằng chứng._'
    : artifacts.evidenceBank.map((item, index) => [
      `### Bằng chứng ${index + 1}`,
      line('Bằng chứng', item.evidence),
      line('Hoàn cảnh', item.context),
      line('Nguồn', item.source),
      line('Có thể hiểu', item.insight),
    ].join('\n')).join('\n\n')
  const draftRows = artifacts.drafts.map((draft, index) => [
    `### Bản nháp ${index + 1} — ${draftScore(draft)}/12`,
    block(draft.draft),
    '',
    line('Quyết định sửa', draft.revisionNote),
  ].join('\n')).join('\n\n')
  const planRows = artifacts.fourteenDayPlan.length === 0
    ? '_Chưa có đề mục._'
    : artifacts.fourteenDayPlan.map((item, index) =>
      `${index + 1}. ${safe(item.evidence)} — ${safe(contentJobLabel(item.job))}${item.publishDate ? ` — ${safe(item.publishDate)}` : ''}`,
    ).join('\n')

  return `# Bộ khởi đầu quy trình nội dung v1.0 (Content Workflow Starter Kit)

> Dữ liệu được tải từ trình duyệt của người học. Hãy giữ tệp này ở nơi an toàn và tự xác minh mọi luận điểm trước khi xuất bản.

## Thẻ trọng tâm khách hàng (Customer Focus Card)

${line('Doanh nghiệp', focus.business)}
${line('Sản phẩm đang bán', focus.offer)}
${line('Khách hàng', focus.customerGroup)}
${line('Hoàn cảnh', focus.currentSituation)}
${line('Vấn đề', focus.primaryProblem)}
${line('Chuyển dịch', focus.desiredMovement)}
${line('Trọng tâm khách hàng', focus.focusStatement)}

## Ngân hàng tiếng nói khách hàng (Customer Voice Mini Bank)

${evidenceRows}

## Thẻ nhiệm vụ nội dung (Content Job Card)

${line('Bằng chứng đã chọn', job.selectedEvidence)}
${line('Nhiệm vụ nội dung', contentJobLabel(job.job))}
${line('Niềm tin trước', job.beliefBefore)}
${line('Chuyển dịch mong muốn', job.expectedShift)}
${line('Hành động tiếp theo', job.nextAction)}

## Bản giao việc nội dung dùng lại được (Reusable Content Brief)

${line('Doanh nghiệp/sản phẩm', brief.businessOffer)}
${line('Khách hàng', brief.customer)}
${line('Hoàn cảnh', brief.situation)}
${line('Điều họ đang nghĩ', brief.currentBelief)}
${line('Điều muốn họ hiểu', brief.desiredUnderstanding)}
${line('Nhiệm vụ nội dung', contentJobLabel(brief.contentJob))}
${line('Ý chính', brief.coreMessage)}
${line('Bằng chứng khách hàng', brief.customerEvidence)}
${line('Bằng chứng hỗ trợ', brief.supportingProof)}
${line('Giọng điệu', brief.voiceConstraints)}
${line('Phải có', brief.mustInclude)}
${line('Phải tránh', brief.mustAvoid)}
${line('Lời kêu gọi hành động (CTA)', brief.callToAction)}
${line('Định dạng', brief.format)}
${line('Kênh', brief.channel)}

## Câu lệnh quy trình nội dung v1 (Content Workflow Prompt)

${block(artifacts.workflowPrompt)}

## Các bản nháp đã đánh giá

${draftRows}

${line('Nhật ký phản hồi quy trình', artifacts.workflowFeedback)}

## Bản tóm tắt quy trình nội dung một trang (One-Pager)

${line('Mục tiêu', onePager.goal)}
${line('Đầu vào', onePager.inputs)}
${line('Các bước', onePager.steps)}
${line('Tiêu chuẩn', onePager.standards)}
${line('AI làm', onePager.aiRole)}
${line('Con người làm', onePager.humanRole)}
${line('Nhịp dùng', onePager.cadence)}
${line('Trạng thái dùng ngoài đời', publishStatusLabel(onePager.publishStatus))}
${line('Địa chỉ web hoặc ghi chú', onePager.publishedUrlOrNote)}
${line('Tín hiệu ban đầu', onePager.signalNote)}

## Kế hoạch nội dung 14 ngày

${planRows}
`
}

export function starterKitFilename(now = new Date()): string {
  const stamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z').replaceAll(':', '-')
  return `bo-khoi-dau-quy-trinh-noi-dung-${stamp}.md`
}
