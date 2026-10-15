import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import PathLink from '@/components/two-path/PathLink'
import FooterWordmark from './FooterWordmark'
import { CONAN_URL, PATH_LABELS, TENSAI_URL } from '@/lib/two-path-links'
import type { SiteRouteMode } from '@/lib/site-route-mode'
import {
  footerExploreNavigation,
  footerUtilityNavigation,
  pathNavigation,
  pathRouteFor,
  socialNavigation,
} from './site-navigation'
import styles from './SiteChrome.module.css'

const productHosts = {
  tensai: new URL(TENSAI_URL).host,
  conan: new URL(CONAN_URL).host.replace(/^www\./, ''),
} as const

type SiteFooterProps = {
  mode: SiteRouteMode
  pathname: string
}

export default function SiteFooter({ mode, pathname }: SiteFooterProps) {
  return (
    <footer className={styles.cinemaFooter} data-route-mode={mode} data-path-route={pathRouteFor(pathname)}>
      <div className={styles.footerBrand}>
        <p className={styles.footerTagline}>
          Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI.
        </p>
      </div>

      <nav className={styles.footerColumns} aria-label="Liên kết cuối trang">
        <div className={styles.footerColumn}>
          <h2 className={styles.footerHeading}>Hai con đường</h2>
          <ul>
            {pathNavigation.map((link) => (
              <li key={link.path} className={styles.footerPath} data-path={link.path}>
                <PathLink path={link.path} kind="door" placement="footer">
                  {link.label} · {PATH_LABELS[link.path]}
                </PathLink>
                <PathLink path={link.path} kind="outbound" placement="footer" className={styles.footerOutbound}>
                  {productHosts[link.path]}
                  <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
                </PathLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h2 className={styles.footerHeading}>Khám phá</h2>
          <ul>
            {footerExploreNavigation.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h2 className={styles.footerHeading}>Kết nối</h2>
          <ul>
            {socialNavigation.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <FooterWordmark />

      <div className={styles.footerBase}>
        <p className={styles.copyright}>© 2026 · Làm thật, trả giá thật, hệ thống thật.</p>
        {footerUtilityNavigation.map((link) => (
          <a key={link.href} href={link.href} className={styles.footerUtility}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
