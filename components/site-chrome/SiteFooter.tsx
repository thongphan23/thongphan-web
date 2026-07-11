import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { SiteRouteMode } from '@/lib/site-route-mode'
import { primaryNavigation, secondaryNavigation } from './site-navigation'
import styles from './SiteChrome.module.css'

export default function SiteFooter({ mode }: { mode: SiteRouteMode }) {
  return (
    <footer className={styles.cinemaFooter} data-route-mode={mode}>
      <div>
        <p className={styles.footerName}>THÔNG PHAN</p>
        <p>Biến chuyên môn thật thành tài sản có người muốn dùng.</p>
      </div>
      <nav aria-label="Liên kết cuối trang">
        {[...primaryNavigation, ...secondaryNavigation].map((link) =>
          link.href === '/conanmaker/' ? (
            <a key={link.href} href={link.href}>
              {link.label}
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.7} />
            </a>
          ) : (
            <Link key={link.href} href={link.href}>
              {link.label}
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.7} />
            </Link>
          ),
        )}
      </nav>
      <p className={styles.copyright}>© 2026 · Làm thật, trả giá thật, hệ thống thật.</p>
    </footer>
  )
}
