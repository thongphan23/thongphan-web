import type { Metadata } from 'next'
import ChatClient from './ChatClient'

export const metadata: Metadata = {
  title: 'Hỏi Brain2 — Thông Phan',
  description: 'Đặt một tình huống thật và xem cách tri thức có hệ thống tạo ra câu trả lời có bối cảnh hơn.',
  alternates: { canonical: '/chat' },
}

export default function ChatPage() {
  return <ChatClient />
}
