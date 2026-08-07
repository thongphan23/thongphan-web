'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { nextChallengeDay, type ChallengeStateV1, type ReadinessKey } from '@/lib/content-workflow/model'
import { clearChallengeState, readChallengeState, writeChallengeState } from '@/lib/content-workflow/storage'
import styles from '@/app/challenge/content-workflow-7days/page.module.css'

const CHALLENGE_ROOT = '/challenge/content-workflow-7days'
const readinessItems: ReadonlyArray<{ key: ReadinessKey; label: string; help: string }> = [
  { key: 'offer', label: 'Tôi biết business/offer nào sẽ dùng.', help: 'Chọn một offer đang bán hoặc sắp kiểm chứng.' },
  { key: 'customer', label: 'Tôi chọn được một nhóm khách hàng có thật.', help: 'Không cần rộng; cần một nhóm trong một hoàn cảnh cụ thể.' },
  { key: 'evidence', label: 'Tôi có hoặc biết cách tìm customer evidence.', help: 'Inbox, bình luận, sales call, email hoặc cuộc trò chuyện trực tiếp.' },
  { key: 'channel', label: 'Tôi có một kênh để đưa content tới người thật.', help: 'Có thể đăng công khai hoặc gửi trực tiếp cho khách hàng phù hợp.' },
]

export default function ChallengeHubClient() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<ChallengeStateV1 | null>(null)
  const [readiness, setReadiness] = useState<Record<ReadinessKey, boolean>>({ offer: false, customer: false, evidence: false, channel: false })
  const [storageWarning, setStorageWarning] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = readChallengeState()
      setState(saved)
      setReadiness(saved.readiness)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  const completeCount = state?.completedDays.length ?? 0
  const hasProgress = Boolean(state && (state.currentDay > 1 || state.completedDays.length > 0 || Object.values(state.readiness).some(Boolean)))
  const missing = readinessItems.filter((item) => !readiness[item.key])

  function startChallenge() {
    const current = state ?? readChallengeState()
    const updated: ChallengeStateV1 = {
      ...current,
      updatedAt: new Date().toISOString(),
      readiness,
    }
    if (!writeChallengeState(updated)) setStorageWarning('Trình duyệt đang chặn lưu tiến độ. Anh vẫn học được, nhưng nên export Markdown trước khi đóng tab.')
    const day = nextChallengeDay(updated)
    router.push(`${CHALLENGE_ROOT}/day-${String(day).padStart(2, '0')}`)
  }

  function resetChallenge() {
    if (!clearChallengeState()) setStorageWarning('Không thể xóa localStorage tự động. Anh có thể xóa dữ liệu trang trong cài đặt trình duyệt.')
    const fresh = readChallengeState({
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    })
    setState(fresh)
    setReadiness(fresh.readiness)
    dialogRef.current?.close()
  }

  return (
    <section className={styles.readinessSection} id="readiness" aria-labelledby="readiness-title">
      <div className={styles.readinessIntro}>
        <p>Readiness Check</p>
        <h2 id="readiness-title">Anh đang mang nguyên liệu gì vào bàn làm việc?</h2>
        <p>Thiếu evidence không khóa challenge. Anh sẽ nhận một corrective path để tìm dữ liệu thật.</p>
        {hasProgress ? (
          <div className={styles.resumeNote}>
            <strong>Tiến độ trên thiết bị này: {completeCount}/7 ngày.</strong>
            <Link href={`${CHALLENGE_ROOT}/day-${String(nextChallengeDay(state!)).padStart(2, '0')}`}>
              Tiếp tục ngày được khuyến nghị <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <button type="button" onClick={() => dialogRef.current?.showModal()}><RotateCcw aria-hidden="true" size={15} /> Đặt lại</button>
          </div>
        ) : null}
      </div>

      <div className={styles.readinessForm}>
        {readinessItems.map((item) => (
          <label key={item.key}>
            <input
              type="checkbox"
              checked={readiness[item.key]}
              onChange={(event) => setReadiness((current) => ({ ...current, [item.key]: event.target.checked }))}
            />
            <span className={styles.checkmark} aria-hidden="true"><Check size={16} /></span>
            <span><strong>{item.label}</strong><small>{item.help}</small></span>
          </label>
        ))}
        {missing.length > 0 ? (
          <p className={styles.corrective} role="status">
            Anh còn {missing.length} mục chưa có. Vẫn có thể bắt đầu; ở Ngày 2, hãy quay lại inbox, bình luận hoặc hỏi trực tiếp ba khách hàng.
          </p>
        ) : (
          <p className={styles.ready} role="status">Đủ nguyên liệu để đi thẳng vào workflow.</p>
        )}
        {storageWarning ? <p className={styles.storageWarning} role="alert">{storageWarning}</p> : null}
        <button className={styles.startButton} type="button" onClick={startChallenge}>
          {hasProgress ? 'Tiếp tục bàn làm việc' : 'Mở Ngày 01'} <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>

      <dialog ref={dialogRef} className={styles.resetDialog} onCancel={() => dialogRef.current?.close()}>
        <h2>Đặt lại toàn bộ thử thách?</h2>
        <p>Workbook và tiến độ đang lưu trên thiết bị này sẽ bị xóa. File Markdown đã export không bị ảnh hưởng.</p>
        <div>
          <button type="button" onClick={() => dialogRef.current?.close()}>Giữ lại</button>
          <button type="button" onClick={resetChallenge}>Xóa dữ liệu local</button>
        </div>
      </dialog>
    </section>
  )
}
