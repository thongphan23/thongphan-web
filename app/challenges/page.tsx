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
    title: '21 Ngày Brain2 — Xây Bộ Não Thứ 2',
    tagline: 'Từ 0 đến hệ thống tri thức cá nhân hoạt động trong 21 ngày',
    description: 'Mỗi sáng 1 email. 15 phút thực hành. Sau 21 ngày bạn có vault Obsidian chạy được và kết nối AI.',
    duration_days: 21,
    is_active: 1,
  }
]

export default function ChallengesPage() {
  const challenges = CHALLENGES
  return (
    <div className={styles.challengesPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1>Challenges</h1>
          <p className={styles.subtitle}>
            Email drip hàng ngày. Bài học thực chiến. Không lý thuyết suông.
          </p>
        </div>
      </section>

      {/* Challenge Grid */}
      <section className={styles.challengeGrid}>
        <div className="container">
          {challenges.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Chưa có challenge nào. Quay lại sau nhé!
            </p>
          ) : (
            <div className={styles.grid}>
              {challenges.map((challenge) => (
              <a
                key={challenge.id}
                href={`/challenges/${challenge.slug}`}
                className="card"
              >
                <div className={styles.challengeCard}>
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

      {/* Info Section */}
      <section className={styles.info}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📧</div>
              <h3>Email hàng ngày</h3>
              <p>Mỗi sáng 7h, bạn nhận 1 email với bài học + bài tập thực hành.</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🎯</div>
              <h3>Thực chiến 100%</h3>
              <p>Không lý thuyết. Mỗi bài đều có ví dụ thực tế từ 10 năm kinh nghiệm.</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🆓</div>
              <h3>Miễn phí hoàn toàn</h3>
              <p>Tui chia sẻ vì muốn nhiều người dùng AI đúng cách. Không bán gì cả.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
