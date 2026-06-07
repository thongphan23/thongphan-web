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

export const microAssets: MicroAsset[] = [
  {
    slug: 'ai-starter-kit-nguoi-di-lam',
    title: 'AI Starter Kit Cho Người Đi Làm',
    subtitle: 'Chuẩn hoá cách dùng AI theo từng nghề, không học tool lan man.',
    category: 'ai-starter',
    priceVnd: 149000,
    format: 'PDF + checklist + prompt pack',
    estimatedTimeMinutes: 90,
    outcome:
      'Người mua biết dùng AI vào 5 nhóm việc cụ thể của nghề mình: nghĩ, đọc, viết, tổng hợp và tạo output.',
    status: 'available-soon',
    featured: true,
    checkoutLabel: 'Nhận thông báo khi mở bán',
    checkoutUrl: 'https://m.me/thongphan.88',
    includes: [
      'Bản đồ bắt đầu dùng AI cho người mới đi làm, không cần nền kỹ thuật.',
      '5 nguyên tắc chuẩn hoá: giao việc rõ, đưa ngữ cảnh, kiểm chứng, giữ giọng người thật, lưu lại workflow.',
      'Use case theo nghề: nhân viên văn phòng, giáo viên/giảng viên, marketing/content, sales/tư vấn, quản lý/team lead.',
      'Bộ prompt mẫu cho từng nghề, viết bằng tiếng Việt dễ sửa.',
      'Checklist 7 ngày để biến AI từ trò thử nghiệm thành thói quen làm việc.'
    ],
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
        firstWorkflow: 'Ghi chú thô → AI sắp xếp → người kiểm chứng → gửi/tạo task.'
      },
      {
        name: 'Giáo viên / giảng viên',
        pain: 'Muốn dùng AI để soạn bài, tạo hoạt động, cá nhân hoá học viên nhưng sợ bài dạy bị generic.',
        useCases: [
          'Biến mục tiêu bài học thành outline 45-90 phút.',
          'Tạo ví dụ gần đời sống học viên thay vì ví dụ sách giáo khoa.',
          'Soạn câu hỏi kiểm tra hiểu bài theo nhiều mức độ.',
          'Chuyển một bài giảng thành worksheet thực hành.',
        ],
        firstWorkflow: 'Mục tiêu học tập → hoạt động lớp → câu hỏi kiểm tra → worksheet.'
      },
      {
        name: 'Marketing / content',
        pain: 'Dùng AI viết nhanh hơn nhưng output dễ giống người khác, thiếu insight và thiếu trải nghiệm thật.',
        useCases: [
          'Đào insight từ trải nghiệm/case thật.',
          'Tạo 10 góc hook từ một quan điểm chuyên môn.',
          'Biến feedback khách hàng thành ý tưởng bài viết.',
          'Rewrite bài cho rõ hơn mà không làm mất giọng.'
        ],
        firstWorkflow: 'Trải nghiệm thật → insight → hook → outline → draft → chỉnh bằng gu người.'
      },
      {
        name: 'Sales / tư vấn',
        pain: 'Nói chuyện với khách nhiều nhưng chưa biến dữ liệu hội thoại thành kịch bản, phản hồi và tài sản bán hàng.',
        useCases: [
          'Tóm tắt nhu cầu khách sau cuộc gọi.',
          'Soạn follow-up cá nhân hoá theo nỗi đau.',
          'Tạo danh sách phản biện thường gặp và cách trả lời.',
          'Biến case cũ thành proof gửi khách mới.'
        ],
        firstWorkflow: 'Ghi chú khách → phân loại pain → draft phản hồi → chọn proof phù hợp.'
      },
      {
        name: 'Quản lý / team lead',
        pain: 'Cần ra quyết định, giao việc, review output nhưng không muốn AI tạo thêm nhiễu cho team.',
        useCases: [
          'Biến mục tiêu mơ hồ thành task rõ owner/deadline.',
          'Tóm tắt báo cáo team thành rủi ro và quyết định cần chốt.',
          'Tạo rubric review output để team làm đồng đều hơn.',
          'Chuẩn hoá quy trình lặp lại thành SOP.'
        ],
        firstWorkflow: 'Mục tiêu → tiêu chí tốt/xấu → task → rubric review → SOP.'
      }
    ],
    whoShouldBuy: [
      'Người đi làm mới dùng AI, đang rối vì quá nhiều tool và prompt.',
      'Giáo viên/giảng viên muốn dùng AI để soạn bài và tạo hoạt động học nhưng vẫn giữ chất người dạy.',
      'Marketer, sales, quản lý cần use case sát công việc thay vì học AI chung chung.',
      'Người muốn có một tuần đầu dùng AI thật sự có hệ thống.'
    ],
    whoShouldNotBuy: [
      'Người đang tìm khóa học AI chuyên sâu nhiều tuần.',
      'Người muốn feedback cá nhân hoặc mentor cầm tay chỉ việc.',
      'Người chỉ muốn danh sách tool mới nhất mà không muốn chuẩn hoá cách làm.',
      'Developer đã có workflow AI coding riêng.'
    ],
    conanBoundary:
      'Kit này giúp tự chuẩn hoá cách dùng AI ở mức cá nhân. Nếu cần cộng đồng, feedback, accountability và roadmap biến chuyên môn thành tài sản/dòng tiền, đó là phần của Conan Maker.'
  },
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
    checkoutUrl: 'https://m.me/thongphan.88',
    includes: ['100 câu hỏi theo nhóm kinh nghiệm', 'Bảng chấm điểm ý tưởng', 'Prompt chuyển câu trả lời thành outline'],
    professions: [],
    whoShouldBuy: ['Người có chuyên môn nhưng chưa biết mình có gì để đóng gói.'],
    whoShouldNotBuy: ['Người muốn AI tự bịa chuyên môn thay mình.'],
    conanBoundary: 'Workbook tự đào tri thức, không có feedback cá nhân như Conan Maker.'
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
    checkoutUrl: 'https://m.me/thongphan.88',
    includes: ['50 mẫu hook', '15 công thức tension', 'Prompt biến trải nghiệm thành hook'],
    professions: [],
    whoShouldBuy: ['Người viết content chuyên môn nhưng mở bài còn nhạt.'],
    whoShouldNotBuy: ['Người muốn cam kết viral.'],
    conanBoundary: 'Pack này giúp mở bài tốt hơn, không thay thế hệ content và feedback trong Conan.'
  }
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

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
