import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReaderLoopWorkspace from '@/components/reader-loop/ReaderLoopWorkspace'
import { readerLoopPreviewEnabled } from '@/lib/reader-loop/release'

export const metadata: Metadata = {
  title: 'Reader Loop — Một bài đọc đúng lúc',
  description: 'Gọi tên điều đang vướng, nhận một bài đọc có lý do và giữ lại bước tiếp theo.',
  robots: { index: false, follow: false },
}

export default function ReadPage() {
  if (!readerLoopPreviewEnabled) notFound()
  return <ReaderLoopWorkspace />
}
