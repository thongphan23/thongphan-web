'use client'

import Link from 'next/link'
import { ArrowRight, BookOpenText, RotateCcw } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { SAMPLE_QUESTIONS, type ReaderLoopContent } from '@/lib/reader-loop/recommendation'
import { ensureCredentials, readerApi, type ReaderCredentials } from '@/lib/reader-loop/client'
import styles from './reader-loop.module.css'

interface Recommendation {
  decision_id: string
  policy_version: string
  primary: ReaderLoopContent
  alternatives: ReaderLoopContent[]
  reason: string
  reason_codes: string[]
  expected_outcome: string
  unknowns: string[]
}

interface ReaderState {
  active_session: null | {
    id: string
    content_id: string
    content_url: string
    status: string
    evidence?: { max_scroll_percent: number; active_ms: number }
  }
  latest_completion: null | {
    next_action: { type: string; label: string; reason: string; url: string }
  }
}

export default function ReaderLoopWorkspace() {
  const [credentials, setCredentials] = useState<ReaderCredentials | null>(null)
  const [selected, setSelected] = useState<string>('expertise_asset')
  const [customQuestion, setCustomQuestion] = useState('')
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [readerState, setReaderState] = useState<ReaderState | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  async function loadState() {
    setLoading(true)
    setError(false)
    try {
      const nextCredentials = await ensureCredentials()
      const nextState = await readerApi<ReaderState>('/v1/state', {}, nextCredentials)
      setCredentials(nextCredentials)
      setReaderState(nextState)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { queueMicrotask(() => { void loadState() }) }, [])

  async function submitQuestion(event: FormEvent) {
    event.preventDefault()
    const questionId = selected === 'custom' ? 'custom' : selected
    const questionText = selected === 'custom'
      ? customQuestion.trim()
      : SAMPLE_QUESTIONS.find((item) => item.id === selected)?.label
    if (!questionText || !credentials) return

    setSubmitting(true)
    setError(false)
    try {
      const result = await readerApi<Recommendation>('/v1/recommendations', {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId, question_text: questionText }),
      }, credentials)
      setRecommendation(result)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  async function startReading() {
    if (!recommendation || !credentials) return
    setSubmitting(true)
    setError(false)
    try {
      const session = await readerApi<{ session_id: string; content_url: string }>('/v1/reading-sessions', {
        method: 'POST', body: JSON.stringify({ decision_id: recommendation.decision_id }),
      }, credentials)
      window.location.assign(`${session.content_url}?readerLoopSession=${encodeURIComponent(session.session_id)}`)
    } catch {
      setError(true)
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.workspace}>
      <header className={styles.workspaceHeader}>
        <Link href="/library" className={styles.backLink}>Thư viện</Link>
        <div className={styles.titleGrid}>
          <div>
            <h1>Một bài đọc đúng lúc.</h1>
            <p>Gọi tên điều đang vướng, đọc một bài có lý do, rồi giữ lại một bước để làm.</p>
          </div>
          <ol className={styles.progress} aria-label="Tiến trình Reader Loop">
            <li data-active={!recommendation}>01 <span>Chọn vấn đề</span></li>
            <li data-active={Boolean(recommendation)}>02 <span>Đọc có mục đích</span></li>
            <li data-active={Boolean(readerState?.latest_completion)}>03 <span>Phản tư và đi tiếp</span></li>
          </ol>
        </div>
      </header>

      {loading ? <p className={styles.status} role="status">Đang nối lại mạch đọc…</p> : null}
      {error ? (
        <section className={styles.errorState} role="alert">
          <h2>Không thể tải đề xuất lúc này.</h2>
          <p>Thư viện vẫn hoạt động bình thường. Có thể thử nối lại Reader Loop hoặc tự chọn một bài.</p>
          <button type="button" onClick={() => void loadState()}><RotateCcw aria-hidden size={17} /> Thử lại</button>
          <Link href="/library">Mở thư viện</Link>
        </section>
      ) : null}

      {!loading && !error && readerState?.active_session ? (
        <section className={styles.resume} aria-labelledby="resume-title">
          <div>
            <p>Đang đọc dở</p>
            <h2 id="resume-title">Mạch đọc trước vẫn còn đây.</h2>
            <span>Đã đi qua {readerState.active_session.evidence?.max_scroll_percent ?? 0}% bài đọc.</span>
          </div>
          <Link href={`${readerState.active_session.content_url}?readerLoopSession=${encodeURIComponent(readerState.active_session.id)}`}>
            Tiếp tục đọc <ArrowRight aria-hidden size={18} />
          </Link>
        </section>
      ) : null}

      {!loading && !error && !readerState?.active_session && !recommendation ? (
        <p className={styles.emptyState}>Chưa có mạch đọc nào. Bắt đầu từ câu hỏi đang có ý nghĩa nhất với anh/chị.</p>
      ) : null}

      <section className={styles.questionSection} aria-labelledby="reader-question-title">
        <div className={styles.sectionNumber}>01</div>
        <div>
          <h2 id="reader-question-title">Hiện tại anh/chị đang muốn giải quyết điều gì nhất?</h2>
          <form onSubmit={submitQuestion} className={styles.questionForm}>
            <fieldset disabled={submitting || loading}>
              <legend className="sr-only">Chọn vấn đề hiện tại</legend>
              {SAMPLE_QUESTIONS.map((question, index) => (
                <label key={question.id} data-selected={selected === question.id}>
                  <input type="radio" name="question" value={question.id} checked={selected === question.id} onChange={() => setSelected(question.id)} />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{question.label}</strong>
                </label>
              ))}
              <label data-selected={selected === 'custom'}>
                <input type="radio" name="question" value="custom" checked={selected === 'custom'} onChange={() => setSelected('custom')} />
                <span>06</span>
                <strong>Câu hỏi khác</strong>
              </label>
            </fieldset>
            {selected === 'custom' ? (
              <label className={styles.customQuestion}>
                Viết ngắn điều anh/chị đang mắc kẹt
                <textarea maxLength={500} required value={customQuestion} onChange={(event) => setCustomQuestion(event.target.value)} />
              </label>
            ) : null}
            <button className={styles.primaryButton} type="submit" disabled={submitting || loading || !credentials}>
              {submitting ? 'Đang chọn bài…' : 'Nhận một bài để bắt đầu'} <ArrowRight aria-hidden size={18} />
            </button>
          </form>
          <p className={styles.dataNotice}>Chỉ lưu một mã ẩn danh, câu hỏi và bằng chứng đọc tổng hợp trên hạ tầng preview. Không nhập email hoặc số điện thoại; hệ thống không lưu IP, thao tác chuột hay phím bấm.</p>
        </div>
      </section>

      {recommendation ? (
        <section className={styles.recommendation} aria-labelledby="recommendation-title">
          <div className={styles.sectionNumber}>02</div>
          <div>
            <p className={styles.kicker}>Gợi ý để bắt đầu · {recommendation.policy_version}</p>
            <h2 id="recommendation-title">{recommendation.primary.title}</h2>
            <p className={styles.reason}>{recommendation.reason}</p>
            <dl>
              <div><dt>Kết quả mong đợi</dt><dd>{recommendation.expected_outcome}</dd></div>
              <div><dt>Điều chưa biết</dt><dd>{recommendation.unknowns.join(' ')}</dd></div>
            </dl>
            <button className={styles.primaryButton} type="button" onClick={() => void startReading()} disabled={submitting}>
              <BookOpenText aria-hidden size={18} /> Đọc bài này
            </button>
            <div className={styles.alternatives}>
              <h3>Hai lối đọc khác</h3>
              {recommendation.alternatives.map((item) => <Link key={item.id} href={item.url}>{item.title}<ArrowRight aria-hidden size={16} /></Link>)}
            </div>
          </div>
        </section>
      ) : null}

      <footer className={styles.workspaceFooter}>
        <p>Muốn xem hệ thống đã dùng bằng chứng nào?</p>
        <Link href="/read/inspector">Mở Evidence Inspector <ArrowRight aria-hidden size={17} /></Link>
      </footer>
    </main>
  )
}
