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
      <h2 id="source-disclosure-title">Đây là ghi chú tuyển đọc, không phải bản dịch toàn văn.</h2>
      <p>
        Thư viện tóm lược bối cảnh và gợi ý cách tiếp cận bài viết. Toàn bộ nội dung gốc vẫn
        thuộc về tác giả và đơn vị xuất bản; vì vậy phần đọc đầy đủ được mở tại nguồn.
      </p>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
        Rời thongphan.com để đọc bài gốc tại {source} (mở trong thẻ mới)
        <ExternalLink aria-hidden="true" size={18} strokeWidth={1.7} />
      </a>
    </aside>
  )
}
