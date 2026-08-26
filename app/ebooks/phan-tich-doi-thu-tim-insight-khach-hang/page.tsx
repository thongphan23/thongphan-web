import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

const TITLE = 'Đừng soi đối thủ để bắt chước'
const DESCRIPTION =
  'Cách phân tích đối thủ và tìm thấu hiểu khách hàng để tạo nội dung chất lượng cao, chuyển đổi cao.'
const BASE_PATH = '/ebooks/phan-tich-doi-thu-tim-insight-khach-hang'
const COVER_PATH = '/images/ebooks/phan-tich-doi-thu-tim-insight-khach-hang-cover.jpg'

export const metadata: Metadata = {
  title: `${TITLE} — Ebook của Thông Phan`,
  description: DESCRIPTION,
  alternates: { canonical: BASE_PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'book',
    url: BASE_PATH,
    images: [{ url: COVER_PATH, width: 1200, height: 800, alt: `Bìa ebook ${TITLE}` }],
  },
}

export default function EbookPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="ebook-title">
        <div className={styles.coverWrap}>
          <Image
            className={styles.cover}
            src={COVER_PATH}
            width="1920"
            height="1280"
            alt="Lối đi đông người giữa các quầy hàng trong Chợ Bến Thành"
            priority
          />
          <span className={styles.coverLabel}>Ebook · Thông Phan</span>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>Đọc thị trường · Hiểu khách hàng</p>
          <h1 id="ebook-title">{TITLE}</h1>
          <p className={styles.subtitle}>Từ tín hiệu thị trường đến nội dung có phép thử.</p>
          <p className={styles.description}>{DESCRIPTION}</p>

          <dl className={styles.meta}>
            <div><dt>Tác giả</dt><dd>Thông Phan</dd></div>
            <div><dt>Độ dài</dt><dd>48 trang</dd></div>
            <div><dt>Nội dung</dt><dd>6 chương và phiếu thực hành</dd></div>
          </dl>

          <div className={styles.actions}>
            <a className={styles.primary} href="/ebook/phan-tich-doi-thu-tim-insight-khach-hang/read/">Đọc trực tuyến</a>
            <a
              className={styles.secondary}
              href="/downloads/ebook-phan-tich-doi-thu-tim-insight-khach-hang.pdf"
              download
            >
              Tải bản PDF
            </a>
          </div>
          <p className={styles.note}>Miễn phí · Không cần đăng ký · Có thể đọc trên điện thoại.</p>
          <Link className={styles.back} href="/library">← Trở lại thư viện</Link>
        </div>
      </section>

      <section className={styles.chapters} aria-labelledby="chapters-title">
        <header>
          <p>Trong ebook này</p>
          <h2 id="chapters-title">Sáu chuyển đổi từ quan sát đến hành động.</h2>
        </header>
        <ol>
          <li><span>01</span><strong>Đối thủ không phải đáp án</strong></li>
          <li><span>02</span><strong>Vẽ bản đồ cạnh tranh đúng</strong></li>
          <li><span>03</span><strong>Nghe nơi quyết định bị kẹt</strong></li>
          <li><span>04</span><strong>Biến tín hiệu thành thấu hiểu khách hàng</strong></li>
          <li><span>05</span><strong>Từ thấu hiểu sang nội dung chuyển đổi</strong></li>
          <li><span>06</span><strong>Đo, học và bỏ cái sai</strong></li>
        </ol>
      </section>
    </main>
  )
}
