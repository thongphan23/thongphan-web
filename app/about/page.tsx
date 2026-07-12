import { ArrowDown } from 'lucide-react'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import OriginStory from '@/components/origin-story/OriginStory'
import JsonLd from '@/components/seo/JsonLd'
import { buildAboutPageStructuredData, createPageMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = createPageMetadata({
  title: 'Câu chuyện của Thông Phan: những gì tạo nên cách tui làm việc',
  description: 'Năm hồi về khác biệt, sự chú ý, cái giá phải trả, cách học lại và hệ thống Brain2 được xây từ những bài học đó.',
  pathname: '/about',
  image: '/images/homepage/proof/thong-stage-3x2-v1.webp',
})

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <DossierHeader
          tone="dark"
          eyebrow="Hồ sơ nguồn gốc"
          folio="TP / ORIGIN / 01"
          title="Đây là những gì đã tạo nên cách tui làm việc hôm nay."
          description="Không phải một bản thành tích. Đây là năm hồi được kể bằng nguồn báo chí, lời kể cá nhân, hình ảnh có quyền sử dụng và những hệ thống đang vận hành."
        >
          <a className={styles.inlineCta} href="#origin-story" data-motion-action>
            Bắt đầu câu chuyện <ArrowDown aria-hidden="true" size={18} />
          </a>
        </DossierHeader>

        <OriginStory />
        <JsonLd data={buildAboutPageStructuredData()} />
      </div>
    </div>
  )
}
