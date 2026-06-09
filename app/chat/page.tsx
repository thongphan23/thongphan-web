'use client'

import { useState, useRef, useEffect } from 'react'
import { BrandGlyph } from '@/components/BrandGlyph'
import { GardenSignature } from '@/components/GardenSignature'
import styles from './page.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  "Tui có chuyên môn nhưng chưa biết biến thành tiền, bắt đầu từ đâu?",
  "Làm sao để AI không viết nội dung chung chung?",
  "Brain2 khác gì ứng dụng ghi chú?",
  "Tui nên xây tài sản số gì từ kiến thức của mình?",
  "Tui đi làm toàn thời gian, tạo dòng tiền thứ 2 thế nào cho an toàn?"
]

const BRAIN_SIGNALS = [
  ['context', 'AI · Brain2 · content'],
  ['route', 'diagnose → system → asset'],
  ['source', 'Thong Phan living library'],
]

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL

function getMockResponse(message: string) {
  const mockResponses: Record<string, string> = {
    brain2: 'Brain2 là hệ thống quản lý tri thức cá nhân của tui. Nó dùng Obsidian, kho ghi chú và các ghi chú một ý. Mỗi ghi chú là một ý tưởng độc lập, liên kết với nhau tạo thành mạng lưới kiến thức. Nghe ghê vậy thôi chứ thực ra là cách tui làm cho AI hiểu mình hơn.',
    ai: 'AI không cướp việc bạn đâu. Người dùng AI giỏi hơn bạn mới cướp. 10 năm kinh nghiệm cộng với AI là một lợi thế rất lớn, miễn là kinh nghiệm đó được hệ thống hóa thành dữ liệu, tiêu chuẩn và quy trình.',
    conan: 'Conan School là nơi tui và anh Đắc xây để người đi làm dùng AI đúng cách. Không phải học công cụ cho vui, mà học cách nghĩ, xây hệ thống và tạo output thật từ chuyên môn của mình.',
    default: 'Tui là Thông Phan, làm nội dung và marketing hơn 10 năm, đồng sáng lập Conan School. Tui giúp người có chuyên môn biến kiến thức thành tài sản, hệ thống AI và dòng tiền thứ 2. Hỏi tui về AI, nội dung, Brain2, tài sản số hoặc Conan nhé.',
  }

  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('brain2')) return mockResponses.brain2
  if (lowerMessage.includes('ai') || lowerMessage.includes('cướp')) return mockResponses.ai
  if (lowerMessage.includes('conan')) return mockResponses.conan
  return mockResponses.default
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const updateAssistant = (content: string) => {
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1].content = content
          return newMessages
        })
      }

      if (!CHAT_API_URL) {
        const words = getMockResponse(text).split(' ')
        for (const word of words) {
          assistantMessage += `${word} `
          updateAssistant(assistantMessage)
          await new Promise(resolve => setTimeout(resolve, 24))
        }
        return
      }

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.response) {
                  assistantMessage += parsed.response
                  updateAssistant(assistantMessage)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Thử lại nhé!'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.chatPage}>
      <div className={styles.chatHeader} data-reveal>
        <div className={styles.headerCopy}>
          <div className={styles.avatar}><BrandGlyph name="brainTree" /></div>
          <div>
            <h1 className={styles.chatTitle}>Hỏi Brain2 của Thông</h1>
            <p className={styles.chatSub}>Bản thử sống: chuyên môn được hệ thống hóa thành người cùng nghĩ bằng AI</p>
          </div>
        </div>
        <div className={styles.brainPanel} aria-label="Brain2 context signals">
          {BRAIN_SIGNALS.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <GardenSignature variant="tree" eyebrow="Brain2 companion" title="Chat là một nhánh hội thoại mọc từ thư viện sống, không phải bot hỏi đáp chung chung." compact />
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome} data-reveal>
            <p>
              Hỏi về AI, Brain2, nội dung, tài sản số, hoặc cách biến kiến thức chuyên môn thành dòng tiền thứ 2.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className={styles.suggestion}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  data-stagger
                >
                  {q}
                </button>
              ))}
            </div>
            <a href="/diagnostic" className={styles.diagnosticLink}>
              Chưa biết hỏi gì? Tự chẩn đoán năng lực AI trước →
            </a>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.role === 'assistant' && <span className={styles.msgAvatar}>TP</span>}
            <div className={styles.msgContent}>
              {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={e => { e.preventDefault(); sendMessage(input) }}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Hỏi Thông Phan..."
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Gửi →'}
        </button>
      </form>
    </main>
  )
}
