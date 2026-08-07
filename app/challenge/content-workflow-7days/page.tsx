import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ChallengeHubClient from '@/components/content-workflow/ChallengeHubClient'
import { CONTENT_WORKFLOW_DAYS } from '@/lib/content-workflow/content'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '7 ngày tự xây Content Workflow đầu tiên bằng AI — Thông Phan',
  description: 'Trải nghiệm tự học miễn phí giúp founder biến customer evidence, Content Job và tiêu chuẩn của business thành một workflow content AI có thể dùng lại.',
  alternates: { canonical: '/challenge/content-workflow-7days' },
  openGraph: {
    title: '7 ngày tự xây Content Workflow đầu tiên bằng AI',
    description: 'Mang một offer thật vào và tự tạo Content Workflow Starter Kit v1.0 ngay trên trình duyệt.',
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
            <h1>7 ngày tự xây Content Workflow đầu tiên bằng AI</h1>
            <p>
              Mang một offer thật vào. Biến customer evidence, mục tiêu content và
              tiêu chuẩn của business thành một workflow AI đơn giản có thể dùng lại.
            </p>
            <a className={styles.primaryAction} href="#readiness">Bắt đầu với một offer</a>
            <small>Miễn phí · Mở ngay · Không cần tài khoản · Dữ liệu chỉ lưu trên thiết bị này</small>
          </div>
          <figure className={styles.heroAsset}>
            <Image
              src="/images/challenges/content-workflow-7days-fieldbook.webp"
              alt="Chồng hồ sơ Content Workflow buộc bằng sợi chỉ đỏ"
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
          <p>7 ngày · 8 artifact · 1 Starter Kit</p>
          <h2 id="output-map-title">Mỗi ngày khóa một quyết định của workflow.</h2>
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
          <h2>Anh sẽ không nhận</h2>
          <ul>
            <li>Một bộ prompt chung cho mọi business.</li>
            <li>Lời hứa viral, tự động bán hàng hoặc content đạt chuẩn thị trường.</li>
            <li>Một website AI viết bài thay anh.</li>
          </ul>
        </article>
        <article>
          <h2>Anh sẽ tự tạo</h2>
          <ul>
            <li>Customer Focus, Evidence Bank và Content Job của chính business.</li>
            <li>Reusable Brief, Workflow Prompt và ba draft đã tự review.</li>
            <li>One-Pager cùng kế hoạch tiếp tục trong 14 ngày.</li>
          </ul>
        </article>
      </section>

      <section className={styles.fitSection}>
        <div>
          <h2>Phù hợp nếu</h2>
          <p>Anh đang có business, một offer thật, customer evidence và quyền quyết định content.</p>
        </div>
        <div>
          <h2>Chưa phù hợp nếu</h2>
          <p>Anh chưa có offer hoặc muốn AI tự nghĩ customer, claim và tiêu chuẩn thay mình.</p>
        </div>
        <p className={styles.finalNote}>
          Tất cả bảy ngày đều mở. “7 ngày” là nhịp khuyến nghị, không phải lịch khóa bài.
        </p>
      </section>
    </div>
  )
}
