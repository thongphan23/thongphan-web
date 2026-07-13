'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { SiteRouteMode } from '@/lib/site-route-mode'
import MobileMenu from './MobileMenu'
import { homepageChapterNavigation, primaryNavigation } from './site-navigation'
import styles from './SiteChrome.module.css'

type SiteHeaderProps = {
  mode: SiteRouteMode
  pathname: string
}

export default function SiteHeader({ mode, pathname }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('story')
  const [scrolled, setScrolled] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const isHomepage = pathname === '/'
  const isLibrary = pathname.startsWith('/library')

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 24)
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!isHomepage) return

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-home-section]'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-18% 0px -68%', threshold: [0, 0.2, 0.55] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isHomepage])

  return (
    <header
      className={styles.cinemaHeader}
      data-route-mode={mode}
      data-header-scrolled={scrolled}
    >
      <div className={styles.cinemaHeaderInner}>
        <Link
          href={isLibrary ? '/library' : '/'}
          className={`${styles.cinemaWordmark} ${isLibrary ? styles.libraryWordmark : ''}`}
          aria-label={isLibrary ? 'Thư viện Thông Phan' : 'Thông Phan — Trang chủ'}
        >
          {isLibrary ? (
            <>
              <span>THƯ VIỆN</span>
              <strong>THÔNG PHAN</strong>
            </>
          ) : 'THÔNG PHAN'}
        </Link>

        <nav className={styles.desktopNav} aria-label="Điều hướng chính">
          <ul>
            {primaryNavigation.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={triggerRef}
          type="button"
          className={styles.menuTrigger}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          aria-label="Mở mục lục"
          onClick={() => setMenuOpen(true)}
        >
          <Menu aria-hidden="true" size={22} strokeWidth={1.7} />
          <span>Mục lục</span>
        </button>
      </div>

      {isHomepage ? (
        <nav className={styles.chapterNav} aria-label="Các chương trên trang chủ">
          {homepageChapterNavigation.map((link) => (
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
      ) : null}

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        showHomepageChapters={isHomepage}
        triggerRef={triggerRef}
      />
    </header>
  )
}
