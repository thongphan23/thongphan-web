import type { Metadata } from 'next'
import SystemNote from '@/components/system-note/SystemNote'

export const metadata: Metadata = { title: 'System note — Thông Phan', description: 'Vertical slice minh hoạ Website đọc note qua api.thongphan.com và Cloudflare D1.', robots: { index: false, follow: false } }
export default function SystemNotePage(){return <SystemNote/>}
