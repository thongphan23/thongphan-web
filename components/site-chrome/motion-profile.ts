import type { SiteRouteMode } from '@/lib/site-route-mode'

export type MotionProfile = {
  ambient: 'full' | 'restrained' | 'none'
  pointer: 'full' | 'interactive' | 'none'
  scroll: 'full' | 'medium' | 'minimal'
}

export function motionProfileForPath(
  pathname: string,
  mode: SiteRouteMode,
): MotionProfile {
  if (pathname.startsWith('/library/read/') || pathname.startsWith('/blog/')) {
    return { ambient: 'none', pointer: 'interactive', scroll: 'minimal' }
  }

  if (pathname.startsWith('/brain2/21-ngay/')) {
    return { ambient: 'none', pointer: 'interactive', scroll: 'minimal' }
  }

  if (pathname === '/') {
    return { ambient: 'full', pointer: 'full', scroll: 'full' }
  }

  if (mode === 'editorial-light') {
    return { ambient: 'restrained', pointer: 'interactive', scroll: 'medium' }
  }

  return { ambient: 'restrained', pointer: 'interactive', scroll: 'medium' }
}
