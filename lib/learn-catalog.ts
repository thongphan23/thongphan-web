export type LearnCourseAccess = 'free' | 'coming-paid'

export type LearnCourse = {
  slug: 'ai-foundation' | 'prompt-thinking' | 'evaluate-verify'
  title: string
  eyebrow: string
  promise: string
  description: string
  access: LearnCourseAccess
  priceLabel: string
  duration: string
  lessonCount: number
  artifact: string
  image: string
  outcomes: string[]
  syllabus: Array<{ title: string; detail: string }>
}

export const LEARN_APP_URL =
  process.env.NEXT_PUBLIC_LEARN_APP_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5174' : 'https://learn.thongphan.com')

export const learnCourses: LearnCourse[] = [
  {
    slug: 'ai-foundation',
    title: 'AI Foundation',
    eyebrow: 'Khóa nền tảng · miễn phí toàn bộ',
    promise: 'Biết giao đúng việc cho AI, viết yêu cầu rõ và kiểm chứng đầu ra trước khi dùng.',
    description: 'Khóa nhập môn dành cho người đi làm đang dùng AI rời rạc hoặc chưa biết bắt đầu từ đâu.',
    access: 'free',
    priceLabel: 'Miễn phí',
    duration: '2 tuần · 15 phút/ngày',
    lessonCount: 18,
    artifact: 'Bộ prompt công việc đầu tiên',
    image: '/images/learn/course-ai-foundation.jpg',
    outcomes: [
      'Chọn đúng việc nên và không nên giao cho AI.',
      'Tách yêu cầu mơ hồ thành vai trò, bối cảnh, mục tiêu và định dạng.',
      'Nhận ra câu trả lời thiếu bằng chứng hoặc có rủi ro trước khi dùng.',
    ],
    syllabus: [
      { title: 'Chặng 1 · Giao việc rõ', detail: '4 bài học, 1 luyện tập, 1 thử thách ứng dụng.' },
      { title: 'Chặng 2 · Kiểm chứng', detail: 'Đối chiếu nguồn, tìm khoảng trống và sửa đầu ra.' },
      { title: 'Tác phẩm', detail: 'Một bộ prompt có tiêu chí kiểm tra cho công việc thật.' },
    ],
  },
  {
    slug: 'prompt-thinking',
    title: 'Prompt Thinking',
    eyebrow: 'Khóa nâng cấp · sắp mở',
    promise: 'Biến vấn đề công việc thành cấu trúc AI có thể thực thi và lặp lại.',
    description: 'Dành cho người đã hoàn thành AI Foundation và muốn đi từ prompt lẻ sang cách nghĩ có hệ thống.',
    access: 'coming-paid',
    priceLabel: 'Trả phí một lần · sắp mở',
    duration: '3 tuần · 15 phút/ngày',
    lessonCount: 24,
    artifact: 'Prompt playbook theo vai trò',
    image: '/images/learn/cat-celebration-major.jpg',
    outcomes: [
      'Phân rã bài toán trước khi viết prompt.',
      'Thiết kế scaffold, ví dụ và tiêu chí đầu ra.',
      'Tạo prompt có thể bàn giao cho đồng đội.',
    ],
    syllabus: [
      { title: 'Từ việc sang cấu trúc', detail: 'Requirement, context, constraint và success criteria.' },
      { title: 'Từ prompt sang quy trình', detail: 'Chuỗi bước, checkpoint và cách sửa có bằng chứng.' },
      { title: 'Tác phẩm', detail: 'Một playbook dùng lại được cho công việc chính.' },
    ],
  },
  {
    slug: 'evaluate-verify',
    title: 'Evaluate & Verify',
    eyebrow: 'Khóa nâng cấp · sắp mở',
    promise: 'Kiểm chứng câu trả lời AI trước khi nó đi vào nội dung, dữ liệu hoặc quyết định.',
    description: 'Dành cho người thường xuyên dùng đầu ra AI và cần một lớp judgment đáng tin cậy.',
    access: 'coming-paid',
    priceLabel: 'Trả phí một lần · sắp mở',
    duration: '3 tuần · 15 phút/ngày',
    lessonCount: 24,
    artifact: 'Bộ tiêu chí đánh giá đầu ra AI',
    image: '/images/learn/cat-profile-badge.jpg',
    outcomes: [
      'Phân biệt độ trôi chảy với độ đúng.',
      'Thiết kế rubric và kiểm tra chéo bằng nguồn.',
      'Xác định khi nào cần người chịu trách nhiệm cuối.',
    ],
    syllabus: [
      { title: 'Nhìn lỗi có hệ thống', detail: 'Claim, evidence, uncertainty và missing context.' },
      { title: 'Kiểm tra trước khi dùng', detail: 'Rubric, source check và human decision boundary.' },
      { title: 'Tác phẩm', detail: 'Một checklist kiểm chứng cho đầu ra công việc thật.' },
    ],
  },
]

export function getLearnCourse(slug: string): LearnCourse | undefined {
  return learnCourses.find((course) => course.slug === slug)
}

export function buildLearnAppUrl(params: Record<string, string> = {}): string {
  const url = new URL(LEARN_APP_URL)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url.toString()
}

export function buildCourseStructuredData(course: LearnCourse) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.promise,
    provider: {
      '@type': 'Organization',
      name: 'Thông Phan',
      sameAs: 'https://thongphan.com',
    },
    isAccessibleForFree: course.access === 'free',
    inLanguage: 'vi-VN',
    url: `https://thongphan.com/learn/courses/${course.slug}`,
  }
}
