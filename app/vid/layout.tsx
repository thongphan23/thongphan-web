import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://vid.thongphan.com'),
  title: {
    default: 'VID · Thông Phan — Video được tuyển chọn',
    template: '%s · VID Thông Phan',
  },
  description: 'Thư viện video thuyết minh tiếng Việt do Thông Phan tuyển chọn, có nguồn gốc rõ ràng.',
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'VID · Thông Phan',
    locale: 'vi_VN',
    type: 'website',
    url: 'https://vid.thongphan.com',
  },
}

export default function VidLayout({ children }: { children: React.ReactNode }) {
  return children
}
