import type { Metadata } from 'next'
import DiagnosticClient from './DiagnosticClient'

export const metadata: Metadata = {
  title: 'Chẩn đoán 5 tầng AI — Thông Phan',
  description: 'Trả lời 5 câu để biết bạn nên dùng AI ở tầng việc vặt, nội dung, Brain2, tài sản số hay thực hành sâu hơn.',
  alternates: { canonical: '/diagnostic' },
}

export default function DiagnosticPage() {
  return <DiagnosticClient />
}
