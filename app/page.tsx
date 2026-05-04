import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.homepage}>
      {/* Section 1: Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className="shimmer-text">
            AI không cướp việc bạn.<br />
            Người dùng AI giỏi hơn bạn mới cướp.
          </h1>
          <p className={styles.subheadline}>
            10 năm content marketing. 40+ bài viral. Tui đang chia sẻ tất cả.
          </p>
          <div className={styles.ctas}>
            <a href="/blog" className="btn-primary">Đọc Blog →</a>
            <a href="/chat" className="btn-outline">Thử Chat với Tui</a>
          </div>
        </div>
      </section>

      {/* Section 2: Track Record */}
      <section className={styles.trackRecord}>
        <div className="container">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>10+</div>
              <div className={styles.statLabel}>năm</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>40+</div>
              <div className={styles.statLabel}>bài viral</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>600+</div>
              <div className={styles.statLabel}>đăng ký/24h</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Module Cards */}
      <section className={styles.modules}>
        <div className="container">
          <div className={styles.moduleGrid}>
            <a href="/blog" className="card">
              <div className={styles.moduleIcon}>✍️</div>
              <h3>Blog</h3>
              <p>Bài viết dài về AI, career, content marketing từ 10 năm thực chiến.</p>
            </a>
            <a href="/challenges" className="card">
              <div className={styles.moduleIcon}>🎯</div>
              <h3>Challenges</h3>
              <p>21 Ngày Brain2 — xây bộ não thứ 2 với AI, email drip hàng ngày.</p>
            </a>
            <a href="/chat" className="card">
              <div className={styles.moduleIcon}>💬</div>
              <h3>Chat với Tui</h3>
              <p>RAG từ Brain2 vault — hỏi tui bất cứ gì về AI, career, content.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Section 4: Featured Posts */}
      <section className={styles.featured}>
        <div className="container">
          <h2>Bài nổi bật</h2>
          <div className={styles.postGrid}>
            <a href="/blog/ai-khong-cuop-viec-ban" className="card">
              <span className="badge gold">AI</span>
              <h3 className="mt-4">AI không cướp việc bạn</h3>
              <p className="text-muted mt-4">Người dùng AI giỏi hơn bạn mới cướp. Đây là cách tui dùng AI để tăng năng suất 10x.</p>
              <div className={styles.postMeta}>
                <span>5 phút đọc</span>
                <span>•</span>
                <span>2026-05-01</span>
              </div>
            </a>
            <a href="/blog/xay-brain2-voi-obsidian" className="card">
              <span className="badge">Brain2</span>
              <h3 className="mt-4">Xây Brain2 với Obsidian</h3>
              <p className="text-muted mt-4">Bộ não thứ 2 giúp tui nhớ mọi thứ, kết nối ý tưởng, và viết nhanh hơn 5x.</p>
              <div className={styles.postMeta}>
                <span>8 phút đọc</span>
                <span>•</span>
                <span>2026-04-28</span>
              </div>
            </a>
            <a href="/blog/40-bai-viral-tui-hoc-duoc-gi" className="card">
              <span className="badge">Content</span>
              <h3 className="mt-4">40 bài viral, tui học được gì</h3>
              <p className="text-muted mt-4">10 năm content marketing, đây là những bài học đắt nhất tui trả tiền để học.</p>
              <div className={styles.postMeta}>
                <span>12 phút đọc</span>
                <span>•</span>
                <span>2026-04-25</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Section 5: Philosophy Quote */}
      <section className={styles.philosophy}>
        <div className="container text-center">
          <blockquote className={styles.quote}>
            "Mọi người sợ AI. Tui sợ người hiểu AI."
          </blockquote>
        </div>
      </section>
    </div>
  )
}
