import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review Observable Expression · Mục đích đời sống',
  description: 'Ba bản dựng một phim với carrier hình ảnh quan sát được cho từng ý quan trọng.',
  robots: { index: false, follow: false, nocache: true },
}
export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · OBSERVABLE EXPRESSION V1</p>
        <h1>Hiểu đúng trước. Hay sau.</h1>
        <p className={styles.lede}>
          Mỗi ý quan trọng trong voice được tách thành dấu hiệu phải nhìn thấy: bên trong là một mình
          và tĩnh lại; thành công là công nhận hữu hình; đau khổ là biểu cảm hoặc hệ quả trên con người.
          Sau đó hệ thống mới được chọn cảnh trong đúng một phim.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>59,7 giây</dd></div>
          <div><dt>Carrier đã khóa</dt><dd>24/24 ý · đạt chuẩn</dd></div>
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
          <a className={styles.evidenceLink} href="/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index.json?v=observable-expression-v1-20260731" target="_blank" rel="noreferrer">
            Mở chỉ mục bằng chứng toàn bộ workflow
          </a>
        </p>
      </section>
    </div>
  )
}
