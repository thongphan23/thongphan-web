import type { Metadata } from 'next'
import VoiceReviewPlayer from '@/components/voice-review/VoiceReviewPlayer'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Voice Review · Thông Phan Remotion',
  description: 'Ba bản voice nam dùng chung nội dung để owner đánh giá nhịp, khoảng nghỉ và độ tự nhiên.',
  robots: { index: false, follow: false, nocache: true },
}

export default function VoiceReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER VOICE REVIEW · V7</p>
        <h1>Ba cách đọc.<br />Một nội dung.</h1>
        <p className={styles.lede}>
          Cùng một kịch bản và cùng một giọng nam. Ba bản dùng các cách diễn khác nhau
          để so sánh độ tự nhiên, nhịp suy nghĩ và đường năng lượng.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>66,3–68,1 giây</dd></div>
          <div><dt>Sai chữ ASR</dt><dd>0,085–0,764%</dd></div>
          <div><dt>Đơn vị suy nghĩ</dt><dd>6 cụm ý · 6 khoảng lặng có chủ đích</dd></div>
        </dl>
      </header>

      <VoiceReviewPlayer />

      <section className={styles.questions} aria-labelledby="voice-review-questions">
        <p className={styles.eyebrow}>Bốn tín hiệu cần chấm</p>
        <h2 id="voice-review-questions">Tự nhiên · Dễ thở · Có nhịp · Có cảm</h2>
        <ol>
          <li>Bản nào ít tạo cảm giác máy hoặc biến giọng nhất?</li>
          <li>Bản nào có khoảng nghỉ giống một người đang thật sự suy nghĩ?</li>
          <li>Bản nào điều tiết được lúc dồn, lúc thả mà không gây mệt?</li>
          <li>Đoạn nào vẫn bị giật, kéo dài hoặc lướt qua ý kế tiếp?</li>
        </ol>
      </section>
    </main>
  )
}
