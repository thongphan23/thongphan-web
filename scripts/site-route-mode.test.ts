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
  ['/assets', 'evidence-dossier'],
  ['/assets/offer-map', 'evidence-dossier'],
  ['/challenges', 'evidence-dossier'],
  ['/challenges/brain2', 'evidence-dossier'],
  ['/chat', 'evidence-dossier'],
  ['/library', 'editorial-light'],
  ['/library/read/deep-work', 'editorial-light'],
  ['/blog', 'editorial-light'],
  ['/blog/a-field-note', 'editorial-light'],
  ['/classic', 'legacy'],
  ['/concept', 'legacy'],
  ['/co-che-tep-moi.html', 'legacy'],
  ['/about/team', 'default'],
  ['/diagnostic/results', 'default'],
  ['/chat/thread', 'default'],
  ['/classic/notes', 'default'],
  ['/conanmakerish', 'default'],
  ['/unknown', 'default'],
]

test('routeModeForPath honors every exact and prefix route contract', () => {
  for (const [pathname, expected] of routeModeCases) {
    assert.equal(routeModeForPath(pathname), expected, pathname)
  }
})

test('the unified shell is initially enabled for the homepage only', () => {
  assert.equal(isUnifiedRouteEnabled('/'), true)

  for (const [pathname] of routeModeCases) {
    if (pathname !== '/') assert.equal(isUnifiedRouteEnabled(pathname), false, pathname)
  }
})
