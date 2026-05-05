import type { Metadata } from 'next'
import '@/styles/globals.css'
import './layout.module.css'

export const metadata: Metadata = {
  title: 'Thông Phan — Thương hiệu cá nhân thời đại AI',
  description: '10 năm content marketing. 40+ bài viral. Tui đang chia sẻ tất cả về cách dùng AI đúng để giữ và +1 thu nhập.',
  keywords: ['AI', 'content marketing', 'career', 'Brain2', 'Thông Phan'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" data-theme="dark">
      <body>
        <nav className="navbar">
          <div className="container">
            <a href="/" className="logo">THÔNG PHAN</a>
            <div className="nav-links">
              <a href="/blog">Blog</a>
              <a href="/challenges">Challenges</a>
              <a href="/chat">Chat</a>
              <a href="/about">About</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <p>&copy; 2026 Thông Phan. Mọi người sợ AI. Tui sợ người hiểu AI.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
