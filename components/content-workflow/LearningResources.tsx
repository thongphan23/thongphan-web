'use client'

import { useState } from 'react'
import { Check, Clipboard } from 'lucide-react'
import { DAY_RESOURCES } from '@/lib/content-workflow/resources'
import type { ChallengeDay } from '@/lib/content-workflow/model'
import styles from './ContentWorkflow.module.css'

export default function LearningResources({ day }: { day: ChallengeDay }) {
  const [status, setStatus] = useState('')

  async function copy(content: string, title: string) {
    try {
      await navigator.clipboard.writeText(content)
      setStatus(`Đã sao chép “${title}”.`)
    } catch {
      setStatus('Trình duyệt đang chặn bộ nhớ tạm. Hãy chọn nội dung trong thẻ và sao chép thủ công.')
    }
  }

  return (
    <section className={styles.resourcesSection} aria-labelledby="resources-title">
      <h2 id="resources-title"><span>06</span> Tài nguyên để đi tiếp</h2>
      <p>Mở từng thẻ để xem mẫu hoàn chỉnh. Bạn có thể sao chép và sửa trực tiếp cho trường hợp của bạn.</p>
      <div className={styles.resourceGrid}>
        {DAY_RESOURCES[day].map((resource) => (
          <details key={resource.id} className={styles.resourceCard}>
            <summary><small>{resource.type}</small><strong>{resource.title}</strong><span>{resource.description}</span></summary>
            <pre tabIndex={0}>{resource.content}</pre>
            <button type="button" onClick={() => copy(resource.content, resource.title)}>
              <Clipboard aria-hidden="true" size={15} /> Sao chép tài nguyên
            </button>
          </details>
        ))}
      </div>
      <p className={styles.resourceStatus} aria-live="polite">{status ? <><Check aria-hidden="true" size={14} /> {status}</> : null}</p>
    </section>
  )
}
