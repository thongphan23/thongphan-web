import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.page} data-cinema-not-found>
      <section className={styles.frame} aria-labelledby="not-found-title">
        <div className={styles.slate} aria-hidden="true">
          <span>TP / LOST FRAME</span>
          <strong>404</strong>
          <span>TAKE NOT FOUND</span>
        </div>
        <div className={styles.copy}>
          <p>Cảnh này không có trong cuộn phim.</p>
          <h1 id="not-found-title">Đường dẫn đã đổi, hoặc trang chưa từng tồn tại.</h1>
          <span>Quay lại trang chủ để tiếp tục hành trình, hoặc mở thư viện nếu anh em đang tìm một bài để đọc.</span>
          <div className={styles.actions}>
            <Link href="/"><ArrowLeft aria-hidden="true" size={18} /> Về trang chủ</Link>
            <Link href="/library"><BookOpen aria-hidden="true" size={18} /> Mở thư viện</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
