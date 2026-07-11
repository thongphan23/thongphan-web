'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import defaultStyles from '@/app/layout.module.css'
import { isUnifiedRouteEnabled, routeModeForPath } from '@/lib/site-route-mode'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'
import styles from './SiteChrome.module.css'

function DefaultHeader() {
  return (
    <nav className={defaultStyles.navbar}>
      <div className={defaultStyles.navInner}>
        <Link href="/" className={defaultStyles.logo}><span className={defaultStyles.logoMark} aria-hidden="true" /> THÔNG PHAN</Link>
        <ul className={defaultStyles.navLinks}>
          <li><Link href="/diagnostic">Chẩn đoán AI</Link></li>
          <li><Link href="/blog">Bài viết</Link></li>
          <li><Link href="/library">Thư viện</Link></li>
          <li><Link href="/assets">Kho tài sản nhỏ</Link></li>
          <li><Link href="/challenges">21 ngày Brain2</Link></li>
          <li><Link href="/about">Về tui</Link></li>
          <li><Link href="/diagnostic" className={defaultStyles.navCta}>Tự chẩn đoán</Link></li>
        </ul>
      </div>
    </nav>
  )
}

function DefaultFooter() {
  return (
    <footer className={defaultStyles.footer}>
      <div className={defaultStyles.footerInner}>
        <div className={defaultStyles.footerBrand}>
          <Link href="/" className={defaultStyles.footerLogo}><span className={defaultStyles.logoMark} aria-hidden="true" /> THÔNG PHAN</Link>
          <p className={defaultStyles.footerTagline}>
            Nếu bạn có chuyên môn thật nhưng chưa được nhìn thấy đúng, hãy bắt đầu biến kinh nghiệm của mình thành nội dung, tài sản số và cơ hội xứng đáng.
          </p>
        </div>

        <div className={defaultStyles.footerCol}>
          <h4>Khám phá</h4>
          <Link href="/diagnostic">Làm bài chẩn đoán</Link>
          <Link href="/blog">Bài viết</Link>
          <Link href="/library">Thư viện sống</Link>
          <Link href="/assets">Kho tài sản nhỏ</Link>
          <Link href="/challenges">21 ngày Brain2</Link>
          <Link href="/chat">Hỏi thử Brain2</Link>
          <Link href="/about">Về tui</Link>
        </div>

        <div className={defaultStyles.footerCol}>
          <h4>Hệ sinh thái</h4>
          <a href="https://com.conan.school" target="_blank" rel="noopener">Conan</a>
          <a href="https://conan.school" target="_blank" rel="noopener">Conan School</a>
        </div>

        <div className={defaultStyles.footerCol}>
          <h4>Kết nối</h4>
          <a href="https://facebook.com/thongphan23" target="_blank" rel="noopener">Facebook</a>
          <a href="https://linkedin.com/in/thongphan" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://m.me/thongphan.88" target="_blank" rel="noopener">Messenger</a>
        </div>
      </div>

      <div className={defaultStyles.footerBottom}>
        <span>© 2026 Thông Phan. Chuyên môn không tự tạo cơ hội. Hệ thống mới giúp người khác nhìn thấy và tin bạn.</span>
        <span>Đồng sáng lập & giám đốc marketing (CMO) · <a href="https://conan.school" target="_blank" rel="noopener">Conan School</a></span>
      </div>
    </footer>
  )
}

type SiteChromeProps = {
  children: ReactNode
  legacyFontClassName: string
  pathnameOverride?: string
}

export default function SiteChrome({ children, legacyFontClassName, pathnameOverride }: SiteChromeProps) {
  const detectedPathname = usePathname()
  const pathname = pathnameOverride ?? detectedPathname
  const mode = routeModeForPath(pathname)
  const isUnified = isUnifiedRouteEnabled(pathname)

  return (
    <div
      className={`${styles.siteShell} ${isUnified ? '' : legacyFontClassName}`}
      data-route-mode={mode}
      data-site-shell={isUnified ? 'unified' : 'legacy'}
    >
      <div
        className={isUnified ? styles.cinemaProgress : defaultStyles.scrollProgress}
        data-scroll-progress
        aria-hidden="true"
      />
      {!isUnified ? (
        <div className={defaultStyles.siteAtmosphere} aria-hidden="true">
          <span className={defaultStyles.siteGrid} />
          <span className={defaultStyles.siteGlow} />
          <span className={defaultStyles.siteScanline} />
        </div>
      ) : null}
      {isUnified ? <SiteHeader mode={mode} pathname={pathname} /> : <DefaultHeader />}
      <main className={isUnified ? styles.cinemaMain : defaultStyles.mainSurface}>{children}</main>
      {isUnified ? <SiteFooter mode={mode} /> : <DefaultFooter />}
    </div>
  )
}
