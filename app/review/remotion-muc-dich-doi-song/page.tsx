import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review Visual Fit v2 · Mục đích đời sống',
  description: 'Ba bản dựng một phim được chọn qua preview im lặng và cạnh tranh thật cho từng ý.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · VISUAL FIT CALIBRATION V2</p>
        <h1>Ba phương án thật. Một lựa chọn có bằng chứng.</h1>
        <p className={styles.lede}>
          Mỗi ý trong voice có ba điểm cắt được render im lặng trước khi chọn. Hệ thống chỉ được khóa
          cảnh khi cả ý nghĩa, dấu hiệu vật lý và pixel thật cùng khớp; tên file hay mô tả nguồn không
          còn được xem là bằng chứng hình ảnh.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Phương án đã đọc pixel</dt><dd>72 preview im lặng</dd></div>
          <div><dt>Quyết định đã khóa</dt><dd>24/24 · đủ cạnh tranh</dd></div>
          <div><dt>Cảnh đã khóa</dt><dd>51 shot · không lặp trong bản</dd></div>
          <div><dt>Liên tục nguồn phim</dt><dd>3 phim · 0 cảnh ngoại lai</dd></div>
          <div><dt>Phụ đề</dt><dd>28 đoạn · một dòng</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Bốn câu hỏi cần chấm</p>
        <h2 id="questions-title">Nhìn · Hiểu · Cảm · Nhớ</h2>
        <ol>
          <li>“Bên trong” có đọc ngay thành một mình, tĩnh lại và suy ngẫm không?</li>
          <li>“Thành công” có được chứng minh bằng cúp, bằng cấp hoặc nghi thức công nhận không?</li>
          <li>Nhịp nhanh ở 38,58-49,96 giây có tăng áp lực rõ không?</li>
          <li>Trong Soul, Forrest Gump và A Beautiful Mind, phim nào truyền tải ý và cảm xúc tự nhiên nhất?</li>
        </ol>
        <p>
          <a className={styles.evidenceLink} href="/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index-visual-fit-v2.md?v=visual-fit-v2-20260731" target="_blank" rel="noreferrer">
            Mở chỉ mục bằng chứng toàn bộ workflow
          </a>
        </p>
      </section>
    </div>
  )
}
