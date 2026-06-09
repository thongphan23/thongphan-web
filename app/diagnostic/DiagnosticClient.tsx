'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GardenSignature } from '@/components/GardenSignature'
import styles from './page.module.css'

type DiagnosticCta = {
  label: string
  href: string
  primary?: boolean
  external?: boolean
}

type DiagnosticLevel = {
  min: number
  no: string
  name: string
  title: string
  diagnosis: string
  stuck: string
  next: string
  ctas: DiagnosticCta[]
}

const questions = [
  {
    id: 'usage',
    question: 'Bạn đang dùng AI vào việc gì nhiều nhất?',
    options: [
      { label: 'Hỏi đáp lẻ tẻ, viết email, tóm tắt', score: 1 },
      { label: 'Tạo nội dung, dàn ý, ý tưởng, hình ảnh', score: 2 },
      { label: 'Có quy trình cố định cho công việc của mình', score: 3 },
      { label: 'Đã dùng AI để tạo tài liệu kéo khách, sản phẩm hoặc phễu bán', score: 4 },
    ],
  },
  {
    id: 'knowledge',
    question: 'Kiến thức chuyên môn của bạn đang được hệ thống hóa tới đâu?',
    options: [
      { label: 'Nằm trong đầu là chính', score: 1 },
      { label: 'Có ghi chú/tài liệu nhưng rời rạc', score: 2 },
      { label: 'Có phân loại, có khung tư duy, có ca thật', score: 3 },
      { label: 'Có kho tri thức dùng được với AI', score: 4 },
    ],
  },
  {
    id: 'content',
    question: 'Bạn đã biến chuyên môn thành nội dung kéo khách chưa?',
    options: [
      { label: 'Chưa, thỉnh thoảng mới đăng', score: 1 },
      { label: 'Có đăng nhưng chưa đều và chưa ra lead', score: 2 },
      { label: 'Có vài định dạng hiệu quả, có người hỏi mua/tư vấn', score: 3 },
      { label: 'Có hệ thống nội dung và biết bài nào tạo tiền', score: 4 },
    ],
  },
  {
    id: 'asset',
    question: 'Bạn có tài sản số nào từ kiến thức của mình chưa?',
    options: [
      { label: 'Chưa có gì rõ ràng', score: 1 },
      { label: 'Có checklist hoặc mẫu nhỏ', score: 2 },
      { label: 'Có tài liệu kéo khách, buổi thực hành hoặc khóa nhỏ', score: 3 },
      { label: 'Có lời mời mua, sản phẩm số hoặc phễu đang bán', score: 4 },
    ],
  },
  {
    id: 'safety',
    question: 'Dòng tiền thứ 2 của bạn đang ở mức nào?',
    options: [
      { label: 'Chưa có, mới nghĩ tới', score: 1 },
      { label: 'Có cơ hội lẻ tẻ nhưng chưa ổn định', score: 2 },
      { label: 'Có doanh thu phụ nhưng chưa đủ an toàn', score: 3 },
      { label: 'Đang tiến gần mức có thể lựa chọn nghỉ/chuyển hướng', score: 4 },
    ],
  },
]

const scanSignals = [
  ['01', 'Task AI', 'prompt lẻ'],
  ['02', 'Content', 'output bắt đầu có lực'],
  ['03', 'Brain2', 'tri thức được nối lại'],
  ['04', 'Asset', 'đóng gói thành tài sản'],
  ['05', 'Conan', 'thực hành có phản hồi'],
]

const levels: DiagnosticLevel[] = [
  {
    min: 0,
    no: '01',
    name: 'Task AI',
    title: 'Tầng 1, Task AI',
    diagnosis: 'Bạn đang dùng AI như trợ lý việc vặt. Có ích, nhưng chưa tạo lợi thế nghề nghiệp hay tài sản riêng.',
    stuck: 'Bạn đang kẹt ở câu hỏi lẻ, prompt lẻ, đầu ra lẻ. AI giúp nhanh hơn, nhưng chưa biết chuyên môn của bạn là gì.',
    next: 'Đọc lại bài nền tảng, rồi gom 10 ca thật hoặc kinh nghiệm thật trước khi học thêm công cụ.',
    ctas: [
      { label: 'Đọc bài nền tảng', href: '/blog/ai-khong-cuop-viec-ban', primary: true },
      { label: 'Hỏi Brain2', href: '/chat' },
    ],
  },
  {
    min: 9,
    no: '02',
    name: 'Content Leverage',
    title: 'Tầng 2, Content Leverage',
    diagnosis: 'Bạn đã bắt đầu dùng AI để tạo nội dung hoặc đầu ra. Đây là bước tốt, nhưng chưa đủ để tạo tài sản.',
    stuck: 'Bạn đang kẹt ở chỗ có nội dung nhưng chưa có hệ thống chứng minh chuyên môn, kéo khách và tái sử dụng tri thức.',
    next: 'Chọn 3 chủ đề bạn có trải nghiệm thật, rồi biến mỗi chủ đề thành một bài có proof, câu chuyện và lời mời rõ.',
    ctas: [
      { label: 'Đọc cách content kéo khách', href: '/blog/40-bai-viral-tui-hoc-duoc-gi', primary: true },
      { label: 'Bắt đầu 21 ngày Brain2', href: '/challenges/brain2-21-ngay' },
    ],
  },
  {
    min: 13,
    no: '03',
    name: 'Brain2 Base',
    title: 'Tầng 3, Brain2 Base',
    diagnosis: 'Bạn đã có nền chuyên môn và bắt đầu thấy cần một Brain2. Đây là đoạn chuyển từ biết nhiều sang dùng được.',
    stuck: 'Bạn đang kẹt ở khâu nối tri thức: ghi chú, ca thật, góc nhìn, nội dung và AI chưa chảy thành một hệ thống.',
    next: 'Xây nền Brain2 đủ dùng: gom tri thức, tách ý một ý, nối với case thật, rồi dùng AI trên kho đó.',
    ctas: [
      { label: 'Kích hoạt 21 ngày Brain2', href: '/challenges/brain2-21-ngay', primary: true },
      { label: 'Đọc bài Brain2', href: '/blog/xay-brain2-voi-obsidian' },
    ],
  },
  {
    min: 17,
    no: '04',
    name: 'Digital Asset',
    title: 'Tầng 4, Digital Asset',
    diagnosis: 'Bạn đã có khả năng biến chuyên môn thành tài sản số. Đoạn này bắt đầu cần thị trường, phản hồi và chuyển đổi.',
    stuck: 'Bạn đang kẹt ở việc đóng gói: tài liệu, lời mời mua, phễu, assistant hoặc sản phẩm nhỏ chưa có nhịp thử thật.',
    next: 'Đưa một tài sản ra môi trường có phản hồi: nội dung kéo khách, workshop nhỏ, tài liệu chẩn đoán hoặc offer thử.',
    ctas: [
      { label: 'Vào Conan Maker', href: 'https://com.conan.school', external: true, primary: true },
      { label: 'Chat để chọn tài sản đầu tiên', href: '/chat' },
    ],
  },
  {
    min: 19,
    no: '05',
    name: 'Conan Ready',
    title: 'Tầng 5, Conan Ready',
    diagnosis: 'Bạn đã có nền đủ rõ để bước vào môi trường thực hành sâu. Lúc này học thêm một mình sẽ chậm.',
    stuck: 'Bạn không còn kẹt ở kiến thức. Bạn kẹt ở nhịp thực thi, phản hồi, tiêu chuẩn đầu ra và cộng đồng cùng làm thật.',
    next: 'Vào Conan Maker để tiếp tục nhịp thực hành, nhận góp ý và giữ accountability dài hạn.',
    ctas: [
      { label: 'Vào Conan Maker', href: 'https://com.conan.school', external: true, primary: true },
      { label: 'Hỏi Brain2 trước', href: '/chat' },
    ],
  },
]

function getLevel(score: number) {
  return [...levels].reverse().find((level) => score >= level.min) ?? levels[0]
}

export default function DiagnosticClient() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const completed = Object.keys(answers).length === questions.length
  const score = useMemo(() => Object.values(answers).reduce((sum, value) => sum + value, 0), [answers])
  const level = getLevel(score)
  const answeredCount = Object.keys(answers).length
  const completionPercent = Math.round((answeredCount / questions.length) * 100)
  const scorePercent = completed ? Math.round((score / 20) * 100) : completionPercent

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroShell}>
            <div className={styles.heroInner} data-reveal>
              <span className={styles.eyebrow}>Bảng chẩn đoán năng lực AI</span>
              <h1>Bạn đang ở tầng nào trong hành trình biến kiến thức thành dòng tiền?</h1>
              <p>
                Trả lời 5 câu. Tui sẽ cho bạn biết nên bắt đầu từ việc vặt, nội dung, Brain2, tài sản số hay Conan Maker.
              </p>
              <GardenSignature variant="gate" eyebrow="Diagnostic gate" title="Bài quét là cánh cổng xác định nên tưới phần rễ nào trước." compact />
            </div>

            <div className={styles.diagnosticStage} aria-hidden="true" data-reveal="right">
              <div className={styles.scanHalo} />
              <div className={styles.scanPanel}>
                <div className={styles.scanTop}>
                  <span>AI Expertise Scan</span>
                  <span>{completed ? level.name : `${answeredCount}/5 tín hiệu`}</span>
                </div>
                <div className={styles.scanCore}>
                  <strong>{completed ? level.no : '??'}</strong>
                  <span>{completed ? level.name : 'Đang quét nền chuyên môn'}</span>
                </div>
                <div className={styles.scanSignals}>
                  {scanSignals.map(([no, label, meta], index) => (
                    <span
                      key={label}
                      className={completed && no === level.no ? styles.signalActive : ''}
                      style={{ '--i': index } as CSSProperties}
                    >
                      <b>{no}</b>
                      <small>{label}</small>
                      <em>{meta}</em>
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.scanShadow} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.diagnostic}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.questions}>
              {questions.map((item, index) => (
                <article
                  key={item.id}
                  className={`${styles.questionCard} ${answers[item.id] ? styles.answered : ''}`}
                  data-reveal
                >
                  <div className={styles.questionTop}>
                    <span>0{index + 1}</span>
                    <h2>{item.question}</h2>
                  </div>
                  <div className={styles.options}>
                    {item.options.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        className={answers[item.id] === option.score ? styles.selected : ''}
                        onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: option.score }))}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className={styles.result} data-reveal="right">
              <span className={styles.resultLabel}>{completed ? 'Kết quả của bạn' : 'Tiến độ'}</span>
              <div className={styles.score}>{completed ? level.no : `${Object.keys(answers).length}/${questions.length}`}</div>
              <div
                className={styles.resultMeter}
                aria-label={completed ? 'Điểm chẩn đoán' : 'Tiến độ hoàn thành'}
                style={{ '--progress': `${scorePercent}%` } as CSSProperties}
              >
                <span />
              </div>
              <div className={styles.resultPath} aria-label="5 tầng trưởng thành AI">
                {levels.map((item) => (
                  <div
                    key={item.name}
                    className={`${styles.pathItem} ${completed && item.name === level.name ? styles.pathActive : ''}`}
                  >
                    <span>{item.no}</span>
                    <strong>{item.name}</strong>
                  </div>
                ))}
              </div>
              {completed ? (
                <>
                  <h2>{level.title}</h2>
                  <p>{level.diagnosis}</p>
                  <div className={styles.stuckBox}>
                    <strong>Đang kẹt ở đâu:</strong>
                    <span>{level.stuck}</span>
                  </div>
                  <div className={styles.nextBox}>
                    <strong>Bước tiếp theo:</strong>
                    <span>{level.next}</span>
                  </div>
                  <div className={styles.resultActions}>
                    {level.ctas.map((cta) => (
                      cta.external ? (
                        <a
                          key={cta.label}
                          href={cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cta.primary ? 'btn-primary' : 'btn-outline'}
                        >
                          {cta.label}
                        </a>
                      ) : (
                        <Link
                          key={cta.label}
                          href={cta.href}
                          className={cta.primary ? 'btn-primary' : 'btn-outline'}
                        >
                          {cta.label}
                        </Link>
                      )
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  Chọn câu trả lời gần nhất với hiện trạng thật. Đừng chọn câu nghe hay nhất, vì mục tiêu là biết nên bắt đầu ở đâu.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
