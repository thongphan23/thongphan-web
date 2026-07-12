'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

import { dispatchBrain2Event } from './Brain2Analytics'
import styles from './Brain2.module.css'

const API_ROOT = '/brain2/21-ngay/api'

export default function Brain2AccessGate({
  day,
  onGranted,
}: {
  day: number
  onGranted: () => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const submissionGenerationRef = useRef(0)
  const submissionControllerRef = useRef<AbortController | null>(null)

  const invalidateSubmission = useCallback(() => {
    submissionGenerationRef.current += 1
    submissionControllerRef.current?.abort()
    submissionControllerRef.current = null
  }, [])

  useEffect(() => () => invalidateSubmission(), [invalidateSubmission])

  useEffect(() => {
    if (!open) return
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [open])

  function close() {
    invalidateSubmission()
    setSubmitting(false)
    setOpen(false)
    setCode('')
    setError('')
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function openGate() {
    setOpen(true)
    dispatchBrain2Event({ name: 'brain2_access_gate_viewed', detail: { day } })
  }

  function containFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]') ?? [])]
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable.at(-1) ?? first
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!code.trim() || submitting) return
    invalidateSubmission()
    const generation = submissionGenerationRef.current
    const controller = new AbortController()
    submissionControllerRef.current = controller
    const isCurrent = () =>
      submissionGenerationRef.current === generation &&
      submissionControllerRef.current === controller &&
      !controller.signal.aborted
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(`${API_ROOT}/access`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code }),
        signal: controller.signal,
      })
      if (!isCurrent()) return
      if (!response.ok) {
        const category = response.status === 429 ? 'rate-limited' : response.status >= 500 ? 'unavailable' : 'invalid'
        dispatchBrain2Event({ name: 'brain2_access_failed', detail: { day, category } })
        setError(response.status === 429
          ? 'Thử lại sau. Hệ thống đang tạm giới hạn số lần nhập.'
          : response.status >= 500
            ? 'Tạm thời chưa kiểm tra được quyền truy cập. Bạn có thể thử lại sau.'
            : 'Mã chưa đúng. Vui lòng kiểm tra và thử lại.')
        return
      }
      dispatchBrain2Event({ name: 'brain2_access_granted', detail: { day } })
      setCode('')
      setOpen(false)
      await onGranted()
    } catch {
      if (!isCurrent()) return
      dispatchBrain2Event({ name: 'brain2_access_failed', detail: { day, category: 'unavailable' } })
      setError('Tạm thời chưa kiểm tra được quyền truy cập. Bạn có thể thử lại sau.')
    } finally {
      if (isCurrent()) {
        submissionControllerRef.current = null
        setSubmitting(false)
      }
    }
  }

  const dialog = open ? (
    <div className={styles.dialogBackdrop}>
      <div
        ref={dialogRef}
        className={styles.accessDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brain2-access-title"
        onKeyDown={containFocus}
      >
        <button type="button" className={styles.dialogClose} onClick={close} aria-label="Đóng cửa sổ nhập mã">Đóng</button>
        <p>Quyền Conan Maker</p>
        <h2 id="brain2-access-title">Mở phần thực hành chuyên sâu</h2>
        <span>Mã chỉ được gửi đến máy chủ để xác thực và không được lưu trong trình duyệt.</span>
        <form onSubmit={submit}>
          <label htmlFor="brain2-access-code">Mã truy cập</label>
          <input
            ref={inputRef}
            id="brain2-access-code"
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            required
          />
          <button type="submit" disabled={submitting}>{submitting ? 'Đang kiểm tra…' : 'Xác nhận'}</button>
        </form>
        <p className={styles.gateError} aria-live="polite">{error}</p>
      </div>
    </div>
  ) : null

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.gateTrigger} onClick={openGate} data-motion-action>Mở bằng mã Conan Maker</button>
      {dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}
