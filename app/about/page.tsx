import { ArrowDown } from 'lucide-react'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import OriginStory from '@/components/origin-story/OriginStory'
import JsonLd from '@/components/seo/JsonLd'
import { buildAboutPageStructuredData, createPageMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = createPageMetadata({
  title: 'Về Thông Phan: người dẫn đường đã đi sai đủ nhiều',
  description: 'Năm hồi về khác biệt, sự chú ý, cái giá phải trả, cách học lại và hệ thống đang chạy, rồi vì sao Thông chia làm hai con đường cho người đi làm và người kinh doanh.',
  pathname: '/about',
  image: '/images/homepage/proof/thong-stage-3x2-v1.webp',
})

export default function AboutPage() {
  return (
    <div className={styles.page} data-motion-stage>
      <div className={styles.shell}>
        <DossierHeader
          tone="dark"
          eyebrow="Hồ sơ nguồn gốc"
          folio="TP / ORIGIN / 01"
          title="Tui là người dẫn đường, vì tui đã đi sai đủ nhiều."
          description="Không phải một bản thành tích. Đây là năm hồi được kể bằng nguồn báo chí, lời kể cá nhân, hình ảnh có quyền sử dụng và những hệ thống đang chạy."
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
