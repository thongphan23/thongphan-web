import type { Metadata } from 'next'
import VoiceReviewPlayer from '@/components/voice-review/VoiceReviewPlayer'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Mèo béo · Voice Review',
  description: 'Bản kể chuyện nỗi nhớ nhà của người đi học xa, dùng profile giọng Mèo béo.',
  robots: { index: false, follow: false, nocache: true },
}

export default function VoiceReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>TPR · OWNER VOICE REVIEW · MÈO BÉO</p>
        <h1>Nỗi nhớ nhà<br />của người đi xa.</h1>
        <p className={styles.lede}>
          Một câu chuyện về căn phòng trọ, mùi cơm từ phòng bên và cuộc gọi về nhà
          mà ta vẫn thường trì hoãn. Bản này dùng profile giọng “Mèo béo”.
        </p>
        <dl className={styles.runFacts}>
          <div><dt>Thời lượng</dt><dd>1 phút 49 giây</dd></div>
          <div><dt>Sai chữ ASR</dt><dd>1,69% · đạt</dd></div>
          <div><dt>Ý quan trọng</dt><dd>6/6 cụm được giữ trọn</dd></div>
        </dl>
      </header>

      <VoiceReviewPlayer />

      <section className={styles.questions} aria-labelledby="voice-review-questions">
        <p className={styles.eyebrow}>Bốn tín hiệu cần nghe</p>
        <h2 id="voice-review-questions">Đúng giọng · Tự nhiên · Có nhịp · Có cảm</h2>
        <ol>
          <li>Giọng đã đủ giống “Mèo béo” hay vẫn còn lệch màu giọng?</li>
          <li>Khoảng nghỉ có giống một người đang thật sự nhớ và suy nghĩ?</li>
          <li>Nhịp kể có điều tiết được lúc nén, lúc thả mà không gây mệt?</li>
          <li>Đoạn nào vẫn bị máy, biến giọng, kéo dài hoặc lướt qua ý?</li>
        </ol>
      </section>
    </main>
  )
}
