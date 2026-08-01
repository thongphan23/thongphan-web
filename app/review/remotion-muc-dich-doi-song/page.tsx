import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review dựng dọc theo ngữ nghĩa · Mục đích đời sống',
  description: 'Mười lăm bản dựng dọc qua năm vòng cải tiến, kèm bằng chứng nguồn, carrier, pixel và tự đánh giá.',
  robots: { index: false, follow: false, nocache: true },
}

export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · VERTICAL SEMANTIC COMPOSITION V2</p>
        <h1>Mười lăm bản dựng dọc. Năm vòng cải tiến có bằng chứng.</h1>
        <p className={styles.lede}>
          Đây không phải bản ngang bị crop sau khi render. Mỗi shot được quan sát lại, lập các phương
          án khung dọc và chọn vùng giữ đúng người, vật hoặc hành động đang mang nghĩa của voice.
          Ba phim dùng cùng một voice để đo tác động của phương pháp trên ba loại ngôn ngữ hình ảnh.
          Vòng 4 sửa lỗi crop tự lia. Vòng 5 đi sâu hơn: chọn lại cả nguồn, trim, native event,
          đúng chủ thể mang nghĩa và chế độ khung trước khi khóa Edit Plan dọc.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Định dạng</dt><dd>9:16 · 1080×1920</dd></div>
          <div><dt>Thử nghiệm</dt><dd>5 vòng × 3 phim</dd></div>
          <div><dt>Quan sát nguồn vòng 5</dt><dd>690 keyframe · 230 native event</dd></div>
          <div><dt>Vòng cuối</dt><dd>69/69 timeline item PASS</dd></div>
          <div><dt>Crop di động</dt><dd>24/51 → 0/69</dd></div>
          <div><dt>Vật mang nghĩa</dt><dd>207/207 frame mã hóa</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Năm câu hỏi cần anh chấm</p>
        <h2 id="questions-title">Khung dọc có thực sự giữ đúng ý?</h2>
        <ol>
          <li>So với vòng 4, vòng 5 có luôn giữ đúng nhân vật hoặc vật chứng quan trọng trong khung dọc không?</li>
          <li>Các khung START, MID và END có giữ cùng chủ thể, đúng native event và bố cục ổn định không?</li>
          <li>Cảnh được thay hoặc tách event có làm ý voice dễ hiểu hơn, đặc biệt ở cao trào B07 không?</li>
          <li>Phụ đề một dòng có tránh đúng vùng bằng chứng và vẫn đọc thoải mái không?</li>
          <li>Trong ba bản vòng 5, phim nào truyền đạt voice rõ và tự nhiên nhất?</li>
        </ol>
        <div className={styles.packageLinks}>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/implementation-report.md?v=semantic-vertical-framing-v1-20260801" target="_blank" rel="noreferrer">
            Báo cáo nâng cấp plugin
          </a>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-4/manual_pixel_adjudication.json?v=camera-stability-r4-20260801" target="_blank" rel="noreferrer">
            Kiểm tra pixel thủ công vòng 4
          </a>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/camera-stability-owner-feedback-evidence.json?v=camera-stability-r4-20260801" target="_blank" rel="noreferrer">
            Evidence phản hồi camera
          </a>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-5/OWNER-REVIEW-PACKET.md?v=semantic-vertical-composition-r5-20260802" target="_blank" rel="noreferrer">
            Gói review vòng 5
          </a>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/vertical-focus-observations.json?v=semantic-vertical-framing-v1-20260801" target="_blank" rel="noreferrer">
            153 quan sát trọng tâm
          </a>
        </div>
      </section>
    </div>
  )
}
