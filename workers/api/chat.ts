// workers/api/chat.ts
export interface Env {
  AI: Ai
  BRAIN2_INDEX: VectorizeIndex
}

const SYSTEM_PROMPT = `Bạn là AI đại diện cho Thông Phan — content marketer 10 năm, Co-Founder & CMO Conan School.

GIỌNG NÓI (bắt buộc):
- Xưng "tui", gọi "anh em"
- Bình tĩnh, authority — như người anh đã đi qua, không phải giáo sư giảng bài
- Thẳng thắn, đúng vào vấn đề. Không vòng vo
- Có thể chêm "há há", "hehe" đúng lúc — nhưng không lạm dụng
- Câu ngắn. Không bullet point dài dòng

KHÔNG ĐƯỢC:
- Tâng bốc người hỏi ("Câu hỏi hay quá!")
- Nói kiểu guru ("Tui sẽ thay đổi cuộc đời bạn")
- Generic tips không góc nhìn riêng
- Tạo thêm FOMO hay lo lắng

MỖI CÂU TRẢ LỜI tạo ít nhất 1 trong: nhẹ nhõm / sáng tỏ / biết bước tiếp theo

TRACK RECORD (nếu được hỏi về background):
- 10+ năm content marketing
- 40+ bài viral, 80k+ shares
- Workshop AI → 600+ đăng ký trong 24h
- Co-Founder & CMO Conan School
- Hoa Sơn Tửu Lầu: khởi nghiệp 85tr → 6 nhà hàng, 60tr/ngày

Context từ Brain2 vault của tui:
{CONTEXT}

Câu hỏi: {USER_MESSAGE}`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type AiEmbeddingResult = { data: number[][] }

const chatWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const { message } = await request.json() as { message: string }
      if (!message?.trim()) {
        return new Response(JSON.stringify({ error: 'Message required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        })
      }

      // 1. Embed user message
      const embeddingResult = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: [message]
      }) as AiEmbeddingResult
      const queryVector = embeddingResult.data[0]

      // 2. Query Vectorize for relevant Brain2 chunks
      const searchResult = await env.BRAIN2_INDEX.query(queryVector, {
        topK: 5,
        returnMetadata: 'all'
      })

      // 3. Build context from search results
      const context = searchResult.matches
        .filter(m => m.score > 0.3)  // Lower threshold for better recall
        .map(m => m.metadata?.text || '')
        .join('\n\n---\n\n')

      // 4. Build final prompt
      const prompt = SYSTEM_PROMPT
        .replace('{CONTEXT}', context || 'Không tìm thấy context liên quan.')
        .replace('{USER_MESSAGE}', message)

      // 5. Stream response from Workers AI
      const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 800,
      }) as ReadableStream

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...CORS_HEADERS,
        }
      })

    } catch (error) {
      console.error('Chat error:', error)
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      })
    }
  }
}

export default chatWorker
