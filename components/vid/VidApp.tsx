'use client'

import VidShell from './VidShell'
import styles from './Vid.module.css'

export type VidView = 'home' | 'watch' | 'results' | 'topic' | 'playlist' | 'library'

const viewLabels: Record<VidView, string> = {
  home: 'Trang chủ',
  watch: 'Đang chiếu',
  results: 'Kết quả tìm kiếm',
  topic: 'Chủ đề',
  playlist: 'Danh sách phát',
  library: 'Thư viện của bạn',
}

export default function VidApp({ initialView }: { initialView: VidView }) {
  return (
    <VidShell>
      <section className={styles.placeholder} aria-labelledby="vid-view-title">
        <span>THÔNG PHAN SCREENING ROOM</span>
        <h1 id="vid-view-title">{viewLabels[initialView]}</h1>
        <p>Nội dung đang được kết nối với thư viện video.</p>
      </section>
    </VidShell>
  )
}
