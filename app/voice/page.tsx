import type { Metadata } from 'next'
import VoiceReviewPlayer from '@/components/voice-review/VoiceReviewPlayer'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Ba chủ đề · Voice System Review',
  description: 'Ba bản kiểm tra khả năng diễn xuất tiếng Việt bằng profile giọng Mèo béo.',
  robots: { index: false, follow: false, nocache: true },
}

export default function VoiceReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER VOICE REVIEW · MÈO BÉO</p>
        <h1>Ba ý tưởng.<br />Một hệ giọng.</h1>
        <p className={styles.lede}>
          Ba kịch bản độc lập dùng cùng profile giọng “Mèo béo”. Mỗi bản có một
          đường cảm xúc riêng để kiểm tra độ tự nhiên, khả năng điều tiết nhịp và
          cách hạ trọn ý ở cuối câu.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Số bản</dt><dd>3 chủ đề độc lập</dd></div>
          <div><dt>Sai chữ ASR</dt><dd>0–0,2562% · đạt</dd></div>
          <div><dt>Ý quan trọng</dt><dd>18/18 cụm được giữ trọn</dd></div>
        </dl>
      </header>

      <VoiceReviewPlayer />

      <section className={styles.questions} aria-labelledby="voice-review-questions">
        <p className={styles.eyebrow}>Năm tín hiệu cần nghe</p>
        <h2 id="voice-review-questions">Đúng giọng · Tự nhiên · Có nhịp · Có cảm</h2>
        <ol>
          <li>Cùng một người kể có được giữ ổn định qua cả ba chủ đề?</li>
          <li>Khoảng nghỉ có đúng với ý đang suy nghĩ, cảnh báo hoặc tâm tình?</li>
          <li>Nhịp kể có điều tiết được lúc nén, lúc thả mà không gây mệt?</li>
          <li>Từ cuối mỗi câu đã được hạ trọn, không còn cảm giác ngắt giữa chừng?</li>
          <li>Đoạn nào vẫn bị máy, biến giọng, kéo dài hoặc lướt qua ý?</li>
        </ol>
      </section>
    </main>
  )
}
