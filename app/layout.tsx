import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Cormorant_Garamond, Newsreader } from 'next/font/google'
import '@/styles/globals.css'
import ScrollAnimations from '@/components/ScrollAnimations'
import SiteChrome from '@/components/site-chrome/SiteChrome'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
})

const newsreader = Newsreader({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://thongphan.com'),
  title: 'Thông Phan — Biến kiến thức thành tài sản và dòng tiền',
  description: 'Nếu bạn có chuyên môn thật nhưng chưa được nhìn thấy đúng, hãy bắt đầu biến kinh nghiệm của mình thành nội dung, tài sản số và cơ hội xứng đáng.',
  keywords: ['AI', 'chuyên môn', 'tài sản số', 'dòng tiền thứ 2', 'Brain2', 'Thông Phan', 'Conan School'],
  authors: [{ name: 'Thông Phan' }],
  openGraph: {
    siteName: 'Thông Phan',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@thongphan',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} ${cormorantGaramond.variable} ${newsreader.variable}`}>
        <ScrollAnimations />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
