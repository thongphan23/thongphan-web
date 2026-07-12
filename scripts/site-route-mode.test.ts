import assert from 'node:assert/strict'
import test from 'node:test'

import { isUnifiedRouteEnabled, routeModeForPath, type SiteRouteMode } from '../lib/site-route-mode'

const routeModeCases: Array<[pathname: string, expected: SiteRouteMode]> = [
  ['/conanmaker', 'standalone'],
  ['/conanmaker/', 'standalone'],
  ['/conanmaker/workbench', 'standalone'],
  ['/', 'cinema-dark'],
  ['/about', 'cinema-dark'],
  ['/diagnostic', 'evidence-dossier'],
  ['/learn', 'learning-dossier'],
  ['/learn/diagnostic', 'learning-dossier'],
  ['/assets', 'evidence-dossier'],
  ['/assets/offer-map', 'evidence-dossier'],
  ['/challenges', 'evidence-dossier'],
  ['/challenges/brain2', 'evidence-dossier'],
  ['/brain2/21-ngay', 'evidence-dossier'],
  ['/brain2/21-ngay/ngay-01', 'editorial-light'],
  ['/chat', 'evidence-dossier'],
  ['/library', 'editorial-light'],
  ['/library/read/deep-work', 'editorial-light'],
  ['/blog', 'editorial-light'],
  ['/blog/a-field-note', 'editorial-light'],
  ['/classic', 'legacy'],
  ['/concept', 'legacy'],
  ['/co-che-tep-moi.html', 'legacy'],
  ['/about/team', 'cinema-dark'],
  ['/diagnostic/results', 'cinema-dark'],
  ['/chat/thread', 'cinema-dark'],
  ['/classic/notes', 'cinema-dark'],
  ['/conanmakerish', 'cinema-dark'],
  ['/unknown', 'cinema-dark'],
]

test('routeModeForPath honors every exact and prefix route contract', () => {
  for (const [pathname, expected] of routeModeCases) {
    assert.equal(routeModeForPath(pathname), expected, pathname)
  }
})

test('the unified shell is the safe default while explicit legacy and standalone routes stay isolated', () => {
  const enabled = ['/', '/about', '/diagnostic', '/learn', '/learn/diagnostic', '/assets', '/assets/offer-map', '/challenges', '/challenges/brain2', '/brain2/21-ngay', '/brain2/21-ngay/ngay-01', '/chat', '/library', '/library/read', '/library/read/deep-work', '/library/a-living-note', '/blog', '/blog/a-field-note', '/about/team', '/diagnostic/results', '/chat/thread', '/unknown']
  const disabled = ['/classic', '/concept', '/co-che-tep-moi.html', '/conanmaker', '/conanmaker/']

  for (const pathname of enabled) assert.equal(isUnifiedRouteEnabled(pathname), true, pathname)
  for (const pathname of disabled) assert.equal(isUnifiedRouteEnabled(pathname), false, pathname)
})
