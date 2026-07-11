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

test('the unified shell enables every migrated Cinema and editorial surface only', () => {
  const enabled = ['/', '/about', '/diagnostic', '/assets', '/assets/offer-map', '/challenges', '/challenges/brain2', '/chat', '/library', '/library/read', '/library/read/deep-work', '/library/a-living-note', '/blog', '/blog/a-field-note']
  const disabled = ['/about/team', '/diagnostic/results', '/chat/thread', '/classic', '/classic/notes', '/conanmaker', '/conanmakerish', '/libraryish', '/unknown']

  for (const pathname of enabled) assert.equal(isUnifiedRouteEnabled(pathname), true, pathname)
  for (const pathname of disabled) assert.equal(isUnifiedRouteEnabled(pathname), false, pathname)
})
