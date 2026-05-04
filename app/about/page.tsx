import styles from './page.module.css'

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container-blog">
          <div className={styles.label}>Câu chuyện cá nhân</div>
          <h1>Về Thông Phan</h1>
          <p className={styles.subtitle}>
            Sinh năm 1988 tại Tiền Giang. Tốt nghiệp UEH (Math/Stats).<br />
            Từ shipper, sales, diễn viên quần chúng đến doanh nhân và nhà đào tạo.
          </p>

          {/* Core Traits */}
          <div className={styles.traits}>
            <span className="badge">✨ Sáng tạo</span>
            <span className="badge">🔍 Tò mò</span>
            <span className="badge">😄 Hài hước</span>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className={styles.expertise}>
        <div className="container-blog">
          <h2>Chuyên môn</h2>
          <div className={styles.expertiseBar}>
            <div className={styles.barLabel}>
              <span>Marketing</span>
              <span>95%</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '95%' }}></div>
            </div>
          </div>
          <div className={styles.expertiseBar}>
            <div className={styles.barLabel}>
              <span>Content</span>
              <span>90%</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '90%' }}></div>
            </div>
          </div>
          <div className={styles.expertiseBar}>
            <div className={styles.barLabel}>
              <span>AI & Automation</span>
              <span>85%</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={styles.timeline}>
        <div className="container-blog">
          <h2>Hành trình</h2>
          <div className={styles.timelineList}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2006</div>
              <div className={styles.timelineContent}>
                <h3>Chuyên Lý, Chuyên Tiền Giang</h3>
                <p>Nền tảng tư duy phân tích</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2015</div>
              <div className={styles.timelineContent}>
                <h3>Hoa Sơn Tửu Lầu</h3>
                <p>
                  Chuỗi nhà hàng kiếm hiệp đầu tiên VN.<br />
                  Khởi nghiệp 85tr, 32m². 2 năm → 6 nhà hàng, 650m²/quán, 60tr/ngày/quán.<br />
                  Lên CNN Travel, VTV3, Tuổi Trẻ, Thanh Niên.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2016-17</div>
              <div className={styles.timelineContent}>
                <h3>Serial Entrepreneur</h3>
                <p>
                  Kiếm Vương, Thánh Địa Liên Quân, Vietnam938.<br />
                  Quy mô 50+ nhân sự.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2018-21</div>
              <div className={styles.timelineContent}>
                <h3>Marketing Leadership</h3>
                <p>
                  Saffron Việt Nam, iCheck Corp.<br />
                  Dẫn dắt team 200+ nhân sự.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2022</div>
              <div className={styles.timelineContent}>
                <h3>CMO Autoshop</h3>
                <p>
                  Top 1 giải pháp ngành F&B.<br />
                  Phục vụ hàng nghìn quán cafe & trà sữa toàn quốc.
                </p>
              </div>
            </div>

            <div className={`${styles.timelineItem} ${styles.highlight}`}>
              <div className={styles.timelineYear}>Hiện tại</div>
              <div className={styles.timelineContent}>
                <h3>Co-Founder & CMO Conan School</h3>
                <p>
                  Trường "kinh doanh hiệu quả" đầu tiên tại Việt Nam.<br />
                  100+ makers đang build sản phẩm thật.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className={styles.mentors}>
        <div className="container-blog">
          <h2>Những người định hình tư duy tui</h2>
          <div className={styles.mentorGrid}>
            <div className="card">
              <h3>Ba của tôi (Phan Quân Chiêu)</h3>
              <p className={styles.mentorTrait}>Resilience và Determination</p>
              <p className="text-muted">PhD Bách Khoa</p>
            </div>
            <div className="card">
              <h3>Alex Hormozi</h3>
              <p className={styles.mentorTrait}>Business scaling và value creation</p>
            </div>
            <div className="card">
              <h3>Nguyễn Ngọc Long</h3>
              <p className={styles.mentorTrait}>Media consciousness và brand strategy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className={styles.philosophy}>
        <div className="container-blog text-center">
          <blockquote className={styles.quote}>
            "Nói ít, làm nhiều và chứng minh bằng hành động."
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container-blog text-center">
          <h2>Muốn phát triển cùng nhau?</h2>
          <p className={styles.ctaDesc}>
            Tham gia Conan Maker — cộng đồng 100+ maker đang build thật.
          </p>
          <div className={styles.ctaButtons}>
            <a href="https://www.conan.school/membership" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Vào Conan Maker →
            </a>
            <a href="/chat" className="btn-outline">
              Chat với Tui
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
