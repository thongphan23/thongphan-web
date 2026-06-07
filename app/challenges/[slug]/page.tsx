import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import styles from './page.module.css'
import SignupForm from '@/components/SignupForm'
import { notFound } from 'next/navigation'

interface Challenge {
  id: string
  slug: string
  title: string
  tagline: string | null
  description: string | null
  duration_days: number
  is_active: number
  created_at: string
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// Static data — no HTTP fetch during build
const CHALLENGES: Challenge[] = [
  {
    id: 'brain2-21-days',
    slug: 'brain2-21-ngay',
    title: '21 ngày Brain2, kích hoạt kho kiến thức của bạn',
    tagline: 'Điểm bắt đầu để biến chuyên môn thành tài sản số bằng AI',
    description: 'Mỗi ngày 15 phút để gom kinh nghiệm, ca thật, góc nhìn và bằng chứng thật vào một hệ thống. Sau 21 ngày, bạn có nền để vào Conan Maker và bắt đầu tạo đầu ra thật.',
    duration_days: 21,
    is_active: 1,
    created_at: '2026-05-01',
  },
]

const beforeAfter = [
  ['Before', 'Kiến thức nằm rời rạc trong đầu, AI dùng theo hứng, content càng viết càng dễ giống người khác.'],
  ['After', 'Có nền Brain2 đủ dùng, có raw material thật và có cách để AI hiểu chuyên môn riêng của bạn.'],
]

const weekStructure = [
  ['Tuần 1', 'Gom tri thức', 'Lôi kinh nghiệm, ca khách hàng, thất bại, câu hỏi hay gặp và proof cũ vào một nơi.'],
  ['Tuần 2', 'Kết nối', 'Tách ý một ý, nối các mảnh lại thành bản đồ chuyên môn, không cần làm vault hoàn hảo.'],
  ['Tuần 3', 'Biến thành output', 'Tạo bài viết, tài liệu kéo khách hoặc góc chẩn đoán đầu tiên từ chính Brain2 đó.'],
]

const activationLanes = [
  ['Raw proof', 'Kinh nghiệm thật', 'Không bắt đầu từ prompt. Bắt đầu từ những thứ bạn đã trải qua.'],
  ['Brain2 map', 'Nối lại hệ thống', 'Mỗi mảnh tri thức có vị trí, liên kết và ngữ cảnh để AI dùng được.'],
  ['First output', 'Đầu ra đầu tiên', 'Một bài viết, tài liệu kéo khách hoặc góc chẩn đoán có dấu vân tay riêng.'],
]

function getChallenge(slug: string): Challenge | null {
  return CHALLENGES.find(c => c.slug === slug) ?? null
}

export async function generateStaticParams() {
  return CHALLENGES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const challenge = getChallenge(slug)

  if (!challenge) {
    return {
      title: 'Challenge không tồn tại — Thông Phan',
    }
  }

  return {
    title: `${challenge.title} — Thông Phan`,
    description: challenge.description ?? '21 ngày xây nền Brain2 để biến chuyên môn thật thành tài sản số bằng AI.',
  }
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const challenge = getChallenge(slug)

  if (!challenge) {
    notFound()
  }

  return (
    <div className={styles.challengeDetail}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroShell}>
            <div className={styles.heroContent} data-reveal>
              <div className={styles.duration}>
                {challenge.duration_days} ngày
              </div>
              <h1>{challenge.title}</h1>
              {challenge.tagline && (
                <p className={styles.tagline}>{challenge.tagline}</p>
              )}
              {challenge.description && (
                <p className={styles.description}>{challenge.description}</p>
              )}

              {/* Stats */}
              <div className={styles.stats} data-reveal>
                <div className={styles.stat} data-stagger>
                  <div className={styles.statNumber}>{challenge.duration_days}</div>
                  <div className={styles.statLabel}>ngày kích hoạt</div>
                </div>
                <div className={styles.stat} data-stagger>
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>gắn chuyên môn</div>
                </div>
                <div className={styles.stat} data-stagger>
                  <div className={styles.statNumber}>0đ</div>
                  <div className={styles.statLabel}>để bắt đầu</div>
                </div>
              </div>
            </div>

            <div className={styles.activationDeck} aria-hidden="true" data-reveal="right">
              <div className={styles.deckRing} />
              <div className={styles.deckCard}>
                <div className={styles.deckTop}>
                  <span>Brain2 activation</span>
                  <span>Day 01 → 21</span>
                </div>
                <div className={styles.dayStack}>
                  {Array.from({ length: 21 }).map((_, index) => (
                    <span key={index} style={{ '--i': index } as CSSProperties}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ))}
                </div>
                <div className={styles.deckCore}>
                  <strong>21</strong>
                  <span>nhịp kéo chuyên môn ra khỏi đầu</span>
                </div>
              </div>
              <div className={styles.deckShadow} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.activation}>
        <div className="container">
          <div className={styles.activationHeader} data-reveal>
            <span>Activation product</span>
            <h2>Không phải học thêm cho vui. Đây là đoạn làm sạch nguyên liệu để AI hiểu anh em.</h2>
            <p>
              21 ngày này làm một việc: biến kinh nghiệm rời rạc thành nền Brain2 đủ dùng, rồi mở cửa tự nhiên sang Conan Maker.
            </p>
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
          <div className={styles.activationLanes} data-reveal>
            {activationLanes.map(([label, title, body], index) => (
              <article key={label} data-stagger style={{ '--i': index } as CSSProperties}>
                <span>{label}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className="container">
          <h2>21 ngày này giúp bạn có nền gì?</h2>
          <div className={styles.benefitsList} data-reveal>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>01</div>
              <div className={styles.benefitContent}>
                <h3>21 nhịp thực hành nhẹ</h3>
                <p>Mỗi ngày một câu lệnh hoặc bài tập nhỏ để kéo kiến thức thật ra khỏi đầu, không bắt bạn ngồi học thêm lý thuyết.</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>02</div>
              <div className={styles.benefitContent}>
                <h3>Bản đồ chuyên môn cá nhân</h3>
                <p>Bạn bắt đầu thấy mình biết gì, có ca nào, có bằng chứng nào và có thể biến phần nào thành nội dung hoặc tài sản.</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>03</div>
              <div className={styles.benefitContent}>
                <h3>Brain2 đủ dùng để nối với AI</h3>
                <p>Không cần kho tri thức hoàn hảo. Cần một nền đủ sạch để AI hiểu chuyên môn riêng thay vì viết như người lạ.</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>04</div>
              <div className={styles.benefitContent}>
                <h3>Cửa vào Conan Maker</h3>
                <p>21 ngày là điểm kích hoạt. Conan Maker là nơi bạn tiếp tục biến kiến thức thành đầu ra thật với cộng đồng.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section className={styles.signup}>
        <div className="container">
          <div className={styles.signupContent} data-reveal>
            <h2>Bắt đầu ngay hôm nay</h2>
            <p>Điền email để nhận bài đầu tiên. Sau khi hoàn thành, bước tiếp theo là Conan Maker.</p>
            <SignupForm challengeSlug={slug} />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className={styles.socialProof}>
        <div className="container">
          <h2>Dấu hiệu bạn đang đi đúng hướng</h2>
          <div className={styles.testimonials} data-reveal>
            <div className={styles.testimonial} data-stagger>
              <p className={styles.testimonialText}>
                "Tui không còn hỏi AI kiểu ngẫu hứng nữa. Tui bắt đầu đưa ca thật, góc nhìn và trải nghiệm của mình vào câu lệnh."
              </p>
              <p className={styles.testimonialAuthor}>Tầng 2: bắt đầu tạo nội dung</p>
            </div>
            <div className={styles.testimonial} data-stagger>
              <p className={styles.testimonialText}>
                "Tui nhận ra mình có nhiều kiến thức hơn mình nghĩ, chỉ là trước giờ chưa đóng gói lại thành tài sản."
              </p>
              <p className={styles.testimonialAuthor}>Tầng 3: xây hệ thống chuyên môn</p>
            </div>
            <div className={styles.testimonial} data-stagger>
              <p className={styles.testimonialText}>
                "Tui thấy đường đi rõ hơn: giữ công việc chính, xây tài sản bên cạnh, đo tín hiệu thị trường rồi mới tính bước lớn."
              </p>
              <p className={styles.testimonialAuthor}>Tầng 4: xây tài sản bằng AI</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
