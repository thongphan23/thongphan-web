import type { Metadata } from 'next'
import Image from 'next/image'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import ExperienceCard from '@/components/experience/ExperienceCard'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import { getPublishedExperiences } from '@/lib/experiences'
import { learnPublicEnabled } from '@/lib/learn-release'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Trải nghiệm — Thông Phan',
  description: 'Chọn một trải nghiệm có đầu ra rõ: tự chẩn đoán, thực hành Brain2 hoặc học nền tảng AI tương tác.',
  alternates: { canonical: '/experiences' },
}

export default function ExperiencesPage() {
  const availableExperiences = getPublishedExperiences({ includeLearn: learnPublicEnabled })

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <DossierHeader
              eyebrow="Trải nghiệm thật"
              folio="TP / EXPERIENCE INDEX / 01"
              title="Đừng chỉ đọc. Hãy tạo ra một thứ thuộc về bạn."
              description="Mỗi trải nghiệm ở đây cho bạn biết thời gian cần bỏ ra, đầu ra sẽ mang về và bước đi tiếp nếu thấy phù hợp."
            />
            <figure className={styles.heroPortrait}>
              <Image
                src="/images/homepage/thong-library-author.jpg"
                alt="Thông Phan bên những cuốn sách và tài liệu do mình tạo ra"
                width={960}
                height={960}
                priority
              />
              <figcaption>Đọc để nhìn rõ · Làm để có bằng chứng</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.index} aria-labelledby="experience-index-title">
        <div className="container">
          <header className={styles.indexHeader}>
            <span>Chọn theo đầu ra</span>
            <h2 id="experience-index-title">Bắt đầu bằng việc bạn muốn mang về.</h2>
            <p>Chỉ những trải nghiệm đang hoạt động và có nội dung thật mới xuất hiện ở đây.</p>
          </header>
          <div className={styles.list}>
            {availableExperiences.map((experience, index) => (
              <ExperienceCard key={experience.id} experience={experience} index={index} />
            ))}
          </div>
        </div>
      </section>

      <ChapterHandoff journeyKey="experiences" tone="dark" />
    </div>
  )
}
