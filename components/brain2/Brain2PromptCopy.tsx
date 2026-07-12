'use client'

import { useState } from 'react'

import { dispatchBrain2Event } from './Brain2Analytics'
import styles from './Brain2.module.css'

export default function Brain2PromptCopy({
  day,
  blockId,
  label,
  text,
}: {
  day: number
  blockId: string
  label: string
  text: string
}) {
  const [status, setStatus] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Đã sao chép')
      dispatchBrain2Event({ name: 'brain2_prompt_copied', detail: { day, blockId } })
    } catch {
      setStatus('Chưa thể sao chép. Bạn có thể chọn trực tiếp phần chữ bên dưới.')
    }
  }

  return (
    <section className={styles.workingDocument} data-motion-surface aria-labelledby={`${blockId}-label`}>
      <header>
        <h3 id={`${blockId}-label`}>{label}</h3>
        <button type="button" onClick={copy} data-motion-action>Sao chép</button>
      </header>
      <pre tabIndex={0}>{text}</pre>
      <p className={styles.copyStatus} aria-live="polite">{status}</p>
    </section>
  )
}
