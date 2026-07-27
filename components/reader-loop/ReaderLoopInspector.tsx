'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readCredentials, readerApi } from '@/lib/reader-loop/client'
import type { ReaderLoopContent } from '@/lib/reader-loop/recommendation'
import styles from './reader-loop.module.css'

interface InspectorData {
  question: string | null
  recommendation: null | {
    primary: ReaderLoopContent
    alternatives: ReaderLoopContent[]
    reason_codes: string[]
  }
  session: null | {
    evidence?: {
      active_ms: number
      max_scroll_percent: number
      sections_seen: string[]
      meaningful_interaction_count: number
    }
  }
  completion: null | {
    manual_completion: { id: string }
    reflection: { key_takeaway: string; next_step: string }
    next_action: { label: string; reason: string }
  }
}

export default function ReaderLoopInspector() {
  const [data, setData] = useState<InspectorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const credentials = readCredentials()
    if (!credentials) { queueMicrotask(() => setLoading(false)); return }
    readerApi<InspectorData>('/v1/inspector', {}, credentials)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const recommendation = data?.recommendation
  const session = data?.session
  const completion = data?.completion

  return (
    <main className={styles.inspector}>
      <header>
        <Link href="/read" className={styles.backLink}><ArrowLeft aria-hidden size={17} /> Reader Loop</Link>
        <h1>Evidence Inspector</h1>
        <p>Chuỗi này chỉ thuộc mã ẩn danh đang lưu trong trình duyệt này. Nó phân biệt điều đã xảy ra với điều hệ thống quyết định.</p>
      </header>

      {loading ? <p className={styles.status} role="status">Đang dựng chuỗi bằng chứng…</p> : null}
      {error ? <p className={styles.inlineError} role="alert">Không thể tải chuỗi bằng chứng lúc này.</p> : null}
      {!loading && !error && !data?.question ? <p className={styles.emptyState}>Chưa có evidence. Hãy bắt đầu bằng một câu hỏi ở Reader Loop.</p> : null}

      {data?.question ? (
        <ol className={styles.evidenceChain}>
          <li><span>01 · Question</span><h2>Câu hỏi</h2><p>{data.question}</p></li>
          <li><span>02 · Candidate recommendations</span><h2>Các bài được cân nhắc</h2><ul>{[recommendation?.primary, ...(recommendation?.alternatives ?? [])].filter((item): item is ReaderLoopContent => Boolean(item)).map((item) => <li key={item.id}>{item.title}</li>)}</ul></li>
          <li><span>03 · Selected recommendation</span><h2>Bài được chọn</h2><p>{recommendation?.primary?.title ?? 'Chưa có'}</p></li>
          <li><span>04 · Reason codes</span><h2>Mã lý do</h2><ul>{(recommendation?.reason_codes ?? []).map((code: string) => <li key={code}>{code}</li>)}</ul></li>
          <li><span>05 · Reading evidence</span><h2>Bằng chứng đọc tổng hợp</h2>{session?.evidence ? <dl><div><dt>Active time</dt><dd>{Math.round(session.evidence.active_ms / 1000)} giây</dd></div><div><dt>Scroll coverage</dt><dd>{session.evidence.max_scroll_percent}%</dd></div><div><dt>Section coverage</dt><dd>{session.evidence.sections_seen.length} section</dd></div><div><dt>Meaningful interactions</dt><dd>{session.evidence.meaningful_interaction_count}</dd></div></dl> : <p>Chưa mở bài.</p>}</li>
          <li><span>06 · Manual completion</span><h2>Xác nhận hoàn thành</h2><p>{completion?.manual_completion ? 'Người đọc đã chủ động xác nhận.' : 'Chưa xác nhận.'}</p></li>
          <li><span>07 · Reflection</span><h2>Phản tư</h2>{completion?.reflection ? <blockquote><p>{completion.reflection.key_takeaway}</p><footer>{completion.reflection.next_step}</footer></blockquote> : <p>Chưa có phản tư.</p>}</li>
          <li><span>08 · Next-action decision</span><h2>Quyết định bước tiếp theo</h2>{completion?.next_action ? <><p>{completion.next_action.label}</p><small>{completion.next_action.reason}</small></> : <p>Chưa có quyết định.</p>}</li>
        </ol>
      ) : null}
    </main>
  )
}
