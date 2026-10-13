export type PathKey = 'tensai' | 'conan'
export type Placement = 'hero' | 'door' | 'nav' | 'footer' | 'page' | 'closing'

export const TENSAI_URL = 'https://learn.thongphan.com/'
export const CONAN_URL = 'https://www.conan.school/'

export const PATH_KEYS: readonly PathKey[] = ['tensai', 'conan']

export const PATH_ROUTES = {
  tensai: '/tensai',
  conan: '/conan',
} as const satisfies Record<PathKey, string>

export const PATH_LABELS: Record<PathKey, string> = {
  tensai: 'Tensai',
  conan: 'Conan School',
}

const OUTBOUND_URLS: Record<PathKey, string> = {
  tensai: TENSAI_URL,
  conan: CONAN_URL,
}

export function isPathKey(value: unknown): value is PathKey {
  return value === 'tensai' || value === 'conan'
}

export function withUtm(url: string, placement: Placement) {
  const target = new URL(url)
  target.searchParams.set('utm_source', 'thongphan.com')
  target.searchParams.set('utm_medium', 'referral')
  target.searchParams.set('utm_campaign', 'two-path')
  target.searchParams.set('utm_content', placement)
  return target.toString()
}

export function outboundUrl(path: PathKey, placement: Placement) {
  return withUtm(OUTBOUND_URLS[path], placement)
}

export function doorEvent(path: PathKey, placement: Placement) {
  return { name: 'path_door_selected' as const, detail: { path, placement } }
}

export function outboundEvent(path: PathKey, placement: Placement) {
  return {
    name: path === 'tensai' ? ('outbound_tensai' as const) : ('outbound_conan' as const),
    detail: { placement },
  }
}
