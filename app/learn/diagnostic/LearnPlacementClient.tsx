'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react'
import { buildLearnAppUrl } from '@/lib/learn-catalog'
import { placementChallenges, scorePlacementAnswers, type PlacementAnswers } from './diagnostic-model'
import styles from './page.module.css'

const STORAGE_KEY = 'thongphan-learn-placement-v1'

type StoredPlacement = { index: number; answers: PlacementAnswers }

export default function LearnPlacementClient() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<PlacementAnswers>({})
  const [hydrated, setHydrated] = useState(false)
  const completed = index >= placementChallenges.length
  const challenge = placementChallenges[index]
  const selected = challenge ? answers[challenge.id] : undefined
  const result = useMemo(() => scorePlacementAnswers(answers), [answers])

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as StoredPlacement
        if (Number.isInteger(parsed.index) && parsed.index >= 0 && parsed.index <= placementChallenges.length) {
          setIndex(parsed.index)
          setAnswers(parsed.answers ?? {})
        }
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ index, answers } satisfies StoredPlacement))
  }, [answers, hydrated, index])

  useEffect(() => {
    if (completed) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [completed])

  const advance = () => {
    if (!challenge || !Number.isInteger(selected)) return
    setIndex((value) => value + 1)
  }

  const skip = () => {
    if (!challenge) return
    setAnswers((current) => ({ ...current, [challenge.id]: null }))
    setIndex((value) => value + 1)
  }

  const reset = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAnswers({})
    setIndex(0)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  if (!hydrated) return <div className={styles.loading}>Đang mở bài chẩn đoán…</div>

  if (completed) {
    const startUrl = buildLearnAppUrl({
      source: 'public-placement',
      placement_score: String(result.correct),
      confidence: String(result.confidence),
      recommended_start: result.recommendedStart,
    })

    return (
      <section className={styles.result} aria-live="polite">
        <span className={styles.resultEyebrow}>Điểm bắt đầu đề xuất</span>
        <h1>{result.recommendedStart}</h1>
        <p>
          Bạn trả lời đúng {result.correct}/8 tình huống. Độ tin cậy của đề xuất là{' '}
          {Math.round(result.confidence * 100)}%.
        </p>
        <div className={styles.resultRule}>
          <strong>Điều này có nghĩa gì?</strong>
          <span>
            Bạn không cần học lại những gì đã chắc, nhưng AI Foundation vẫn là nơi miễn phí để khóa nền và lưu tiến độ.
          </span>
        </div>
        <div className={styles.resultActions}>
          <a href={startUrl} className={styles.primaryAction}>
            Vào điểm bắt đầu <ArrowRight aria-hidden="true" size={18} />
          </a>
          <button type="button" onClick={reset}>
            <RotateCcw aria-hidden="true" size={17} /> Làm lại
          </button>
        </div>
        <small>Không có email, tên hay dữ liệu nhận diện nào được lưu trong bài chẩn đoán này.</small>
      </section>
    )
  }

  return (
    <section className={styles.player} aria-label="Chẩn đoán điểm bắt đầu Learn">
      <header className={styles.topbar}>
        <Link href="/learn" aria-label="Thoát bài chẩn đoán"><X aria-hidden="true" /></Link>
        <div className={styles.progress} aria-label={`Câu ${index + 1} trên ${placementChallenges.length}`}>
          <span style={{ width: `${((index + 1) / placementChallenges.length) * 100}%` }} />
        </div>
        <strong>{index + 1}/8</strong>
      </header>

      <div className={styles.challenge} key={challenge.id}>
        <span className={styles.contextLabel}>Tình huống công việc</span>
        <h1>{challenge.question}</h1>
        <p>{challenge.context}</p>
        <div className={styles.options}>
          {challenge.options.map((option, optionIndex) => (
            <button
              type="button"
              aria-pressed={selected === optionIndex}
              key={option}
              onClick={() => setAnswers((current) => ({ ...current, [challenge.id]: optionIndex }))}
            >
              <span aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.back}
          disabled={index === 0}
          aria-label="Quay lại câu trước"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <button type="button" className={styles.skip} onClick={skip}>Bỏ qua</button>
        <button type="button" className={styles.next} disabled={!Number.isInteger(selected)} onClick={advance}>
          {index === placementChallenges.length - 1 ? 'Xem đề xuất' : 'Tiếp tục'}
        </button>
      </footer>
    </section>
  )
}
