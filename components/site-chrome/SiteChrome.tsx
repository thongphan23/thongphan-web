'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { isUnifiedRouteEnabled, routeModeForPath, type SiteRouteMode } from '@/lib/site-route-mode'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'
import MotionAtmosphere from './MotionAtmosphere'
import FilmGrain from './FilmGrain'
import MotionKernel from '@/components/motion/MotionKernel'
import RouteCurtain from '@/components/motion/RouteCurtain'
import styles from './SiteChrome.module.css'

// The legacy shell and its stylesheet load only on the routes that use it.
const DefaultHeader = dynamic(() => import('./LegacyChrome').then((m) => m.DefaultHeader))
const DefaultFooter = dynamic(() => import('./LegacyChrome').then((m) => m.DefaultFooter))
const LegacyBackdrop = dynamic(() => import('./LegacyChrome').then((m) => m.LegacyBackdrop))

// First-paint ground. Each route's static HTML carries its page tone in a hoisted <style>, so the
// frame before stylesheets and hydration is cream on /tensai and ink on the dark routes, never
// white. Once SiteChrome runs it stamps data-ground on <html>, which retires every hoisted copy
// (client navigations leave old ones in <head>) and lets the global data-ground rules take over.
const GROUNDS: Partial<Record<SiteRouteMode, 'paper' | 'ink'>> = { 'editorial-light': 'paper', 'cinema-dark': 'ink' }
const GROUND_COLORS = { paper: '#f3efe6', ink: '#070706' } as const

type SiteChromeProps = {
  children: ReactNode
  legacyFontClassName: string
  pathnameOverride?: string
}

export default function SiteChrome({ children, legacyFontClassName, pathnameOverride }: SiteChromeProps) {
  const detectedPathname = usePathname()
  const pathname = pathnameOverride ?? detectedPathname
  const mode = routeModeForPath(pathname)
  const isUnified = isUnifiedRouteEnabled(pathname)
  const ground = isUnified ? GROUNDS[mode] : undefined

  useEffect(() => {
    document.documentElement.dataset.ground = ground ?? 'none'
  }, [ground])

  if (mode === 'standalone') {
    return <>{children}</>
  }

  return (
    <div
      className={`${styles.siteShell} ${isUnified ? '' : legacyFontClassName}`}
      data-route-mode={mode}
      data-site-shell={isUnified ? 'unified' : 'legacy'}
      data-homepage={pathname === '/'}
    >
      {ground ? (
        <style href={`ground-${ground}`} precedence="ground">
          {`html:not([data-ground]),html:not([data-ground]) body{background:${GROUND_COLORS[ground]}}`}
        </style>
      ) : null}
      {isUnified ? <div className={styles.cinemaProgress} data-scroll-progress aria-hidden="true" /> : <LegacyBackdrop />}
      {isUnified ? <MotionAtmosphere pathname={pathname} mode={mode} /> : null}
      {isUnified ? <FilmGrain /> : null}
      <MotionKernel pathname={pathname} />
      {isUnified ? <RouteCurtain pathname={pathname} /> : null}
      {isUnified ? <SiteHeader mode={mode} pathname={pathname} /> : <DefaultHeader />}
      <main className={isUnified ? styles.cinemaMain : styles.legacyMain}>{children}</main>
      {isUnified ? <SiteFooter mode={mode} pathname={pathname} /> : <DefaultFooter />}
    </div>
  )
}
