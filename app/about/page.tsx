import type { Metadata } from 'next'
import Link from 'next/link'
import { GardenSignature } from '@/components/GardenSignature'
import styles from './page.module.css'

const proofArcs = [
  {
    year: 'Flop',
    title: '14 tháng nội dung không mở được cửa',
    body: 'Có giai đoạn tui làm, thử, sửa, đăng, rồi vẫn flop. Đoạn đó dạy tui một chuyện: nếu không có insight và hệ thống, chăm chỉ chỉ làm mình mệt hơn.',
  },
  {
    year: '10 năm',
    title: 'Content, marketing và CMO thực chiến',
    body: 'Tui đi qua F&B, content, đội marketing, thương hiệu và doanh thu thật. AI tới sau, nhưng nền hiểu khách hàng, thông điệp và trust đã được rèn trước đó.',
  },
  {
    year: '40+',
    title: 'Bài viral, 80k+ shares, 600+ comment',
    body: 'Những con số này không phải huy chương. Nó là bằng chứng rằng tri thức thật, nói đúng nỗi đau và có hệ thống phân phối sẽ kéo được người đúng.',
  },
  {
    year: '2026',
    title: 'Brain2 + Conan',
    body: 'Brain2 là hệ tri thức tui đang vận hành thật. Conan là môi trường thực hành để biến tri thức đó thành nội dung, tài sản, AI workflow và cộng đồng.',
  },
]

const proofIndex = [
  ['14 tháng', 'flop đủ lâu để hiểu hỗn loạn không tự hết nếu thiếu bản đồ'],
  ['10 năm', 'content, marketing, CMO và thị trường thật trước khi nói về AI'],
  ['40+ bài', 'viral vì có insight, không phải vì nhảy theo tool mới'],
  ['80k+', 'lượt chia sẻ từ những bài có proof và góc nhìn rõ'],
  ['600+', 'comment đăng ký workshop trong 24h, tín hiệu nhu cầu thật'],
  ['100+', 'Conan Makers đang thực hành trong cộng đồng riêng'],
]

const proofSignals = [
  ['origin', '10 năm thị trường thật'],
  ['signal', '40+ bài viral có proof'],
  ['system', 'Brain2 + Conan Maker'],
]

export const metadata: Metadata = {
  title: 'Về Thông Phan — Proof sống, không phải CV',
  description: 'Thông Phan giúp người có chuyên môn biến kiến thức thành tài sản, hệ thống AI và dòng tiền thứ 2 từ nền Brain2 và kinh nghiệm thật.',
}

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroShell} data-reveal>
            <div className={styles.heroInner}>
              <span className={styles.label}>Bằng chứng sống</span>
              <h1>Tui không đến từ thế giới guru AI tool. Tui đến từ 10 năm làm thật.</h1>
              <p>
                Tui là Thông Phan. Việc của tui là giúp người có chuyên môn biến kiến thức thành tài sản và tạo dòng tiền thứ 2 bằng AI, trong khi vẫn giữ an toàn công việc chính cho đến khi dòng tiền mới đủ vững.
              </p>
              <GardenSignature variant="tree" eyebrow="Proof có rễ" title="10 năm làm thật là bộ rễ, AI chỉ là lớp tăng trưởng phía trên." compact />
            </div>

            <div className={styles.proofStage} aria-label="Proof stage của Thông Phan">
              <div className={styles.stageHalo} />
              <div className={styles.stageFrame}>
                <img
                  src="/images/homepage/thong-stage-anchor.jpg"
                  alt="Thông Phan chia sẻ trên sân khấu"
                  className={styles.stagePhoto}
                />
                <div className={styles.stageScan} />
              </div>
              <div className={styles.proofConsole}>
                {proofSignals.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.stageOrbit}>
                <span>AI-native expertise</span>
                <span>Brain2</span>
                <span>Proof-first content</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.principle}>
        <div className="container">
          <div className={styles.principleGrid} data-reveal>
            <div>
              <span className={styles.label}>Quan điểm</span>
              <h2>AI không thay chuyên môn. AI khuếch đại chuyên môn đã được đóng gói.</h2>
            </div>
            <div className={styles.principleText}>
              <p>
                Người có kinh nghiệm thường thua không phải vì họ kém. Họ thua vì tri thức nằm trong đầu, trong vài tài liệu cũ, trong kinh nghiệm xử lý khách hàng, nhưng chưa được biến thành tài sản có thể phân phối.
              </p>
              <p>
                Tui xây trang này để chỉ ra một con đường thực tế hơn: giữ công việc chính, xây tài sản bên cạnh, tạo dòng tiền thứ 2, rồi chỉ chuyển hướng khi đã đủ an toàn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.timeline}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Hành trình</span>
            <h2>Từ hỗn loạn, thử sai, tới hệ thống đang chạy thật</h2>
          </div>
          <div className={styles.timelineGrid} data-reveal>
            {proofArcs.map((item) => (
              <article key={item.title} className={styles.timelineItem} data-stagger>
                <span>{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.proofIndex}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Proof Index</span>
            <h2>Mỗi con số phải trả lời một câu: vì sao anh em nên tin con đường này?</h2>
          </div>
          <div className={styles.proofGrid} data-reveal>
            {proofIndex.map(([value, body]) => (
              <article key={value} className={styles.proofItem} data-stagger>
                <strong>{value}</strong>
                <span>{body}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.capabilities}>
        <div className="container">
          <div className={styles.capabilityGrid} data-reveal>
            <article data-stagger>
              <strong>Bằng chứng nội dung</strong>
              <span>40+ bài viral, 80k+ lượt chia sẻ, 600+ đăng ký buổi thực hành trong 24h.</span>
            </article>
            <article data-stagger>
              <strong>Bằng chứng tri thức</strong>
              <span>Brain2 cá nhân, hệ thống hóa tri thức, dùng AI như người cùng suy nghĩ.</span>
            </article>
            <article data-stagger>
              <strong>Bằng chứng cộng đồng</strong>
              <span>Đồng sáng lập & CMO Conan School, cùng đội ngũ xây Conan Maker.</span>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner} data-reveal>
            <h2>Không cần tin tui ngay. Tự chẩn đoán trước.</h2>
            <p>
              Biết mình đang ở tầng nào trong hành trình dùng AI sẽ giúp bạn chọn đúng bước: đọc, hỏi Brain2, xây Brain2 hay vào Conan Maker.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/diagnostic" className="btn-primary">Tự chẩn đoán năng lực AI</Link>
              <Link href="/chat" className="btn-outline">Hỏi Brain2</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
