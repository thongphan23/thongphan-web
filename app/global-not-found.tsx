import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Cormorant_Garamond, Newsreader } from 'next/font/google'
import '@/styles/globals.css'
import SiteChrome from '@/components/site-chrome/SiteChrome'
import NotFound from './not-found'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
  display: 'swap',
  preload: false,
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
  title: 'Không tìm thấy trang — Thông Phan',
  description: 'Đường dẫn đã đổi, hoặc trang chưa từng tồn tại.',
}

export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} ${cormorantGaramond.variable} ${newsreader.variable}`}>
        <SiteChrome legacyFontClassName="">
          <NotFound />
        </SiteChrome>
      </body>
    </html>
  )
}
