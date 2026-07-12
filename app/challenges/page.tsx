import type { Metadata } from 'next'
import styles from './page.module.css'
import { challenges } from '@/lib/challenges'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import Image from 'next/image'
import ChapterHandoff from '@/components/journey/ChapterHandoff'

const beforeAfter = [
  ['Before', 'Kiến thức rời rạc, AI dùng lẻ tẻ, nội dung nghe đúng nhưng generic.'],
  ['After', 'Có nền Brain2, có raw material thật, có hệ thống để AI hiểu chuyên môn của bạn.'],
]

const weekStructure = [
  ['Tuần 1', 'Gom tri thức', 'Kéo kinh nghiệm, ca thật, câu chuyện, câu hỏi khách hàng và proof cũ ra khỏi đầu.'],
  ['Tuần 2', 'Kết nối', 'Tách ý một ý, nối các mảnh liên quan và tạo bản đồ chuyên môn đủ rõ cho AI.'],
  ['Tuần 3', 'Biến thành output', 'Dùng Brain2 tạo bài viết, tài liệu kéo khách, góc chẩn đoán hoặc lời mời thử.'],
]

export const metadata: Metadata = {
  title: '21 ngày Brain2 — Thông Phan',
  description: 'Activation product giúp người có chuyên môn gom tri thức rời rạc thành nền Brain2 để AI hiểu chuyên môn và tạo tài sản số.',
  alternates: { canonical: '/challenges' },
}

export default function ChallengesPage() {
  return (
    <div className={styles.challengesPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroShell} data-reveal>
            <div className={styles.heroCopy}>
              <DossierHeader eyebrow="Lịch thực hành" folio="TP / 21 DAYS / 01" title="Kích hoạt chuyên môn bằng một nhịp đủ nhỏ." description="Không phải chuỗi email cho vui. Đây là 21 ngày gom nguyên liệu thật, nối thành Brain2 và tạo đầu ra đầu tiên." />
            </div>

            <figure className={styles.challengeStage}>
              <Image src="/images/challenges/brain2-21-day-editorial-slate-v1.webp" width={1200} height={675} alt="Lịch thực hành giấy, bút chì và bảng slate phim tượng trưng cho 21 ngày Brain2" priority />
              <figcaption><span>21 ngày</span> Gom tri thức · Kết nối · Tạo đầu ra</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Challenge Grid */}
      <section className={styles.challengeGrid}>
        <div className="container">
          {challenges.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Chưa có thử thách nào. Quay lại sau nhé!
            </p>
          ) : (
            <div className={styles.grid}>
              {challenges.map((challenge) => (
              <a
                key={challenge.id}
                href="/brain2/21-ngay"
                className={styles.challengeLink}
              >
                <div className={styles.challengeCard} data-reveal>
                  <div className={styles.duration}>
                    {challenge.duration_days} ngày
                  </div>
                  <h2>{challenge.title}</h2>
                  {challenge.tagline && (
                    <p className={styles.tagline}>{challenge.tagline}</p>
                  )}
                  {challenge.description && (
                    <p className={styles.description}>{challenge.description}</p>
                  )}
                  <span className="btn-primary">
                    Tham gia ngay →
                  </span>
                </div>
              </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.activation}>
        <div className="container">
          <div className={styles.activationHeader} data-reveal>
            <span>Before / After</span>
            <h2>21 ngày này không hứa đổi đời. Nó giúp anh em có nền để làm tiếp.</h2>
          </div>
          <div className={styles.beforeAfterGrid} data-reveal>
            {beforeAfter.map(([label, body]) => (
              <article key={label} className={styles.beforeAfterCard} data-stagger>
                <strong>{label}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>

          <div className={styles.weekGrid} data-reveal>
            {weekStructure.map(([week, title, body]) => (
              <article key={week} className={styles.weekCard} data-stagger>
                <span>{week}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.info}>
        <div className="container">
            <div className={styles.infoGrid} data-reveal>
            <div className={styles.infoCard} data-stagger>
              <div className={styles.infoIcon}>01</div>
              <h3>Nhịp nhỏ mỗi ngày</h3>
              <p>Mỗi sáng nhận một bài tập gọn để kéo tri thức thật ra khỏi đầu.</p>
            </div>
            <div className={styles.infoCard} data-stagger>
              <div className={styles.infoIcon}>02</div>
              <h3>Gắn với chuyên môn thật</h3>
              <p>Làm trên kinh nghiệm, ca thật, khách hàng và góc nhìn riêng của bạn.</p>
            </div>
            <div className={styles.infoCard} data-stagger>
              <div className={styles.infoIcon}>03</div>
              <h3>Cửa vào Conan Maker</h3>
              <p>Hoàn thành nền Brain2 rồi bước tiếp vào môi trường thực hành sâu hơn.</p>
            </div>
          </div>
        </div>
      </section>
      <ChapterHandoff journeyKey="challenges" tone="dark" />
    </div>
  )
}
