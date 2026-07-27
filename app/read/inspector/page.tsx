import type { Metadata } from 'next'
import ReaderLoopInspector from '@/components/reader-loop/ReaderLoopInspector'

export const metadata: Metadata = {
  title: 'Evidence Inspector — Reader Loop preview',
  robots: { index: false, follow: false },
}

export default function ReaderLoopInspectorPage() {
  return <ReaderLoopInspector />
}
