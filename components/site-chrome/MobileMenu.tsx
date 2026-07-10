'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { homepageChapterNavigation, primaryNavigation } from './site-navigation'
import styles from './SiteChrome.module.css'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
  showHomepageChapters: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
}

export default function MobileMenu({
  open,
  onClose,
  showHomepageChapters,
  triggerRef,
}: MobileMenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => {
    onClose()
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [onClose, triggerRef])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const focusable = Array.from(
      dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
    )
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

      if (!dialog?.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
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
  }, [closeMenu, open])

  if (!open) return null

  return (
    <div
      className={styles.menuBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeMenu()
      }}
    >
      <div
        id="site-mobile-menu"
        ref={dialogRef}
        className={styles.menuDialog}
        role="dialog"
        aria-modal="true"
        aria-label="Điều hướng trang web"
      >
        <div className={styles.menuTopline}>
          <span>THÔNG PHAN</span>
          <button type="button" className={styles.menuClose} onClick={closeMenu} aria-label="Đóng menu">
            <X aria-hidden="true" size={22} strokeWidth={1.7} />
          </button>
        </div>

        <nav className={styles.mobileNav} aria-label="Điều hướng chính trên di động">
          {primaryNavigation.map((link, index) =>
            link.href === '/conanmaker/' ? (
              <a key={link.href} href={link.href} onClick={closeMenu}>
                <span>0{index + 1}</span>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                <span>0{index + 1}</span>
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {showHomepageChapters ? (
          <nav className={styles.mobileChapterNav} aria-label="Các chương trên trang chủ">
            {homepageChapterNavigation.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  )
}
