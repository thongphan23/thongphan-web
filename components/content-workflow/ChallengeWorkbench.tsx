'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { CONTENT_WORKFLOW_DAYS, SIMULATED_CASE, type ContentWorkflowDay } from '@/lib/content-workflow/content'
import { buildStarterKitMarkdown, starterKitFilename } from '@/lib/content-workflow/export'
import {
  ARTIFACT_KEYS,
  assembleWorkflowPrompt,
  createEmptyChallengeState,
  draftScore,
  getArtifactCoverage,
  validateDay,
  type ChallengeStateV1,
  type ContentBrief,
  type ContentJob,
  type CustomerFocus,
  type DraftReview,
  type DraftScore,
  type EvidenceItem,
  type FourteenDayPlanItem,
  type OnePager,
  type ValidationError,
} from '@/lib/content-workflow/model'
import { clearChallengeState, readChallengeState, writeChallengeState } from '@/lib/content-workflow/storage'
import styles from './ContentWorkflow.module.css'

const ROOT = '/challenge/content-workflow-7days'

const artifactLabels = {
  customerFocus: 'Customer Focus',
  evidenceBank: 'Evidence Bank',
  contentJob: 'Content Job',
  contentBrief: 'Reusable Brief',
  workflowPrompt: 'Workflow Prompt',
  reviewedDrafts: '2 content đã review',
  onePager: 'One-Page Workflow',
  fourteenDayPlan: 'Kế hoạch 14 ngày',
} as const

const scoreLabels: ReadonlyArray<[keyof DraftReview['scores'], string]> = [
  ['rightCustomer', 'Đúng người'],
  ['rightProblem', 'Đúng vấn đề'],
  ['oneMainIdea', 'Một ý chính'],
  ['hasEvidence', 'Có evidence'],
  ['specific', 'Không chung chung'],
  ['nextStepFits', 'Bước tiếp theo phù hợp'],
]

function fieldId(path: string): string {
  return `field-${path.replaceAll('.', '-')}`
}

function errorFor(errors: ValidationError[], path: string): string | undefined {
  return errors.find((item) => item.field === path)?.message
}

function Field({
  path,
  label,
  description,
  value,
  onChange,
  error,
  rows = 3,
  placeholder,
}: {
  path: string
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  error?: string
  rows?: number
  placeholder?: string
}) {
  const id = fieldId(path)
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      {description ? <small id={`${id}-description`}>{description}</small> : null}
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <em id={`${id}-error`}>{error}</em> : null}
    </label>
  )
}

function SelectField({
  path,
  label,
  value,
  onChange,
  children,
  error,
}: {
  path: string
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  error?: string
}) {
  const id = fieldId(path)
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      {error ? <em id={`${id}-error`}>{error}</em> : null}
    </label>
  )
}

function createEvidence(index: number): EvidenceItem {
  return { id: `evidence-${Date.now()}-${index}`, evidence: '', context: '', source: '', insight: '' }
}

function createPlanItem(index: number): FourteenDayPlanItem {
  return { id: `plan-${Date.now()}-${index}`, evidence: '', job: '', publishDate: '' }
}

export default function ChallengeWorkbench({ lesson }: { lesson: ContentWorkflowDay }) {
  const router = useRouter()
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const resetDialogRef = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<ChallengeStateV1>(() => createEmptyChallengeState())
  const [hydrated, setHydrated] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Đang mở workbook local…')
  const [actionStatus, setActionStatus] = useState('')
  const [errors, setErrors] = useState<ValidationError[]>([])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = readChallengeState()
      const next: ChallengeStateV1 = { ...saved, currentDay: lesson.day, updatedAt: new Date().toISOString() }
      if (lesson.day === 2 && next.artifacts.evidenceBank.length === 0) {
        next.artifacts = { ...next.artifacts, evidenceBank: Array.from({ length: 3 }, (_, index) => createEvidence(index)) }
      }
      setState(next)
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [lesson.day])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => {
      const saved = writeChallengeState(state)
      setSaveStatus(saved
        ? `Đã lưu trên thiết bị lúc ${new Intl.DateTimeFormat('vi', { hour: '2-digit', minute: '2-digit' }).format(new Date())}`
        : 'Không thể lưu trên thiết bị · hãy export trước khi đóng tab')
    }, 450)
    return () => window.clearTimeout(timeout)
  }, [hydrated, state])

  const completedCount = state.completedDays.length
  const validation = validateDay(lesson.day, state)
  const nextDay = Math.min(7, lesson.day + 1)

  function updateState(recipe: (current: ChallengeStateV1) => ChallengeStateV1) {
    setState((current) => ({ ...recipe(current), updatedAt: new Date().toISOString() }))
    setErrors([])
  }

  function updateArtifact<K extends keyof ChallengeStateV1['artifacts']>(key: K, value: ChallengeStateV1['artifacts'][K]) {
    updateState((current) => ({ ...current, artifacts: { ...current.artifacts, [key]: value } }))
  }

  function runGate() {
    const result = validateDay(lesson.day, state)
    setErrors(result.errors)
    if (!result.valid) {
      setActionStatus('Quality Gate chưa qua. Đi tới các trường cần sửa trong danh sách dưới đây.')
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0)
      return
    }
    updateState((current) => ({
      ...current,
      completedDays: current.completedDays.includes(lesson.day)
        ? current.completedDays
        : [...current.completedDays, lesson.day].sort((a, b) => a - b),
    }))
    setActionStatus(`Ngày ${lesson.day} đã hoàn thành theo tiêu chí cấu trúc. Anh vẫn là người quyết định chất lượng cuối.`)
  }

  async function copyText(text: string, fallback?: HTMLTextAreaElement | null) {
    try {
      await navigator.clipboard.writeText(text)
      setActionStatus('Đã sao chép vào clipboard.')
    } catch {
      fallback?.focus()
      fallback?.select()
      setActionStatus('Clipboard bị chặn. Nội dung đã được chọn; nhấn Ctrl/Cmd + C để sao chép thủ công.')
    }
  }

  function exportMarkdown() {
    const markdown = buildStarterKitMarkdown(state)
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = starterKitFilename()
    anchor.click()
    URL.revokeObjectURL(url)
    setActionStatus('Starter Kit đã được export thành Markdown.')
  }

  function resetChallenge() {
    const cleared = clearChallengeState()
    resetDialogRef.current?.close()
    if (!cleared) {
      setActionStatus('Không thể xóa localStorage tự động. Hãy xóa dữ liệu trang trong cài đặt trình duyệt.')
      return
    }
    router.push(ROOT)
  }

  return (
    <div className={styles.workbench} data-hydrated={hydrated}>
      <header className={styles.workbenchHeader}>
        <Link href={ROOT}><ArrowLeft aria-hidden="true" size={17} /> Content Workflow 7 Days</Link>
        <p aria-live="polite">{saveStatus}</p>
        <button type="button" onClick={() => resetDialogRef.current?.showModal()}><RotateCcw aria-hidden="true" size={15} /> Đặt lại</button>
      </header>

      <div className={styles.workspace}>
        <nav className={styles.dayNav} aria-label="Bảy ngày thực hành">
          <div className={styles.progressSummary}>
            <span>Tiến độ</span>
            <strong>{completedCount}/7</strong>
            <div><i style={{ width: `${(completedCount / 7) * 100}%` }} /></div>
          </div>
          <ol>
            {CONTENT_WORKFLOW_DAYS.map((item) => {
              const complete = state.completedDays.includes(item.day)
              return (
                <li key={item.slug} data-current={item.day === lesson.day} data-complete={complete}>
                  <Link href={`${ROOT}/${item.slug}`}>
                    <span>{complete ? <Check aria-hidden="true" size={14} /> : String(item.day).padStart(2, '0')}</span>
                    <small>Ngày {item.day}</small>
                    <strong>{item.artifact}</strong>
                  </Link>
                </li>
              )
            })}
          </ol>
          <p>Tất cả ngày đều mở. Tiến độ chỉ khuyến nghị, không khóa route.</p>
        </nav>

        <main className={styles.lessonCanvas}>
          <header className={styles.lessonHeader}>
            <span>Ngày {String(lesson.day).padStart(2, '0')} / 07</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.question}</p>
          </header>

          <section className={styles.learnSection} aria-labelledby="learn-title">
            <h2 id="learn-title"><span>01</span> Học</h2>
            <blockquote>{lesson.threshold}</blockquote>
            <ul>{lesson.learn.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className={styles.caseSection} aria-labelledby="case-title">
            <h2 id="case-title"><span>02</span> Xem</h2>
            <div>
              <small>{lesson.see.label}</small>
              <h3>{lesson.see.title}</h3>
              <p>{lesson.see.body}</p>
              <em>{SIMULATED_CASE.disclosure}</em>
            </div>
          </section>

          <section className={styles.taskSection} aria-labelledby="task-title">
            <h2 id="task-title"><span>03</span> Làm</h2>
            <ol>{lesson.do.map((item) => <li key={item}>{item}</li>)}</ol>
            <p><strong>Bản tối thiểu:</strong> {lesson.minimum}</p>
          </section>
        </main>

        <aside className={styles.artifactDesk} aria-label={`Bàn làm việc ${lesson.artifact}`}>
          <header>
            <p>Artifact desk</p>
            <h2>{lesson.artifact}</h2>
            <span>Dữ liệu chỉ lưu trong localStorage của trình duyệt này.</span>
          </header>

          <div className={styles.formBody}>{renderDayForm(lesson.day, state, updateArtifact, errors, {
            setActionStatus,
            copyText,
          })}</div>

          <section className={styles.gateSection} aria-labelledby="gate-title">
            <h3 id="gate-title"><span>04</span> Kiểm</h3>
            <ul>{lesson.qualityGate.map((item) => <li key={item}>{item}</li>)}</ul>
            {errors.length > 0 ? (
              <div className={styles.errorSummary} role="alert" tabIndex={-1} ref={errorSummaryRef}>
                <strong>Còn {errors.length} điểm cần sửa</strong>
                <ul>{errors.map((item) => <li key={`${item.field}-${item.message}`}><a href={`#${fieldId(item.field)}`}>{item.message}</a></li>)}</ul>
              </div>
            ) : null}
            <button className={styles.gateButton} type="button" onClick={runGate}>
              {validation.valid ? 'Xác nhận hoàn thành ngày' : 'Chạy Quality Gate'} <Check aria-hidden="true" size={17} />
            </button>
            {state.completedDays.includes(lesson.day) ? (
              <Link className={styles.nextButton} href={`${ROOT}/day-${String(nextDay).padStart(2, '0')}`}>
                {lesson.day === 7 ? 'Xem lại Starter Kit' : `Sang Ngày ${String(nextDay).padStart(2, '0')}`} <ArrowRight aria-hidden="true" size={17} />
              </Link>
            ) : null}
          </section>

          <p className={styles.liveStatus} aria-live="polite">{actionStatus}</p>
          {lesson.day === 7 ? (
            <div className={styles.exportActions}>
              <button type="button" onClick={exportMarkdown}><Download aria-hidden="true" size={16} /> Export Markdown</button>
              <button type="button" onClick={() => copyText(buildStarterKitMarkdown(state))}><Clipboard aria-hidden="true" size={16} /> Copy Starter Kit</button>
            </div>
          ) : null}
        </aside>
      </div>

      <dialog ref={resetDialogRef} className={styles.resetDialog} onCancel={() => resetDialogRef.current?.close()}>
        <h2>Xóa workbook trên thiết bị này?</h2>
        <p>Toàn bộ readiness, artifact và tiến độ local sẽ mất. File Markdown đã export không bị ảnh hưởng.</p>
        <div><button type="button" onClick={() => resetDialogRef.current?.close()}>Giữ lại</button><button type="button" onClick={resetChallenge}>Xóa và về trang đầu</button></div>
      </dialog>
    </div>
  )
}

type ArtifactUpdater = <K extends keyof ChallengeStateV1['artifacts']>(key: K, value: ChallengeStateV1['artifacts'][K]) => void
type FormActions = {
  setActionStatus: (status: string) => void
  copyText: (text: string, fallback?: HTMLTextAreaElement | null) => Promise<void>
}

function renderDayForm(day: ContentWorkflowDay['day'], state: ChallengeStateV1, update: ArtifactUpdater, errors: ValidationError[], actions: FormActions): ReactNode {
  if (day === 1) return <DayOne value={state.artifacts.customerFocus} update={(value) => update('customerFocus', value)} errors={errors} />
  if (day === 2) return <DayTwo state={state} update={update} errors={errors} />
  if (day === 3) return <DayThree value={state.artifacts.contentJob} update={(value) => update('contentJob', value)} errors={errors} />
  if (day === 4) return <DayFour value={state.artifacts.contentBrief} update={(value) => update('contentBrief', value)} errors={errors} />
  if (day === 5) return <DayFive state={state} update={update} actions={actions} errors={errors} />
  if (day === 6) return <DaySix state={state} update={update} errors={errors} />
  return <DaySeven state={state} update={update} errors={errors} />
}

function DayOne({ value, update, errors }: { value: CustomerFocus; update: (value: CustomerFocus) => void; errors: ValidationError[] }) {
  const fields: Array<[keyof CustomerFocus, string, string]> = [
    ['business', 'Business hoặc dự án', 'Business nào sẽ dùng workflow này?'],
    ['offer', 'Offer đang bán', 'Chọn đúng một offer.'],
    ['customerGroup', 'Nhóm khách hàng', 'Họ là ai trong hoàn cảnh cụ thể nào?'],
    ['currentSituation', 'Hoàn cảnh hiện tại', 'Chuyện gì đang xảy ra với họ?'],
    ['primaryProblem', 'Vấn đề chính', 'Điểm kẹt cụ thể là gì?'],
    ['desiredMovement', 'Chuyển dịch mong muốn', 'Họ muốn tiến tới đâu?'],
    ['focusStatement', 'Câu Customer Focus', 'Tôi tạo content cho [nhóm người], khi họ đang [hoàn cảnh], muốn [tiến bộ], nhưng bị kẹt bởi [vấn đề].'],
  ]
  return <div className={styles.fieldStack}>{fields.map(([key, label, description]) => <Field key={key} path={`customerFocus.${key}`} label={label} description={description} value={value[key]} error={errorFor(errors, `customerFocus.${key}`)} onChange={(next) => update({ ...value, [key]: next })} rows={key === 'focusStatement' ? 5 : 3} />)}</div>
}

function DayTwo({ state, update, errors }: { state: ChallengeStateV1; update: ArtifactUpdater; errors: ValidationError[] }) {
  const rows = state.artifacts.evidenceBank
  function change(index: number, key: keyof EvidenceItem, value: string) {
    update('evidenceBank', rows.map((item, rowIndex) => rowIndex === index ? { ...item, [key]: value } : item))
  }
  return <div className={styles.fieldStack}>
    {rows.map((item, index) => <fieldset className={styles.evidenceRow} key={item.id}>
      <legend>Evidence {String(index + 1).padStart(2, '0')}</legend>
      <Field path={`evidence-${index + 1}-evidence`} label="Câu nói hoặc hành vi thật" value={item.evidence} onChange={(value) => change(index, 'evidence', value)} />
      <Field path={`evidence-${index + 1}-context`} label="Hoàn cảnh" value={item.context} onChange={(value) => change(index, 'context', value)} />
      <Field path={`evidence-${index + 1}-source`} label="Nguồn" value={item.source} onChange={(value) => change(index, 'source', value)} />
      <Field path={`evidence-${index + 1}-insight`} label="Có thể hiểu gì?" value={item.insight} onChange={(value) => change(index, 'insight', value)} />
      {rows.length > 3 ? <button className={styles.removeButton} type="button" onClick={() => update('evidenceBank', rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 aria-hidden="true" size={15} /> Xóa evidence</button> : null}
    </fieldset>)}
    {errorFor(errors, 'evidenceBank') ? <p className={styles.inlineError} id={fieldId('evidenceBank')} role="alert">{errorFor(errors, 'evidenceBank')}</p> : null}
    {rows.length < 20 ? <button className={styles.addButton} type="button" onClick={() => update('evidenceBank', [...rows, createEvidence(rows.length)])}><Plus aria-hidden="true" size={16} /> Thêm evidence</button> : null}
    <Field path="evidencePlan" label="Kế hoạch tìm evidence còn thiếu" description="Bắt buộc khi mới có ba hoặc bốn evidence." value={state.artifacts.evidencePlan} error={errorFor(errors, 'evidencePlan')} onChange={(value) => update('evidencePlan', value)} />
  </div>
}

function DayThree({ value, update, errors }: { value: ContentJob; update: (value: ContentJob) => void; errors: ValidationError[] }) {
  return <div className={styles.fieldStack}>
    <Field path="contentJob.selectedEvidence" label="Evidence đã chọn" value={value.selectedEvidence} error={errorFor(errors, 'contentJob.selectedEvidence')} onChange={(next) => update({ ...value, selectedEvidence: next })} />
    <SelectField path="contentJob.job" label="Content Job chính" value={value.job} error={errorFor(errors, 'contentJob.job')} onChange={(next) => update({ ...value, job: next as ContentJob['job'] })}>
      <option value="">Chọn một job</option><option value="recognize-problem">Nhận ra vấn đề</option><option value="understand-cause">Hiểu nguyên nhân</option><option value="try-next-step">Thử bước tiếp theo</option>
    </SelectField>
    <Field path="contentJob.beliefBefore" label="Khách hàng đang nghĩ gì?" value={value.beliefBefore} error={errorFor(errors, 'contentJob.beliefBefore')} onChange={(next) => update({ ...value, beliefBefore: next })} />
    <Field path="contentJob.expectedShift" label="Sau content, muốn họ hiểu gì?" value={value.expectedShift} error={errorFor(errors, 'contentJob.expectedShift')} onChange={(next) => update({ ...value, expectedShift: next })} />
    <Field path="contentJob.nextAction" label="Hành động nhỏ tiếp theo" value={value.nextAction} error={errorFor(errors, 'contentJob.nextAction')} onChange={(next) => update({ ...value, nextAction: next })} />
  </div>
}

function DayFour({ value, update, errors }: { value: ContentBrief; update: (value: ContentBrief) => void; errors: ValidationError[] }) {
  const fields: Array<[keyof ContentBrief, string]> = [
    ['businessOffer', 'Business / offer'], ['customer', 'Customer'], ['situation', 'Hoàn cảnh'], ['currentBelief', 'Điều họ đang nghĩ'], ['desiredUnderstanding', 'Điều muốn họ hiểu'], ['coreMessage', 'Ý chính'], ['customerEvidence', 'Customer evidence'], ['supportingProof', 'Bằng chứng hoặc ví dụ hỗ trợ'], ['voiceConstraints', 'Giọng điệu'], ['mustInclude', 'Phải có'], ['mustAvoid', 'Phải tránh'], ['callToAction', 'Hành động tiếp theo'], ['format', 'Độ dài / định dạng'], ['channel', 'Kênh'],
  ]
  return <div className={styles.fieldStack}>
    {fields.slice(0, 5).map(([key, label]) => <Field key={key} path={`contentBrief.${key}`} label={label} value={value[key]} error={errorFor(errors, `contentBrief.${key}`)} onChange={(next) => update({ ...value, [key]: next })} />)}
    <SelectField path="contentBrief.contentJob" label="Content Job" value={value.contentJob} error={errorFor(errors, 'contentBrief.contentJob')} onChange={(next) => update({ ...value, contentJob: next as ContentBrief['contentJob'] })}>
      <option value="">Chọn một job</option><option value="recognize-problem">Nhận ra vấn đề</option><option value="understand-cause">Hiểu nguyên nhân</option><option value="try-next-step">Thử bước tiếp theo</option>
    </SelectField>
    {fields.slice(5).map(([key, label]) => <Field key={key} path={`contentBrief.${key}`} label={label} value={value[key]} error={errorFor(errors, `contentBrief.${key}`)} onChange={(next) => update({ ...value, [key]: next })} />)}
  </div>
}

function DayFive({ state, update, actions, errors }: { state: ChallengeStateV1; update: ArtifactUpdater; actions: FormActions; errors: ValidationError[] }) {
  const prompt = state.artifacts.workflowPrompt
  return <div className={styles.fieldStack}>
    <button className={styles.assembleButton} type="button" onClick={() => {
      if (prompt.trim()) { actions.setActionStatus('Prompt hiện tại được giữ nguyên để không ghi đè chỉnh sửa của anh.'); return }
      update('workflowPrompt', assembleWorkflowPrompt(state))
      actions.setActionStatus('Đã lắp Prompt v1 từ Content Brief. Hãy đọc và sửa trước khi copy.')
    }}>Lắp prompt từ Brief ngày 1–4</button>
    <label className={styles.field} htmlFor={fieldId('workflowPrompt')}>
      <span>Content Workflow Prompt v1</span>
      <small>Prompt được tạo một lần. Mọi chỉnh sửa sau đó đều được giữ lại.</small>
      <textarea id={fieldId('workflowPrompt')} rows={28} value={prompt} aria-describedby={errorFor(errors, 'workflowPrompt') ? `${fieldId('workflowPrompt')}-error` : undefined} onChange={(event) => update('workflowPrompt', event.target.value)} />
      {errorFor(errors, 'workflowPrompt') ? <em id={`${fieldId('workflowPrompt')}-error`}>{errorFor(errors, 'workflowPrompt')}</em> : null}
    </label>
    <button className={styles.copyButton} type="button" onClick={() => actions.copyText(prompt, document.getElementById(fieldId('workflowPrompt')) as HTMLTextAreaElement | null)}><Clipboard aria-hidden="true" size={16} /> Copy Master Prompt</button>
  </div>
}

function DaySix({ state, update, errors }: { state: ChallengeStateV1; update: ArtifactUpdater; errors: ValidationError[] }) {
  function changeDraft(index: number, next: DraftReview) {
    update('drafts', state.artifacts.drafts.map((draft, draftIndex) => draftIndex === index ? next : draft))
  }
  return <div className={styles.fieldStack}>
    {state.artifacts.drafts.map((draft, index) => <fieldset className={styles.draftRow} key={draft.id}>
      <legend>Run {String(index + 1).padStart(2, '0')} · {draftScore(draft)}/12</legend>
      <Field path={`draft-${index + 1}-content`} label="Bản content" value={draft.draft} onChange={(value) => changeDraft(index, { ...draft, draft: value })} rows={10} />
      <div className={styles.scoreGrid}>{scoreLabels.map(([key, label]) => <label key={key}><span>{label}</span><select value={draft.scores[key]} onChange={(event: ChangeEvent<HTMLSelectElement>) => changeDraft(index, { ...draft, scores: { ...draft.scores, [key]: Number(event.target.value) as DraftScore } })}><option value="0">0 · Không đạt</option><option value="1">1 · Cần sửa</option><option value="2">2 · Đạt</option></select></label>)}</div>
      <Field path={`draft-${index + 1}-revision`} label="Quyết định sửa của tôi" value={draft.revisionNote} onChange={(value) => changeDraft(index, { ...draft, revisionNote: value })} />
    </fieldset>)}
    {errorFor(errors, 'drafts') ? <p className={styles.inlineError} id={fieldId('drafts')} role="alert">{errorFor(errors, 'drafts')}</p> : null}
    <Field path="workflowFeedback" label="Workflow Feedback Log" description="AI thường làm tốt gì, sai gì và workflow cần bổ sung gì?" value={state.artifacts.workflowFeedback} onChange={(value) => update('workflowFeedback', value)} rows={6} />
  </div>
}

function DaySeven({ state, update, errors }: { state: ChallengeStateV1; update: ArtifactUpdater; errors: ValidationError[] }) {
  const coverage = getArtifactCoverage(state)
  const onePager = state.artifacts.onePager
  const plan = state.artifacts.fourteenDayPlan
  const fields: Array<[keyof OnePager, string]> = [
    ['selectedDraft', 'Content tốt nhất'], ['goal', 'Mục tiêu workflow'], ['inputs', 'Đầu vào'], ['steps', 'Các bước'], ['standards', 'Tiêu chuẩn'], ['aiRole', 'AI làm'], ['humanRole', 'Con người làm'], ['cadence', 'Nhịp dùng'], ['publishedUrlOrNote', 'URL hoặc cách đã đưa content tới người thật'], ['signalNote', 'Signal ban đầu'],
  ]
  function changePlan(index: number, next: FourteenDayPlanItem) {
    update('fourteenDayPlan', plan.map((item, itemIndex) => itemIndex === index ? next : item))
  }
  return <div className={styles.fieldStack}>
    <div className={styles.coverageLedger} id={fieldId('artifacts')}>
      <strong>{Object.values(coverage).filter(Boolean).length}/8 artifact có dữ liệu đạt gate</strong>
      <ul>{ARTIFACT_KEYS.map((key) => <li key={key} data-complete={coverage[key]}><span>{coverage[key] ? <Check aria-hidden="true" size={13} /> : '—'}</span>{artifactLabels[key]}</li>)}</ul>
    </div>
    {fields.slice(0, 8).map(([key, label]) => <Field key={key} path={`onePager.${key}`} label={label} value={onePager[key]} error={errorFor(errors, `onePager.${key}`)} onChange={(value) => update('onePager', { ...onePager, [key]: value })} />)}
    <SelectField path="onePager.publishStatus" label="Trạng thái đưa ra thực tế" value={onePager.publishStatus} error={errorFor(errors, 'onePager.publishStatus')} onChange={(value) => update('onePager', { ...onePager, publishStatus: value as OnePager['publishStatus'] })}>
      <option value="">Chưa xác nhận</option><option value="published">Đã đăng công khai</option><option value="sent">Đã gửi trực tiếp</option>
    </SelectField>
    {fields.slice(8).map(([key, label]) => <Field key={key} path={`onePager.${key}`} label={label} value={onePager[key]} error={errorFor(errors, `onePager.${key}`)} onChange={(value) => update('onePager', { ...onePager, [key]: value })} />)}
    <fieldset className={styles.planSection}><legend>Kế hoạch content 14 ngày</legend>
      {plan.map((item, index) => <div className={styles.planRow} key={item.id}>
        <Field path={`plan-${index + 1}-evidence`} label={`Evidence ${index + 1}`} value={item.evidence} onChange={(value) => changePlan(index, { ...item, evidence: value })} />
        <SelectField path={`plan-${index + 1}-job`} label="Content Job" value={item.job} onChange={(value) => changePlan(index, { ...item, job: value as FourteenDayPlanItem['job'] })}><option value="">Chọn job</option><option value="recognize-problem">Nhận ra vấn đề</option><option value="understand-cause">Hiểu nguyên nhân</option><option value="try-next-step">Thử bước tiếp</option></SelectField>
        <label className={styles.field}><span>Ngày dự kiến</span><input type="date" value={item.publishDate} onChange={(event) => changePlan(index, { ...item, publishDate: event.target.value })} /></label>
        <button className={styles.removeButton} type="button" onClick={() => update('fourteenDayPlan', plan.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden="true" size={14} /> Xóa</button>
      </div>)}
      {plan.length < 14 ? <button className={styles.addButton} type="button" onClick={() => update('fourteenDayPlan', [...plan, createPlanItem(plan.length)])}><Plus aria-hidden="true" size={16} /> Thêm đề mục</button> : null}
    </fieldset>
  </div>
}
