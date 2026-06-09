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
  title: 'Kho tài sản nhỏ — AI Starter cho người đi làm | Thông Phan',
  description:
    'Các bộ công cụ nhỏ dưới 200k giúp người đi làm, giáo viên, marketer, sales và quản lý bắt đầu dùng AI đúng cách theo nghề.',
  alternates: {
    canonical: '/assets',
  },
  openGraph: {
    title: 'Kho tài sản nhỏ của Thông Phan',
    description:
      'Micro assets dưới 200k: AI starter kit theo nghề, workbook, prompt pack và canvas để bắt đầu biến kiến thức thành tài sản.',
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
            <span><b>ASSET OS</b> Micro Store</span>
            <span><b>PRICE CAP</b> dưới 200k</span>
            <span><b>MODE</b> chọn theo nghề</span>
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Kho tài sản nhỏ · dưới 200k</span>
            <h1>Bắt đầu dùng AI theo nghề, không học tool lan man.</h1>
            <p>
              Mỗi nghề có một bộ riêng: workbook, video ngắn, prompt pack và checklist kiểm
              chứng output. Anh em chọn đúng công việc mình đang làm, làm ra một output nhỏ,
              rồi mới quyết định có cần đi sâu hơn với Conan Maker không.
            </p>
            <div className={styles.heroActions}>
              <Link href={`/assets/${featured.slug}`} className="btn-primary">
                Xem sản phẩm đầu tiên
              </Link>
              <Link href="/diagnostic" className="btn-outline">
                Làm diagnostic trước
              </Link>
            </div>
            <GardenSignature variant="fruit" eyebrow="Asset như quả chín" title="Mỗi sản phẩm là một quả nhỏ hái được từ hệ tri thức, không phải template bán lẻ." compact />
          </div>

          <aside className={styles.featuredCard} aria-label="Sản phẩm nổi bật">
            <div className={styles.assetRadar} aria-hidden="true">
              <span />
              <span />
              <span />
              <strong>{starterAssets.length}</strong>
            </div>
            <span className={styles.badge}>Đang ưu tiên build</span>
            <h2>{featured.title}</h2>
            <p>{featured.subtitle}</p>
            <div className={styles.priceRow}>
              <strong>{formatVnd(featured.priceVnd)}</strong>
              <span>{featured.format}</span>
            </div>
            <ul>
              <li>{starterAssets.length} sản phẩm AI Starter tách riêng theo nghề</li>
              <li>{featured.estimatedTimeMinutes} phút để đi hết vòng đầu</li>
              <li>Có video ngắn + workbook + prompt pack</li>
            </ul>
            <Link href={`/assets/${featured.slug}`}>Mở chi tiết →</Link>
          </aside>
        </header>

        <section className={styles.boundary} data-reveal aria-labelledby="boundary-title">
          <div>
            <span>Ranh giới rõ</span>
            <h2 id="boundary-title">thongphan.com bán mảnh ghép nhỏ. Conan Maker giữ phần chuyển hóa sâu.</h2>
          </div>
          <div className={styles.boundaryGrid}>
            <article>
              <h3>Ở đây anh em mua</h3>
              <p>Kit, checklist, workbook, prompt pack, canvas. Dùng ngay cho một output nhỏ trong công việc.</p>
            </article>
            <article>
              <h3>Ở Conan anh em làm sâu</h3>
              <p>Cộng đồng, feedback, accountability, roadmap 21-90 ngày và hệ thống biến chuyên môn thành dòng tiền.</p>
            </article>
          </div>
        </section>

        <section className={styles.professionStrip} data-reveal aria-labelledby="profession-title">
          <div className={styles.sectionHeader}>
            <span>Use case theo nghề</span>
            <h2 id="profession-title">5 nghề tách thành 5 sản phẩm riêng, để người mua chọn đúng tình huống của họ.</h2>
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
            <span>Catalog MVP</span>
            <h2 id="catalog-title">Nhỏ, rõ, dưới 200k — không phải khóa học thay Conan.</h2>
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
