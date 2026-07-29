import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review Film Source Model · Mục đích đời sống',
  description: 'Ba bản dựng dùng ba phim được chọn bằng mô hình độ phủ nghĩa, cảm xúc và tuyến nhân vật.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · FILM SOURCE MODEL V2</p>
        <h1>Ba phim mới, một thông điệp cần nhìn thấy được.</h1>
        <p className={styles.lede}>
          Sáu phim được mô hình hóa, ba phim được chọn và ba phim bị loại. Mỗi cảnh cuối phải nối
          được ý voice với hành động, phản ứng, cảm xúc hoặc vật chứng khi source phim đã tắt tiếng.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Nguồn đã xem</dt><dd>84 clip · 6 phim</dd></div>
          <div><dt>Cảnh đã khóa</dt><dd>68 shot · không lặp</dd></div>
          <div><dt>Luân phiên phim</dt><dd>Giãn tối thiểu 5 video</dd></div>
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
          <a className={styles.evidenceLink} href="/review/remotion-muc-dich-doi-song/media/evidence/run-evidence-index.json" target="_blank" rel="noreferrer">
            Mở chỉ mục bằng chứng toàn bộ workflow
          </a>
        </p>
      </section>
    </div>
  )
}
