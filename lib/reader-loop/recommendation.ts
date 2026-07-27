export const READER_LOOP_POLICY_VERSION = 'reader-loop-rules-v0.1.0'

export const SAMPLE_QUESTIONS = [
  { id: 'expertise_asset', label: 'Tôi có chuyên môn nhưng chưa biết biến nó thành tài sản hoặc thu nhập.' },
  { id: 'learning_output', label: 'Tôi học và nghiên cứu nhiều nhưng chưa tạo ra kết quả thực tế.' },
  { id: 'content_customers', label: 'Nội dung của tôi ít được quan tâm và không tạo ra khách hàng.' },
  { id: 'ai_overload', label: 'Tôi muốn dùng AI nhưng đang quá tải công cụ và kiến thức.' },
  { id: 'second_income', label: 'Tôi muốn tạo nguồn thu thứ hai mà không rời công việc hiện tại.' },
] as const

export type SampleQuestionId = (typeof SAMPLE_QUESTIONS)[number]['id']

export interface ReaderLoopContent {
  id: string
  slug: string
  url: `/library/${string}`
  title: string
  problem: string
  topic: string
  readerStage: string
  expectedOutcome: string
  prerequisite: string
  possibleNextActions: string[]
  active: true
  keywords: string[]
}

export const READER_LOOP_CONTENT: ReaderLoopContent[] = [
  {
    id: 'expertise-asset-map',
    slug: 'tai-san-so-cua-nguoi-co-chuyen-mon',
    url: '/library/tai-san-so-cua-nguoi-co-chuyen-mon',
    title: 'Tài sản số của người có chuyên môn',
    problem: 'Có chuyên môn nhưng chưa biết đóng gói thành một đầu ra có người dùng.',
    topic: 'Tài sản tri thức',
    readerStage: 'problem-aware',
    expectedOutcome: 'Phân biệt chuyên môn, tài sản và offer để chọn một vật thể nhỏ có thể làm trước.',
    prerequisite: 'Không có.',
    possibleNextActions: ['Chọn một tài sản nhỏ để kiểm chứng', 'Audit chuyên môn hiện có'],
    active: true,
    keywords: ['chuyên môn', 'tài sản', 'sản phẩm', 'thu nhập', 'kiến thức'],
  },
  {
    id: 'expertise-system-map',
    slug: 'cau-truc-chuyen-mon-he-thong-ai-dong-tien-thu-hai',
    url: '/library/cau-truc-chuyen-mon-he-thong-ai-dong-tien-thu-hai',
    title: 'Cấu trúc chuyên môn, hệ thống AI, dòng tiền thứ hai',
    problem: 'Chưa thấy mối nối giữa điều mình biết, hệ thống làm việc và nguồn thu thứ hai.',
    topic: 'Hệ thống chuyên môn',
    readerStage: 'unclear',
    expectedOutcome: 'Nhìn rõ chuỗi chuyên môn → hệ thống → tài sản → dòng tiền để chọn đúng điểm bắt đầu.',
    prerequisite: 'Không có.',
    possibleNextActions: ['Viết ra chuyên môn đã trả giá để có', 'Chọn một vấn đề nhỏ để phục vụ'],
    active: true,
    keywords: ['dòng tiền', 'thu nhập', 'công việc', 'chuyên môn', 'hệ thống'],
  },
  {
    id: 'note-system',
    slug: 'cau-truc-note-song',
    url: '/library/cau-truc-note-song',
    title: 'Cấu trúc note sống',
    problem: 'Học nhiều nhưng tri thức nằm rời rạc và chưa đi vào một đầu ra thực tế.',
    topic: 'Học và chuyển hóa',
    readerStage: 'problem-aware',
    expectedOutcome: 'Biến việc ghi chép thành một nhịp tạo nguyên liệu có thể dùng lại và làm ra đầu ra.',
    prerequisite: 'Có ít nhất một chủ đề đang học hoặc làm.',
    possibleNextActions: ['Tạo một note sống từ việc đang làm', 'Nối note với một đầu ra cụ thể'],
    active: true,
    keywords: ['học', 'nghiên cứu', 'ghi chú', 'note', 'kết quả', 'đầu ra', 'brain2'],
  },
  {
    id: 'content-patterns',
    slug: '40-bai-viral-80k-shares-doc-nhu-du-lieu',
    url: '/library/40-bai-viral-80k-shares-doc-nhu-du-lieu',
    title: 'Đọc bài lan rộng như dữ liệu',
    problem: 'Nội dung thiếu dấu hiệu thu hút đúng người và chưa tạo được mối nối tới khách hàng.',
    topic: 'Content kéo khách',
    readerStage: 'problem-aware',
    expectedOutcome: 'Biết cách đọc lại nội dung đã ra thị trường để tìm mẫu lặp lại thay vì đoán mẹo viral.',
    prerequisite: 'Có ít nhất một nội dung từng xuất bản.',
    possibleNextActions: ['Bóc một bài cũ thành mẫu', 'Chọn một bằng chứng thật cho bài tiếp theo'],
    active: true,
    keywords: ['nội dung', 'content', 'khách hàng', 'viral', 'quan tâm', 'bài viết', 'thương hiệu'],
  },
  {
    id: 'ai-overload-map',
    slug: 'ban-do-bat-dau-neu-anh-em-dang-so-ai',
    url: '/library/ban-do-bat-dau-neu-anh-em-dang-so-ai',
    title: 'Bản đồ bắt đầu nếu anh em đang sợ AI',
    problem: 'Quá tải công cụ AI và chưa biết năng lực nào cần nâng trước.',
    topic: 'AI có trách nhiệm',
    readerStage: 'unclear',
    expectedOutcome: 'Bớt chạy theo công cụ và chọn một bước nền vừa sức để AI khuếch đại chuyên môn thật.',
    prerequisite: 'Không có.',
    possibleNextActions: ['Chọn một việc lặp lại để AI hỗ trợ', 'Bắt đầu một nền Brain2 nhỏ'],
    active: true,
    keywords: ['ai', 'công cụ', 'quá tải', 'sợ', 'prompt', 'chatgpt', 'automation'],
  },
  {
    id: 'expertise-audit',
    slug: 'template-audit-chuyen-mon-thanh-tai-san-so',
    url: '/library/template-audit-chuyen-mon-thanh-tai-san-so',
    title: 'Template audit chuyên môn thành tài sản số',
    problem: 'Cần một cách thực hành để chọn phần chuyên môn đáng đóng gói trước.',
    topic: 'Tài sản tri thức',
    readerStage: 'approach-understood',
    expectedOutcome: 'Hoàn thành một audit nhỏ và chọn một tài sản đầu tiên để kiểm chứng.',
    prerequisite: 'Đã gọi tên được một vùng chuyên môn hoặc trải nghiệm thật.',
    possibleNextActions: ['Điền audit chuyên môn', 'Chọn một proof để xuất bản'],
    active: true,
    keywords: ['audit', 'chuyên môn', 'tài sản', 'thực hành', 'template'],
  },
]

const samplePrimary: Record<SampleQuestionId, string> = {
  expertise_asset: 'expertise-asset-map',
  learning_output: 'note-system',
  content_customers: 'content-patterns',
  ai_overload: 'ai-overload-map',
  second_income: 'expertise-system-map',
}

const getContent = (id: string) => READER_LOOP_CONTENT.find((item) => item.id === id)!

function normalize(value: string) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
}

function scoreContent(question: string, item: ReaderLoopContent) {
  const normalized = normalize(question)
  return item.keywords.reduce((score, keyword) => score + (normalized.includes(normalize(keyword)) ? 1 : 0), 0)
}

export function recommendReading(questionId: SampleQuestionId | 'custom', questionText: string) {
  const ranked = READER_LOOP_CONTENT
    .map((item) => ({ item, score: scoreContent(questionText, item) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))

  const primary = questionId === 'custom'
    ? (ranked[0].score > 0 ? ranked[0].item : getContent('expertise-system-map'))
    : getContent(samplePrimary[questionId])
  const unknowns = questionId === 'custom' && ranked[0].score === 0
    ? ['Câu hỏi chưa khớp một nhu cầu mẫu rõ ràng.']
    : ['Chưa có phản hồi sau đọc nên đây là gợi ý để bắt đầu.']
  const alternatives = ranked
    .filter(({ item }) => item.id !== primary.id)
    .slice(0, 2)
    .map(({ item }) => item)

  return {
    policyVersion: READER_LOOP_POLICY_VERSION,
    primary,
    alternatives,
    reason: `Bài này khớp trực tiếp với vấn đề “${primary.problem}” và phù hợp khi người đọc đang ở giai đoạn ${primary.readerStage}.`,
    reasonCodes: [`problem:${primary.id}`, `stage:${primary.readerStage}`, 'access:public', 'freshness:active'],
    expectedOutcome: primary.expectedOutcome,
    unknowns,
  }
}

export function nextActionFor(contentId: string, reflectionNextStep: string) {
  const content = getContent(contentId)
  const wantsAction = /làm|thử|viết|tạo|bắt đầu|audit|chọn/i.test(reflectionNextStep)

  return wantsAction
    ? {
        type: 'do_action' as const,
        label: content.possibleNextActions[0],
        url: '/read',
        reason: 'Bước tự khai của bạn đã đủ cụ thể để chuyển từ đọc sang làm.',
        evidenceUsed: ['manual_completion', 'reflection_next_step'],
        unknowns: ['Chưa có bằng chứng hành động đã được thực hiện.'],
      }
    : {
        type: 'clarify_question' as const,
        label: 'Làm rõ bước nhỏ có thể thực hiện trong 24 giờ tới',
        url: '/read',
        reason: 'Bước dự định còn rộng, nên làm rõ trước khi đọc thêm.',
        evidenceUsed: ['manual_completion', 'reflection_next_step'],
        unknowns: ['Chưa biết điều kiện và thời gian bạn có thể dành cho bước tiếp theo.'],
      }
}
