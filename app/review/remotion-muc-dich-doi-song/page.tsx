import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review Visual Proposition · Mục đích đời sống',
  description: 'Ba bản dựng mới ưu tiên đúng nghĩa, hiểu ngay và truy vết được từng quyết định hình ảnh.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · VISUAL PROPOSITION V1</p>
        <h1>Đúng nghĩa trước. Hay sau.</h1>
        <p className={styles.lede}>
          Cùng một voice, ba giả thuyết kể bằng hình ảnh. Mỗi ý có ba phương án được chấm độc lập;
          cảnh cuối chỉ được chọn khi vừa đúng nghĩa, vừa có thể hiểu nhanh khi tắt tiếng.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Phương án đã chấm</dt><dd>72 lựa chọn</dd></div>
          <div><dt>Cảnh đã khóa</dt><dd>48 shot · không lặp</dd></div>
          <div><dt>Phụ đề</dt><dd>28 đoạn · một dòng</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Bốn tín hiệu cần chấm</p>
        <h2 id="questions-title">Hiểu · Cảm · Nhớ · Tin</h2>
        <ol>
          <li>Bản nào giúp hiểu ý ngay mà không cần biết cốt truyện?</li>
          <li>Bản nào có tuyến cảnh liền mạch và đường cong cảm xúc rõ nhất?</li>
          <li>Bản nào làm đoạn áp lực từ 38,58 đến 49,96 giây mạnh nhất?</li>
          <li>Bản nào khiến thông điệp cuối đọng lại rõ nhất?</li>
        </ol>
        <p>
          <a className={styles.evidenceLink} href="/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index.json" target="_blank" rel="noreferrer">
            Mở chỉ mục bằng chứng toàn bộ workflow
          </a>
        </p>
      </section>
    </div>
  )
}
