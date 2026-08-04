import type { Metadata } from 'next'
import styles from './page.module.css'

const mediaRoot = '/review/cua-ban-la-gi/media'
const evidenceRoot = `${mediaRoot}/evidence`

export const metadata: Metadata = {
  title: 'Của bạn là gì? · TPR Owner Review',
  description: 'Bản dựng dọc từ voice Facebook Reel, khóa một phim Coco và kèm đầy đủ bằng chứng lựa chọn hình ảnh.',
  robots: { index: false, follow: false, nocache: true },
}

const evidence = [
  ['Gói owner review', 'owner-review-packet.md'],
  ['Incident crop và phụ đề', 'owner-feedback-crop-caption-incident.md'],
  ['Báo cáo QA cuối', 'final-video-qa.json'],
  ['Biên nhận bản đang phát', 'review-publish-receipt.json'],
  ['Shot plan 26 cảnh', 'production-shot-plan.json'],
  ['Edit plan dọc 46 item', 'vertical-edit-plan.json'],
  ['Pixel QA START/MID/END', 'vertical-semantic-pixel-qa.json'],
  ['Biên bản kiểm mặt và đầu', 'vertical-rendered-observations.json'],
  ['Pixel QA phụ đề', 'vertical-caption-safe-area-qa.json'],
  ['Quyết định chọn phim', 'source-casting-board.json'],
  ['Contact sheet cuối', 'final-contact-sheet.jpg'],
  ['Kiểm mặt 1/6', 'face-review-contact-01.jpg'],
  ['Kiểm mặt 2/6', 'face-review-contact-02.jpg'],
  ['Kiểm mặt 3/6', 'face-review-contact-03.jpg'],
  ['Kiểm mặt 4/6', 'face-review-contact-04.jpg'],
  ['Kiểm mặt 5/6', 'face-review-contact-05.jpg'],
  ['Kiểm mặt 6/6', 'face-review-contact-06.jpg'],
]

export default function CuaBanLaGiReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>TPR · OWNER REVIEW · 04.08.2026</p>
        <h1>Của bạn là gì?</h1>
        <p className={styles.lede}>
          Một lời ước quay ngược thời gian được dựng thành lời nhắc ôm người thân khi họ vẫn còn
          hiện hữu. Toàn bộ hình ảnh được khóa trong một thế giới phim duy nhất để giữ mạch cảm xúc.
        </p>
      </header>

      <section className={styles.review} aria-labelledby="review-title">
        <div className={styles.playerStage}>
          <video
            className={styles.player}
            controls
            playsInline
            preload="metadata"
            poster={`${mediaRoot}/cua-ban-la-gi-coco-v4-poster-07595f2cede5.jpg`}
          >
            <source src={`${mediaRoot}/cua-ban-la-gi-coco-v4-5d6a41a8288f.mp4`} type="video/mp4" />
          </video>
        </div>

        <div className={styles.detail}>
          <p className={styles.eyebrow}>BẢN SỬA 4 · COCO · FACE-SAFE LOCKED</p>
          <h2 id="review-title">Điều còn lại sau một giấc mơ</h2>
          <p className={styles.summary}>
            Phim được chọn vì có đủ quan hệ ông bà - cháu, ảnh gia đình, mất mát, ký ức, gặp lại
            và một cái ôm có thể hiểu ngay cả khi tắt tiếng.
          </p>

          <dl className={styles.facts}>
            <div><dt>Thời lượng</dt><dd>88,21 giây</dd></div>
            <div><dt>Khung hình</dt><dd>9:16 · 1080×1920</dd></div>
            <div><dt>Nguồn hình</dt><dd>13 clip · 26 shot · 46 item</dd></div>
            <div><dt>Cảnh lặp</dt><dd>0 trim chồng lặp</dd></div>
            <div><dt>Camera tạo thêm</dt><dd>0 chuyển động</dd></div>
            <div><dt>Phụ đề</dt><dd>45/45 đoạn · pixel verified</dd></div>
            <div><dt>Cảnh cần khuôn mặt</dt><dd>27/27 cảnh · đủ mặt và đầu</dd></div>
            <div><dt>Kiểm tra khuôn mặt</dt><dd>81/81 quan sát · thủ công</dd></div>
          </dl>

          <blockquote>
            Nếu phép màu của mình còn hiện hữu, đừng để cái ôm phải chờ đến một giấc mơ.
          </blockquote>

          <nav className={styles.evidence} aria-label="Bằng chứng dựng video">
            {evidence.map(([label, filename]) => (
              <a key={filename} href={`${evidenceRoot}/${filename}`} target="_blank" rel="noreferrer">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className={styles.questions} aria-labelledby="questions-title">
        <p className={styles.eyebrow}>BỐN ĐIỂM CẦN ANH CHẤM</p>
        <h2 id="questions-title">Hình có chạm đúng điều voice đang nói?</h2>
        <ol>
          <li>Mạch từ ước muốn, mất mát, ký ức đến cái ôm có dễ hiểu khi không biết trước phim không?</li>
          <li>Đoạn ảnh gia đình có giữ đủ lâu để người xem kịp hiểu và cảm nhận không?</li>
          <li>Đoạn kết ánh sáng, cái ôm và gia đình có tạo được cao trào cảm xúc không?</li>
          <li>Phụ đề có nằm tự nhiên trong vùng an toàn khi xem như một Reel thật không?</li>
        </ol>
      </section>
    </main>
  )
}
