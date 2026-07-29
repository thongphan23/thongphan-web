import type { Metadata } from 'next'
import TprConsole from '@/components/tpr/TprConsole'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'TPR Operations Console',
  description: 'Bảng điều hành riêng cho Thong Phan Remotion: run, video, nguồn, evidence, model, graph và Taste.',
  robots: { index: false, follow: false, nocache: true },
}

export default function TprOperationsPage() {
  return (
    <main className={styles.page}>
      <TprConsole />
    </main>
  )
}
