import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review dựng dọc theo ngữ nghĩa · Mục đích đời sống',
  description: 'Mười hai bản dựng dọc qua bốn vòng cải tiến, kèm bằng chứng crop, camera và tự đánh giá.',
  robots: { index: false, follow: false, nocache: true },
}

export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · SEMANTIC VERTICAL FRAMING V1</p>
        <h1>Mười hai bản dựng dọc. Bốn vòng cải tiến có bằng chứng.</h1>
        <p className={styles.lede}>
          Đây không phải bản ngang bị crop sau khi render. Mỗi shot được quan sát lại, lập các phương
          án khung dọc và chọn vùng giữ đúng người, vật hoặc hành động đang mang nghĩa của voice.
          Ba phim dùng cùng một voice để đo tác động của phương pháp trên ba loại ngôn ngữ hình ảnh.
          Vòng 4 sửa triệt để lỗi crop tự lia lệch bằng chính sách camera tĩnh mặc định.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Định dạng</dt><dd>9:16 · 1080×1920</dd></div>
          <div><dt>Thử nghiệm</dt><dd>4 vòng × 3 phim</dd></div>
          <div><dt>Quan sát nguồn</dt><dd>153 keyframe · 51 shot</dd></div>
          <div><dt>Vòng cuối</dt><dd>51/51 qua cổng hình học</dd></div>
          <div><dt>Crop di động</dt><dd>24/51 → 0/51</dd></div>
          <div><dt>Vật mang nghĩa</dt><dd>48/51 qua kiểm tra pixel</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Năm câu hỏi cần anh chấm</p>
        <h2 id="questions-title">Khung dọc có thực sự giữ đúng ý?</h2>
        <ol>
          <li>So với vòng 3, vòng 4 có hết cảm giác camera tự lia và kéo chủ thể lệch khung không?</li>
          <li>Các khung START, MID và END có giữ cùng một bố cục ổn định trong toàn shot không?</li>
          <li>Vật chứng như công việc, tấm bằng và hành động có được giữ đủ để hiểu ngay không?</li>
          <li>Phụ đề một dòng có tránh đúng vùng bằng chứng và vẫn đọc thoải mái không?</li>
          <li>Trong ba bản vòng 4, phim nào truyền đạt voice rõ và tự nhiên nhất?</li>
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
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/vertical-focus-observations.json?v=semantic-vertical-framing-v1-20260801" target="_blank" rel="noreferrer">
            153 quan sát trọng tâm
          </a>
        </div>
      </section>
    </div>
  )
}
