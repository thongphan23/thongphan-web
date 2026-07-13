export type SiteRouteMode =
  | 'standalone'
  | 'cinema-dark'
  | 'evidence-dossier'
  | 'learning-dossier'
  | 'editorial-light'
  | 'legacy'
  | 'default'

const exactRouteModes: Readonly<Record<string, SiteRouteMode>> = {
  '/conanmaker': 'standalone',
  '/': 'cinema-dark',
  '/about': 'cinema-dark',
  '/diagnostic': 'evidence-dossier',
  '/learn': 'learning-dossier',
  '/assets': 'evidence-dossier',
  '/experiences': 'evidence-dossier',
  '/brain2/21-ngay': 'evidence-dossier',
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
  ['/learn', 'learning-dossier'],
  ['/experiences', 'evidence-dossier'],
  ['/brain2/21-ngay', 'editorial-light'],
  ['/library', 'editorial-light'],
  ['/blog', 'editorial-light'],
]

export function routeModeForPath(pathname: string): SiteRouteMode {
  const exactMode = exactRouteModes[pathname]
  if (exactMode) return exactMode

  const prefixMatch = prefixRouteModes.find(([prefix]) => pathname.startsWith(`${prefix}/`))
  return prefixMatch?.[1] ?? 'cinema-dark'
}

export function isUnifiedRouteEnabled(pathname: string): boolean {
  const mode = routeModeForPath(pathname)
  return mode !== 'legacy' && mode !== 'standalone'
}
