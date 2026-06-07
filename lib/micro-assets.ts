export type MicroAssetCategory = 'ai-starter' | 'brain2' | 'content' | 'digital-asset'

export type ProfessionTrack = {
  name: string
  pain: string
  useCases: string[]
  firstWorkflow: string
}

export type MicroAsset = {
  slug: string
  title: string
  subtitle: string
  category: MicroAssetCategory
  priceVnd: number
  format: string
  estimatedTimeMinutes: number
  outcome: string
  status: 'available-soon' | 'draft' | 'planned'
  featured?: boolean
  includes: string[]
  professions: ProfessionTrack[]
  whoShouldBuy: string[]
  whoShouldNotBuy: string[]
  conanBoundary: string
  checkoutLabel: string
  checkoutUrl: string
}

export const CATEGORY_LABELS: Record<MicroAssetCategory, string> = {
  'ai-starter': 'AI Starter theo nghề',
  brain2: 'Brain2',
  content: 'Content leverage',
  'digital-asset': 'Tài sản số',
}

const checkoutUrl = 'https://m.me/thongphan.88'

const starterBoundary =
  'Bộ này giúp tự chuẩn hoá cách dùng AI ở mức cá nhân, theo đúng công việc đang làm. Nếu cần cộng đồng, feedback, accountability và roadmap biến chuyên môn thành tài sản/dòng tiền, đó là phần của Conan Maker.'

const aiStarterIncludes = [
  'Workbook hướng dẫn bắt đầu theo nghề, đi từ việc thật chứ không học tool lan man.',
  'Video ngắn đi kèm để anh em thấy cách nghĩ, cách giao việc cho AI và cách kiểm output.',
  'Prompt pack tiếng Việt có thể sửa ngay theo bối cảnh cá nhân.',
  'Checklist 7 ngày để biến AI từ trò thử nghiệm thành thói quen làm việc.',
  'Bảng kiểm chứng output để không để AI viết sai, bịa hoặc làm mất giọng người thật.',
]

const commonWhoShouldNotBuy = [
  'Người đang tìm khóa học AI chuyên sâu nhiều tuần.',
  'Người muốn feedback cá nhân hoặc mentor cầm tay chỉ việc.',
  'Người chỉ muốn danh sách tool mới nhất mà không muốn chuẩn hoá cách làm.',
  'Developer đã có workflow AI coding riêng.',
]

const aiStarterAssets: MicroAsset[] = [
  {
    slug: 'ai-starter-van-phong',
    title: 'AI Starter Cho Nhân Viên Văn Phòng',
    subtitle: 'Dùng AI để xử lý email, tài liệu, biên bản, báo cáo mà không bị rối prompt.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 75,
    outcome:
      'Người mua có một workflow rõ để biến ghi chú, tài liệu và việc lặp lại thành output gửi được trong môi trường công sở.',
    status: 'available-soon',
    featured: true,
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Nhân viên văn phòng',
        pain: 'Quá nhiều email, tài liệu, biên bản, báo cáo nhưng chưa biết giao AI việc gì cho đúng.',
        useCases: [
          'Tóm tắt tài liệu dài thành 5 ý cần quyết định.',
          'Biến ghi chú họp thành biên bản có owner/deadline.',
          'Soạn email rõ ý nhưng vẫn giữ giọng lịch sự.',
          'Tạo checklist công việc lặp lại để không quên bước.',
        ],
        firstWorkflow: 'Ghi chú thô → AI sắp xếp → người kiểm chứng → gửi/tạo task.',
      },
    ],
    whoShouldBuy: [
      'Nhân viên văn phòng mới dùng AI, đang bị ngợp vì việc lặp lại và tài liệu rời rạc.',
      'Người muốn một vòng làm việc rõ: đưa ngữ cảnh, nhận bản nháp, kiểm chứng, rồi mới gửi.',
      'Người cần dùng AI để đỡ mất thời gian nhưng vẫn giữ chất lượng công việc.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-giao-vien-giang-vien',
    title: 'AI Starter Cho Giáo Viên / Giảng Viên',
    subtitle: 'Soạn bài, tạo hoạt động, câu hỏi và worksheet mà không làm bài dạy bị generic.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Người mua biết dùng AI để biến mục tiêu bài học thành hoạt động lớp, câu hỏi kiểm tra và worksheet thực hành.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Giáo viên / giảng viên',
        pain: 'Muốn dùng AI để soạn bài, tạo hoạt động, cá nhân hoá học viên nhưng sợ bài dạy bị generic.',
        useCases: [
          'Biến mục tiêu bài học thành outline 45-90 phút.',
          'Tạo ví dụ gần đời sống học viên thay vì ví dụ sách giáo khoa.',
          'Soạn câu hỏi kiểm tra hiểu bài theo nhiều mức độ.',
          'Chuyển một bài giảng thành worksheet thực hành.',
        ],
        firstWorkflow: 'Mục tiêu học tập → hoạt động lớp → câu hỏi kiểm tra → worksheet.',
      },
    ],
    whoShouldBuy: [
      'Giáo viên, giảng viên hoặc mentor muốn dùng AI để chuẩn bị bài nhanh hơn.',
      'Người sợ AI làm bài dạy mất chất người dạy và muốn có checklist kiểm chứng.',
      'Người cần ví dụ, hoạt động, câu hỏi và worksheet sát người học hơn.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-marketing-content',
    title: 'AI Starter Cho Marketing / Content',
    subtitle: 'Dùng AI để đào insight, tạo hook, dựng outline và rewrite mà không mất trải nghiệm thật.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Người mua có workflow biến trải nghiệm, feedback và quan điểm chuyên môn thành bài nháp có chất riêng hơn.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Marketing / content',
        pain: 'Dùng AI viết nhanh hơn nhưng output dễ giống người khác, thiếu insight và thiếu trải nghiệm thật.',
        useCases: [
          'Đào insight từ trải nghiệm/case thật.',
          'Tạo 10 góc hook từ một quan điểm chuyên môn.',
          'Biến feedback khách hàng thành ý tưởng bài viết.',
          'Rewrite bài cho rõ hơn mà không làm mất giọng.',
        ],
        firstWorkflow: 'Trải nghiệm thật → insight → hook → outline → draft → chỉnh bằng gu người.',
      },
    ],
    whoShouldBuy: [
      'Marketer, content writer hoặc chủ kênh đang dùng AI nhưng output còn nhạt.',
      'Người muốn AI hỗ trợ nghĩ và dựng bài, không để AI thay trải nghiệm thật.',
      'Người cần prompt đào insight, hook và rewrite theo giọng riêng.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-sales-tu-van',
    title: 'AI Starter Cho Sales / Tư Vấn',
    subtitle: 'Biến dữ liệu hội thoại thành follow-up, phản biện, proof và tài sản bán hàng.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 75,
    outcome:
      'Người mua biết dùng AI sau mỗi cuộc gọi để tóm tắt nhu cầu, cá nhân hoá phản hồi và chọn proof phù hợp.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Sales / tư vấn',
        pain: 'Nói chuyện với khách nhiều nhưng chưa biến dữ liệu hội thoại thành kịch bản, phản hồi và tài sản bán hàng.',
        useCases: [
          'Tóm tắt nhu cầu khách sau cuộc gọi.',
          'Soạn follow-up cá nhân hoá theo nỗi đau.',
          'Tạo danh sách phản biện thường gặp và cách trả lời.',
          'Biến case cũ thành proof gửi khách mới.',
        ],
        firstWorkflow: 'Ghi chú khách → phân loại pain → draft phản hồi → chọn proof phù hợp.',
      },
    ],
    whoShouldBuy: [
      'Sales, tư vấn viên hoặc founder bán hàng trực tiếp qua cuộc gọi/tin nhắn.',
      'Người muốn follow-up cá nhân hoá hơn thay vì gửi mẫu chung.',
      'Người cần chuẩn hoá phản biện và proof để bán hàng bớt cảm tính.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-quan-ly-team-lead',
    title: 'AI Starter Cho Quản Lý / Team Lead',
    subtitle: 'Dùng AI để rõ mục tiêu, giao việc, review output và chuẩn hoá quy trình lặp lại.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Người mua có workflow biến mục tiêu mơ hồ thành task, rubric review và SOP để team làm đồng đều hơn.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Quản lý / team lead',
        pain: 'Cần ra quyết định, giao việc, review output nhưng không muốn AI tạo thêm nhiễu cho team.',
        useCases: [
          'Biến mục tiêu mơ hồ thành task rõ owner/deadline.',
          'Tóm tắt báo cáo team thành rủi ro và quyết định cần chốt.',
          'Tạo rubric review output để team làm đồng đều hơn.',
          'Chuẩn hoá quy trình lặp lại thành SOP.',
        ],
        firstWorkflow: 'Mục tiêu → tiêu chí tốt/xấu → task → rubric review → SOP.',
      },
    ],
    whoShouldBuy: [
      'Quản lý, team lead hoặc founder nhỏ cần dùng AI để giảm mơ hồ trong vận hành.',
      'Người muốn chuẩn hoá cách giao việc và review output cho team.',
      'Người cần tạo SOP/rubric từ công việc lặp lại thay vì chỉ dùng AI để viết nhanh.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
]

export const microAssets: MicroAsset[] = [
  ...aiStarterAssets,
  {
    slug: '100-cau-hoi-bien-kinh-nghiem-thanh-tai-san',
    title: '100 Câu Hỏi Biến Kinh Nghiệm Thành Tài Sản',
    subtitle: 'Đào lại thứ anh em đã biết nhưng chưa từng đóng gói.',
    category: 'digital-asset',
    priceVnd: 99000,
    format: 'Workbook',
    estimatedTimeMinutes: 75,
    outcome: 'Có danh sách insight, case, framework và ý tưởng tài sản số từ kinh nghiệm thật.',
    status: 'planned',
    checkoutLabel: 'Nhận thông báo',
    checkoutUrl,
    includes: ['100 câu hỏi theo nhóm kinh nghiệm', 'Bảng chấm điểm ý tưởng', 'Prompt chuyển câu trả lời thành outline'],
    professions: [],
    whoShouldBuy: ['Người có chuyên môn nhưng chưa biết mình có gì để đóng gói.'],
    whoShouldNotBuy: ['Người muốn AI tự bịa chuyên môn thay mình.'],
    conanBoundary: 'Workbook tự đào tri thức, không có feedback cá nhân như Conan Maker.',
  },
  {
    slug: 'hook-pack-cho-nguoi-co-chuyen-mon',
    title: 'Hook Pack Cho Người Có Chuyên Môn',
    subtitle: 'Hook từ tension thật, không giật tít rẻ tiền.',
    category: 'content',
    priceVnd: 99000,
    format: 'Prompt pack',
    estimatedTimeMinutes: 45,
    outcome: 'Tạo hook từ trải nghiệm và quan điểm chuyên môn của chính mình.',
    status: 'planned',
    checkoutLabel: 'Nhận thông báo',
    checkoutUrl,
    includes: ['50 mẫu hook', '15 công thức tension', 'Prompt biến trải nghiệm thành hook'],
    professions: [],
    whoShouldBuy: ['Người viết content chuyên môn nhưng mở bài còn nhạt.'],
    whoShouldNotBuy: ['Người muốn cam kết viral.'],
    conanBoundary: 'Pack này giúp mở bài tốt hơn, không thay thế hệ content và feedback trong Conan.',
  },
]

export function getAllMicroAssets() {
  return microAssets
}

export function getMicroAssetBySlug(slug: string) {
  return microAssets.find((asset) => asset.slug === slug)
}

export function getFeaturedMicroAsset() {
  return microAssets.find((asset) => asset.featured) ?? microAssets[0]
}

export function getAiStarterAssets() {
  return microAssets.filter((asset) => asset.category === 'ai-starter')
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
