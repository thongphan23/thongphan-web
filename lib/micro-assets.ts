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
  'ai-starter': 'AI cho công việc cụ thể',
  brain2: 'Brain2',
  content: 'Nội dung kéo khách',
  'digital-asset': 'Tài sản số',
}

const checkoutUrl = 'https://m.me/thongphan.88'

const starterBoundary =
  'Bộ này giúp bạn chuẩn hoá cách dùng AI cho đúng công việc đang làm. Nếu cần cộng đồng, phản hồi, trách nhiệm thực hành và roadmap biến chuyên môn thành tài sản hoặc dòng tiền, đó là phần nên đi sâu hơn trong Conan Maker.'

const aiStarterIncludes = [
  'Workbook đi từ việc thật của bạn, không bắt đầu bằng danh sách công cụ.',
  'Video ngắn để bạn thấy cách nghĩ, cách giao việc cho AI và cách kiểm đầu ra.',
  'Prompt tiếng Việt có thể sửa ngay theo bối cảnh của bạn.',
  'Checklist 7 ngày để AI bớt là trò thử nghiệm và thành một phần trong cách bạn làm việc.',
  'Bảng kiểm để không để AI viết sai, bịa hoặc làm mất giọng người thật.',
]

const commonWhoShouldNotBuy = [
  'Bạn đang tìm một khóa AI chuyên sâu kéo dài nhiều tuần.',
  'Bạn cần feedback cá nhân hoặc mentor cầm tay chỉ việc.',
  'Bạn chỉ muốn danh sách công cụ mới nhất, nhưng chưa muốn chuẩn hoá cách làm.',
  'Bạn là developer đã có quy trình AI coding riêng.',
]

const aiStarterAssets: MicroAsset[] = [
  {
    slug: 'ai-starter-van-phong',
    title: 'AI Cho Nhân Viên Văn Phòng',
    subtitle: 'Dùng AI để xử lý email, tài liệu, biên bản, báo cáo mà không bị rối prompt.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 75,
    outcome:
      'Bạn có một quy trình rõ để biến ghi chú, tài liệu và việc lặp lại thành bản hoàn chỉnh gửi được trong môi trường công sở.',
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
      'Bạn làm văn phòng, mới dùng AI và đang bị ngợp vì email, tài liệu, biên bản, báo cáo.',
      'Bạn muốn một vòng làm việc rõ: đưa ngữ cảnh, nhận bản nháp, kiểm chứng, rồi mới gửi.',
      'Bạn muốn dùng AI để đỡ mất thời gian nhưng vẫn giữ chất lượng công việc.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-giao-vien-giang-vien',
    title: 'AI Cho Giáo Viên / Giảng Viên',
    subtitle: 'Soạn bài, tạo hoạt động, câu hỏi và worksheet mà không làm bài dạy bị chung chung.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Bạn biết cách dùng AI để biến mục tiêu bài học thành hoạt động lớp, câu hỏi kiểm tra và worksheet thực hành.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Giáo viên / giảng viên',
        pain: 'Muốn dùng AI để soạn bài, tạo hoạt động, cá nhân hoá học viên nhưng sợ bài dạy bị chung chung.',
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
      'Bạn là giáo viên, giảng viên hoặc mentor muốn chuẩn bị bài nhanh hơn mà không làm bài dạy bị nhạt.',
      'Bạn sợ AI làm bài dạy mất chất người dạy và muốn có checklist kiểm chứng.',
      'Bạn cần ví dụ, hoạt động, câu hỏi và worksheet sát người học hơn.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-marketing-content',
    title: 'AI Cho Marketing / Content',
    subtitle: 'Dùng AI để đào insight, tạo hook, dựng outline và rewrite mà không mất trải nghiệm thật.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Bạn có quy trình biến trải nghiệm, feedback và quan điểm chuyên môn thành bài nháp có chất riêng hơn.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Marketing / content',
        pain: 'Dùng AI viết nhanh hơn nhưng đầu ra dễ giống người khác, thiếu insight và thiếu trải nghiệm thật.',
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
      'Bạn làm marketing/content hoặc đang xây kênh, đã dùng AI nhưng đầu ra còn nhạt.',
      'Bạn muốn AI hỗ trợ nghĩ và dựng bài, không để AI thay trải nghiệm thật.',
      'Bạn cần prompt để đào insight, tạo hook và rewrite mà vẫn giữ giọng riêng.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-sales-tu-van',
    title: 'AI Cho Sales / Tư Vấn',
    subtitle: 'Biến dữ liệu hội thoại thành theo dõi sau tư vấn, phản biện, bằng chứng và tài sản bán hàng.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 75,
    outcome:
      'Bạn biết cách dùng AI sau mỗi cuộc gọi để tóm tắt nhu cầu, cá nhân hoá phản hồi và chọn bằng chứng phù hợp.',
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
          'Soạn theo dõi sau tư vấn cá nhân hoá theo nỗi đau.',
          'Tạo danh sách phản biện thường gặp và cách trả lời.',
          'Biến case cũ thành bằng chứng gửi khách mới.',
        ],
        firstWorkflow: 'Ghi chú khách → phân loại pain → draft phản hồi → chọn bằng chứng phù hợp.',
      },
    ],
    whoShouldBuy: [
      'Bạn làm sales, tư vấn hoặc founder bán hàng trực tiếp qua cuộc gọi/tin nhắn.',
      'Bạn muốn theo dõi sau tư vấn cá nhân hoá hơn thay vì gửi mẫu chung.',
      'Bạn cần chuẩn hoá phản biện và bằng chứng để bán hàng bớt cảm tính.',
    ],
    whoShouldNotBuy: commonWhoShouldNotBuy,
    conanBoundary: starterBoundary,
  },
  {
    slug: 'ai-starter-quan-ly-team-lead',
    title: 'AI Cho Quản Lý / Team Lead',
    subtitle: 'Dùng AI để rõ mục tiêu, giao việc, review đầu ra và chuẩn hoá quy trình lặp lại.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'Workbook + video + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Bạn có quy trình biến mục tiêu mơ hồ thành task, rubric review và quy trình chuẩn để team làm đồng đều hơn.',
    status: 'available-soon',
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl,
    includes: aiStarterIncludes,
    professions: [
      {
        name: 'Quản lý / team lead',
        pain: 'Cần ra quyết định, giao việc, review đầu ra nhưng không muốn AI tạo thêm nhiễu cho team.',
        useCases: [
          'Biến mục tiêu mơ hồ thành task rõ owner/deadline.',
          'Tóm tắt báo cáo team thành rủi ro và quyết định cần chốt.',
          'Tạo rubric review đầu ra để team làm đồng đều hơn.',
          'Chuẩn hoá quy trình lặp lại thành quy trình chuẩn.',
        ],
        firstWorkflow: 'Mục tiêu → tiêu chí tốt/xấu → task → rubric review → quy trình chuẩn.',
      },
    ],
    whoShouldBuy: [
      'Bạn là quản lý, team lead hoặc founder nhỏ cần dùng AI để giảm mơ hồ trong vận hành.',
      'Bạn muốn chuẩn hoá cách giao việc và review đầu ra cho team.',
      'Bạn cần tạo quy trình chuẩn/rubric từ công việc lặp lại, thay vì chỉ dùng AI để viết nhanh.',
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
    subtitle: 'Đào lại thứ bạn đã biết nhưng chưa từng đóng gói.',
    category: 'digital-asset',
    priceVnd: 99000,
    format: 'Workbook',
    estimatedTimeMinutes: 75,
    outcome: 'Bạn có danh sách insight, case, framework và ý tưởng tài sản số từ kinh nghiệm thật.',
    status: 'planned',
    checkoutLabel: 'Nhận thông báo',
    checkoutUrl,
    includes: ['100 câu hỏi theo nhóm kinh nghiệm', 'Bảng chấm điểm ý tưởng', 'Prompt chuyển câu trả lời thành outline'],
    professions: [],
    whoShouldBuy: ['Bạn có chuyên môn nhưng chưa biết mình có gì để đóng gói.'],
    whoShouldNotBuy: ['Bạn muốn AI tự bịa chuyên môn thay mình.'],
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
    whoShouldBuy: ['Bạn viết content chuyên môn nhưng mở bài còn nhạt.'],
    whoShouldNotBuy: ['Bạn muốn được cam kết viral.'],
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
