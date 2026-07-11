'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import { diagnosticLevels, diagnosticQuestions, getDiagnosticLevel } from './diagnostic-model'
import styles from './page.module.css'

export default function DiagnosticClient() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const score = useMemo(() => Object.values(answers).reduce((sum, value) => sum + value, 0), [answers])
  const completed = Object.keys(answers).length === diagnosticQuestions.length
  const level = getDiagnosticLevel(score)
  const completion = Math.round((Object.keys(answers).length / diagnosticQuestions.length) * 100)

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <DossierHeader eyebrow="Hồ sơ tự chẩn đoán" folio="TP / SIGNAL / 01" title="Bạn đang dùng AI ở tầng nào?" description="Năm câu hỏi. Không chấm giỏi hay dở. Mục tiêu là nhìn rõ chỗ đang đứng và chọn đúng bước tiếp theo." />

        <div className={styles.workspace}>
          <section className={styles.questions} aria-label="Năm câu hỏi chẩn đoán">
            {diagnosticQuestions.map((question, index) => (
              <fieldset key={question.id} className={styles.question}>
                <legend><span>{String(index + 1).padStart(2, '0')}</span>{question.question}</legend>
                <div className={styles.options}>
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.score
                    return <button key={option.label} type="button" aria-pressed={selected} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.score }))}><span>{selected ? <Check aria-hidden="true" size={16} /> : option.score}</span>{option.label}</button>
                  })}
                </div>
              </fieldset>
            ))}
          </section>

          <aside className={styles.result} aria-live="polite">
            <div className={styles.progressHeader}><span>{completed ? 'Hồ sơ hoàn tất' : 'Tiến độ'}</span><strong>{completed ? `${score}/20` : `${Object.keys(answers).length}/5`}</strong></div>
            <div className={styles.progress}><span style={{ width: `${completed ? 100 : completion}%` }} /></div>
            <ol className={styles.levels}>
              {diagnosticLevels.map((item) => <li key={item.no} data-active={completed && item.no === level.no}><span>{item.no}</span><p>{item.name}</p></li>)}
            </ol>
            {completed ? (
              <div className={styles.resultBody}>
                <span className={styles.resultNo}>{level.no}</span><h2>{level.title}</h2><p>{level.diagnosis}</p>
                <dl><div><dt>Điểm đang kẹt</dt><dd>{level.stuck}</dd></div><div><dt>Bước tiếp theo</dt><dd>{level.next}</dd></div></dl>
                <ol className={styles.actions} aria-label="Ba bước phù hợp với kết quả này">
                  {level.recommendations.map((action, index) => (
                    <li key={action.href} data-primary={index === 0}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <small>{action.eyebrow}</small>
                        <p>{action.reason}</p>
                        {action.href === '/conanmaker/' ? (
                          <a href={action.href}>{action.label}<ArrowRight aria-hidden="true" size={16} /></a>
                        ) : (
                          <Link href={action.href}>{action.label}<ArrowRight aria-hidden="true" size={16} /></Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <button type="button" className={styles.reset} onClick={() => setAnswers({})}>Làm lại hồ sơ</button>
              </div>
            ) : <p className={styles.pending}>Chọn một phương án ở mỗi câu. Kết quả chỉ xuất hiện sau khi đủ năm tín hiệu.</p>}
          </aside>
        </div>
      </div>
    </div>
  )
}
