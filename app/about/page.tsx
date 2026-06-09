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
    title: 'Content, marketing và làm thị trường thật',
    body: 'Tui đi qua F&B, content, đội marketing, thương hiệu và doanh thu thật. AI tới sau, nhưng nền hiểu khách hàng, thông điệp và niềm tin đã được rèn trước đó.',
  },
  {
    year: '40+',
    title: 'Bài viral, 80k+ lượt chia sẻ, 600+ bình luận',
    body: 'Những con số này không phải huy chương. Nó là bằng chứng rằng tri thức thật, nói đúng nỗi đau và có hệ thống phân phối sẽ kéo được người đúng.',
  },
  {
    year: '2026',
    title: 'Brain2 + Conan',
    body: 'Brain2 là hệ tri thức tui đang vận hành thật. Conan là môi trường thực hành để biến tri thức đó thành nội dung, tài sản, quy trình AI và cộng đồng.',
  },
]

const proofIndex = [
  ['14 tháng', 'flop đủ lâu để hiểu hỗn loạn không tự hết nếu thiếu bản đồ'],
  ['10 năm', 'content, marketing và thị trường thật trước khi nói về AI'],
  ['40+ bài', 'viral vì có insight, không phải vì nhảy theo công cụ mới'],
  ['80k+', 'lượt chia sẻ từ những bài có bằng chứng và góc nhìn rõ'],
  ['600+', 'bình luận đăng ký workshop trong 24h, tín hiệu nhu cầu thật'],
  ['100+', 'Conan Makers đang thực hành trong cộng đồng riêng'],
]

const proofSignals = [
  ['gốc', '10 năm thị trường thật'],
  ['bằng chứng', '40+ bài viral có bằng chứng'],
  ['hệ thống', 'Brain2 + Conan Maker'],
]

export const metadata: Metadata = {
  title: 'Về Thông Phan — Vì sao tôi làm việc này',
  description: 'Tôi giúp người có chuyên môn biến kiến thức thật thành nội dung, tài sản số và dòng tiền thứ hai bằng AI, Brain2 và hệ thống thực hành.',
}

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroShell} data-reveal>
            <div className={styles.heroInner}>
              <span className={styles.label}>Bằng chứng sống</span>
              <h1>Tui không muốn dạy bạn thêm vài công cụ AI. Tui muốn giúp bạn biến thứ mình thật sự biết thành tài sản.</h1>
              <p>
                Tui là Thông Phan. Nếu bạn có chuyên môn, có kinh nghiệm, nhưng chưa biết cách đóng gói nó thành nội dung, sản phẩm hoặc cơ hội mới, trang này được xây cho bạn.
              </p>
              <GardenSignature variant="tree" eyebrow="Bằng chứng có rễ" title="10 năm làm thật là bộ rễ, AI chỉ là lớp tăng trưởng phía trên." compact />
            </div>

            <div className={styles.proofStage} aria-label="Sân khấu bằng chứng của Thông Phan">
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
                <span>Biết dùng AI trên việc thật</span>
                <span>Brain2</span>
                <span>Nói bằng bằng chứng trước</span>
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
              <h2>AI không thay chuyên môn của bạn. Nó chỉ khuếch đại thứ bạn đã biết cách đóng gói.</h2>
            </div>
            <div className={styles.principleText}>
              <p>
                Nhiều người giỏi thua không phải vì kém. Họ thua vì kinh nghiệm vẫn nằm trong đầu, trong vài file cũ, trong những lần xử lý khách hàng mà chưa từng được biến thành thứ người khác có thể thấy và tin.
              </p>
              <p>
                Con đường tui tin là: vẫn giữ việc chính nếu cần, xây tài sản bên cạnh, tạo dòng tiền thứ hai, rồi chỉ chuyển hướng khi nền đã đủ chắc.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.timeline}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Hành trình</span>
            <h2>Tui cũng từng đi từ hỗn loạn, thử sai, rồi mới có hệ thống đang chạy thật</h2>
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
            <span className={styles.label}>Bằng chứng để bạn tự kiểm</span>
            <h2>Mấy con số này không để khoe. Nó chỉ trả lời một câu: tại sao bạn có thể tin con đường này?</h2>
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
              <span>Đồng sáng lập và phụ trách marketing Conan School, cùng đội ngũ xây Conan Maker.</span>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner} data-reveal>
            <h2>Đừng tin tui vội. Tự chẩn đoán trước.</h2>
            <p>
              Khi biết mình đang ở tầng nào, bạn sẽ đỡ học lan man: nên đọc trước, hỏi Brain2, xây Brain2, hay vào môi trường thực hành sâu hơn.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/diagnostic" className="btn-primary">Làm bài chẩn đoán</Link>
              <Link href="/chat" className="btn-outline">Hỏi thử Brain2</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
