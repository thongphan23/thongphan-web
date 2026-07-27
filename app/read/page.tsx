import type { Metadata } from 'next'
import ReaderLoopWorkspace from '@/components/reader-loop/ReaderLoopWorkspace'

export const metadata: Metadata = {
  title: 'Reader Loop — Một bài đọc đúng lúc',
  description: 'Gọi tên điều đang vướng, nhận một bài đọc có lý do và giữ lại bước tiếp theo.',
  robots: { index: false, follow: false },
}

export default function ReadPage() {
  return <ReaderLoopWorkspace />
}
