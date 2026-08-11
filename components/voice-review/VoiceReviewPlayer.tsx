'use client'

import { useRef } from 'react'
import styles from '@/app/voice/page.module.css'

const tracks = [
  {
    id: 'CV',
    name: 'Lương thấp nhưng học nhiều?',
    duration: '1:38',
    metric: 'ASR 0% · 6/6 ý',
    feel: 'Tỉnh táo trước một sự đánh đổi tưởng như cao đẹp.',
    remember: 'Lương thấp chỉ đáng nhận khi giá trị thị trường tăng đủ nhanh.',
    src: '/voice/audio/benchmark-low-salary-a9f60144.mp3',
    script: `Có nên làm một công việc lương thấp nhưng học được nhiều không? Có, nhưng chỉ khi chữ “học” ở đây tạo ra giá trị thật, chứ không phải một lời hứa để bạn chấp nhận bị trả thấp.

Một công việc đáng đánh đổi thu nhập phải cho bạn ít nhất ba thứ. Được làm gần người giỏi, được nhận phản hồi đủ nhanh, và được cầm những việc khiến năng lực của mình tăng lên rõ rệt.

Sau sáu tháng, bạn phải chỉ ra được mình làm tốt hơn điều gì, có sản phẩm nào để chứng minh, và cơ hội nghề nghiệp nào đã mở ra. Nếu chỉ bận hơn, chịu áp lực giỏi hơn, nhưng kỹ năng vẫn đứng yên, đó không phải học hỏi.

Điều nguy hiểm nhất là biến sự hy sinh thành bản sắc. Mình đã chịu lương thấp quá lâu, nên mình phải tin công việc này đáng giá, dù bằng chứng đang nói ngược lại; hãy xem mức lương thấp như một khoản học phí có thời hạn.

Kỹ năng học được phải mang đi nơi khác được, tốc độ trưởng thành phải đo được, và khoảng cách thu nhập phải nhỏ dần theo thời gian.

Vậy nên, đừng hỏi công việc này dạy mình nhiều không. Hãy hỏi: sau một năm ở đây, giá trị của mình trên thị trường có tăng đủ nhanh không? Nếu câu trả lời là có, mức lương thấp có thể là một khoản đầu tư; nếu không, nó chỉ là một cái giá bạn đang trả thay cho công ty.`,
  },
  {
    id: 'DX',
    name: 'Khi nào nên ngừng một mục tiêu?',
    duration: '1:37',
    metric: 'ASR 0,2562% · 6/6 ý',
    feel: 'Được cho phép đổi hướng mà không tự xem mình là kẻ thất bại.',
    remember: 'Bản lĩnh không chỉ là đi tiếp, mà còn là biết đổi hướng đúng lúc.',
    src: '/voice/audio/benchmark-stop-goal-b2f21c6b.mp3',
    script: `Người ta thường nói: đã bắt đầu thì đừng bỏ cuộc. Nhưng có những mục tiêu, càng cố thêm, mình càng đi xa khỏi cuộc đời mà mình thật sự muốn sống.

Mình từng có một giai đoạn bám vào crypto đến mức gần như khánh kiệt. Lúc đó, tiếp tục không còn là kiên trì nữa; nó chỉ là nỗi sợ phải thừa nhận rằng mình đã chọn sai trận đánh.

Một mục tiêu nên được xem lại khi ba chuyện xảy ra cùng lúc. Chi phí ngày càng lớn, bằng chứng tiến bộ ngày càng ít, và bạn phải liên tục bẻ cong giá trị của mình để ở lại với nó.

Nhưng đừng nhầm khó khăn với tín hiệu phải dừng. Có những việc khó vì mình đang học, còn có những việc khó vì con đường này không còn dẫn tới nơi mình muốn đến.

Bạn có thể tự hỏi câu đầu tiên: nếu hôm nay chưa bắt đầu, mình có còn chọn mục tiêu này không? Trong vòng chín mươi ngày tới, bằng chứng nào sẽ chứng minh nó còn đáng theo? Và mình đang cố vì điều mình muốn, hay chỉ vì không muốn bị xem là người bỏ cuộc?

Ngừng một mục tiêu không nhất thiết là từ bỏ chính mình. Đôi khi, đó là cách bảo vệ thời gian, lòng tự trọng và năng lượng. Bạn giữ lại những thứ ấy cho một trận đánh xứng đáng hơn; bởi bản lĩnh không chỉ nằm ở việc đi tiếp, nó còn nằm ở khoảnh khắc mình đủ tỉnh táo để đổi hướng.`,
  },
  {
    id: 'BB',
    name: 'Tại sao càng lớn càng ít bạn?',
    duration: '1:41',
    metric: 'ASR 0% · 6/6 ý',
    feel: 'Nhẹ lòng về những mối quan hệ đã thưa dần, nhưng không tự cô lập.',
    remember: 'Tình bạn sâu khi trưởng thành cần sự chủ động, không chỉ cần thời gian.',
    src: '/voice/audio/benchmark-fewer-friends-6ac9f880.mp3',
    script: `Càng lớn, mình càng ít bạn. Không hẳn vì mình trở nên lạnh lùng hơn, mà vì những điều từng giúp tình bạn xuất hiện tự nhiên đã dần biến mất.

Ngày còn đi học, mình gặp cùng một nhóm người gần như mỗi ngày. Chỉ cần ngồi cạnh nhau đủ lâu, cùng ghét một môn học, cùng chờ một giờ ra chơi, thế là có chuyện để thân.

Khi trưởng thành, mỗi người sống theo một lịch khác. Công việc khác, thành phố khác, gia đình khác, và cả những nỗi lo cũng không còn giống nhau.

Mình bắt đầu hiểu rõ điều gì cho mình cảm giác an toàn, và điều gì làm mình mệt. Mình cũng nhận ra có những mối quan hệ chỉ tồn tại vì thói quen. Thế nên, ít bạn hơn đôi khi không phải là mất mát; nó là kết quả của việc mình không còn có thể thân với tất cả mọi người.

Nhưng cũng đừng vội gọi sự cô lập là trưởng thành. Một tình bạn sâu vẫn cần người chủ động nhắn trước, dành thời gian, nhớ một câu chuyện cũ và có mặt khi đời người kia không vui.

Càng lớn, bạn bè có thể ít đi, nhưng mỗi người còn lại thường giữ một phần rất thật trong cuộc đời mình. Nếu đang nghĩ đến một người đã lâu không nói chuyện, có lẽ đừng đợi một dịp đặc biệt, mà hãy nhắn một câu thật đơn giản: dạo này bạn thế nào rồi?`,
  },
] as const

export default function VoiceReviewPlayer() {
  const players = useRef<Record<string, HTMLAudioElement | null>>({})

  const handlePlay = (activeId: string) => {
    for (const [id, player] of Object.entries(players.current)) {
      if (id !== activeId && player && !player.paused) player.pause()
    }
  }

  return (
    <section className={styles.playerList} aria-label="Ba bản voice Mèo béo cần đánh giá">
      {tracks.map((track, index) => (
        <article className={styles.track} key={track.id}>
          <div className={styles.trackIdentity} aria-hidden="true">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{track.id}</strong>
          </div>
          <div className={styles.trackBody}>
            <header>
              <h2>{track.name}</h2>
              <p>{track.duration} · {track.metric}</p>
            </header>
            <dl className={styles.intent}>
              <div><dt>Cảm thấy</dt><dd>{track.feel}</dd></div>
              <div><dt>Nhớ</dt><dd>{track.remember}</dd></div>
            </dl>
            <audio
              ref={(node) => { players.current[track.id] = node }}
              controls
              preload="metadata"
              onPlay={() => handlePlay(track.id)}
              aria-label={`Phát bản voice ${track.name}`}
            >
              <source src={track.src} type="audio/mpeg" />
              Trình duyệt này không hỗ trợ âm thanh MP3.
            </audio>
            <details className={styles.script}>
              <summary>Đọc toàn bộ kịch bản</summary>
              {track.script.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </details>
          </div>
        </article>
      ))}
    </section>
  )
}
