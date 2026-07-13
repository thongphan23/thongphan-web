export type JourneyKey =
  | 'home'
  | 'about'
  | 'diagnostic'
  | 'library'
  | 'reader'
  | 'assets'
  | 'asset-detail'
  | 'experiences'
  | 'challenge-detail'
  | 'blog'
  | 'blog-detail'
  | 'chat'

export type JourneyAction = {
  href: string
  label: string
  reason: string
  eyebrow: string
  external?: boolean
}

export type JourneyHandoff = {
  chapter: string
  title: string
  description: string
  primary: JourneyAction
  secondary: JourneyAction[]
}

const actions = {
  home: {
    href: '/',
    label: 'Trở lại trang chủ',
    reason: 'Xem lại toàn cảnh và chọn một điểm vào khác phù hợp hơn.',
    eyebrow: 'Xem toàn cảnh',
  },
  about: {
    href: '/about',
    label: 'Đọc câu chuyện của Thông',
    reason: 'Hiểu trải nghiệm thật và các nguyên tắc đứng sau hệ thống này.',
    eyebrow: 'Kiểm tra nguồn gốc',
  },
  diagnostic: {
    href: '/diagnostic',
    label: 'Làm bản đồ chuyên môn',
    reason: 'Năm câu hỏi giúp gọi đúng chỗ đang kẹt trước khi chọn công cụ.',
    eyebrow: 'Nhìn rõ vị trí',
  },
  library: {
    href: '/library',
    label: 'Mở lộ trình đọc',
    reason: 'Đọc theo vấn đề đang gặp thay vì gom thêm kiến thức rời rạc.',
    eyebrow: 'Đọc để gọi tên',
  },
  reading: {
    href: '/library/read',
    label: 'Xem tuyển đọc thế giới',
    reason: 'Đối chiếu góc nhìn của mình với những bài viết và bài nói đáng đọc.',
    eyebrow: 'Đọc sâu hơn',
  },
  assets: {
    href: '/assets',
    label: 'Chọn một tài sản nhỏ',
    reason: 'Biến điều vừa hiểu thành một đầu ra có thể dùng và nhận phản hồi.',
    eyebrow: 'Tạo đầu ra',
  },
  experiences: {
    href: '/experiences',
    label: 'Chọn một trải nghiệm',
    reason: 'Chọn theo thời gian, đầu ra và mức cam kết thay vì mở thêm nội dung ngẫu nhiên.',
    eyebrow: 'Bắt tay làm',
  },
  brain2Challenge: {
    href: '/brain2/21-ngay',
    label: 'Bắt đầu 21 ngày Brain2',
    reason: 'Gom ca thật, tách ý và thử một nhịp làm việc có thể duy trì.',
    eyebrow: 'Kích hoạt Brain2',
  },
  blog: {
    href: '/blog',
    label: 'Đọc bài của Thông',
    reason: 'Theo dõi những góc nhìn được rút ra từ việc làm và trả giá thật.',
    eyebrow: 'Đọc góc nhìn',
  },
  chat: {
    href: '/chat',
    label: 'Mở bàn hỏi',
    reason: 'Nói rõ việc đang làm, điều đã thử và chỗ đang kẹt để được chỉ đúng đường.',
    eyebrow: 'Gỡ một ca cụ thể',
  },
  conan: {
    href: '/conanmaker/',
    label: 'Vào Conan Maker',
    reason: 'Đi tiếp trong môi trường có nhịp thực thi, phản hồi và người cùng làm.',
    eyebrow: 'Làm trong môi trường thật',
  },
} satisfies Record<string, JourneyAction>

export const journeyHandoffs = {
  home: {
    chapter: 'Chọn điểm bắt đầu',
    title: 'Đừng xem thêm. Hãy xác định đúng việc cần làm.',
    description: 'Một bước chẩn đoán ngắn giúp phần còn lại của hệ thống trở nên có ích hơn.',
    primary: actions.diagnostic,
    secondary: [actions.library, actions.about],
  },
  about: {
    chapter: 'Sau câu chuyện',
    title: 'Bây giờ hãy quay lại câu chuyện của chính bạn.',
    description: 'Điểm quan trọng không phải là Thông đã làm gì, mà là chuyên môn của bạn đang có hình hài tới đâu.',
    primary: actions.brain2Challenge,
    secondary: [actions.library, actions.chat],
  },
  diagnostic: {
    chapter: 'Sau khi nhìn rõ',
    title: 'Dùng kết quả để chọn đúng nguyên liệu.',
    description: 'Đọc một lộ trình phù hợp trước, sau đó mới quyết định cần công cụ hay môi trường thực hành.',
    primary: actions.library,
    secondary: [actions.assets, actions.chat],
  },
  library: {
    chapter: 'Chọn lối vào',
    title: 'Đọc ít hơn, nhưng bắt đầu đúng chỗ.',
    description: 'Nếu chưa biết vấn đề nằm ở đâu, bản đồ chuyên môn sẽ giúp bạn chọn một lộ trình đọc có lý do.',
    primary: actions.diagnostic,
    secondary: [actions.reading, actions.assets],
  },
  reader: {
    chapter: 'Đóng một chương đọc',
    title: 'Biến điều vừa hiểu thành một vật thể có thể dùng.',
    description: 'Một tài sản nhỏ tạo phản hồi thật nhanh hơn việc tiếp tục lưu thêm bài viết.',
    primary: actions.assets,
    secondary: [actions.brain2Challenge, actions.diagnostic],
  },
  assets: {
    chapter: 'Trước khi chọn công cụ',
    title: 'Xác định đầu ra trước khi tải thêm một bộ mẫu.',
    description: 'Bản đồ chuyên môn giúp chọn tài sản đúng với tình trạng hiện tại thay vì mua theo cảm giác.',
    primary: actions.diagnostic,
    secondary: [actions.brain2Challenge, actions.chat],
  },
  'asset-detail': {
    chapter: 'Sau khi có công cụ',
    title: 'Đưa tài sản vào một nhịp làm thật.',
    description: 'Công cụ chỉ có giá trị khi nó được dùng đủ đều để tạo ra đầu ra và phản hồi.',
    primary: actions.experiences,
    secondary: [actions.chat, actions.conan],
  },
  experiences: {
    chapter: 'Chọn một cam kết',
    title: 'Bắt đầu bằng một đầu ra đủ nhỏ để hoàn thành.',
    description: 'Tự chẩn đoán nếu chưa rõ vị trí, hoặc bắt đầu Brain2 nếu bạn đã sẵn sàng gom tri thức thật.',
    primary: actions.brain2Challenge,
    secondary: [actions.diagnostic, actions.library],
  },
  'challenge-detail': {
    chapter: 'Sau nhịp khởi động',
    title: 'Khi cần đi xa hơn, đừng làm một mình.',
    description: 'Conan Maker tiếp nối phần thực hành bằng phản hồi, tiêu chuẩn đầu ra và cộng đồng cùng làm.',
    primary: actions.conan,
    secondary: [actions.assets, actions.chat],
  },
  blog: {
    chapter: 'Từ góc nhìn tới hệ thống',
    title: 'Đặt bài viết vào một lộ trình đọc có chủ đích.',
    description: 'Thư viện nối các bài riêng lẻ thành những đường đọc theo vấn đề và trạng thái người đọc.',
    primary: actions.library,
    secondary: [actions.diagnostic, actions.about],
  },
  'blog-detail': {
    chapter: 'Sau bài viết',
    title: 'Đối chiếu góc nhìn này với tình trạng của bạn.',
    description: 'Một bài viết chỉ có ích khi nó giúp bạn gọi tên quyết định hoặc hành động tiếp theo.',
    primary: actions.diagnostic,
    secondary: [actions.library, actions.assets],
  },
  chat: {
    chapter: 'Đừng dừng ở câu trả lời',
    title: 'Chọn một nơi để tiếp tục làm rõ bằng hành động.',
    description: 'Bàn hỏi chỉ có nhiệm vụ chỉ đường. Giá trị xuất hiện khi bạn đọc, làm hoặc thử trong bối cảnh thật.',
    primary: actions.diagnostic,
    secondary: [actions.library, actions.assets],
  },
} satisfies Record<JourneyKey, JourneyHandoff>

const intentPatterns = [
  { pattern: /cộng đồng|conan|cùng làm|accountability/i, action: actions.conan },
  { pattern: /tài sản|sản phẩm|product|offer|đóng gói|bán/i, action: actions.assets },
  { pattern: /brain2|ghi chú|note|obsidian|tri thức/i, action: actions.brain2Challenge },
  { pattern: /content|nội dung|bài viết|proof|bằng chứng/i, action: actions.library },
] as const

export function getJourneyHandoff(key: JourneyKey): JourneyHandoff {
  return journeyHandoffs[key]
}

export function getRecommendationsForPrompt(prompt: string): JourneyAction[] {
  const primary = intentPatterns.find(({ pattern }) => pattern.test(prompt))?.action ?? actions.diagnostic
  const fallback = [actions.diagnostic, actions.library, actions.chat]
  return [primary, ...fallback.filter((action) => action.href !== primary.href)].slice(0, 3)
}
