import type { Metadata } from 'next'
import styles from './page.module.css'

interface Challenge {
  id: string
  slug: string
  title: string
  tagline: string | null
  description: string | null
  duration_days: number
  is_active: number
}

// Static data - no HTTP fetch during build
const CHALLENGES: Challenge[] = [
  {
    id: '1',
    slug: 'brain2-21-ngay',
    title: '21 ngày Brain2, kích hoạt kho kiến thức của bạn',
    tagline: 'Điểm bắt đầu để biến chuyên môn thành tài sản số bằng AI',
    description: 'Mỗi ngày 15 phút gom kinh nghiệm, ca thật, góc nhìn và bằng chứng thật vào một hệ thống, rồi tiếp tục thực hành trong Conan Maker.',
    duration_days: 21,
    is_active: 1,
  }
]

const beforeAfter = [
  ['Before', 'Kiến thức rời rạc, AI dùng lẻ tẻ, nội dung nghe đúng nhưng generic.'],
  ['After', 'Có nền Brain2, có raw material thật, có hệ thống để AI hiểu chuyên môn của bạn.'],
]

const weekStructure = [
  ['Tuần 1', 'Gom tri thức', 'Kéo kinh nghiệm, ca thật, câu chuyện, câu hỏi khách hàng và proof cũ ra khỏi đầu.'],
  ['Tuần 2', 'Kết nối', 'Tách ý một ý, nối các mảnh liên quan và tạo bản đồ chuyên môn đủ rõ cho AI.'],
  ['Tuần 3', 'Biến thành output', 'Dùng Brain2 tạo bài viết, tài liệu kéo khách, góc chẩn đoán hoặc lời mời thử.'],
]

const stageDays = Array.from({ length: 21 }, (_, index) => index + 1)

export const metadata: Metadata = {
  title: '21 ngày Brain2 — Thông Phan',
  description: 'Activation product giúp người có chuyên môn gom tri thức rời rạc thành nền Brain2 để AI hiểu chuyên môn và tạo tài sản số.',
}

export default function ChallengesPage() {
  const challenges = CHALLENGES
  return (
    <div className={styles.challengesPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroShell} data-reveal>
            <div className={styles.heroCopy}>
              <h1>Thử thách kích hoạt chuyên môn</h1>
              <p className={styles.subtitle}>
                Không phải challenge email cho vui. Đây là activation product để kiến thức của bạn đủ sạch, đủ rõ và đủ dùng với AI.
              </p>
            </div>

            <div className={styles.challengeStage} aria-label="21 ngày Brain2 activation">
              <div className={styles.stageGrid} />
              <div className={styles.stageCore}>
                <span>Brain2</span>
                <strong>21 ngày</strong>
              </div>
              <div className={styles.dayDeck}>
                {stageDays.map((day) => (
                  <span key={day} className={day <= 7 ? styles.dayActive : day <= 14 ? styles.dayMid : ''}>
                    {String(day).padStart(2, '0')}
                  </span>
                ))}
              </div>
              <div className={styles.stageLanes}>
                <span>Gom tri thức</span>
                <span>Kết nối graph</span>
                <span>Xuất bản output</span>
              </div>
            </div>
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
                href={`/challenges/${challenge.slug}`}
                className="card"
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
                  <button className="btn-primary">
                    Tham gia ngay →
                  </button>
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
    </div>
  )
}
