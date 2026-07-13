export type ExperienceType = 'article' | 'diagnostic' | 'guided-practice' | 'challenge' | 'course' | 'tool-trial'
export type ExperienceAvailability = 'always' | 'learn-public'
export type ExperienceAccess = 'public' | 'mixed'
export type ExperienceStatus = 'draft' | 'published' | 'retired'

export type ExperienceDefinition = Readonly<{
  id: string
  version: `${number}.${number}.${number}`
  type: ExperienceType
  status: ExperienceStatus
  availability: ExperienceAvailability
  href: string
  title: string
  promise: string
  audience: string
  problem: string
  durationLabel: string
  output: string
  ctaLabel: string
  access: Readonly<{ kind: ExperienceAccess; label: string }>
  media: Readonly<{
    src: string
    alt: string
    width: number
    height: number
    fit: 'cover' | 'contain'
    position: string
    source: 'owned' | 'generated'
    rights: 'owned-archive' | 'generated-for-thongphan'
  }>
}>

export const experiences: readonly ExperienceDefinition[] = [
  {
    id: 'expertise-asset-map',
    version: '1.0.0',
    type: 'diagnostic',
    status: 'published',
    availability: 'always',
    href: '/diagnostic',
    title: 'Bản đồ tài sản chuyên môn của bạn',
    promise: 'Nhìn rõ mình đang có nguyên liệu gì và đang kẹt ở bước nào trước khi chọn khóa học hay công cụ.',
    audience: 'Người có kinh nghiệm thật nhưng chưa biết nên biến nó thành nội dung, tài sản hay sản phẩm nào trước.',
    problem: 'Chuyên môn còn nằm rời rạc trong đầu nên mỗi lần làm content hoặc sản phẩm đều phải bắt đầu lại.',
    durationLabel: '5–7 phút',
    output: 'Một chẩn đoán vị trí hiện tại và bước nên làm tiếp theo trong hệ sinh thái.',
    ctaLabel: 'Tự soi vị trí',
    access: { kind: 'public', label: 'Miễn phí · Không cần tài khoản' },
    media: {
      src: '/images/homepage/thong-library-author.jpg',
      alt: 'Thông Phan ngồi trong không gian thư viện với những tài liệu đã xuất bản',
      width: 960,
      height: 960,
      fit: 'contain',
      position: '50% 50%',
      source: 'owned',
      rights: 'owned-archive',
    },
  },
  {
    id: 'brain2-21-days',
    version: '1.0.0',
    type: 'challenge',
    status: 'published',
    availability: 'always',
    href: '/brain2/21-ngay',
    title: '21 ngày xây Brain2 từ kinh nghiệm thật',
    promise: 'Gom kinh nghiệm, ca thật và góc nhìn riêng thành một nền tri thức mà AI có thể hiểu và hỗ trợ.',
    audience: 'Người muốn xây hệ thống tri thức cá nhân đủ sâu để tạo content và tài sản từ trải nghiệm của mình.',
    problem: 'Ghi chú, câu chuyện và bằng chứng đang phân tán nên AI chỉ tạo ra những câu trả lời chung chung.',
    durationLabel: '21 ngày',
    output: 'Một nền Brain2 có nguyên liệu thật, liên kết rõ và nhịp tạo đầu ra có thể tiếp tục.',
    ctaLabel: 'Bắt đầu Ngày 01',
    access: { kind: 'mixed', label: 'Tuần 1 miễn phí · Tuần 2–3 cần quyền Conan Maker' },
    media: {
      src: '/images/challenges/brain2-21-day-editorial-slate-v1.webp',
      alt: 'Lịch thực hành giấy, bút chì và bảng slate phim cho thử thách Brain2 21 ngày',
      width: 1200,
      height: 675,
      fit: 'contain',
      position: '50% 50%',
      source: 'generated',
      rights: 'generated-for-thongphan',
    },
  },
  {
    id: 'ai-foundation',
    version: '1.0.0',
    type: 'course',
    status: 'published',
    availability: 'learn-public',
    href: '/learn/free',
    title: 'AI Foundation cho người đi làm',
    promise: 'Học cách kiểm tra và sử dụng AI như một năng lực nghề nghiệp thay vì ghi nhớ thêm một danh sách công cụ.',
    audience: 'Người đi làm đang dùng AI rời rạc và cần một nền tảng tương tác có thể áp dụng vào công việc thật.',
    problem: 'Biết nhiều tool nhưng chưa có cách đánh giá output, đặt bài toán và chuyển kiến thức thành hành động.',
    durationLabel: 'Bài học tương tác',
    output: 'Một nền tư duy sử dụng AI có bằng chứng học tập và Tác phẩm áp dụng vào công việc.',
    ctaLabel: 'Học phần miễn phí',
    access: { kind: 'public', label: 'Mở khi Learn public' },
    media: {
      src: '/images/learn/course-ai-foundation.jpg',
      alt: 'Minh họa khóa AI Foundation trong thế giới học tập của Thông Phan Learn',
      width: 930,
      height: 797,
      fit: 'contain',
      position: '50% 50%',
      source: 'generated',
      rights: 'generated-for-thongphan',
    },
  },
]

export function getPublishedExperiences({ includeLearn }: { includeLearn: boolean }): readonly ExperienceDefinition[] {
  return experiences.filter((experience) =>
    experience.status === 'published'
      && (
        experience.availability === 'always'
        || (experience.availability === 'learn-public' && includeLearn)
      ),
  )
}
