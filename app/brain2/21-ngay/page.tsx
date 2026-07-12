import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import Brain2Analytics, { Brain2ConanLink } from '@/components/brain2/Brain2Analytics'
import Brain2Roadmap from '@/components/brain2/Brain2Roadmap'
import JsonLd from '@/components/seo/JsonLd'
import { buildBrain2CourseStructuredData } from '@/lib/brain2/structured-data'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '21 ngày Brain2 — Biến trải nghiệm thành hệ thống',
  description: 'Một đầu ra mỗi ngày để đưa trải nghiệm, bài học và chuyên môn của bạn vào một hệ thống có thể truy xuất và dùng lại.',
  alternates: { canonical: '/brain2/21-ngay' },
  openGraph: {
    title: '21 ngày Brain2',
    description: 'Biến những gì bạn đã sống thành một hệ thống có thể dùng lại.',
    url: '/brain2/21-ngay',
    type: 'website',
    images: ['/images/challenges/brain2-21-day-editorial-slate-v1.webp'],
  },
}

export default function Brain2ChallengePage() {
  return (
    <div className={styles.hubPage}>
      <Brain2Analytics event={{ name: 'brain2_hub_viewed' }} />

      <section className={styles.hero}>
        <div className={styles.heroCopy} data-motion-reveal="fade">
          <p className={styles.eyebrow}>Thực hành Brain2 · 21 ngày</p>
          <h1>21 ngày để biến những gì bạn đã sống thành một hệ thống có thể dùng lại</h1>
          <p className={styles.lead}>Mỗi ngày một đầu ra; thời lượng thay đổi theo độ sâu của bài.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/brain2/21-ngay/ngay-01" data-motion-action>Bắt đầu Ngày 01 →</Link>
            <Link className={styles.secondaryAction} href="/about" data-motion-action>Đọc câu chuyện phía sau</Link>
          </div>
          <p className={styles.accessNote}>Tuần 1 mở công khai. Tuần 2–3 dành cho thành viên Conan Maker.</p>
        </div>

        <figure className={styles.heroMedia} data-motion-surface data-motion-reveal="scale">
          <Image
            src="/images/challenges/brain2-21-day-editorial-slate-v1.webp"
            alt="Bảng slate phim, sổ giấy và bút chì tượng trưng cho lộ trình thực hành 21 ngày Brain2"
            width={1200}
            height={675}
            priority
            sizes="(max-width: 800px) 100vw, 44vw"
          />
          <figcaption>Không phải một ứng dụng để trò chuyện. Đây là lộ trình thực hành trên dữ liệu của chính bạn.</figcaption>
        </figure>
      </section>

      <section className={styles.transformation} aria-labelledby="brain2-transformation">
        <header data-motion-reveal="fade">
          <p>Từ ký ức rời rạc đến năng lực gọi lại</p>
          <h2 id="brain2-transformation">Bạn không cần ghi nhiều hơn. Bạn cần dùng lại được điều mình đã biết.</h2>
        </header>
        <div className={styles.beforeAfter}>
          <article data-motion-surface>
            <span>Trước</span>
            <h3>Tri thức nằm trong đầu, thư mục và những cuộc trò chuyện đã trôi qua.</h3>
            <p>Khi cần viết, quyết định hay giải thích, bạn phải bắt đầu lại từ đầu.</p>
          </article>
          <article data-motion-surface>
            <span>Sau 21 ngày</span>
            <h3>Bạn có một cấu trúc đủ rõ để truy xuất trải nghiệm và tạo đầu ra tiếp theo.</h3>
            <p>Mỗi ngày kết thúc bằng một tài sản nhìn thấy được, không phải cảm giác đã học.</p>
          </article>
        </div>
      </section>

      <section className={styles.mapSection} aria-labelledby="brain2-roadmap-title">
        <header data-motion-reveal="fade">
          <p>Bản đồ thực hành</p>
          <h2 id="brain2-roadmap-title">Ba tuần. Hai mươi mốt đầu ra. Một hệ thống thuộc về bạn.</h2>
          <span>Trạng thái truy cập được ghi bằng chữ ở từng ngày, không ẩn sau màu sắc.</span>
        </header>
        <Brain2Roadmap />
      </section>

      <section className={styles.closing} data-motion-reveal="fade">
        <div>
          <p>Ngày đầu tiên đủ nhỏ để bắt đầu ngay</p>
          <h2>Mở một vault tối giản, xác định lý do và tạo cam kết đầu tiên.</h2>
        </div>
        <div className={styles.closingActions}>
          <Link className={styles.primaryAction} href="/brain2/21-ngay/ngay-01" data-motion-action>Bắt đầu miễn phí →</Link>
          <Brain2ConanLink className={styles.secondaryAction} placement="hub">Xem Conan Maker</Brain2ConanLink>
        </div>
      </section>

      <JsonLd data={buildBrain2CourseStructuredData()} />
    </div>
  )
}
