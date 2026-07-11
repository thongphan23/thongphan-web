'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import { getMockResponse, splitSseEvents, suggestedQuestions, type ChatMessage } from './chat-model'
import styles from './page.module.css'

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const updateLastAssistant = (content: string) => setMessages((current) => {
    const next = [...current]
    next[next.length - 1] = { role: 'assistant', content }
    return next
  })

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages((current) => [...current, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)
    try {
      if (!CHAT_API_URL) {
        let response = ''
        for (const word of getMockResponse(text).split(' ')) {
          response += `${word} `
          updateLastAssistant(response)
          await new Promise((resolve) => setTimeout(resolve, 24))
        }
        return
      }
      const response = await fetch(CHAT_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }),
      })
      if (!response.ok) throw new Error('Failed to get response')
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is empty')
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let remainder = ''
      const consumeEvent = (event: string) => {
        const data = event.slice(6)
        if (data === '[DONE]') return
        const parsed = JSON.parse(data)
        if (parsed.response) { assistantMessage += parsed.response; updateLastAssistant(assistantMessage) }
      }
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const split = splitSseEvents(remainder, decoder.decode(value, { stream: true }))
        remainder = split.remainder
        split.events.forEach(consumeEvent)
      }
      const finalSplit = splitSseEvents(remainder, `${decoder.decode()}\n\n`)
      finalSplit.events.forEach(consumeEvent)
      if (!assistantMessage.trim()) throw new Error('Response stream completed without an answer')
    } catch (error) {
      console.error('Chat error:', error)
      updateLastAssistant('Xin lỗi, có lỗi xảy ra. Thử lại nhé!')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <DossierHeader eyebrow="Bàn hỏi mở" folio="TP / BRAIN2 / 01" title="Đem tình huống thật vào đây." description="AI chỉ trả lời khác khi nó nhận được đủ bối cảnh. Hãy nói điều bạn đang làm, thứ đã thử và chỗ đang kẹt." />
        <section className={styles.chatDesk} aria-label="Trò chuyện với Brain2">
          <div className={styles.messages} aria-live="polite">
            {messages.length === 0 ? (
              <div className={styles.welcome}>
                <MessageCircle aria-hidden="true" size={28} />
                <h2>Bắt đầu từ một câu hỏi có bối cảnh</h2>
                <div className={styles.suggestions}>
                  {suggestedQuestions.map((question) => <button key={question} type="button" onClick={() => sendMessage(question)} disabled={loading}>{question}</button>)}
                </div>
                <Link href="/diagnostic">Chưa biết hỏi gì? Làm bài chẩn đoán trước</Link>
              </div>
            ) : messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`${styles.message} ${styles[message.role]}`}>
                <span>{message.role === 'assistant' ? 'TP' : 'Bạn'}</span>
                <p>{message.content || (loading && index === messages.length - 1 ? 'Đang đọc bối cảnh…' : '')}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className={styles.inputArea} onSubmit={(event) => { event.preventDefault(); sendMessage(input) }}>
            <label htmlFor="brain2-question">Tình huống của bạn</label>
            <div><input id="brain2-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tui đang làm…, đã thử…, nhưng đang kẹt ở…" disabled={loading} /><button type="submit" disabled={loading || !input.trim()} aria-label="Gửi câu hỏi"><ArrowUp aria-hidden="true" /></button></div>
          </form>
        </section>
      </div>
    </div>
  )
}
