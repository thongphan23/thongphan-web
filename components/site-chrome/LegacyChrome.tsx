'use client'

import Link from 'next/link'
import defaultStyles from '@/app/layout.module.css'

// The old shell for the legacy routes (/classic, /concept). SiteChrome loads this module with
// next/dynamic, so its stylesheet ships only on the pages that render it.

export function LegacyBackdrop() {
  return (
    <>
      <div className={defaultStyles.scrollProgress} data-scroll-progress aria-hidden="true" />
      <div className={defaultStyles.siteAtmosphere} aria-hidden="true">
        <span className={defaultStyles.siteGrid} />
        <span className={defaultStyles.siteGlow} />
        <span className={defaultStyles.siteScanline} />
      </div>
    </>
  )
}

export function DefaultHeader() {
  return (
    <nav className={defaultStyles.navbar}>
      <div className={defaultStyles.navInner}>
        <Link href="/" className={defaultStyles.logo}><span className={defaultStyles.logoMark} aria-hidden="true" /> THÔNG PHAN</Link>
        <ul className={defaultStyles.navLinks}>
          <li><Link href="/diagnostic">Chẩn đoán AI</Link></li>
          <li><Link href="/blog">Bài viết</Link></li>
          <li><Link href="/library">Thư viện</Link></li>
          <li><Link href="/assets">Kho tài sản nhỏ</Link></li>
          <li><Link href="/brain2/21-ngay">21 ngày Brain2</Link></li>
          <li><Link href="/about">Về tui</Link></li>
          <li><Link href="/diagnostic" className={defaultStyles.navCta}>Tự chẩn đoán</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export function DefaultFooter() {
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
          <Link href="/brain2/21-ngay">21 ngày Brain2</Link>
          <Link href="/chat">Bàn hỏi</Link>
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
