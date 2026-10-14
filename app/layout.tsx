import type { Metadata } from 'next'
import {
  Be_Vietnam_Pro,
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Lora,
  Newsreader,
} from 'next/font/google'
import '@/styles/globals.css'
import ScrollAnimations from '@/components/ScrollAnimations'
import SiteChrome from '@/components/site-chrome/SiteChrome'
import JsonLd from '@/components/seo/JsonLd'
import { buildWebsiteStructuredData, DEFAULT_DESCRIPTION, SITE_URL } from '@/lib/seo'

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
  style: ['normal', 'italic'],
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

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: false,
})

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
})

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,
})

// Runs before first paint: opt into motion pre-states only when reduced motion is off,
// and fall back to the static page if the engine has not started within four seconds.
const MOTION_BOOT = `(function(){var d=document.documentElement;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');setTimeout(function(){if(!d.hasAttribute('data-motion-ready'))d.classList.remove('motion')},4000)}catch(e){}})()`

const legacyFontClassName = `${inter.variable} ${lora.variable} ${jetBrainsMono.variable}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Thông Phan — Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI',
  description: DEFAULT_DESCRIPTION,
  keywords: ['AI', 'AI cho người đi làm', 'kinh doanh trong kỷ nguyên AI', 'Tensai', 'Conan School', 'Thông Phan'],
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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body className={`${beVietnamPro.variable} ${cormorantGaramond.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}>
        <ScrollAnimations />
        <SiteChrome legacyFontClassName={legacyFontClassName}>{children}</SiteChrome>
        <JsonLd data={buildWebsiteStructuredData()} />
      </body>
    </html>
  )
}
