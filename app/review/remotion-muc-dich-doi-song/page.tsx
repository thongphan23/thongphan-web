import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review ba bản dựng · Mục đích đời sống',
  description: 'Trang review riêng cho ba chiến lược kể chuyện bằng hình ảnh trên cùng một voice.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · 29.07.2026</p>
        <h1>Ba cách kể cùng một voice.</h1>
        <p className={styles.lede}>
          Voice, phụ đề, nhạc nền, thời lượng và nhịp shot được giữ nguyên. Biến số duy nhất là
          phim cùng cách chuyển ý nghĩa thành hình ảnh.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Định dạng</dt><dd>16:9 · 720p web</dd></div>
          <div><dt>Âm thanh</dt><dd>Voice + nhạc nền</dd></div>
          <div><dt>Nguồn phim</dt><dd>Đã tắt tiếng</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Bốn tín hiệu cần chấm</p>
        <h2 id="questions-title">Hiểu · Cảm · Nhớ · Tin</h2>
        <ol>
          <li>Bản nào giúp hiểu ý ngay mà không cần biết cốt truyện?</li>
          <li>Bản nào có đường cong cảm xúc rõ nhất?</li>
          <li>Bản nào làm đoạn áp lực từ 38,58 đến 49,96 giây mạnh nhất?</li>
          <li>Bản nào khiến thông điệp cuối đọng lại rõ nhất?</li>
        </ol>
      </section>
    </div>
  )
}
