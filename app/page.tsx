import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.homepage}>
      {/* Section 1: Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className="shimmer-text">
            Thương hiệu cá nhân không chờ đợi.<br />
            Nó được xây bằng AI, Content, và tư duy đúng.
          </h1>
          <p className={styles.subheadline}>
            10+ năm. 40+ bài viral. 80k+ shares.<br />
            Tui đang chia sẻ toàn bộ hệ thống.
          </p>
          <div className={styles.ctas}>
            <a href="/blog" className="btn-primary">Đọc Blog →</a>
            <a href="/chat" className="btn-outline">Chat với Tui</a>
          </div>
        </div>
      </section>

      {/* Section 2: Track Record */}
      <section className={styles.trackRecord}>
        <div className="container">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>80k+</div>
              <div className={styles.statLabel}>Shares</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>40+</div>
              <div className={styles.statLabel}>Bài viral<br />({'>'}1k shares)</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>600+</div>
              <div className={styles.statLabel}>Đăng ký workshop<br />trong 24h</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Topics */}
      <section className={styles.topics}>
        <div className="container">
          <h2 className="text-center mb-12">4 chủ đề tui chia sẻ</h2>
          <div className={styles.topicGrid}>
            <div className="card">
              <div className={styles.topicIcon}>🧠</div>
              <h3>AI & Automation</h3>
              <p>Làm chủ AI trước khi AI làm chủ bạn</p>
            </div>
            <div className="card">
              <div className={styles.topicIcon}>✍️</div>
              <h3>Content Viral</h3>
              <p>Viral có công thức, không phải may mắn</p>
            </div>
            <div className="card">
              <div className={styles.topicIcon}>🔮</div>
              <h3>Brain2</h3>
              <p>Xây bộ não thứ 2 với Obsidian + AI</p>
            </div>
            <div className="card">
              <div className={styles.topicIcon}>🧬</div>
              <h3>Social Psychology</h3>
              <p>Hiểu người, ảnh hưởng đúng cách</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Module Cards */}
      <section className={styles.modules}>
        <div className="container">
          <div className={styles.moduleGrid}>
            <a href="/blog" className="card">
              <div className={styles.moduleIcon}>📖</div>
              <h3>Blog</h3>
              <p>Long-form. Không fluff. Đọc 1 bài = tiết kiệm 6 tháng thử sai.</p>
              <div className={styles.moduleCta}>Đọc bài viết →</div>
            </a>
            <a href="/challenges" className="card">
              <div className={styles.moduleIcon}>🎯</div>
              <h3>Challenges</h3>
              <p>21 ngày email. Mỗi sáng 1 bài tập. Miễn phí hoàn toàn.</p>
              <div className={styles.moduleCta}>Tham gia ngay →</div>
            </a>
            <a href="/chat" className="card">
              <div className={styles.moduleIcon}>💬</div>
              <h3>Chat với Tui</h3>
              <p>Hỏi tui bất cứ thứ gì — 24/7. Powered by Brain2 vault của tui.</p>
              <div className={styles.moduleCta}>Bắt đầu chat →</div>
            </a>
          </div>
        </div>
      </section>

      {/* Section 5: Ecosystem */}
      <section className={styles.ecosystem}>
        <div className="container">
          <div className={styles.ecosystemHeader}>
            <h2>Bạn muốn đi xa hơn?</h2>
            <p className={styles.ecosystemSub}>
              Tui không chỉ chia sẻ blog. Tui còn co-build một cộng đồng.
            </p>
          </div>
          <div className={styles.ecosystemGrid}>
            <a href="https://www.conan.school/membership" target="_blank" rel="noopener noreferrer" className="card">
              <div className={styles.ecosystemIcon}>🏗️</div>
              <h3>Conan Maker</h3>
              <p>
                100+ maker đang cùng nhau build sản phẩm thật.
                Học = Tạo ra được thứ gì đó. Không phải note.
              </p>
              <div className={styles.moduleCta}>Trở thành Maker →</div>
            </a>
            <a href="https://www.conan.school/membership" target="_blank" rel="noopener noreferrer" className="card">
              <div className={styles.ecosystemIcon}>🎯</div>
              <h3>Coaching 1:1</h3>
              <p>
                Làm việc trực tiếp với team Conan.
                Personal Branding, Content, AI — từng bước cụ thể.
              </p>
              <div className={styles.moduleCta}>Xem Conan Elite →</div>
            </a>
          </div>
        </div>
      </section>

      {/* Section 6: Philosophy Quote */}
      <section className={styles.philosophy}>
        <div className="container text-center">
          <blockquote className={styles.quote}>
            "Nói ít, làm nhiều và chứng minh bằng hành động."
          </blockquote>
          <p className={styles.quoteAuthor}>— Thông Phan</p>
        </div>
      </section>
    </div>
  )
}
