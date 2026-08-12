import { learnPublicEnabled } from '@/lib/learn-release'

const coreNavigation = [
  { href: '/about', label: 'Câu chuyện' },
  { href: '/library', label: 'Thư viện' },
  { href: '/experiences', label: 'Trải nghiệm' },
] as const

export function getPrimaryNavigation(includeLearn: boolean) {
  return [
    ...coreNavigation,
    ...(includeLearn ? [{ href: '/learn', label: 'Học' } as const] : []),
    { href: '/diagnostic', label: 'Chẩn đoán' } as const,
  ]
}

export const primaryNavigation = getPrimaryNavigation(learnPublicEnabled)

export const secondaryNavigation = [
  { href: 'https://vid.thongphan.com', label: 'Video tuyển chọn', external: true },
  { href: '/assets', label: 'Tài sản' },
  { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
  { href: '/conanmaker/', label: 'Conan Maker' },
] as const

export const homepageChapterNavigation = [
  { href: '#story', label: 'Mở đầu', section: 'story' },
  { href: '#mirror', label: 'Tấm gương', section: 'mirror' },
  { href: '#proof', label: 'Bằng chứng', section: 'proof' },
  { href: '#method', label: 'Phương pháp', section: 'method' },
  { href: '#paths', label: 'Chọn đường', section: 'paths' },
  { href: '#conan', label: 'Conan', section: 'conan' },
] as const
