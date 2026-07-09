'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import defaultStyles from '@/app/layout.module.css'
import styles from './SiteChrome.module.css'

const cinemaLinks = [
  { href: '#story', label: 'Câu chuyện', section: 'story' },
  { href: '#proof', label: 'Bằng chứng', section: 'proof' },
  { href: '#method', label: 'Phương pháp', section: 'method' },
  { href: '/conanmaker', label: 'Conan Maker', section: 'conanmaker' },
] as const

function CinemaHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('story')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => {
    setMenuOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-home-section]'))
    if (!sections.length) return

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target.id) setActiveSection(visible.target.id)
    }, { rootMargin: '-18% 0px -68%', threshold: [0, 0.2, 0.55] })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
    requestAnimationFrame(() => focusable[0]?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }

      if (event.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className={styles.cinemaHeader}>
      <div className={styles.cinemaHeaderInner}>
        <Link href="/" className={styles.cinemaWordmark} aria-label="Thông Phan — Trang chủ">
          THÔNG PHAN
        </Link>

        <nav className={styles.desktopNav} aria-label="Mục lục trang chủ">
          {cinemaLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={activeSection === link.section ? styles.activeLink : undefined}
              aria-current={activeSection === link.section ? 'location' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          ref={triggerRef}
          type="button"
          className={styles.menuTrigger}
          aria-expanded={menuOpen}
          aria-controls="cinema-menu"
          onClick={() => setMenuOpen(true)}
        >
          Mục lục
        </button>
      </div>

      {menuOpen ? (
        <div className={styles.menuBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMenu()
        }}>
          <div
            id="cinema-menu"
            ref={dialogRef}
            className={styles.menuDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Mục lục trang chủ"
          >
            <div className={styles.menuTopline}>
              <span>THÔNG PHAN</span>
              <button type="button" onClick={closeMenu}>Đóng</button>
            </div>
            <nav aria-label="Mục lục di động">
              {cinemaLinks.map((link, index) => (
                <Link key={link.href} href={link.href} onClick={closeMenu}>
                  <span>0{index + 1}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            <p>Chuyên môn thật. Bằng chứng thật. Một bước tiếp theo rõ ràng.</p>
          </div>
        </div>
      ) : null}
    </header>
  )
}

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

function CinemaFooter() {
  return (
    <footer className={styles.cinemaFooter}>
      <div>
        <p className={styles.footerName}>THÔNG PHAN</p>
        <p>Biến chuyên môn thật thành tài sản có người muốn dùng.</p>
      </div>
      <nav aria-label="Liên kết cuối trang">
        <Link href="/diagnostic">Chẩn đoán</Link>
        <Link href="/library">Thư viện</Link>
        <Link href="/conanmaker">Conan Maker</Link>
      </nav>
      <p className={styles.copyright}>© 2026 · Làm thật, trả giá thật, hệ thống thật.</p>
    </footer>
  )
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  return (
    <>
      <div
        className={isHomepage ? styles.cinemaProgress : defaultStyles.scrollProgress}
        data-scroll-progress
        aria-hidden="true"
      />
      {isHomepage ? null : (
        <div className={defaultStyles.siteAtmosphere} aria-hidden="true">
          <span className={defaultStyles.siteGrid} />
          <span className={defaultStyles.siteGlow} />
          <span className={defaultStyles.siteScanline} />
        </div>
      )}
      {isHomepage ? <CinemaHeader /> : <DefaultHeader />}
      <main className={isHomepage ? styles.cinemaMain : defaultStyles.mainSurface}>{children}</main>
      {isHomepage ? <CinemaFooter /> : <DefaultFooter />}
    </>
  )
}
