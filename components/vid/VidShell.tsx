'use client'

import {
  ArrowUpRight,
  Clock3,
  Compass,
  History,
  Home,
  ListVideo,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import styles from './Vid.module.css'
import VidLink from './VidLink'

const navigation = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/topic?slug=all', label: 'Chủ đề', icon: Compass },
  { href: '/playlist?list=all', label: 'Danh sách phát', icon: ListVideo },
  { href: '/library?tab=continue', label: 'Xem tiếp', icon: History },
  { href: '/library?tab=later', label: 'Xem sau', icon: Clock3 },
] as const

export default function VidShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget)
    if (!String(data.get('search_query') ?? '').trim()) event.preventDefault()
  }

  return (
    <div className={styles.platform} data-vid-platform data-sidebar-collapsed={collapsed}>
      <a className={styles.skipLink} href="#vid-main">Bỏ qua điều hướng</a>
      <span className={styles.projectorBeam} aria-hidden="true" />

      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={collapsed ? 'Mở rộng điều hướng' : 'Thu gọn điều hướng'}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
        <VidLink href="/" className={styles.wordmark} aria-label="VID Thông Phan — Trang chủ">
          <strong>VID</strong><span>·</span> THÔNG PHAN
        </VidLink>
        <form className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`} action="/results" onSubmit={submitSearch} role="search">
          <label className={styles.srOnly} htmlFor="vid-search">Tìm video</label>
          <input id="vid-search" name="search_query" type="search" placeholder="Tìm trong thư viện tuyển chọn" autoComplete="off" />
          <button type="submit" aria-label="Tìm kiếm"><Search aria-hidden="true" /></button>
        </form>
        <button type="button" className={`${styles.iconButton} ${styles.mobileSearch}`} aria-label="Mở tìm kiếm" onClick={() => setSearchOpen((value) => !value)}>
          <Search aria-hidden="true" />
        </button>
        <a className={styles.ecosystemLink} href="https://thongphan.com">
          thongphan.com <ArrowUpRight aria-hidden="true" />
        </a>
      </header>

      <aside className={styles.sidebar} aria-label="Điều hướng video">
        <nav>
          {navigation.map(({ href, label, icon: Icon }) => (
            <VidLink key={href} href={href} title={collapsed ? label : undefined}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </VidLink>
          ))}
        </nav>
        <p><Menu aria-hidden="true" /> Video đã hoàn chỉnh · nguồn rõ ràng</p>
      </aside>

      <main id="vid-main" className={styles.main} tabIndex={-1}>{children}</main>

      <nav className={styles.bottomNav} aria-label="Điều hướng video trên di động">
        <VidLink href="/"><Home aria-hidden="true" /><span>Trang chủ</span></VidLink>
        <VidLink href="/topic?slug=all"><Compass aria-hidden="true" /><span>Chủ đề</span></VidLink>
        <VidLink href="/library"><ListVideo aria-hidden="true" /><span>Thư viện</span></VidLink>
      </nav>
    </div>
  )
}
