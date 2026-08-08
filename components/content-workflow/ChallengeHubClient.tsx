'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { nextChallengeDay, type ChallengeStateV2, type ReadinessKey } from '@/lib/content-workflow/model'
import { clearChallengeState, readChallengeState, writeChallengeState } from '@/lib/content-workflow/storage'
import styles from '@/app/challenge/content-workflow-7days/page.module.css'

const CHALLENGE_ROOT = '/challenge/content-workflow-7days'
const readinessItems: ReadonlyArray<{ key: ReadinessKey; label: string; help: string }> = [
  { key: 'outcome', label: 'Tôi chọn được một đầu ra content muốn làm lặp lại.', help: 'Ví dụ: bài chia sẻ chuyên môn, kịch bản video ngắn hoặc thư gửi khách hàng.' },
  { key: 'materials', label: 'Tôi có một ít dữ liệu, ghi chú hoặc nhận định để bắt đầu.', help: 'Không cần bằng chứng khách hàng; có thể dùng hiểu biết đang nằm trong đầu bạn.' },
  { key: 'aiAccess', label: 'Tôi có thể dùng một công cụ trò chuyện AI.', help: 'AI chỉ hỗ trợ đào sâu; toàn bộ bài cốt lõi vẫn có thể tự làm.' },
  { key: 'time', label: 'Tôi có thể dành 45–60 phút mỗi ngày.', help: 'Phần đào sâu với AI thêm 20–30 phút là tùy chọn.' },
]

export default function ChallengeHubClient() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<ChallengeStateV2 | null>(null)
  const [readiness, setReadiness] = useState<Record<ReadinessKey, boolean>>({ outcome: false, materials: false, aiAccess: false, time: false })
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
    const updated: ChallengeStateV2 = {
      ...current,
      updatedAt: new Date().toISOString(),
      readiness,
    }
    if (!writeChallengeState(updated)) setStorageWarning('Trình duyệt đang chặn lưu tiến độ. Bạn vẫn học được, nhưng nên tải tệp văn bản (.md) trước khi đóng thẻ trình duyệt.')
    const day = nextChallengeDay(updated)
    router.push(`${CHALLENGE_ROOT}/day-${String(day).padStart(2, '0')}`)
  }

  function resetChallenge() {
    if (!clearChallengeState()) setStorageWarning('Không thể tự động xóa bộ nhớ cục bộ (localStorage). Bạn có thể xóa dữ liệu trang trong cài đặt trình duyệt.')
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
        <p>Kiểm tra mức sẵn sàng (Readiness Check)</p>
        <h2 id="readiness-title">Bạn đang mang nguyên liệu gì vào bàn làm việc?</h2>
        <p>Bạn chưa cần bằng chứng khách hàng. Hãy bắt đầu bằng hiểu biết, nhận định và tài liệu mình đang có.</p>
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
            Bạn còn {missing.length} mục chưa có. Vẫn có thể bắt đầu; mỗi ngày đều có bản mẫu và hướng dẫn gỡ vướng.
          </p>
        ) : (
          <p className={styles.ready} role="status">Đủ nguyên liệu để đi thẳng vào quy trình.</p>
        )}
        {storageWarning ? <p className={styles.storageWarning} role="alert">{storageWarning}</p> : null}
        <button className={styles.startButton} type="button" onClick={startChallenge}>
          {hasProgress ? 'Tiếp tục bàn làm việc' : 'Mở Ngày 01'} <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>

      <dialog ref={dialogRef} className={styles.resetDialog} onCancel={() => dialogRef.current?.close()}>
        <h2>Đặt lại toàn bộ thử thách?</h2>
        <p>Sổ bài tập và tiến độ đang lưu trên thiết bị này sẽ bị xóa. Tệp văn bản (.md) đã tải xuống không bị ảnh hưởng.</p>
        <div>
          <button type="button" onClick={() => dialogRef.current?.close()}>Giữ lại</button>
          <button type="button" onClick={resetChallenge}>Xóa dữ liệu trên thiết bị</button>
        </div>
      </dialog>
    </section>
  )
}
