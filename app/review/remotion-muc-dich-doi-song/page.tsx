import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review Visual Semantic Frame · Mục đích đời sống',
  description: 'Ba bản dựng ưu tiên dễ hiểu, liên tưởng trực tiếp và đúng ngữ cảnh trước thẩm mỹ.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · VISUAL SEMANTIC FRAME V1</p>
        <h1>Dễ hiểu trước. Đẹp sau.</h1>
        <p className={styles.lede}>
          Cùng một voice, ba giả thuyết kể bằng hình ảnh. Mỗi claim có ba phương án và scorecard
          công khai theo thứ tự: liên tưởng trực tiếp, đúng ngữ cảnh, flow/vibe, rồi mới cinematic.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Phương án đã chấm</dt><dd>72 lựa chọn</dd></div>
          <div><dt>Cảnh đã khóa</dt><dd>57 shot · không lặp trong bản</dd></div>
          <div><dt>Phụ đề</dt><dd>28 đoạn · một dòng</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Bốn tín hiệu cần chấm</p>
        <h2 id="questions-title">Hiểu · Liên tưởng · Cảm · Nhớ</h2>
        <ol>
          <li>Từng cảnh có gợi đúng từ khóa voice ngay lần xem đầu không?</li>
          <li>Bản nào vẫn hiểu được khi không biết cốt truyện phim?</li>
          <li>Nhịp nhanh ở 38,58-49,96 giây có tăng áp lực rõ không?</li>
          <li>Bản nào giúp thông điệp cuối đọng lại mà vẫn tự nhiên?</li>
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
