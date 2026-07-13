'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { resolveMenuKeyAction } from './mobile-menu-focus'
import { homepageChapterNavigation, primaryNavigation, secondaryNavigation } from './site-navigation'
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
      const currentFocusable = Array.from(
        dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      )
      const action = resolveMenuKeyAction({
        key: event.key,
        shiftKey: event.shiftKey,
        activeIndex: currentFocusable.indexOf(document.activeElement as HTMLElement),
        itemCount: currentFocusable.length,
      })

      if (action === 'none') return
      event.preventDefault()
      if (action === 'close') closeMenu()
      if (action === 'focus-first') currentFocusable[0]?.focus()
      if (action === 'focus-last') currentFocusable[currentFocusable.length - 1]?.focus()
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
          {primaryNavigation.map((link, index) => (
            <Link key={link.href} href={link.href} onClick={closeMenu}>
              <span>0{index + 1}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.mobileSecondaryNav} aria-label="Điểm đến mở rộng">
          {secondaryNavigation.map((link) =>
            link.href === '/conanmaker/' ? (
              <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href} onClick={closeMenu}>{link.label}</Link>
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
