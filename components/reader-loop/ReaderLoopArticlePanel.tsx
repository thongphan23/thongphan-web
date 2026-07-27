'use client'

import Link from 'next/link'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { readCredentials, readerApi, type ReaderCredentials } from '@/lib/reader-loop/client'
import styles from './reader-loop.module.css'

interface SessionPayload {
  session: {
    id: string
    content_url: string
    status: 'opened' | 'in_progress' | 'completed'
    evidence: {
      visible_ms: number
      active_ms: number
      max_scroll_percent: number
      sections_seen: string[]
      meaningful_interaction_count: number
    }
  }
}

interface CompletionPayload {
  next_action: {
    type: string
    label: string
    url: string
    reason: string
    evidence_used: string[]
    unknowns: string[]
  }
}

export default function ReaderLoopArticlePanel({ slug, title }: { slug: string; title: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<ReaderCredentials | null>(null)
  const [session, setSession] = useState<SessionPayload['session'] | null>(null)
  const [showReflection, setShowReflection] = useState(false)
  const [completion, setCompletion] = useState<CompletionPayload | null>(null)
  const [keyTakeaway, setKeyTakeaway] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const [sessionMismatch, setSessionMismatch] = useState(false)
  const metrics = useRef({ visibleMs: 0, activeMs: 0, maxScroll: 0, sections: new Set<string>(), interactions: 0, lastActivity: 0 })

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('readerLoopSession')
    const reader = readCredentials()
    if (!id || !reader) return
    queueMicrotask(() => {
      setSessionId(id)
      setCredentials(reader)
      readerApi<SessionPayload>(`/v1/reading-sessions/${encodeURIComponent(id)}`, {}, reader)
        .then((payload) => {
          if (payload.session.content_url !== `/library/${slug}`) {
            setSessionMismatch(true)
            return
          }
          setSession(payload.session)
          metrics.current = {
            visibleMs: payload.session.evidence.visible_ms,
            activeMs: payload.session.evidence.active_ms,
            maxScroll: payload.session.evidence.max_scroll_percent,
            sections: new Set(payload.session.evidence.sections_seen),
            interactions: payload.session.evidence.meaningful_interaction_count,
            lastActivity: Date.now(),
          }
        })
        .catch(() => setError(true))
    })
  }, [slug])

  const syncEvidence = useCallback(async () => {
    if (!sessionId || !credentials || !session) return
    const state = metrics.current
    const payload = await readerApi<{ evidence: SessionPayload['session']['evidence'] }>(`/v1/reading-sessions/${encodeURIComponent(sessionId)}/evidence`, {
      method: 'POST',
      body: JSON.stringify({
        content_url: `/library/${slug}`,
        visible_ms: state.visibleMs,
        active_ms: state.activeMs,
        max_scroll_percent: state.maxScroll,
        sections_seen: [...state.sections],
        meaningful_interaction_count: state.interactions,
      }),
    }, credentials)
    setSession((current) => current ? { ...current, status: 'in_progress', evidence: payload.evidence } : current)
  }, [credentials, session, sessionId, slug])

  useEffect(() => {
    if (!sessionId || !credentials || !session) return
    if (session.status === 'completed') return
    const state = metrics.current
    const markActivity = () => { state.lastActivity = Date.now(); state.interactions = Math.min(1000, state.interactions + 1) }
    const measureScroll = () => {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      state.maxScroll = Math.max(state.maxScroll, Math.round((window.scrollY / available) * 100))
      markActivity()
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) state.sections.add((entry.target as HTMLElement).id)
    }, { threshold: 0.4 })
    document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]').forEach((heading) => observer.observe(heading))
    window.addEventListener('scroll', measureScroll, { passive: true })
    window.addEventListener('pointerdown', markActivity, { passive: true })
    window.addEventListener('keydown', markActivity)
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        state.visibleMs += 1000
        if (Date.now() - state.lastActivity < 30_000) state.activeMs += 1000
      }
    }, 1000)
    const syncTimer = window.setInterval(() => { void syncEvidence().catch(() => setError(true)) }, 5000)
    const syncBeforeLeave = () => { void syncEvidence().catch(() => undefined) }
    const syncWhenHidden = () => { if (document.visibilityState === 'hidden') syncBeforeLeave() }
    window.addEventListener('pagehide', syncBeforeLeave)
    document.addEventListener('visibilitychange', syncWhenHidden)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
      window.clearInterval(syncTimer)
      window.removeEventListener('scroll', measureScroll)
      window.removeEventListener('pointerdown', markActivity)
      window.removeEventListener('keydown', markActivity)
      window.removeEventListener('pagehide', syncBeforeLeave)
      document.removeEventListener('visibilitychange', syncWhenHidden)
    }
  }, [sessionId, credentials, session, syncEvidence])

  async function submitReflection(event: FormEvent) {
    event.preventDefault()
    if (!sessionId || !credentials || !session) return
    setSaving(true)
    setError(false)
    try {
      await syncEvidence()
      const result = await readerApi<CompletionPayload>(`/v1/reading-sessions/${encodeURIComponent(sessionId)}/complete`, {
        method: 'POST', body: JSON.stringify({ content_url: `/library/${slug}`, key_takeaway: keyTakeaway, next_step: nextStep }),
      }, credentials)
      setCompletion(result)
      setSession((current) => current ? { ...current, status: 'completed' } : current)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  if (!sessionId) return null

  return (
    <section className={styles.articlePanel} aria-labelledby="reader-loop-panel-title">
      <div className={styles.articlePanelHeader}>
        <p>Reader Loop · Bài đang đọc</p>
        <Link href="/read/inspector">Xem evidence <ArrowRight aria-hidden size={16} /></Link>
      </div>
      <h2 id="reader-loop-panel-title">{title}</h2>
      <p className={styles.dataNotice}>Trang chỉ gửi active time, mức bao phủ, section đã thấy và tổng tương tác có ý nghĩa — không gửi dòng cuộn hay thao tác thô. Không nhập email hoặc số điện thoại vào phần phản tư.</p>

      {sessionMismatch ? <p className={styles.inlineError} role="alert">Reading session không thuộc bài viết này. Không có evidence hoặc completion nào được gửi.</p> : null}
      {error ? <p className={styles.inlineError} role="alert">Không thể lưu tiến trình. Nội dung bài vẫn đọc được; hãy thử lại khi kết nối ổn định.</p> : null}
      {!session && !error && !sessionMismatch ? <p role="status">Đang mở lại reading session…</p> : null}

      {session && !completion && !showReflection && session.status !== 'completed' ? (
        <button type="button" className={styles.completeButton} onClick={() => { void syncEvidence().catch(() => setError(true)); setShowReflection(true) }}>
          <Check aria-hidden size={18} /> Đánh dấu đã đọc xong
        </button>
      ) : null}

      {showReflection && !completion ? (
        <form className={styles.reflectionForm} onSubmit={submitReflection}>
          <label>Điều quan trọng nhất rút ra<textarea required maxLength={1200} value={keyTakeaway} onChange={(event) => setKeyTakeaway(event.target.value)} /></label>
          <label>Bước dự định làm tiếp<textarea required maxLength={1200} value={nextStep} onChange={(event) => setNextStep(event.target.value)} /></label>
          <button type="submit" className={styles.completeButton} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu phản tư và nhận bước tiếp theo'}</button>
        </form>
      ) : null}

      {completion ? (
        <div className={styles.nextAction}>
          <p>Bước tiếp theo</p>
          <h3>{completion.next_action.label}</h3>
          <span>{completion.next_action.reason}</span>
          <Link href={completion.next_action.url}>Đi tới bước này <ArrowRight aria-hidden size={17} /></Link>
        </div>
      ) : null}

      {error ? <button className={styles.retryButton} type="button" onClick={() => { setError(false); void syncEvidence().catch(() => setError(true)) }}><RotateCcw aria-hidden size={16} /> Thử lưu lại</button> : null}
    </section>
  )
}
