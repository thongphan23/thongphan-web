'use client'

import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent } from 'react'
import PathLink from '@/components/two-path/PathLink'
import type { SiteRouteMode } from '@/lib/site-route-mode'
import MobileMenu from './MobileMenu'
import { aboutNavigation, moreNavigation, pathNavigation, pathRouteFor } from './site-navigation'
import styles from './SiteChrome.module.css'

type HeaderTone = 'dark' | 'light'

// The two-path pages alternate ink and paper grounds; on them the header takes the tone of
// whatever sits just below it, so it never cuts a paper bar across the dark footer (or the reverse).
// Objects laid on a ground (a press clipping, a pinned print) carry data-header-ignore: the header
// reads the ground beneath them, not the paper card passing under it.
const toneRoutes = new Set(['/', '/tensai', '/conan', '/about'])

// The header also takes the ground's colour (ink, Tensai's deep green, a darker paper band), so no
// bar of another shade sits across a section; a saturated light ground (the lime course row) keeps
// the reading paper instead of turning the whole header lime.
function sampleTone(header: HTMLElement): { tone: HeaderTone; ground?: string } | undefined {
  const y = header.getBoundingClientRect().bottom + 2
  const under = document
    .elementsFromPoint(window.innerWidth / 2, y)
    .find((node) => !header.contains(node) && !node.closest('[data-header-ignore]'))
  for (let node = under ?? null; node; node = node.parentElement) {
    // Follow the section ground, not a button, thumbnail or card that happens to sit under the header.
    // Controls are skipped outright: on a phone a primary CTA spans well over half the width.
    if (node.matches('a, button') || node.getBoundingClientRect().width < window.innerWidth * 0.6) continue
    const rgb = parseBackground(getComputedStyle(node).backgroundColor)
    if (!rgb) continue
    const tone = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.5 ? 'light' : 'dark'
    const vivid = Math.max(...rgb) - Math.min(...rgb) > 0.2
    const ground = tone === 'light' && vivid ? undefined : `rgb(${rgb.map((channel) => Math.round(channel * 255)).join(' ')})`
    return { tone, ground }
  }
  return undefined
}

// Returns 0–1 channels for a mostly opaque background, from either rgb() or (color-mix) color(srgb).
function parseBackground(value: string): [number, number, number] | undefined {
  const legacy = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(value)
  const modern = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?/.exec(value)
  const match = legacy ?? modern
  if (!match || (match[4] !== undefined && Number(match[4]) < 0.5)) return undefined
  const scale = legacy ? 255 : 1
  return [Number(match[1]) / scale, Number(match[2]) / scale, Number(match[3]) / scale]
}

type SiteHeaderProps = {
  mode: SiteRouteMode
  pathname: string
}

export default function SiteHeader({ mode, pathname }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Remember which page the more menu was opened on, so a route change closes it.
  const [moreOpenFor, setMoreOpenFor] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [tone, setTone] = useState<HeaderTone | undefined>(undefined)
  const [ground, setGround] = useState<string | undefined>(undefined)
  // On the two-path pages the bar slides away while reading down and returns on any upward
  // scroll, so it never sits across a pinned heading, a photo or the footer's first line.
  const [hidden, setHidden] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const moreTriggerRef = useRef<HTMLButtonElement>(null)
  const isLibrary = pathname.startsWith('/library')
  const moreOpen = moreOpenFor === pathname

  useEffect(() => {
    let frame = 0
    let lastY = window.scrollY

    const update = () => {
      frame = 0
      const y = window.scrollY
      setScrolled(y > 24)
      if (toneRoutes.has(pathname)) {
        if (y < 160 || lastY - y > 6) setHidden(false)
        else if (y - lastY > 6) setHidden(true)
      }
      lastY = y
      if (toneRoutes.has(pathname) && headerRef.current) {
        const sample = sampleTone(headerRef.current)
        setTone(sample?.tone)
        setGround(sample?.ground)
      }
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('load', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('load', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  useEffect(() => {
    if (!moreOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpenFor(null)
        moreTriggerRef.current?.focus()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpenFor(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [moreOpen])

  const closeMoreOnFocusLeave = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMoreOpenFor(null)
  }

  return (
    <header
      ref={headerRef}
      className={styles.cinemaHeader}
      data-route-mode={mode}
      data-path-route={pathRouteFor(pathname)}
      data-header-scrolled={scrolled}
      data-header-hidden={hidden && !menuOpen && !moreOpen ? 'true' : undefined}
      data-header-tone={toneRoutes.has(pathname) ? tone : undefined}
      style={toneRoutes.has(pathname) && ground ? ({ '--header-ground': ground } as CSSProperties) : undefined}
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

        <nav className={styles.pathSwitch} aria-label="Hai con đường">
          {pathNavigation.map((link) => (
            <PathLink
              key={link.href}
              path={link.path}
              kind="door"
              placement="nav"
              className={styles.pathLink}
              aria-current={pathname === link.href ? 'page' : undefined}
              data-path={link.path}
            >
              {link.label}
            </PathLink>
          ))}
        </nav>

        <nav className={styles.desktopNav} aria-label="Điều hướng chính">
          <Link
            href={aboutNavigation.href}
            className={styles.aboutLink}
            aria-current={pathname === aboutNavigation.href ? 'page' : undefined}
          >
            {aboutNavigation.label}
          </Link>

          <div className={styles.more} ref={moreRef} onBlur={closeMoreOnFocusLeave}>
            <button
              ref={moreTriggerRef}
              type="button"
              className={styles.moreTrigger}
              aria-expanded={moreOpen}
              aria-controls="site-more-menu"
              onClick={() => setMoreOpenFor(moreOpen ? null : pathname)}
            >
              Thêm
              <ChevronDown aria-hidden="true" size={16} strokeWidth={1.8} />
            </button>
            <ul id="site-more-menu" className={styles.moreMenu} hidden={!moreOpen}>
              {moreNavigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    onClick={() => setMoreOpenFor(null)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        triggerRef={triggerRef}
      />
    </header>
  )
}
