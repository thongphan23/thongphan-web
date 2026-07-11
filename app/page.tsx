import type { Metadata } from 'next'
import HomeCinema from '@/components/home-cinema/HomeCinema'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Thông Phan — Biến chuyên môn thật thành tài sản',
  description: 'Từ trải nghiệm thật đến tài sản, offer và cộng đồng trả phí — không cần rời bỏ công việc hiện tại.',
  pathname: '/',
  image: '/images/homepage/evidence-cinema-hero-v3.webp',
})

export default function HomePage() {
  return <HomeCinema />
}
