'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, RotateCcw } from 'lucide-react'
import ArtifactEditor from './ArtifactEditor'
import LearningResources from './LearningResources'
import { CONTENT_WORKFLOW_DAYS, type ContentWorkflowDay } from '@/lib/content-workflow/content'
import { buildStarterKitMarkdown, starterKitFilename } from '@/lib/content-workflow/export'
import { ARTIFACT_KEYS, createEmptyChallengeState, getArtifactCoverage, validateDay, type ChallengeStateV2, type ValidationError } from '@/lib/content-workflow/model'
import { clearChallengeState, readChallengeState, writeChallengeState } from '@/lib/content-workflow/storage'
import styles from './ContentWorkflow.module.css'

const ROOT = '/challenge/content-workflow-7days'
const artifactLabels = ['Bản mô tả workflow', 'Hồ sơ bối cảnh', 'Hợp đồng đầu ra', 'Bản đồ workflow', 'Workflow có thể chạy', 'Nhật ký chạy thử', 'Bộ workflow hoàn chỉnh'] as const

export default function ChallengeWorkbench({ lesson }: { lesson: ContentWorkflowDay }) {
  const router = useRouter()
  const resetDialogRef = useRef<HTMLDialogElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ChallengeStateV2>(() => createEmptyChallengeState())
  const [hydrated, setHydrated] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Đang mở sổ bài tập trên thiết bị…')
  const [actionStatus, setActionStatus] = useState('')
  const [errors, setErrors] = useState<ValidationError[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readChallengeState()
      setState({ ...saved, currentDay: lesson.day, updatedAt: new Date().toISOString() })
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [lesson.day])

  useEffect(() => {
    if (!hydrated) return
    const timer = window.setTimeout(() => {
      const saved = writeChallengeState(state)
      setSaveStatus(saved ? `Đã lưu trên thiết bị lúc ${new Intl.DateTimeFormat('vi', { hour: '2-digit', minute: '2-digit' }).format(new Date())}` : 'Không thể lưu tự động · hãy tải Bộ workflow trước khi đóng trình duyệt')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [hydrated, state])

  function changeState(next: ChallengeStateV2) {
    setState({ ...next, updatedAt: new Date().toISOString() })
    setErrors([])
  }

  function runGate() {
    const result = validateDay(lesson.day, state)
    setErrors(result.errors)
    if (!result.valid) {
      setActionStatus('Sản phẩm chưa vượt cổng chất lượng. Hãy đọc điểm cần sửa bên dưới.')
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0)
      return
    }
    changeState({ ...state, completedDays: state.completedDays.includes(lesson.day) ? state.completedDays : [...state.completedDays, lesson.day].sort((a, b) => a - b) })
    setActionStatus(`Ngày ${lesson.day} đã hoàn thành. Bạn vẫn là người chịu trách nhiệm về chất lượng và sự thật của đầu ra.`)
  }

  function exportMarkdown() {
    const url = URL.createObjectURL(new Blob([buildStarterKitMarkdown(state)], { type: 'text/markdown;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = starterKitFilename(); anchor.click(); URL.revokeObjectURL(url)
    setActionStatus('Đã tải Bộ workflow thành tệp Markdown (.md).')
  }

  async function copyKit() {
    try { await navigator.clipboard.writeText(buildStarterKitMarkdown(state)); setActionStatus('Đã sao chép toàn bộ Bộ workflow.') }
    catch { setActionStatus('Bộ nhớ tạm bị chặn. Hãy dùng nút tải tệp Markdown.') }
  }

  function resetChallenge() {
    const cleared = clearChallengeState(); resetDialogRef.current?.close()
    if (cleared) router.push(ROOT)
    else setActionStatus('Không thể xóa bộ nhớ cục bộ. Hãy xóa dữ liệu trang trong cài đặt trình duyệt.')
  }

  const completedCount = state.completedDays.length
  const coverage = getArtifactCoverage(state)
  const nextDay = Math.min(7, lesson.day + 1)

  return <div className={styles.workbench} data-hydrated={hydrated}>
    <header className={styles.workbenchHeader}>
      <Link href={ROOT}><ArrowLeft aria-hidden="true" size={17} /> Workflow 7 ngày</Link>
      <p aria-live="polite">{saveStatus}</p>
      <button type="button" onClick={() => resetDialogRef.current?.showModal()}><RotateCcw aria-hidden="true" size={15} /> Đặt lại</button>
    </header>
    <div className={styles.workspace}>
      <nav className={styles.dayNav} aria-label="Bảy ngày thực hành">
        <div className={styles.progressSummary}><span>Tiến độ</span><strong>{completedCount}/7</strong><div><i style={{ width: `${completedCount / 7 * 100}%` }} /></div></div>
        <ol>{CONTENT_WORKFLOW_DAYS.map((item) => { const complete = state.completedDays.includes(item.day); return <li key={item.slug} data-current={item.day === lesson.day} data-complete={complete}><Link href={`${ROOT}/${item.slug}`}><span>{complete ? <Check aria-hidden="true" size={14} /> : String(item.day).padStart(2, '0')}</span><small>Ngày {item.day}</small><strong>{artifactLabels[item.day - 1]}</strong></Link></li> })}</ol>
        <p>Tất cả ngày đều mở. Bạn có thể xem trước, nhưng sản phẩm cuối cần đủ bảy lớp.</p>
      </nav>
      <main className={styles.lessonCanvas}>
        <header className={styles.lessonHeader}><span>Ngày {String(lesson.day).padStart(2, '0')} / 07 · {lesson.duration}</span><h1>{lesson.title}</h1><p>{lesson.question}</p></header>
        <section className={styles.learnSection} aria-labelledby="problem-title"><h2 id="problem-title"><span>01</span> Bài toán hôm nay</h2><blockquote>{lesson.problem}</blockquote></section>
        <section className={styles.learnSection} aria-labelledby="theory-title"><h2 id="theory-title"><span>02</span> Khái niệm lõi</h2><div className={styles.theoryGrid}>{lesson.theory.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
        <section className={styles.learnSection} aria-labelledby="boundary-title"><h2 id="boundary-title"><span>03</span> Ranh giới và hiểu lầm</h2><div className={styles.misconceptionList}>{lesson.misconceptions.map((item) => <article key={item.myth}><strong>Không phải: {item.myth}</strong><p>Thay vào đó: {item.correction}</p></article>)}</div></section>
        <section className={styles.caseSection} aria-labelledby="case-title"><h2 id="case-title"><span>04</span> Conan làm mẫu</h2><div><small>{lesson.conanCase.label}</small><h3>{lesson.conanCase.title}</h3><p>{lesson.conanCase.body}</p><p><strong>Quyết định:</strong> {lesson.conanCase.decision}</p><em>{lesson.conanCase.disclosure}</em></div></section>
        <section className={styles.taskSection} aria-labelledby="practice-title"><h2 id="practice-title"><span>05</span> Bạn tự xây</h2><ol>{lesson.practice.map((item) => <li key={item}>{item}</li>)}</ol><p><strong>Bản tối thiểu:</strong> {lesson.minimum}</p></section>
        <section className={styles.aiLab} aria-labelledby="ai-lab-title"><h2 id="ai-lab-title">Đào sâu với AI · {lesson.aiLab.duration}</h2><p>{lesson.aiLab.role}</p><pre>{lesson.aiLab.prompt}</pre></section>
        <LearningResources day={lesson.day} />
        <aside className={styles.insideConan}><strong>Bên trong Conan</strong><p>{lesson.insideConan}</p></aside>
      </main>
      <aside className={styles.artifactDesk} aria-label={`Bàn tạo ${artifactLabels[lesson.day - 1]}`}>
        <header><p>Bàn tạo sản phẩm</p><h2>{artifactLabels[lesson.day - 1]}</h2><span>Dữ liệu chỉ lưu trong bộ nhớ cục bộ của trình duyệt này.</span></header>
        <div className={styles.formBody}><ArtifactEditor day={lesson.day} state={state} errors={errors} onChange={changeState} onStatus={setActionStatus} /></div>
        <section className={styles.gateSection} aria-labelledby="gate-title"><h3 id="gate-title"><span>07</span> Tự kiểm và sửa</h3><ul>{lesson.qualityGate.map((item) => <li key={item}>{item}</li>)}</ul><p className={styles.revisionPrompt}><strong>Lần sửa bắt buộc:</strong> {lesson.revision}</p>
          {errors.length ? <div className={styles.errorSummary} role="alert" tabIndex={-1} ref={errorSummaryRef}><strong>Còn {errors.length} điểm cần sửa</strong><ul>{errors.map((item) => <li key={`${item.field}-${item.message}`}><a href={`#field-${item.field}`}>{item.message}</a></li>)}</ul></div> : null}
          <button className={styles.gateButton} type="button" onClick={runGate}>Kiểm tra và xác nhận hoàn thành <Check aria-hidden="true" size={17} /></button>
          {state.completedDays.includes(lesson.day) && lesson.day < 7 ? <Link className={styles.nextButton} href={`${ROOT}/day-${String(nextDay).padStart(2, '0')}`}>Sang Ngày {String(nextDay).padStart(2, '0')} <ArrowRight aria-hidden="true" size={17} /></Link> : null}
        </section>
        <p className={styles.liveStatus} aria-live="polite">{actionStatus}</p>
        {lesson.day === 7 ? <><div className={styles.coverageLedger}><strong>{Object.values(coverage).filter(Boolean).length}/7 sản phẩm đạt</strong><ul>{ARTIFACT_KEYS.map((key, index) => <li key={key} data-complete={coverage[key]}><span>{coverage[key] ? <Check aria-hidden="true" size={13} /> : '—'}</span>{artifactLabels[index]}</li>)}</ul></div><div className={styles.exportActions}><button type="button" onClick={exportMarkdown}><Download aria-hidden="true" size={16} /> Tải tệp Markdown</button><button type="button" onClick={copyKit}><Clipboard aria-hidden="true" size={16} /> Sao chép Bộ workflow</button></div></> : null}
      </aside>
    </div>
    <dialog ref={resetDialogRef} className={styles.resetDialog} onCancel={() => resetDialogRef.current?.close()}><h2>Xóa toàn bộ bài làm trên thiết bị này?</h2><p>Tiến độ và bảy sản phẩm trong trình duyệt sẽ mất. Tệp Markdown đã tải không bị ảnh hưởng.</p><div><button type="button" onClick={() => resetDialogRef.current?.close()}>Giữ lại</button><button type="button" onClick={resetChallenge}>Xóa và về trang đầu</button></div></dialog>
  </div>
}
