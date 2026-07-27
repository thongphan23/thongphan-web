import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReaderLoopInspector from '@/components/reader-loop/ReaderLoopInspector'
import { readerLoopPreviewEnabled } from '@/lib/reader-loop/release'

export const metadata: Metadata = {
  title: 'Evidence Inspector — Reader Loop preview',
  robots: { index: false, follow: false },
}

export default function ReaderLoopInspectorPage() {
  if (!readerLoopPreviewEnabled) notFound()
  return <ReaderLoopInspector />
}
