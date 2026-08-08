import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ChallengeHubClient from '@/components/content-workflow/ChallengeHubClient'
import { CONTENT_WORKFLOW_DAYS } from '@/lib/content-workflow/content'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '7 ngày tự xây quy trình nội dung đầu tiên — Thông Phan',
  description: 'Trải nghiệm tự học miễn phí giúp người sáng lập biến bằng chứng khách hàng, nhiệm vụ nội dung và tiêu chuẩn của doanh nghiệp thành một quy trình có AI hỗ trợ, có thể dùng lại.',
  alternates: { canonical: '/challenge/content-workflow-7days' },
  openGraph: {
    title: '7 ngày tự xây quy trình nội dung đầu tiên',
    description: 'Mang một sản phẩm hoặc dịch vụ đang bán vào và tự tạo bộ khởi đầu quy trình nội dung ngay trên trình duyệt.',
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
            <h1>7 ngày tự xây quy trình nội dung đầu tiên</h1>
            <p>
              Mang một sản phẩm hoặc dịch vụ đang bán (offer) thật vào. Biến bằng chứng
              khách hàng (customer evidence), mục tiêu nội dung và tiêu chuẩn của doanh
              nghiệp thành một quy trình nội dung (Content Workflow) có trí tuệ nhân tạo (AI) hỗ trợ và có thể dùng lại.
            </p>
            <a className={styles.primaryAction} href="#readiness">Bắt đầu với một sản phẩm đang bán</a>
            <small>Miễn phí · Mở ngay · Không cần tài khoản · Dữ liệu chỉ lưu trên thiết bị này</small>
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
          <p>7 ngày · 8 sản phẩm · 1 bộ khởi đầu</p>
          <h2 id="output-map-title">Mỗi ngày khóa một quyết định của quy trình.</h2>
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
            <li>Một bộ câu lệnh chung cho mọi doanh nghiệp.</li>
            <li>Lời hứa lan truyền, tự động bán hàng hoặc nội dung chắc chắn hiệu quả.</li>
            <li>Một trang web dùng AI viết bài thay bạn.</li>
          </ul>
        </article>
        <article>
          <h2>Bạn sẽ tự tạo</h2>
          <ul>
            <li>Trọng tâm khách hàng, ngân hàng bằng chứng và nhiệm vụ nội dung của chính doanh nghiệp.</li>
            <li>Bản giao việc có thể dùng lại, câu lệnh quy trình và ba bản nháp đã tự đánh giá.</li>
            <li>Bản tóm tắt một trang cùng kế hoạch tiếp tục trong 14 ngày.</li>
          </ul>
        </article>
      </section>

      <section className={styles.fitSection}>
        <div>
          <h2>Phù hợp nếu</h2>
          <p>Bạn đang có doanh nghiệp hoặc dự án, một sản phẩm thật, bằng chứng khách hàng và quyền quyết định nội dung.</p>
        </div>
        <div>
          <h2>Chưa phù hợp nếu</h2>
          <p>Bạn chưa có sản phẩm để kiểm chứng hoặc muốn AI tự nghĩ khách hàng, luận điểm và tiêu chuẩn thay mình.</p>
        </div>
        <p className={styles.finalNote}>
          Tất cả bảy ngày đều mở. “7 ngày” là nhịp khuyến nghị, không phải lịch khóa bài.
        </p>
      </section>
    </div>
  )
}
