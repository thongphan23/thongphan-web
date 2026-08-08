import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ChallengeHubClient from '@/components/content-workflow/ChallengeHubClient'
import { CONTENT_WORKFLOW_DAYS } from '@/lib/content-workflow/content'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '7 ngày tự xây quy trình (workflow) đầu tiên — Thông Phan',
  description: 'Chương trình tự học miễn phí giúp bạn thiết kế, chạy thử và đóng gói một quy trình có thể dùng lại qua bài thực hành nội dung.',
  alternates: { canonical: '/challenge/content-workflow-7days' },
  openGraph: {
    title: '7 ngày tự xây quy trình (workflow) đầu tiên',
    description: 'Tự xây một quy trình nội dung có thể chạy lại bằng dữ liệu, nhận định và tài liệu bạn đang có.',
    url: '/challenge/content-workflow-7days',
    type: 'website',
  },
}

export default function ContentWorkflowChallengePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1>7 ngày tự xây quy trình (workflow) đầu tiên</h1>
            <p>
              Tự xây một quy trình nội dung có thể chạy lại: chọn kết quả, chuẩn bị bối cảnh,
              định nghĩa đầu ra, phân rã công việc, phân vai người–AI, chạy thử và đóng gói.
              Bạn bắt đầu bằng dữ liệu, tài liệu hoặc nhận định bạn đang có—chưa cần bằng chứng khách hàng.
            </p>
            <a className={styles.primaryAction} href="#readiness">Kiểm tra và mở Ngày 01</a>
            <small>45–60 phút cốt lõi mỗi ngày · 20–30 phút đào sâu với AI tùy chọn · Không cần tài khoản</small>
          </div>
          <figure className={styles.heroAsset}>
            <Image
              src="/images/challenges/content-workflow-7days-fieldbook.webp"
              alt="Chồng hồ sơ quy trình nội dung buộc bằng sợi chỉ đỏ"
              width={1254}
              height={1254}
              priority
            />
          </figure>
        </div>
      </section>

      <ChallengeHubClient />

      <section className={styles.outputSection} aria-labelledby="output-map-title">
        <div className={styles.sectionHeading}>
          <p>7 ngày · 7 sản phẩm · 1 năng lực chuyển giao</p>
          <h2 id="output-map-title">Mỗi ngày đào sâu một khái niệm và tạo một phần của quy trình.</h2>
        </div>
        <ol className={styles.dayRail}>
          {CONTENT_WORKFLOW_DAYS.map((lesson) => (
            <li key={lesson.slug}>
              <Link href={`/challenge/content-workflow-7days/${lesson.slug}`}>
                <span>Ngày {String(lesson.day).padStart(2, '0')}</span>
                <strong>{lesson.artifact}</strong>
                <small>{lesson.question}</small>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.boundarySection} aria-label="Ranh giới của thử thách">
        <article>
          <h2>Bạn sẽ không nhận</h2>
          <ul>
            <li>Một bộ câu lệnh chung để sao chép rồi mong AI tự hiểu.</li>
            <li>Yêu cầu phỏng vấn khách hàng hoặc tìm hàng loạt bằng chứng trước khi bắt đầu.</li>
            <li>Lời hứa tự động hóa, lan truyền hoặc đầu ra chắc chắn hiệu quả.</li>
          </ul>
        </article>
        <article>
          <h2>Bạn sẽ tự tạo</h2>
          <ul>
            <li>Bản mô tả quy trình, Hồ sơ bối cảnh và Hợp đồng đầu ra.</li>
            <li>Bản đồ quy trình, bộ hướng dẫn phân vai người–AI và Nhật ký chạy thử.</li>
            <li>Bộ quy trình hoàn chỉnh cùng Bản thiết kế chuyển giao.</li>
          </ul>
        </article>
      </section>

      <section className={styles.fitSection}>
        <div>
          <h2>Phù hợp nếu</h2>
          <p>Bạn có một việc nội dung muốn làm lặp lại và sẵn sàng dùng hiểu biết, ghi chú hoặc tài liệu bạn đang có để tạo bản đầu tiên.</p>
        </div>
        <div>
          <h2>Chưa phù hợp nếu</h2>
          <p>Bạn chỉ muốn lấy một câu lệnh viết bài tức thì, hoặc muốn tự động hóa ngay trước khi hiểu công việc và điểm quyết định.</p>
        </div>
        <p className={styles.finalNote}>
          Tất cả bảy ngày đều mở. “7 ngày” là nhịp khuyến nghị, không phải lịch khóa bài.
        </p>
      </section>
    </div>
  )
}
