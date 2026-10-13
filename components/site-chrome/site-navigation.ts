import { learnPublicEnabled } from '@/lib/learn-release'

type NavigationLink = { href: string; label: string }

// The header switch: each reader picks a path before anything else.
export const pathNavigation = [
  { href: '/tensai', label: 'Đi làm', path: 'tensai' },
  { href: '/conan', label: 'Kinh doanh', path: 'conan' },
] as const

// Branch pages restyle the shared chrome to their own palette.
export function pathRouteFor(pathname: string) {
  return pathNavigation.find((link) => link.href === pathname)?.path
}

export const aboutNavigation = { href: '/about', label: 'Về Thông' } as const

export function getMoreNavigation(includeLearn: boolean): NavigationLink[] {
  return [
    { href: '/library', label: 'Thư viện' },
    { href: '/experiences', label: 'Trải nghiệm' },
    ...(includeLearn ? [{ href: '/learn', label: 'Học' }] : []),
    { href: '/diagnostic', label: 'Chẩn đoán' },
    { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
  ]
}

export const moreNavigation = getMoreNavigation(learnPublicEnabled)

export const footerExploreNavigation: readonly NavigationLink[] = [
  aboutNavigation,
  { href: '/library', label: 'Thư viện' },
  { href: '/blog', label: 'Bài viết' },
  { href: '/experiences', label: 'Trải nghiệm' },
  { href: '/diagnostic', label: 'Chẩn đoán' },
  { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
  { href: '/assets', label: 'Tài sản' },
  { href: '/chat', label: 'Bàn hỏi' },
]

// Conan Maker is a standalone static route; its trailing slash is canonical.
export const footerUtilityNavigation: readonly NavigationLink[] = [
  { href: '/conanmaker/', label: 'Conan Maker' },
]

export const socialNavigation: readonly NavigationLink[] = [
  { href: 'https://facebook.com/thongphan23', label: 'Facebook' },
  { href: 'https://linkedin.com/in/thongphan', label: 'LinkedIn' },
  { href: 'https://m.me/thongphan.88', label: 'Messenger' },
]
