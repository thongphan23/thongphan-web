import type { Metadata } from 'next'
import Link from 'next/link'
import { Be_Vietnam_Pro, Inter, JetBrains_Mono, Lora } from 'next/font/google'
import '@/styles/globals.css'
import styles from './layout.module.css'
import ScrollAnimations from '@/components/ScrollAnimations'
import CinematicBoot from '@/components/CinematicBoot'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://thongphan.com'),
  title: 'Thông Phan — Biến kiến thức thành tài sản và dòng tiền',
  description: 'Thông Phan giúp người có chuyên môn biến kiến thức thành tài sản và tạo dòng tiền thứ 2 bằng AI, trong khi vẫn giữ an toàn công việc chính.',
  keywords: ['AI', 'chuyên môn', 'tài sản số', 'dòng tiền thứ 2', 'Brain2', 'Thông Phan', 'Conan School'],
  authors: [{ name: 'Thông Phan' }],
  openGraph: {
    siteName: 'Thông Phan',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@thongphan',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-theme="premium-garden">
      <body className={`${beVietnamPro.variable} ${inter.variable} ${jetBrainsMono.variable} ${lora.variable}`}>
        <CinematicBoot />
        <ScrollAnimations />
        <div className={styles.scrollProgress} data-scroll-progress aria-hidden="true" />
        <div className={styles.siteAtmosphere} aria-hidden="true">
          <span className={styles.siteGrid} />
          <span className={styles.siteGlow} />
          <span className={styles.siteScanline} />
        </div>

        <nav className={styles.navbar}>
          <div className={styles.navInner}>
            <Link href="/" className={styles.logo}><span className={styles.logoMark} aria-hidden="true" /> THÔNG PHAN</Link>
            <ul className={styles.navLinks}>
              <li><Link href="/diagnostic">Chẩn đoán AI</Link></li>
              <li><Link href="/blog">Bài viết</Link></li>
              <li><Link href="/library">Thư viện</Link></li>
              <li><Link href="/assets">Kho tài sản nhỏ</Link></li>
              <li><Link href="/challenges">21 ngày Brain2</Link></li>
              <li><Link href="/about">Về tui</Link></li>
              <li><Link href="/diagnostic" className={styles.navCta}>Tự chẩn đoán</Link></li>
            </ul>
          </div>
        </nav>

        <main className={styles.mainSurface}>{children}</main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogo}><span className={styles.logoMark} aria-hidden="true" /> THÔNG PHAN</Link>
              <p className={styles.footerTagline}>
                Giúp người có chuyên môn biến kiến thức thành tài sản và tạo dòng tiền thứ 2 bằng AI, trong khi vẫn giữ an toàn công việc chính.
              </p>
            </div>

            <div className={styles.footerCol}>
              <h4>Khám phá</h4>
              <Link href="/diagnostic">Tự chẩn đoán năng lực AI</Link>
              <Link href="/blog">Bài viết</Link>
              <Link href="/library">Thư viện sống</Link>
              <Link href="/assets">Kho tài sản nhỏ</Link>
              <Link href="/challenges">21 ngày Brain2</Link>
              <Link href="/chat">Hỏi Brain2</Link>
              <Link href="/about">Về tui</Link>
            </div>

            <div className={styles.footerCol}>
              <h4>Hệ sinh thái</h4>
              <a href="https://com.conan.school" target="_blank" rel="noopener">Conan</a>
              <a href="https://conan.school" target="_blank" rel="noopener">Conan School</a>
            </div>

            <div className={styles.footerCol}>
              <h4>Kết nối</h4>
              <a href="https://facebook.com/thongphan23" target="_blank" rel="noopener">Facebook</a>
              <a href="https://linkedin.com/in/thongphan" target="_blank" rel="noopener">LinkedIn</a>
              <a href="https://m.me/thongphan.88" target="_blank" rel="noopener">Messenger</a>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© 2026 Thông Phan. Kiến thức không tự tạo tiền. Hệ thống mới tạo tiền.</span>
            <span>Đồng sáng lập & giám đốc marketing (CMO) · <a href="https://conan.school" target="_blank" rel="noopener">Conan School</a></span>
          </div>
        </footer>
      </body>
    </html>
  )
}
