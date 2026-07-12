import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DossierFolio } from '@/components/dossier/DossierFolio'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import { aboutProof } from '@/lib/about-proof'
import styles from './page.module.css'

const chapters = [
  { marker: '01', title: 'Từng làm rất nhiều mà nội dung vẫn không mở được cửa', body: 'Một quãng dài thử, sửa và flop buộc tui nhìn thẳng vào một điều: chăm chỉ không thể thay cho insight và hệ thống.' },
  { marker: '02', title: 'Thị trường thật đến trước công cụ AI', body: 'Content, marketing, F&B, đội ngũ và doanh thu thật cho tui nền để hiểu khách hàng, thông điệp và niềm tin trước khi nói về AI.' },
  { marker: '03', title: 'Từ phản hồi thị trường thành một hệ thống sống', body: 'Những bài được chia sẻ, những câu hỏi lặp lại và những ca thật trở thành nguyên liệu cho Brain2, nội dung và Conan.' },
]

export const metadata: Metadata = {
  title: 'Về Thông Phan: Vì sao tôi làm việc này',
  description: 'Tôi giúp người có chuyên môn biến kiến thức thật thành nội dung, tài sản số và dòng tiền thứ hai bằng AI và hệ thống thực hành.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <DossierHeader tone="dark" eyebrow="Hồ sơ nguồn gốc" folio="TP / ORIGIN / 01" title="Tui không dạy thêm công cụ. Tui giúp chuyên môn của bạn có hình hài." description="Nếu kinh nghiệm vẫn nằm trong đầu, người khác không thể thấy, tin hay dùng nó. Đây là lý do tui xây một con đường đi từ việc thật đến nội dung, tài sản và hệ thống AI.">
          <Link className={styles.inlineCta} href="/diagnostic" data-motion-action>Tự chẩn đoán trước <ArrowRight aria-hidden="true" size={18} /></Link>
        </DossierHeader>

        <DossierFolio tone="dark" index="01" label="Chân dung và nguyên tắc">
          <div className={styles.portraitGrid}>
            <figure className={styles.portrait} data-motion-surface>
              <Image src="/images/homepage/proof/thong-stage-3x2-v1.webp" width={1200} height={800} alt="Thông Phan chia sẻ trên sân khấu" priority />
              <Image className={styles.stamp} src="/images/homepage/evidence-cinema-stamp-v4.png" width={1024} height={1024} alt="" aria-hidden="true" />
              <figcaption>Thông Phan trên sân khấu. Ảnh gốc được lưu cùng hồ sơ bằng chứng.</figcaption>
            </figure>
            <blockquote>
              <p>“AI không thay chuyên môn của bạn. Nó khuếch đại thứ bạn đã biết cách đóng gói.”</p>
              <span>Nguyên tắc vận hành</span>
            </blockquote>
          </div>
        </DossierFolio>

        <DossierFolio tone="dark" index="02" label="Ba chương đã đi qua">
          <div className={styles.chapterGrid}>
            {chapters.map((chapter) => <article key={chapter.marker} data-motion-surface><span>{chapter.marker}</span><h2>{chapter.title}</h2><p>{chapter.body}</p></article>)}
          </div>
        </DossierFolio>

        <DossierFolio tone="dark" index="03" label="Sổ bằng chứng công khai">
          <div className={styles.proofIntro}><h2>Không cần tin một câu định vị. Hãy xem nguồn.</h2><p>Mỗi con số xuất hiện ở đây được nối về một note bằng chứng công khai. Chỉ những claim có nguồn mới được render.</p></div>
          <div className={styles.proofGrid}>
            {aboutProof.map((metric) => <article key={metric.value} data-motion-surface><strong>{metric.value}</strong><p>{metric.label}</p><Link href={metric.sourceHref} data-motion-action>Nguồn: {metric.sourceLabel}</Link></article>)}
          </div>
        </DossierFolio>

        <ChapterHandoff journeyKey="about" tone="dark" />
      </div>
    </div>
  )
}
