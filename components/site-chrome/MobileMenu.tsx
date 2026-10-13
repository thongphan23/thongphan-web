'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import PathLink from '@/components/two-path/PathLink'
import { PATH_LABELS } from '@/lib/two-path-links'
import { resolveMenuKeyAction } from './mobile-menu-focus'
import { aboutNavigation, moreNavigation, pathNavigation } from './site-navigation'
import styles from './SiteChrome.module.css'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
  pathname: string
  triggerRef: RefObject<HTMLButtonElement | null>
}

export default function MobileMenu({
  open,
  onClose,
  pathname,
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

        <nav className={styles.mobilePathNav} aria-label="Hai con đường">
          {pathNavigation.map((link) => (
            <PathLink
              key={link.href}
              path={link.path}
              kind="door"
              placement="nav"
              data-path={link.path}
              aria-current={pathname === link.href ? 'page' : undefined}
              onClick={closeMenu}
            >
              <span>Tôi {link.label.toLowerCase()}</span>{' '}
              <span>{PATH_LABELS[link.path]}</span>
            </PathLink>
          ))}
        </nav>

        <nav className={styles.mobileNav} aria-label="Điều hướng chính trên di động">
          <Link
            href={aboutNavigation.href}
            aria-current={pathname === aboutNavigation.href ? 'page' : undefined}
            onClick={closeMenu}
          >
            {aboutNavigation.label}
          </Link>
          {moreNavigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
