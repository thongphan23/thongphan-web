import type { Metadata } from 'next'

import TprDashboard from './TprDashboard'

export const metadata: Metadata = {
  title: 'TPR Control Room',
  description: 'Bảng điều khiển nội bộ của Thông Phan Remotion.',
  robots: { index: false, follow: false, nocache: true },
}

export default function TprPage() {
  return <TprDashboard />
}
