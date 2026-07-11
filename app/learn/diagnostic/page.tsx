import type { Metadata } from 'next'
import LearnPlacementClient from './LearnPlacementClient'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Chẩn đoán điểm bắt đầu học AI | Thông Phan Learn',
  description: 'Tám tình huống công việc giúp bạn chọn đúng điểm bắt đầu trong AI Foundation, hoàn thành khoảng 90 giây.',
  alternates: { canonical: '/learn/diagnostic' },
}

export default function LearnDiagnosticPage() {
  return (
    <div className={styles.page}>
      <LearnPlacementClient />
    </div>
  )
}
