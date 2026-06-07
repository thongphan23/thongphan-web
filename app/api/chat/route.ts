// app/api/chat/route.ts
// Next.js API route that proxies to Cloudflare Worker
// For local dev, this returns mock responses
// For production, this proxies to the deployed worker

import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // In production, proxy to deployed worker
    const workerUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://thongphan-chat-api.thongphan23.workers.dev'

    // For local dev without worker, return mock streaming response
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_CHAT_API_URL) {
      return mockStreamingResponse(message)
    }

    // Proxy to worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Mock streaming response for local dev
function mockStreamingResponse(message: string) {
  const encoder = new TextEncoder()

  const mockResponses: Record<string, string> = {
    'brain2': 'Brain2 là hệ thống quản lý tri thức cá nhân của tui. Nó dùng Obsidian, kho ghi chú và các ghi chú một ý. Mỗi ghi chú là một ý tưởng độc lập, liên kết với nhau tạo thành mạng lưới kiến thức. Há há, nghe ghê vậy thôi chứ thực ra là cách tui ghi chép có hệ thống.',
    'ai': 'AI không cướp việc bạn đâu. Người dùng AI giỏi hơn bạn mới cướp. 10 năm kinh nghiệm + AI = không ai theo kịp. Kinh nghiệm của bạn KHÔNG vô dụng — nó là thứ AI không có.',
    'conan': 'Conan School là nơi tui và anh Đắc xây dựng để dạy người đi làm dùng AI đúng cách. Không phải học công cụ, mà học cách NGHĨ trước khi dùng AI. Buổi Deep AI Content của tui có 600+ bình luận đăng ký trong 24h đầu.',
    'default': 'Tui là Thông Phan, làm nội dung và marketing hơn 10 năm, đồng sáng lập Conan School. Tui giúp người có chuyên môn biến kiến thức thành tài sản, hệ thống AI và dòng tiền thứ 2. Hỏi tui về AI, nội dung, Brain2, tài sản số hoặc Conan nhé.'
  }

  const lowerMessage = message.toLowerCase()
  let response = mockResponses.default

  if (lowerMessage.includes('brain2')) response = mockResponses.brain2
  else if (lowerMessage.includes('ai') || lowerMessage.includes('cướp')) response = mockResponses.ai
  else if (lowerMessage.includes('conan')) response = mockResponses.conan

  const stream = new ReadableStream({
    async start(controller) {
      // Simulate streaming word by word
      const words = response.split(' ')
      for (const word of words) {
        const chunk = `data: ${JSON.stringify({ response: word + ' ' })}\n\n`
        controller.enqueue(encoder.encode(chunk))
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  })
}
