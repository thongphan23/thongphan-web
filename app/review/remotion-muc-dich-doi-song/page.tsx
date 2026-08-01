import type { Metadata } from 'next'
import VideoReviewGallery from '@/components/remotion-review/VideoReviewGallery'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Review dựng dọc theo ngữ nghĩa · Mục đích đời sống',
  description: 'Chín bản dựng dọc qua ba vòng cải tiến, kèm bằng chứng crop và tự đánh giá.',
  robots: { index: false, follow: false, nocache: true },
}

export default function RemotionVideoReviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · SEMANTIC VERTICAL FRAMING V1</p>
        <h1>Chín bản dựng dọc. Ba vòng cải tiến có bằng chứng.</h1>
        <p className={styles.lede}>
          Đây không phải bản ngang bị crop sau khi render. Mỗi shot được quan sát lại, lập các phương
          án khung dọc và chọn vùng giữ đúng người, vật hoặc hành động đang mang nghĩa của voice.
          Ba phim dùng cùng một voice để đo tác động của phương pháp trên ba loại ngôn ngữ hình ảnh.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Định dạng</dt><dd>9:16 · 1080×1920</dd></div>
          <div><dt>Thử nghiệm</dt><dd>3 vòng × 3 phim</dd></div>
          <div><dt>Quan sát nguồn</dt><dd>153 keyframe · 51 shot</dd></div>
          <div><dt>Vòng cuối</dt><dd>51/51 qua cổng hình học</dd></div>
          <div><dt>Giữ trọng tâm</dt><dd>79,6% → 99,5%</dd></div>
          <div><dt>Vật mang nghĩa</dt><dd>48/51 qua kiểm tra pixel</dd></div>
        </dl>
      </header>

      <VideoReviewGallery />

      <section className={styles.reviewQuestions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>Năm câu hỏi cần anh chấm</p>
        <h2 id="questions-title">Khung dọc có thực sự giữ đúng ý?</h2>
        <ol>
          <li>So với vòng 1, vòng 3 có hết cảm giác chủ thể bị cắt hoặc đứng sai chỗ không?</li>
          <li>Camera dọc có theo chủ thể mượt, hay còn pan thừa và gây mất tập trung?</li>
          <li>Vật chứng như công việc, tấm bằng và hành động có được giữ đủ để hiểu ngay không?</li>
          <li>Phụ đề một dòng có tránh đúng vùng bằng chứng và vẫn đọc thoải mái không?</li>
          <li>Trong ba bản vòng 3, phim nào truyền đạt voice rõ và tự nhiên nhất?</li>
        </ol>
        <div className={styles.packageLinks}>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/implementation-report.md?v=semantic-vertical-framing-v1-20260801" target="_blank" rel="noreferrer">
            Báo cáo nâng cấp plugin
          </a>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-3-manual-pixel-adjudication.json?v=semantic-vertical-framing-v1-20260801" target="_blank" rel="noreferrer">
            Kiểm tra pixel thủ công vòng 3
          </a>
          <a href="/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/vertical-focus-observations.json?v=semantic-vertical-framing-v1-20260801" target="_blank" rel="noreferrer">
            153 quan sát trọng tâm
          </a>
        </div>
      </section>
    </div>
  )
}
