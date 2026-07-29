import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review ba bản dựng silent-first · Mục đích đời sống',
  description: 'Trang review riêng cho ba bản dựng đã vượt kiểm tra hình câm trên cùng một voice.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · SILENT-FIRST V2</p>
        <h1>Ba bản dựng mới, cùng một voice.</h1>
        <p className={styles.lede}>
          Mỗi cảnh đã được kiểm tra như hình câm: ý nghĩa phải đến từ hành động, phản ứng, cảm xúc
          hoặc hậu quả nhìn thấy được, không dựa vào lời thoại của phim.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Nhịp dựng</dt><dd>25 shot mỗi bản</dd></div>
          <div><dt>Âm thanh</dt><dd>Voice + nhạc nền</dd></div>
          <div><dt>Phim gốc</dt><dd>Tắt tiếng hoàn toàn</dd></div>
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
      </section>
    </div>
  )
}
