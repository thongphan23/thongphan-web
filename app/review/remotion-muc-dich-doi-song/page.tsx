import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review Single-film Continuity · Mục đích đời sống',
  description: 'Ba bản dựng, mỗi bản khóa đúng một phim để giữ một thế giới kể chuyện xuyên suốt.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · SINGLE-FILM CONTINUITY V1</p>
        <h1>Một video. Một phim. Một mạch bối cảnh.</h1>
        <p className={styles.lede}>
          Cùng một voice, ba phim được khóa độc lập từ đầu. Từng cảnh vẫn phải qua cổng dễ hiểu,
          đúng ngữ cảnh và hợp nhịp; nhưng không còn đổi phim giữa chừng để vá một beat đơn lẻ.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Phương án đã chấm</dt><dd>72 lựa chọn</dd></div>
          <div><dt>Cảnh đã khóa</dt><dd>49 shot · không lặp trong bản</dd></div>
          <div><dt>Liên tục nguồn phim</dt><dd>3 phim · 0 cảnh ngoại lai</dd></div>
          <div><dt>Phụ đề</dt><dd>28 đoạn · một dòng</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Bốn tín hiệu cần chấm</p>
        <h2 id="questions-title">Hiểu · Liền mạch · Cảm · Nhớ</h2>
        <ol>
          <li>Từng cảnh có gợi đúng từ khóa voice ngay lần xem đầu không?</li>
          <li>Việc giữ một phim có giúp anh theo bối cảnh và tuyến cảm xúc dễ hơn không?</li>
          <li>Nhịp nhanh ở 38,58-49,96 giây có tăng áp lực rõ không?</li>
          <li>Trong Soul, Click và Forrest Gump, phim nào truyền tải thông điệp tự nhiên nhất?</li>
        </ol>
        <p>
          <a className={styles.evidenceLink} href="/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index.json?v=single-film-v2-20260731" target="_blank" rel="noreferrer">
            Mở chỉ mục bằng chứng toàn bộ workflow
          </a>
        </p>
      </section>
    </div>
  )
}
