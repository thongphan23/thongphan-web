import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, MousePointer2 } from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import { buildCourseStructuredData, buildLearnAppUrl, learnCourses } from '@/lib/learn-catalog'
import { learnPublicEnabled } from '@/lib/learn-release'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Học AI tương tác cho công việc | Thông Phan Learn',
  description: 'Mỗi ngày 15 phút, học AI bằng tình huống và thao tác để tạo năng lực áp dụng được trong công việc. AI Foundation miễn phí toàn bộ.',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'Học AI để làm việc tốt hơn',
    description: '14 màn tương tác mỗi bài. Không phải kho video. Bắt đầu AI Foundation miễn phí.',
    url: '/learn',
    type: 'website',
    images: ['/images/learn/learn-app-today.png'],
  },
}

const freeStartUrl = buildLearnAppUrl({ source: 'thongphan-learn', course: 'ai-foundation' })

export default function LearnPage() {
  if (!learnPublicEnabled) notFound()

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: learnCourses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: buildCourseStructuredData(course),
    })),
  }

  return (
    <div className={styles.page}>
      <JsonLd data={itemList} />

      <section className={styles.hero} aria-labelledby="learn-title">
        <Image
          className={styles.heroImage}
          src="/images/learn/cat-home-island.jpg"
          alt="Mây, mèo đồng hành bên bản đồ AI Foundation"
          fill
          priority
          sizes="100vw"
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>THÔNG PHAN LEARN · AI CHO CÔNG VIỆC</span>
          <h1 id="learn-title">Học AI để làm việc tốt hơn.</h1>
          <p>
            Không phải kho video. Mỗi bài là 14 màn tương tác, một quyết định mỗi màn,
            phản hồi ngay và một đầu ra có thể mang về công việc.
          </p>
          <div className={styles.heroActions}>
            <a href={freeStartUrl} className={styles.primaryCta}>
              Học AI Foundation miễn phí <ArrowRight aria-hidden="true" size={19} />
            </a>
            <Link href="/learn/diagnostic" className={styles.secondaryCta}>
              Chẩn đoán 90 giây
            </Link>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Nhịp học</dt><dd>15 phút/ngày</dd></div>
            <div><dt>Bài học</dt><dd>12-15 màn</dd></div>
            <div><dt>Điểm đầu</dt><dd>Miễn phí toàn bộ</dd></div>
          </dl>
          <span className={styles.domainSignal}>Ứng dụng học: learn.thongphan.com</span>
        </div>
      </section>

      <section className={styles.productBand} data-reveal aria-labelledby="product-title">
        <div className={styles.productInner}>
          <figure className={styles.productVisual}>
            <Image
              src="/images/learn/learn-app-today.png"
              width={390}
              height={844}
              alt="Màn Hôm nay của ứng dụng học learn.thongphan.com"
              sizes="(max-width: 760px) 70vw, 390px"
            />
            <figcaption>Giao diện thật của bản MVP · Cat World ở ngoài, tập trung ở trong bài học.</figcaption>
          </figure>
          <div className={styles.productCopy}>
            <span>Không học bằng cách ngồi xem</span>
            <h2 id="product-title">Bạn phải chọn, ghép, điền, sắp xếp và tự kiểm tra.</h2>
            <p>
              Mỗi màn chỉ giữ những gì cần cho quyết định hiện tại. Khi trả lời sai,
              đầu vào không biến mất; gợi ý tăng dần để người học tự sửa trước khi xem lý do.
            </p>
            <ul>
              <li><MousePointer2 aria-hidden="true" /> Một màn hình, một hành động chính.</li>
              <li><CheckCircle2 aria-hidden="true" /> Phản hồi dạy cách nghĩ, không chỉ báo đúng sai.</li>
              <li><Clock3 aria-hidden="true" /> Phiên học ngắn, có thể dừng và tiếp tục.</li>
            </ul>
            <Link href="/learn/free">Xem đầy đủ AI Foundation <ArrowRight aria-hidden="true" size={17} /></Link>
          </div>
        </div>
      </section>

      <section className={styles.methodBand} data-reveal aria-labelledby="method-title">
        <div className={styles.sectionHead}>
          <span>Cách hệ thống vận hành</span>
          <h2 id="method-title">Game giữ nhịp. Bằng chứng học tập quyết định năng lực.</h2>
        </div>
        <ol className={styles.methodList}>
          <li><span>01</span><h3>Chạm vào vấn đề trước</h3><p>Bắt đầu bằng tình huống công việc thay vì một bài giảng dài.</p></li>
          <li><span>02</span><h3>Nhận phản hồi ngay</h3><p>Thấy vì sao một lựa chọn yếu và thử lại mà không mất dữ liệu.</p></li>
          <li><span>03</span><h3>Chứng minh ở tình huống mới</h3><p>Độ thuần thục chỉ tăng khi có evidence độc lập và chuyển giao.</p></li>
          <li><span>04</span><h3>Mang về một Tác phẩm</h3><p>Khóa học kết thúc bằng prompt, rubric hoặc workflow có thể dùng thật.</p></li>
        </ol>
      </section>

      <section className={styles.catalogBand} data-reveal aria-labelledby="catalog-title">
        <div className={styles.sectionHead}>
          <span>Lộ trình AI nền tảng</span>
          <h2 id="catalog-title">Bắt đầu miễn phí. Chỉ mở khóa học mới khi nền đã đủ.</h2>
          <p>Tiền mở nội dung; không mua Độ thuần thục, Dấu Chân hay lợi thế xếp hạng.</p>
        </div>
        <div className={styles.catalogGrid}>
          {learnCourses.map((course, index) => (
            <article className={styles.courseCard} key={course.slug}>
              <div className={styles.courseVisual}>
                <Image src={course.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className={styles.courseBody}>
                <small>{course.eyebrow}</small>
                <h3>{course.title}</h3>
                <p>{course.promise}</p>
                <dl><div><dt>Thời lượng</dt><dd>{course.duration}</dd></div><div><dt>Tác phẩm</dt><dd>{course.artifact}</dd></div></dl>
                <Link href={`/learn/courses/${course.slug}`}>
                  {course.access === 'free' ? 'Xem khóa miễn phí' : 'Xem chương trình'}
                  {course.access === 'free' ? <ArrowRight aria-hidden="true" size={17} /> : <LockKeyhole aria-hidden="true" size={16} />}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.proofBand} data-reveal aria-labelledby="proof-title">
        <div>
          <span>Bằng chứng nằm trong thiết kế</span>
          <h2 id="proof-title">Không dùng streak để che một hệ thống học yếu.</h2>
        </div>
        <dl>
          <div><dt>14</dt><dd>màn tương tác trong bài mẫu đang chạy</dd></div>
          <div><dt>5</dt><dd>Đặc tính mèo chiếu từ mastery thật</dd></div>
          <div><dt>0</dt><dd>hearts, loot box hoặc mua lợi thế</dd></div>
        </dl>
      </section>

      <section className={styles.closing} data-reveal>
        <Image src="/images/learn/cat-celebration-major.jpg" alt="Mây nâng cúp sau một mốc học tập" width={720} height={720} />
        <div>
          <span>Bắt đầu từ việc thật</span>
          <h2>Chưa biết mình nên vào bài nào?</h2>
          <p>Tám tình huống, khoảng 90 giây, không cần để lại email.</p>
          <div>
            <Link href="/learn/diagnostic" className={styles.primaryCta}>Làm chẩn đoán <ArrowRight aria-hidden="true" size={18} /></Link>
            <a href={freeStartUrl} className={styles.secondaryCta}>Vào học miễn phí</a>
          </div>
        </div>
      </section>
    </div>
  )
}
