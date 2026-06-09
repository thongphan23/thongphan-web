import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CATEGORY_LABELS,
  formatVnd,
  getAiStarterAssets,
  getAllMicroAssets,
  getFeaturedMicroAsset,
} from '@/lib/micro-assets'
import { GardenSignature } from '@/components/GardenSignature'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Kho tài sản nhỏ — Bắt đầu dùng AI theo đúng việc của bạn | Thông Phan',
  description:
    'Các bộ công cụ nhỏ giúp bạn dùng AI vào đúng công việc trước mắt: email, bài dạy, nội dung, tư vấn, quản lý và đóng gói chuyên môn.',
  alternates: {
    canonical: '/assets',
  },
  openGraph: {
    title: 'Kho tài sản nhỏ để bạn bắt đầu làm thật',
    description:
      'Workbook, prompt pack và canvas nhỏ để bạn tạo một đầu ra thật trước khi học sâu hơn.',
    url: '/assets',
    type: 'website',
  },
}

export default function AssetsPage() {
  const assets = getAllMicroAssets()
  const featured = getFeaturedMicroAsset()
  const starterAssets = getAiStarterAssets()

  return (
    <div className={styles.assetsPage}>
      <div className="container">
        <header className={styles.hero} data-reveal data-cinematic-mouse>
          <div className={styles.marketHud} aria-label="Trạng thái kho tài sản nhỏ">
            <span><b>BỘ NHỎ</b> Bắt đầu nhỏ</span>
            <span><b>GIÁ</b> dưới 200k</span>
            <span><b>CÁCH CHỌN</b> đúng việc đang làm</span>
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Kho tài sản nhỏ · dưới 200k</span>
            <h1>Đừng học thêm công cụ nữa. Hãy dùng AI vào đúng việc bạn đang làm.</h1>
            <p>
              Mỗi bộ được thiết kế cho một tình huống cụ thể: soạn email, chuẩn bị bài dạy, viết nội dung, theo dõi sau tư vấn, giao việc cho đội nhóm. Bạn làm ra một đầu ra nhỏ trước, rồi mới quyết định có cần đi sâu hơn không.
            </p>
            <div className={styles.heroActions}>
              <Link href={`/assets/${featured.slug}`} className="btn-primary">
                Xem bộ đầu tiên
              </Link>
              <Link href="/diagnostic" className="btn-outline">
                Chẩn đoán trước
              </Link>
            </div>
            <GardenSignature variant="fruit" eyebrow="Tài sản nhỏ, dùng được ngay" title="Mỗi bộ nhỏ phải giúp bạn làm được một việc thật, không phải tải thêm một đống template để đó." compact />
          </div>

          <aside className={styles.featuredCard} aria-label="Sản phẩm nổi bật">
            <div className={styles.assetRadar} aria-hidden="true">
              <span />
              <span />
              <span />
              <strong>{starterAssets.length}</strong>
            </div>
            <span className={styles.badge}>Đang hoàn thiện</span>
            <h2>{featured.title}</h2>
            <p>{featured.subtitle}</p>
            <div className={styles.priceRow}>
              <strong>{formatVnd(featured.priceVnd)}</strong>
              <span>{featured.format}</span>
            </div>
            <ul>
              <li>{starterAssets.length} bộ AI cho công việc theo từng việc cụ thể</li>
              <li>{featured.estimatedTimeMinutes} phút để làm xong vòng đầu</li>
              <li>Có video ngắn, workbook và prompt pack</li>
            </ul>
            <Link href={`/assets/${featured.slug}`}>Xem chi tiết →</Link>
          </aside>
        </header>

        <section className={styles.boundary} data-reveal aria-labelledby="boundary-title">
          <div>
            <span>Ranh giới rõ</span>
            <h2 id="boundary-title">Ở đây bạn lấy mảnh ghép nhỏ để làm ngay. Conan Maker dành cho phần thực hành sâu hơn.</h2>
          </div>
          <div className={styles.boundaryGrid}>
            <article>
              <h3>Ở đây bạn lấy</h3>
              <p>Kit, checklist, workbook, prompt pack, canvas — đủ nhỏ để dùng ngay cho một đầu ra trong công việc.</p>
            </article>
            <article>
              <h3>Ở Conan bạn làm sâu hơn</h3>
              <p>Cộng đồng, phản hồi, trách nhiệm thực hành, roadmap 21-90 ngày và hệ thống biến chuyên môn thành dòng tiền.</p>
            </article>
          </div>
        </section>

        <section className={styles.professionStrip} data-reveal aria-labelledby="profession-title">
          <div className={styles.sectionHeader}>
            <span>Tình huống theo nghề</span>
            <h2 id="profession-title">Chọn đúng tình huống của bạn trước. Đừng học một bộ AI chung chung cho mọi nghề.</h2>
          </div>
          <div className={styles.professionGrid}>
            {starterAssets.map((asset) => {
              const profession = asset.professions[0]

              return (
                <Link href={`/assets/${asset.slug}`} key={asset.slug} className={styles.professionCard}>
                  <h3>{profession.name}</h3>
                  <p>{profession.pain}</p>
                  <small>{profession.firstWorkflow}</small>
                </Link>
              )
            })}
          </div>
        </section>

        <section className={styles.catalog} data-reveal aria-labelledby="catalog-title">
          <div className={styles.sectionHeader}>
            <span>Các bộ đang làm</span>
            <h2 id="catalog-title">Nhỏ, rõ, làm được ngay — không phải khóa học dài trá hình.</h2>
          </div>
          <div className={styles.catalogGrid}>
            {assets.map((asset) => (
              <Link href={`/assets/${asset.slug}`} className={styles.assetCard} key={asset.slug}>
                <div className={styles.cardTopline}>
                  <span>{CATEGORY_LABELS[asset.category]}</span>
                  <small>{asset.status === 'available-soon' ? 'Sắp mở' : 'Đang lên'}</small>
                </div>
                <h3>{asset.title}</h3>
                <p>{asset.subtitle}</p>
                <div className={styles.cardMeta}>
                  <strong>{formatVnd(asset.priceVnd)}</strong>
                  <span>{asset.estimatedTimeMinutes} phút</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
