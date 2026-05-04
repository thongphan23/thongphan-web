'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  "Tui nên học AI tool nào đầu tiên?",
  "Làm sao để AI không viết giọng AI?",
  "Brain2 là gì? Bắt đầu từ đâu?",
  "Nghề tui có bị AI cướp không?",
  "Tui có 10 năm kinh nghiệm, dùng AI thế nào?"
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call Next.js API route which proxies to worker or returns mock data
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

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
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content = assistantMessage
                    return newMessages
                  })
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
      <div className={styles.chatHeader}>
        <div className={styles.avatar}>TP</div>
        <div>
          <h1 className={styles.chatTitle}>Chat với Thông Phan</h1>
          <p className={styles.chatSub}>AI clone từ Brain2 vault</p>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <p>Hỏi tui bất cứ điều gì về AI, content, sự nghiệp, hay Brain2.</p>
            <div className={styles.suggestions}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className={styles.suggestion}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
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
