export type ExperienceAnswer = 'under-3' | '3-5' | 'over-5'
export type StuckAnswer = 'proof' | 'asset' | 'community'
export type StartAnswer = 'content' | 'asset' | 'community'

export type MirrorAnswers = {
  experience: ExperienceAnswer
  stuck: StuckAnswer
  start: StartAnswer
}

export type MirrorResult = {
  category: StuckAnswer
  title: string
  explanation: string
  href: '/library' | '/diagnostic' | '/conanmaker'
  cta: string
}

const resultByStuck: Record<StuckAnswer, Pick<MirrorResult, 'title'>> = {
  proof: { title: 'Cần làm rõ bằng chứng' },
  asset: { title: 'Cần đóng gói tài sản đầu tiên' },
  community: { title: 'Sẵn sàng thiết kế offer/cộng đồng' },
}

const experienceLead: Record<ExperienceAnswer, string> = {
  'under-3': 'Bạn đang ở giai đoạn gom những ca thực chiến đầu tiên.',
  '3-5': 'Bạn đã có đủ trải nghiệm để bắt đầu nhìn ra một phương pháp riêng.',
  'over-5': 'Với hơn 5 năm trong nghề, phần khó không còn là biết thêm mà là chọn đúng thứ để đóng gói.',
}

const resultExplanation: Record<StuckAnswer, string> = {
  proof: 'Hãy chọn những ca thật, quyết định thật và kết quả thật để người khác nhìn thấy năng lực của bạn.',
  asset: 'Hãy biến một phần chuyên môn thành thứ nhỏ, cụ thể và có thể dùng được trước khi làm một hệ thống lớn.',
  community: 'Bạn đã có nền để gom người cùng vấn đề vào một offer có nhịp triển khai, phản hồi và cam kết rõ.',
}

const destinationByStart: Record<StartAnswer, Pick<MirrorResult, 'href' | 'cta'>> = {
  content: { href: '/library', cta: 'Đi vào thư viện theo lộ trình này' },
  asset: { href: '/diagnostic', cta: 'Làm bản chẩn đoán đầy đủ' },
  community: { href: '/conanmaker', cta: 'Xem môi trường Conan Maker' },
}

export function resolveMirrorResult(answers: MirrorAnswers): MirrorResult {
  const result = resultByStuck[answers.stuck]
  const destination = destinationByStart[answers.start]

  return {
    category: answers.stuck,
    title: result.title,
    explanation: `${experienceLead[answers.experience]} ${resultExplanation[answers.stuck]}`,
    ...destination,
  }
}

export const proofItems = [
  {
    slug: 'thuc-chien-tren-san-khau',
    image: '/images/homepage/thong-stage-anchor.jpg',
    alt: 'Thông Phan cầm micro chia sẻ trước khán giả tại một sự kiện kinh doanh.',
    frame: '01',
    title: 'Chuyên môn phải đi qua thực chiến',
    source: 'Ảnh tư liệu sự kiện',
    proof: 'Điều này chứng minh gì? Những điều được chia sẻ đến từ công việc đã làm và những vấn đề đã trực tiếp đứng lớp.',
    href: '/about',
    linkLabel: 'Đọc câu chuyện của Thông',
  },
  {
    slug: 'tri-thuc-thanh-cuon-sach',
    image: '/images/homepage/thong-library-author.jpg',
    alt: 'Thông Phan cầm cuốn sách Thần thoại Hy Lạp của mình tại một hiệu sách.',
    frame: '02',
    title: 'Tri thức phải thành thứ cầm được trên tay',
    source: 'Ảnh tác giả tại hiệu sách',
    proof: 'Điều này chứng minh gì? Một mảng nghiên cứu có thể được hệ thống hóa thành tài sản cụ thể để người khác đọc và sử dụng.',
    href: '/library',
    linkLabel: 'Khám phá thư viện sống',
  },
] as const

export const methodSteps = [
  ['01', 'Chuyên môn', 'Chọn phần kinh nghiệm bạn đã thật sự trả giá để có.'],
  ['02', 'Bằng chứng', 'Đưa ca thật, quyết định thật và kết quả thật ra ánh sáng.'],
  ['03', 'Tài sản', 'Đóng gói một phần giá trị thành thứ người khác có thể dùng.'],
  ['04', 'Offer', 'Gắn tài sản vào một lời hứa, phạm vi và cách triển khai rõ.'],
  ['05', 'Cộng đồng', 'Tạo môi trường để nhiều người cùng tiến bộ bằng một nhịp chung.'],
] as const

export const pathItems = [
  {
    slug: 'chua-biet-bat-dau',
    index: '01',
    title: 'Tôi chưa biết nên bắt đầu từ đâu',
    body: 'Xác định phần nào trong chuyên môn của bạn đang kẹt và bước đầu tiên đáng làm.',
    href: '/diagnostic',
    cta: 'Bắt đầu bằng chẩn đoán',
  },
  {
    slug: 'bien-kien-thuc-thanh-tai-san',
    index: '02',
    title: 'Tôi muốn biến kiến thức thành tài sản',
    body: 'Đi theo một đường đọc ngắn để chọn đúng dạng tài sản thay vì làm thêm nội dung rời rạc.',
    href: '/library',
    cta: 'Mở lộ trình trong thư viện',
  },
  {
    slug: 'xay-cong-dong-tra-phi',
    index: '03',
    title: 'Tôi đã sẵn sàng xây cộng đồng trả phí',
    body: 'Bước vào môi trường triển khai dài hạn khi bạn đã có chuyên môn, bằng chứng và một hướng offer.',
    href: '/conanmaker',
    cta: 'Đi đến Conan Maker',
  },
] as const

export const mirrorQuestions = {
  experience: {
    legend: 'Bạn đã có chuyên môn được bao lâu?',
    options: [
      ['under-3', 'Dưới 3 năm'],
      ['3-5', '3–5 năm'],
      ['over-5', 'Trên 5 năm'],
    ],
  },
  stuck: {
    legend: 'Thứ gì đang mắc kẹt trong đầu mà chưa thành tài sản?',
    options: [
      ['proof', 'Chưa có bằng chứng rõ'],
      ['asset', 'Có bằng chứng nhưng chưa đóng gói'],
      ['community', 'Đã có tài sản nhưng chưa thành offer/cộng đồng'],
    ],
  },
  start: {
    legend: 'Bạn muốn bắt đầu bằng gì?',
    options: [
      ['content', 'Nội dung'],
      ['asset', 'Tài sản đầu tiên'],
      ['community', 'Cộng đồng trả phí'],
    ],
  },
} as const
