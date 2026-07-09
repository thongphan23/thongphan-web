import type { Metadata } from 'next'
import HomeCinema from '@/components/home-cinema/HomeCinema'

export const metadata: Metadata = {
  title: 'Thông Phan — Biến chuyên môn thật thành tài sản',
  description: 'Từ trải nghiệm thật đến tài sản, offer và cộng đồng trả phí — không cần rời bỏ công việc hiện tại.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <HomeCinema />
}
