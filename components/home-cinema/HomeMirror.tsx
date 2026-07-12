'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  mirrorQuestions,
  resolveMirrorResult,
  type ExperienceAnswer,
  type MirrorAnswers,
  type StartAnswer,
  type StuckAnswer,
} from './home-cinema-content'
import styles from './HomeMirror.module.css'

type PartialAnswers = Partial<MirrorAnswers>

function isComplete(answers: PartialAnswers): answers is MirrorAnswers {
  return Boolean(answers.experience && answers.stuck && answers.start)
}

export default function HomeMirror() {
  const [answers, setAnswers] = useState<PartialAnswers>({})
  const lastEventKey = useRef('')
  const result = useMemo(() => (isComplete(answers) ? resolveMirrorResult(answers) : null), [answers])

  useEffect(() => {
    if (!result) return
    const eventKey = `${result.category}:${result.href}`
    if (lastEventKey.current === eventKey) return
    lastEventKey.current = eventKey
    window.dispatchEvent(new CustomEvent('homepage_mirror_completed', {
      detail: { resultCategory: result.category },
    }))
  }, [result])

  return (
    <div className={styles.mirror}>
      <div className={styles.intro}>
        <span className={styles.frameNumber}>ACT 02</span>
        <h2>Đừng đoán mình cần gì. Hãy soi đúng chỗ đang kẹt.</h2>
        <p>Ba câu hỏi này không lưu dữ liệu. Nó chỉ giúp bạn chọn một bước tiếp theo vừa sức.</p>
      </div>

      <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <fieldset className={styles.question}>
          <legend><span>01</span>{mirrorQuestions.experience.legend}</legend>
          <div className={styles.options}>
            {mirrorQuestions.experience.options.map(([value, label]) => (
              <label key={value} className={styles.option}>
                <input
                  type="radio"
                  name="experience"
                  value={value}
                  checked={answers.experience === value}
                  onChange={() => setAnswers((current) => ({ ...current, experience: value as ExperienceAnswer }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.question}>
          <legend><span>02</span>{mirrorQuestions.stuck.legend}</legend>
          <div className={styles.options}>
            {mirrorQuestions.stuck.options.map(([value, label]) => (
              <label key={value} className={styles.option}>
                <input
                  type="radio"
                  name="stuck"
                  value={value}
                  checked={answers.stuck === value}
                  onChange={() => setAnswers((current) => ({ ...current, stuck: value as StuckAnswer }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.question}>
          <legend><span>03</span>{mirrorQuestions.start.legend}</legend>
          <div className={styles.options}>
            {mirrorQuestions.start.options.map(([value, label]) => (
              <label key={value} className={styles.option}>
                <input
                  type="radio"
                  name="start"
                  value={value}
                  checked={answers.start === value}
                  onChange={() => setAnswers((current) => ({ ...current, start: value as StartAnswer }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.result} aria-live="polite">
          {result ? (
            <>
              <p className={styles.resultLabel}>Lộ trình phù hợp lúc này</p>
              <h3>{result.title}</h3>
              <p>{result.explanation}</p>
              {result.href === '/conanmaker/' ? (
                <a href={result.href} className={styles.resultLink}>{result.cta}</a>
              ) : (
                <Link href={result.href} className={styles.resultLink}>{result.cta}</Link>
              )}
            </>
          ) : (
            <>
              <p className={styles.resultLabel}>Bản soi nhanh</p>
              <h3>Chọn đủ ba câu để thấy bước tiếp theo.</h3>
              <p>Nếu muốn đi thẳng vào bản đầy đủ, bạn vẫn có thể bắt đầu ngay.</p>
              <Link href="/diagnostic" className={styles.secondaryLink}>Mở bài chẩn đoán</Link>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
