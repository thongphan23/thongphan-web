'use client'

import { Clipboard, Plus, Sparkles, Trash2 } from 'lucide-react'
import {
  assembleRunnableWorkflow,
  type ChallengeDay,
  type ChallengeStateV2,
  type StepInstruction,
  type StepRole,
  type TestFailureCategory,
  type ValidationError,
  type WorkflowStage,
} from '@/lib/content-workflow/model'
import styles from './ContentWorkflow.module.css'

type Props = {
  day: ChallengeDay
  state: ChallengeStateV2
  errors: ValidationError[]
  onChange: (state: ChallengeStateV2) => void
  onStatus: (status: string) => void
}

function fieldId(path: string) { return `field-${path.replaceAll('.', '-')}` }

function Field({ path, label, value, description, rows = 3, onChange }: { path: string; label: string; value: string; description?: string; rows?: number; onChange: (value: string) => void }) {
  const id = fieldId(path)
  return <label className={styles.field} htmlFor={id}>
    <span>{label}</span>
    {description ? <small id={`${id}-description`}>{description}</small> : null}
    <textarea id={id} rows={rows} value={value} aria-describedby={description ? `${id}-description` : undefined} onChange={(event) => onChange(event.target.value)} />
  </label>
}

function SelectField({ path, label, value, onChange, children }: { path: string; label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  const id = fieldId(path)
  return <label className={styles.field} htmlFor={id}><span>{label}</span><select id={id} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>
}

const labels = {
  workflowBrief: [['workflowName', 'Tên workflow'], ['repeatedTask', 'Công việc lặp lại'], ['trigger', 'Điểm kích hoạt'], ['currentInputs', 'Đầu vào hiện có'], ['finalOutput', 'Đầu ra cuối'], ['outputUser', 'Người sử dụng đầu ra'], ['currentFriction', 'Vướng mắc hiện tại'], ['scope', 'Phạm vi trong bảy ngày'], ['nonGoals', 'Workflow này không làm']] as const,
  contextPack: [['identityBusiness', 'Doanh nghiệp hoặc dự án'], ['expertiseOffer', 'Chuyên môn hoặc offer'], ['intendedAudience', 'Người nhận dự kiến'], ['knownContext', 'Điều đã biết'], ['currentAssumptions', 'Nhận định hiện tại'], ['voice', 'Giọng điệu'], ['mustDo', 'Phải làm'], ['mustNot', 'Không được làm'], ['references', 'Tài liệu tham chiếu'], ['gaps', 'Khoảng trống cần bổ sung']] as const,
  outputContract: [['audience', 'Người sử dụng đầu ra'], ['purpose', 'Mục đích'], ['format', 'Định dạng'], ['structure', 'Cấu trúc'], ['mustInclude', 'Phải có'], ['mustAvoid', 'Phải tránh'], ['qualityCriteria', 'Tiêu chí chất lượng'], ['antiExample', 'Phản ví dụ không đạt']] as const,
}

function newStage(index: number): WorkflowStage {
  return { id: `stage-${Date.now()}-${index}`, name: '', input: '', transformation: '', output: '', humanDecision: '', qualityGate: '' }
}
function newInstruction(stageId: string, index: number): StepInstruction {
  return { id: `instruction-${Date.now()}-${index}`, stageId, role: '', purpose: '', instruction: '', outputFormat: '', selfCheck: '', handoff: '' }
}

export default function ArtifactEditor({ day, state, errors, onChange, onStatus }: Props) {
  const artifacts = state.artifacts
  function updateArtifacts(next: Partial<ChallengeStateV2['artifacts']>) { onChange({ ...state, artifacts: { ...artifacts, ...next } }) }
  function rootError(key: string) { return errors.find(({ field }) => field === key)?.message }

  if (day <= 3) {
    const key = day === 1 ? 'workflowBrief' : day === 2 ? 'contextPack' : 'outputContract'
    const artifact = artifacts[key] as Record<string, string>
    return <div className={styles.fieldStack} id={fieldId(key)}>
      {labels[key].map(([name, label]) => <Field key={name} path={`${key}.${name}`} label={label} value={artifact[name]} onChange={(value) => updateArtifacts({ [key]: { ...artifact, [name]: value } })} />)}
      {rootError(key) ? <p className={styles.inlineError} role="alert">{rootError(key)}</p> : null}
    </div>
  }

  if (day === 4) {
    const stages = artifacts.workflowMap
    function updateStage(index: number, next: WorkflowStage) { updateArtifacts({ workflowMap: stages.map((item, itemIndex) => itemIndex === index ? next : item) }) }
    return <div className={styles.fieldStack} id={fieldId('workflowMap')}>
      {stages.map((stage, index) => <fieldset className={styles.stageCard} key={stage.id}><legend>Bước {index + 1}</legend>
        <Field path={`workflowMap.${index}.name`} label="Tên bước" value={stage.name} onChange={(value) => updateStage(index, { ...stage, name: value })} />
        <Field path={`workflowMap.${index}.input`} label="Đầu vào" value={stage.input} onChange={(value) => updateStage(index, { ...stage, input: value })} />
        <Field path={`workflowMap.${index}.transformation`} label="Chuyển đổi" value={stage.transformation} onChange={(value) => updateStage(index, { ...stage, transformation: value })} />
        <Field path={`workflowMap.${index}.output`} label="Đầu ra" value={stage.output} onChange={(value) => updateStage(index, { ...stage, output: value })} />
        <Field path={`workflowMap.${index}.humanDecision`} label="Quyết định của con người" description="Nếu không có, ghi rõ “Không có quyết định bổ sung”." value={stage.humanDecision} onChange={(value) => updateStage(index, { ...stage, humanDecision: value })} />
        <Field path={`workflowMap.${index}.qualityGate`} label="Cổng chất lượng" description="Cần ít nhất hai cổng trong toàn bản đồ; các bước khác có thể để trống." value={stage.qualityGate} onChange={(value) => updateStage(index, { ...stage, qualityGate: value })} />
        <button className={styles.removeButton} type="button" onClick={() => updateArtifacts({ workflowMap: stages.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 aria-hidden="true" size={14} /> Xóa bước</button>
      </fieldset>)}
      {stages.length === 0 ? <button className={styles.addButton} type="button" onClick={() => updateArtifacts({ workflowMap: Array.from({ length: 4 }, (_, index) => newStage(index)) })}><Plus aria-hidden="true" size={16} /> Tạo bốn bước khởi đầu</button> : stages.length < 7 ? <button className={styles.addButton} type="button" onClick={() => updateArtifacts({ workflowMap: [...stages, newStage(stages.length)] })}><Plus aria-hidden="true" size={16} /> Thêm bước</button> : null}
      {rootError('workflowMap') ? <p className={styles.inlineError} role="alert">{rootError('workflowMap')}</p> : null}
    </div>
  }

  if (day === 5) {
    const instructions = artifacts.stepInstructions
    function syncInstructions() {
      updateArtifacts({ stepInstructions: artifacts.workflowMap.map((stage, index) => instructions.find(({ stageId }) => stage.id) ?? newInstruction(stage.id, index)) })
      onStatus('Đã tạo một thẻ hướng dẫn cho mỗi bước trong Bản đồ workflow.')
    }
    function updateInstruction(index: number, next: StepInstruction) { updateArtifacts({ stepInstructions: instructions.map((item, itemIndex) => itemIndex === index ? next : item) }) }
    function assemble() {
      const next = { ...state, artifacts: { ...artifacts, stepInstructions: instructions } }
      updateArtifacts({ runnableWorkflow: assembleRunnableWorkflow(next) })
      onStatus('Đã ghép các thẻ thành Workflow có thể chạy. Hãy đọc lại trước khi dùng.')
    }
    return <div className={styles.fieldStack} id={fieldId('runnableWorkflow')}>
      {(instructions.length !== artifacts.workflowMap.length || artifacts.workflowMap.some((stage) => !instructions.some(({ stageId }) => stageId === stage.id))) ? <button className={styles.assembleButton} type="button" onClick={syncInstructions}><Sparkles aria-hidden="true" size={16} /> Tạo thẻ theo bản đồ</button> : null}
      {instructions.map((item, index) => {
        const stage = artifacts.workflowMap.find(({ id }) => id === item.stageId)
        return <fieldset className={styles.stageCard} key={item.id}><legend>{stage?.name || `Bước ${index + 1}`}</legend>
          <SelectField path={`stepInstructions.${index}.role`} label="Vai trò" value={item.role} onChange={(value) => updateInstruction(index, { ...item, role: value as StepRole })}><option value="">Chọn vai trò</option><option value="human">Con người thực hiện</option><option value="ai">AI thực hiện</option><option value="shared">AI và con người cùng làm</option><option value="tool">Công cụ thực hiện</option></SelectField>
          {([['purpose', 'Mục đích'], ['instruction', 'Hướng dẫn thực hiện'], ['outputFormat', 'Định dạng đầu ra'], ['selfCheck', 'Quy tắc tự kiểm'], ['handoff', 'Dữ liệu bàn giao']] as const).map(([key, label]) => <Field key={key} path={`stepInstructions.${index}.${key}`} label={label} value={item[key]} onChange={(value) => updateInstruction(index, { ...item, [key]: value })} />)}
        </fieldset>
      })}
      <button className={styles.assembleButton} type="button" onClick={assemble}><Sparkles aria-hidden="true" size={16} /> Ghép thành Workflow có thể chạy</button>
      <Field path="runnableWorkflow" label="Bản workflow hoàn chỉnh" rows={18} value={artifacts.runnableWorkflow} onChange={(value) => updateArtifacts({ runnableWorkflow: value })} />
      <button className={styles.copyButton} type="button" onClick={async () => { try { await navigator.clipboard.writeText(artifacts.runnableWorkflow); onStatus('Đã sao chép Workflow có thể chạy.') } catch { onStatus('Bộ nhớ tạm bị chặn. Hãy chọn nội dung và sao chép thủ công.') } }}><Clipboard aria-hidden="true" size={15} /> Sao chép workflow</button>
      {rootError('runnableWorkflow') ? <p className={styles.inlineError} role="alert">{rootError('runnableWorkflow')}</p> : null}
    </div>
  }

  if (day === 6) {
    const run = artifacts.testRun
    function updateRun(next: Partial<typeof run>) { updateArtifacts({ testRun: { ...run, ...next } }) }
    function syncEntries() { updateRun({ entries: artifacts.workflowMap.map((stage, index) => run.entries.find(({ stageId }) => stage.id) ?? { id: `run-${Date.now()}-${index}`, stageId: stage.id, output: '', issue: '', intervention: '' }) }) }
    return <div className={styles.fieldStack} id={fieldId('testRun')}>
      <Field path="testRun.runInput" label="Đầu vào dùng để chạy thử" value={run.runInput} onChange={(value) => updateRun({ runInput: value })} />
      {run.entries.length !== artifacts.workflowMap.length ? <button className={styles.assembleButton} type="button" onClick={syncEntries}><Plus aria-hidden="true" size={16} /> Tạo nhật ký theo từng bước</button> : null}
      {run.entries.map((entry, index) => { const stage = artifacts.workflowMap.find(({ id }) => id === entry.stageId); return <fieldset className={styles.stageCard} key={entry.id}><legend>{stage?.name || `Bước ${index + 1}`}</legend>
        {([['output', 'Đầu ra của bước'], ['issue', 'Vấn đề quan sát được'], ['intervention', 'Can thiệp của con người']] as const).map(([key, label]) => <Field key={key} path={`testRun.entries.${index}.${key}`} label={label} value={entry[key]} onChange={(value) => updateRun({ entries: run.entries.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) })} />)}
      </fieldset> })}
      <Field path="testRun.finalContent" label="Đầu ra cuối" rows={8} value={run.finalContent} onChange={(value) => updateRun({ finalContent: value })} />
      <Field path="testRun.outputReview" label="Đánh giá theo Hợp đồng đầu ra" value={run.outputReview} onChange={(value) => updateRun({ outputReview: value })} />
      <SelectField path="testRun.failureCategory" label="Loại lỗi lớn nhất" value={run.failureCategory} onChange={(value) => updateRun({ failureCategory: value as TestFailureCategory })}><option value="">Chọn loại lỗi</option><option value="context">Lỗi ở bối cảnh</option><option value="input">Lỗi ở đầu vào</option><option value="instruction">Lỗi ở hướng dẫn</option><option value="handoff">Lỗi khi bàn giao</option><option value="role">Lỗi phân vai</option><option value="gate">Lỗi ở cổng chất lượng</option><option value="contract">Lỗi ở hợp đồng đầu ra</option></SelectField>
      {([['biggestFailure', 'Lỗi lớn nhất'], ['changeMade', 'Thay đổi đã làm'], ['rerunResult', 'Kết quả chạy lại']] as const).map(([key, label]) => <Field key={key} path={`testRun.${key}`} label={label} value={run[key]} onChange={(value) => updateRun({ [key]: value })} />)}
      {rootError('testRun') ? <p className={styles.inlineError} role="alert">{rootError('testRun')}</p> : null}
    </div>
  }

  const kit = artifacts.workflowKit
  const transfer = kit.transferBlueprint
  return <div className={styles.fieldStack} id={fieldId('workflowKit')}>
    {([['version', 'Phiên bản'], ['purpose', 'Mục đích'], ['preparation', 'Cần chuẩn bị'], ['runGuide', 'Hướng dẫn chạy'], ['commonFailures', 'Lỗi phổ biến và cách phục hồi'], ['updateTriggers', 'Khi nào cần cập nhật']] as const).map(([key, label]) => <Field key={key} path={`workflowKit.${key}`} label={label} value={kit[key]} onChange={(value) => updateArtifacts({ workflowKit: { ...kit, [key]: value } })} />)}
    <fieldset className={styles.stageCard}><legend>Bản thiết kế chuyển giao</legend>
      {([['workflowName', 'Tên workflow khác'], ['result', 'Kết quả cần tạo'], ['context', 'Bối cảnh ổn định'], ['outputContract', 'Hợp đồng đầu ra'], ['stages', 'Các bước chính'], ['humanDecisions', 'Điểm con người quyết định'], ['testPlan', 'Kế hoạch chạy thử']] as const).map(([key, label]) => <Field key={key} path={`workflowKit.transferBlueprint.${key}`} label={label} value={transfer[key]} onChange={(value) => updateArtifacts({ workflowKit: { ...kit, transferBlueprint: { ...transfer, [key]: value } } })} />)}
    </fieldset>
    {rootError('workflowKit') || rootError('artifacts') ? <p className={styles.inlineError} role="alert">{rootError('workflowKit') || rootError('artifacts')}</p> : null}
  </div>
}
