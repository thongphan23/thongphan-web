'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import type { Brain2LessonMeta, Brain2LessonPackage } from '@/lib/brain2/lesson-contract'
import { validateBrain2LessonPackage } from '@/lib/brain2/lesson-validation'
import { setBrain2ProtectedLessonLoaded } from '@/lib/brain2/progress'
import { brain2LessonHref } from '@/lib/brain2/routes'
import Brain2AccessGate from './Brain2AccessGate'
import { Brain2ConanLink } from './Brain2Analytics'
import Brain2LessonDocument from './Brain2LessonDocument'
import styles from './Brain2.module.css'

const API_ROOT = '/brain2/21-ngay/api'

type AccessState = 'checking' | 'unauthorized' | 'loading' | 'ready' | 'unavailable'

function LockedShell({
  meta,
  state,
  message,
  onRetry,
  children,
}: {
  meta: Brain2LessonMeta
  state: AccessState
  message: string
  onRetry: () => void
  children?: ReactNode
}) {
  const navigation = (
    <nav className={styles.lessonNavigation} aria-label="Điều hướng bài thực hành">
      <Link href={brain2LessonHref(meta.day - 1)}>← Ngày {String(meta.day - 1).padStart(2, '0')}</Link>
      {meta.day < 21 ? <Link href={brain2LessonHref(meta.day + 1)}>Ngày {String(meta.day + 1).padStart(2, '0')} →</Link> : <Link href="/brain2/21-ngay">Khép lại hành trình →</Link>}
    </nav>
  )

  return (
    <article className={styles.lessonDocument}>
      <header className={styles.lessonHeader}>
        <Link href="/brain2/21-ngay" className={styles.backLink}>Bản đồ 21 ngày</Link>
        <p>Ngày {String(meta.day).padStart(2, '0')} · Tuần {meta.week} · Dành cho Conan Maker</p>
        <h1>{meta.title}</h1>
        <strong>{meta.promise}</strong>
        <dl>
          <div><dt>Mục tiêu</dt><dd>{meta.objective}</dd></div>
          <div><dt>Thời lượng</dt><dd>{meta.estimatedMinutes.min}–{meta.estimatedMinutes.max} phút</dd></div>
        </dl>
      </header>

      {meta.day === 21 ? navigation : null}

      <section className={styles.lockedSheet} data-motion-surface data-access-state={state}>
        <p>Phần tiếp theo của lộ trình</p>
        <h2>{meta.day === 21 ? 'Đừng giữ Brain2 như một kho lưu trữ.' : 'Nội dung ngày này được mở cho Conan Maker.'}</h2>
        <span>{meta.day === 21 ? 'Khép lại 21 ngày bằng cách chọn một công việc thật để hệ thống tiếp tục phục vụ.' : meta.preview}</span>
        {message ? <p className={styles.accessStatus} aria-live="polite">{message}</p> : null}
        {state === 'unavailable' ? <button type="button" className={styles.retryAccess} onClick={onRetry}>Thử kiểm tra lại</button> : null}
        {children}
        {meta.day === 21 ? (
          <Brain2ConanLink placement="day-21">Tiếp tục thực hành trong Conan Maker →</Brain2ConanLink>
        ) : (
          <a href="/conanmaker/" data-motion-action>Tìm hiểu Conan Maker →</a>
        )}
      </section>

      {meta.day < 21 ? navigation : null}
    </article>
  )
}

export default function Brain2ProtectedLesson({ meta }: { meta: Brain2LessonMeta }) {
  const [state, setState] = useState<AccessState>('checking')
  const [lesson, setLesson] = useState<Brain2LessonPackage | null>(null)
  const [message, setMessage] = useState('Đang kiểm tra quyền truy cập…')
  const [clearError, setClearError] = useState('')
  const requestGenerationRef = useRef(0)
  const requestControllerRef = useRef<AbortController | null>(null)

  const invalidateRequests = useCallback(() => {
    requestGenerationRef.current += 1
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    return requestGenerationRef.current
  }, [])

  const beginRequest = useCallback(() => {
    const generation = invalidateRequests()
    const controller = new AbortController()
    requestControllerRef.current = controller
    return {
      controller,
      generation,
      isCurrent: () =>
        requestGenerationRef.current === generation &&
        requestControllerRef.current === controller &&
        !controller.signal.aborted,
    }
  }, [invalidateRequests])

  const loadLesson = useCallback(async () => {
    const { controller, isCurrent } = beginRequest()
    setState('loading')
    setMessage('Đang mở nội dung ngày này…')
    setClearError('')
    try {
      const response = await fetch(`${API_ROOT}/lessons/${meta.slug}`, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!isCurrent()) return
      if (response.status === 401) {
        setState('unauthorized')
        setMessage('')
        return
      }
      if (!response.ok) throw new Error(`lesson:${response.status}`)
      const value: unknown = await response.json()
      const validated = await validateBrain2LessonPackage(value, meta)
      if (!isCurrent()) return
      if (!validated) throw new Error('lesson:invalid')
      setBrain2ProtectedLessonLoaded(meta.slug, true)
      setLesson(validated)
      setState('ready')
      setMessage('')
    } catch {
      if (!isCurrent()) return
      setBrain2ProtectedLessonLoaded(meta.slug, false)
      setState('unavailable')
      setMessage('Tạm thời chưa tải được nội dung. Bạn có thể thử lại mà không mất tiến độ.')
    } finally {
      if (isCurrent()) requestControllerRef.current = null
    }
  }, [beginRequest, meta])

  const checkAccess = useCallback(async () => {
    const { controller, isCurrent } = beginRequest()
    setState('checking')
    setMessage('Đang kiểm tra quyền truy cập…')
    setClearError('')
    try {
      const response = await fetch(`${API_ROOT}/access`, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!isCurrent()) return
      if (response.status === 401) {
        setState('unauthorized')
        setMessage('')
        return
      }
      if (!response.ok) throw new Error(`access:${response.status}`)
      await loadLesson()
    } catch {
      if (!isCurrent()) return
      setState('unavailable')
      setMessage('Tạm thời chưa kiểm tra được quyền truy cập. Bạn có thể thử lại sau.')
    } finally {
      if (isCurrent()) requestControllerRef.current = null
    }
  }, [beginRequest, loadLesson])

  useEffect(() => {
    void checkAccess()
    return () => {
      invalidateRequests()
      setBrain2ProtectedLessonLoaded(meta.slug, false)
    }
  }, [checkAccess, invalidateRequests, meta.slug])

  async function clearAccess() {
    const { controller, isCurrent } = beginRequest()
    setClearError('')
    try {
      const response = await fetch(`${API_ROOT}/access`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!isCurrent()) return
      if (!response.ok) throw new Error(`access-delete:${response.status}`)
      setBrain2ProtectedLessonLoaded(meta.slug, false)
      setLesson(null)
      setState('unauthorized')
      setMessage('')
    } catch {
      if (!isCurrent()) return
      setClearError('Chưa khóa được quyền truy cập trên máy chủ. Nội dung vẫn đang mở; hãy thử lại.')
    } finally {
      if (isCurrent()) requestControllerRef.current = null
    }
  }

  if (state === 'ready' && lesson) {
    return (
      <div className={styles.authorizedLesson}>
        <div className={styles.accessToolbar}>
          <div>
            <span>Quyền Conan Maker đang hoạt động trên trình duyệt này.</span>
            {clearError ? <p role="alert">{clearError}</p> : null}
          </div>
          <button type="button" onClick={clearAccess}>{clearError ? 'Thử khóa lại' : 'Khóa lại quyền truy cập'}</button>
        </div>
        <Brain2LessonDocument lesson={lesson} />
      </div>
    )
  }

  return (
    <LockedShell meta={meta} state={state} message={message} onRetry={checkAccess}>
      {state === 'unauthorized' ? <Brain2AccessGate day={meta.day} onGranted={loadLesson} /> : null}
    </LockedShell>
  )
}
