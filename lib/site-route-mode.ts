export type SiteRouteMode =
  | 'standalone'
  | 'cinema-dark'
  | 'evidence-dossier'
  | 'editorial-light'
  | 'legacy'
  | 'default'

const exactRouteModes: Readonly<Record<string, SiteRouteMode>> = {
  '/conanmaker': 'standalone',
  '/': 'cinema-dark',
  '/about': 'cinema-dark',
  '/diagnostic': 'evidence-dossier',
  '/assets': 'evidence-dossier',
  '/challenges': 'evidence-dossier',
  '/chat': 'evidence-dossier',
  '/library': 'editorial-light',
  '/blog': 'editorial-light',
  '/classic': 'legacy',
  '/concept': 'legacy',
  '/co-che-tep-moi.html': 'legacy',
}

const prefixRouteModes: ReadonlyArray<readonly [prefix: string, mode: SiteRouteMode]> = [
  ['/conanmaker', 'standalone'],
  ['/assets', 'evidence-dossier'],
  ['/challenges', 'evidence-dossier'],
  ['/library', 'editorial-light'],
  ['/blog', 'editorial-light'],
]

export function routeModeForPath(pathname: string): SiteRouteMode {
  const exactMode = exactRouteModes[pathname]
  if (exactMode) return exactMode

  const prefixMatch = prefixRouteModes.find(([prefix]) => pathname.startsWith(`${prefix}/`))
  return prefixMatch?.[1] ?? 'default'
}

export function isUnifiedRouteEnabled(pathname: string): boolean {
  return pathname === '/'
}
