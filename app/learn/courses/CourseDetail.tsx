import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Clock3, FileCheck2, LockKeyhole } from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import { buildCourseStructuredData, buildLearnAppUrl, type LearnCourse } from '@/lib/learn-catalog'
import styles from './course.module.css'

export default function CourseDetail({ course }: { course: LearnCourse }) {
  const startUrl = buildLearnAppUrl({ source: 'public-course', course: course.slug })

  return (
    <div className={styles.page}>
      <JsonLd data={buildCourseStructuredData(course)} />

      <header className={styles.hero}>
        <Image src={course.image} alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <Link href="/learn" className={styles.back}>THÔNG PHAN LEARN / LỘ TRÌNH AI NỀN TẢNG</Link>
          <span>{course.eyebrow}</span>
          <h1>{course.title}</h1>
          <p>{course.promise}</p>
          <dl>
            <div><dt><Clock3 aria-hidden="true" /> Nhịp học</dt><dd>{course.duration}</dd></div>
            <div><dt><FileCheck2 aria-hidden="true" /> Tác phẩm</dt><dd>{course.artifact}</dd></div>
          </dl>
          <div className={styles.heroActions}>
            {course.access === 'free' ? (
              <a href={startUrl} className={styles.primaryAction}>Bắt đầu miễn phí <ArrowRight aria-hidden="true" size={18} /></a>
            ) : (
              <span className={styles.lockedAction} aria-disabled="true"><LockKeyhole aria-hidden="true" size={17} /> Sắp mở sau AI Foundation</span>
            )}
            <Link href="/learn/diagnostic">Chẩn đoán điểm bắt đầu</Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.outcomeBand} data-reveal aria-labelledby="outcome-title">
          <div>
            <span>Kết quả sau khóa</span>
            <h2 id="outcome-title">Không chỉ “biết thêm”. Bạn phải làm được.</h2>
            <p>{course.description}</p>
          </div>
          <ul>
            {course.outcomes.map((outcome) => <li key={outcome}><Check aria-hidden="true" size={18} />{outcome}</li>)}
          </ul>
        </section>

        <section className={styles.syllabusBand} data-reveal aria-labelledby="syllabus-title">
          <div className={styles.sectionHead}>
            <span>Cấu trúc chương trình</span>
            <h2 id="syllabus-title">Mỗi chặng đi từ hiểu, thử, kiểm tra đến đầu ra.</h2>
          </div>
          <ol>
            {course.syllabus.map((item, index) => (
              <li key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{item.title}</h3><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.boundaryBand} data-reveal>
          <div><span>Quyền học</span><h2>{course.priceLabel}</h2></div>
          <div>
            <p>
              AI Foundation miễn phí toàn bộ. Khóa trả phí chỉ mở nội dung mới;
              không mua mastery, Dấu Chân, vật phẩm hoặc lợi thế bảng xếp hạng.
            </p>
            {course.access === 'free' ? (
              <a href={startUrl}>Vào học ngay <ArrowRight aria-hidden="true" size={18} /></a>
            ) : (
              <Link href="/learn/free">Hoàn thành khóa nền trước <ArrowRight aria-hidden="true" size={18} /></Link>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
