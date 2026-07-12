import { ExternalLink } from 'lucide-react'
import styles from './Editorial.module.css'

type SourceDisclosureProps = {
  source: string
  sourceUrl: string
}

export default function SourceDisclosure({ source, sourceUrl }: SourceDisclosureProps) {
  return (
    <aside className={styles.sourceDisclosure} aria-labelledby="source-disclosure-title">
      <p className={styles.sectionIndex}>Nguồn và quyền đọc</p>
      <h2 id="source-disclosure-title">Bản dịch tuyển đọc luôn đi cùng nguồn gốc.</h2>
      <p>
        Thư viện thongphan.com giữ lại bản dịch đầy đủ để bạn đọc liền mạch, đồng thời đặt
        liên kết nguồn ngay tại đây để tác giả và đơn vị xuất bản luôn được nhận diện rõ ràng.
      </p>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
        Đối chiếu bài gốc tại {source} (mở trong thẻ mới)
        <ExternalLink aria-hidden="true" size={18} strokeWidth={1.7} />
      </a>
    </aside>
  )
}
