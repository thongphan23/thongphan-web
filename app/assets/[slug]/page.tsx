import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CATEGORY_LABELS,
  formatVnd,
  getAllMicroAssets,
  getMicroAssetBySlug,
} from '@/lib/micro-assets'
import styles from './page.module.css'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllMicroAssets().map((asset) => ({ slug: asset.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const asset = getMicroAssetBySlug(slug)

  if (!asset) {
    return {
      title: 'Không tìm thấy tài sản nhỏ | Thông Phan',
    }
  }

  return {
    title: `${asset.title} — ${formatVnd(asset.priceVnd)} | Thông Phan`,
    description: asset.subtitle,
    alternates: {
      canonical: `/assets/${asset.slug}`,
    },
    openGraph: {
      title: asset.title,
      description: asset.subtitle,
      url: `/assets/${asset.slug}`,
      type: 'website',
    },
  }
}

export default async function AssetDetailPage({ params }: Props) {
  const { slug } = await params
  const asset = getMicroAssetBySlug(slug)

  if (!asset) {
    notFound()
  }

  return (
    <div className={styles.assetDetailPage}>
      <div className="container">
        <Link href="/assets" className={styles.backLink}>← Về kho tài sản nhỏ</Link>

        <header className={styles.hero} data-reveal data-cinematic-mouse>
          <div className={styles.assetHud} aria-label="Trạng thái sản phẩm nhỏ">
            <span><b>MICRO ASSET</b> tự làm trong một buổi</span>
            <span><b>NO COURSE TRAP</b> không thay Conan</span>
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{CATEGORY_LABELS[asset.category]} · dưới 200k</span>
            <h1>{asset.title}</h1>
            <p>{asset.subtitle}</p>
            <div className={styles.outcomeBox}>
              <span>Output sau khi dùng</span>
              <strong>{asset.outcome}</strong>
            </div>
          </div>

          <aside className={styles.purchaseCard}>
            <div className={styles.purchaseBeacon} aria-hidden="true"><span /> <span /> <strong>TP</strong></div>
            <div>
              <span>Giá dự kiến</span>
              <strong>{formatVnd(asset.priceVnd)}</strong>
              <p>{asset.format} · khoảng {asset.estimatedTimeMinutes} phút để đi hết vòng đầu.</p>
            </div>
            <a href={asset.checkoutUrl} target="_blank" rel="noopener" className="btn-primary">
              {asset.checkoutLabel}
            </a>
            <small>
              MVP đang dùng Messenger/waitlist để xác thực nhu cầu trước khi bật thanh toán tự động.
            </small>
          </aside>
        </header>

        <section className={styles.gridSection} data-reveal>
          <article className={styles.panel}>
            <h2>Bên trong có gì?</h2>
            <ul>
              {asset.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Ranh giới với Conan Maker</h2>
            <p>{asset.conanBoundary}</p>
          </article>
        </section>

        {asset.professions.length > 0 && (
          <section className={styles.professionSection} data-reveal aria-labelledby="profession-title">
            <div className={styles.sectionHeader}>
              <span>Use case của nghề này</span>
              <h2 id="profession-title">Không bắt người mới học AI chung chung. Đi từ việc họ đang làm mỗi ngày.</h2>
            </div>
            <div className={styles.professionGrid}>
              {asset.professions.map((profession) => (
                <article key={profession.name} className={styles.professionCard}>
                  <div>
                    <h3>{profession.name}</h3>
                    <p>{profession.pain}</p>
                  </div>
                  <div>
                    <h4>Use case trong kit</h4>
                    <ul>
                      {profession.useCases.map((useCase) => (
                        <li key={useCase}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.workflowBox}>
                    <span>Workflow đầu tiên</span>
                    <strong>{profession.firstWorkflow}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={styles.fitSection} data-reveal>
          <article>
            <h2>Nên mua nếu...</h2>
            <ul>
              {asset.whoShouldBuy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h2>Không nên mua nếu...</h2>
            <ul>
              {asset.whoShouldNotBuy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className={styles.nextStep} data-reveal>
          <span>Nếu muốn đi sâu hơn</span>
          <h2>Kit nhỏ giúp anh em bắt đầu. Conan Maker giúp anh em biến nó thành hệ thống sống.</h2>
          <p>
            Khi cần feedback, cộng đồng, accountability và roadmap để biến chuyên môn thành tài sản số/dòng tiền,
            anh em đi sang Conan. Ở đây chỉ bán mảnh ghép tự làm.
          </p>
          <div>
            <a href="https://com.conan.school" target="_blank" rel="noopener" className="btn-outline">
              Tìm hiểu Conan Maker
            </a>
            <Link href="/diagnostic" className="btn-ghost">
              Làm diagnostic trước
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
