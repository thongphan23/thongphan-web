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
  params: {
    slug: string
  }
}

async function getChallenge(slug: string): Promise<Challenge | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/challenges/${slug}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return null
  }
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const challenge = await getChallenge(params.slug)

  if (!challenge) {
    notFound()
  }

  return (
    <div className={styles.challengeDetail}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
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
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>{challenge.duration_days}</div>
                <div className={styles.statLabel}>email</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>thực chiến</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>0đ</div>
                <div className={styles.statLabel}>miễn phí</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className="container">
          <h2>Những gì bạn nhận được</h2>
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>📧</div>
              <div className={styles.benefitContent}>
                <h3>21 email hàng ngày</h3>
                <p>Mỗi sáng 7h, bạn nhận 1 email với bài học mới. Ngắn gọn, đủ để đọc trong 5 phút.</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>🎯</div>
              <div className={styles.benefitContent}>
                <h3>Bài tập thực hành</h3>
                <p>Mỗi bài đều có bài tập cụ thể. Làm xong là có kết quả ngay, không lý thuyết suông.</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>🧠</div>
              <div className={styles.benefitContent}>
                <h3>Hệ thống Brain2 hoàn chỉnh</h3>
                <p>Sau 21 ngày, bạn có 1 hệ thống PKM hoạt động, sẵn sàng dùng cho công việc hàng ngày.</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>🤖</div>
              <div className={styles.benefitContent}>
                <h3>AI workflows thực tế</h3>
                <p>Học cách dùng AI như một thought partner, không phải chatbot hỏi đáp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section className={styles.signup}>
        <div className="container">
          <div className={styles.signupContent}>
            <h2>Bắt đầu ngay hôm nay</h2>
            <p>Điền email, bạn sẽ nhận email đầu tiên trong vòng 5 phút.</p>
            <SignupForm challengeSlug={params.slug} />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className={styles.socialProof}>
        <div className="container">
          <h2>Người đã tham gia nói gì</h2>
          <div className={styles.testimonials}>
            <div className={styles.testimonial}>
              <p className={styles.testimonialText}>
                "21 ngày Brain2 thay đổi cách tui làm việc. Giờ tui nhớ mọi thứ, kết nối ý tưởng nhanh hơn, viết content dễ hơn nhiều."
              </p>
              <p className={styles.testimonialAuthor}>— Minh Anh, Content Creator</p>
            </div>
            <div className={styles.testimonial}>
              <p className={styles.testimonialText}>
                "Tui đã thử nhiều khóa học về PKM, nhưng đây là khóa duy nhất thực chiến 100%. Mỗi bài đều có ví dụ cụ thể, làm theo là có kết quả."
              </p>
              <p className={styles.testimonialAuthor}>— Tuấn Anh, Product Manager</p>
            </div>
            <div className={styles.testimonial}>
              <p className={styles.testimonialText}>
                "Email hàng ngày ngắn gọn, dễ hiểu, không lan man. Đọc xong là biết làm gì ngay. Đúng style của anh Thông."
              </p>
              <p className={styles.testimonialAuthor}>— Hương Giang, Marketing Manager</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
