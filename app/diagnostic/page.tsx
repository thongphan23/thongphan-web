import type { Metadata } from 'next'
import DiagnosticClient from './DiagnosticClient'

export const metadata: Metadata = {
  title: 'Chẩn đoán 5 tầng AI — Thông Phan',
  description: 'Bài chẩn đoán 3 phút để biết bạn đang ở Task AI, Content Leverage, Brain2 Base, Digital Asset hay Conan Ready.',
}

export default function DiagnosticPage() {
  return <DiagnosticClient />
}
