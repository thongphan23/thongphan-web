import type { ChallengeDay } from './model'

export type ContentWorkflowDay = Readonly<{
  day: ChallengeDay
  slug: `day-0${ChallengeDay}`
  title: string
  question: string
  threshold: string
  artifact: string
  locked: false
  learn: readonly string[]
  see: Readonly<{ label: 'Case mô phỏng'; title: string; body: string }>
  do: readonly string[]
  qualityGate: readonly string[]
  minimum: string
}>

export const SIMULATED_CASE = {
  label: 'Case mô phỏng',
  name: 'Studio Mộc',
  isRealCustomerProof: false,
  disclosure: 'Ví dụ tổng hợp để thực hành, không phải testimonial hoặc bằng chứng từ khách hàng thật.',
  business: 'Studio tư vấn thương hiệu cho doanh nghiệp dịch vụ nhỏ.',
  offer: 'Gói định vị và hệ thống thông điệp trong 6 tuần.',
  customer: 'Founder công ty dịch vụ có đội marketing từ 1–3 người.',
  situation: 'Đăng bài đều nhưng founder vẫn phải sửa gần như mọi nội dung trước khi xuất bản.',
  evidence: '“Thuê người viết rồi nhưng cuối cùng chị vẫn phải sửa lại gần hết.”',
} as const

export const CONTENT_WORKFLOW_DAYS: readonly ContentWorkflowDay[] = [
  {
    day: 1,
    slug: 'day-01',
    title: 'Content không dành cho tất cả mọi người',
    question: 'Tôi đang tạo content cho ai?',
    threshold: 'Một workflow content không thể hoạt động nếu mỗi lần AI phải đoán lại khách hàng là ai.',
    artifact: 'Customer Focus Card',
    locked: false,
    learn: [
      'Audience rộng không thay thế được một customer cụ thể trong một hoàn cảnh đang xảy ra.',
      'Customer Focus cần khóa business, offer, nhóm khách hàng, tình huống, vấn đề và chuyển dịch mong muốn.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Studio Mộc chọn một founder đang bị kẹt trong khâu duyệt bài',
      body: 'Thay vì viết cho mọi chủ doanh nghiệp, Studio Mộc chọn founder công ty dịch vụ có đội marketing nhỏ, đang đăng đều nhưng vẫn phải sửa gần hết nội dung trước khi xuất bản.',
    },
    do: [
      'Chọn một business và một offer sẽ dùng xuyên suốt challenge.',
      'Mô tả một nhóm khách hàng bằng tình huống và vấn đề cụ thể.',
      'Hoàn thành câu Customer Focus bằng ngôn ngữ của anh.',
    ],
    qualityGate: [
      'Không dùng nhóm rộng như “mọi người”, “chủ doanh nghiệp” hoặc “người quan tâm marketing” nếu thiếu tình huống.',
      'Phải có một vấn đề đang xảy ra và một chuyển dịch khách hàng muốn đạt tới.',
    ],
    minimum: 'Một câu Customer Focus hoàn chỉnh, đủ cụ thể để người khác biết content này dành cho ai.',
  },
  {
    day: 2,
    slug: 'day-02',
    title: 'AI chỉ tốt bằng dữ liệu anh đưa cho nó',
    question: 'Tôi biết gì thật về họ?',
    threshold: 'Customer evidence thật mạnh hơn persona hoặc câu nói do AI tự tưởng tượng để lấp chỗ trống.',
    artifact: 'Customer Voice Mini Bank',
    locked: false,
    learn: [
      'Evidence có thể đến từ inbox, bình luận, sales call, email, CRM, lý do từ chối hoặc cuộc trò chuyện trực tiếp.',
      'Mỗi evidence cần giữ câu nói hoặc hành vi, hoàn cảnh, nguồn và điều có thể hiểu từ đó.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Một câu nói thật thay đổi cách chẩn đoán vấn đề',
      body: 'Câu “Thuê người viết rồi nhưng cuối cùng chị vẫn phải sửa lại gần hết” cho thấy nút thắt có thể nằm ở brief và tiêu chuẩn, không chỉ ở kỹ năng viết của nhân sự.',
    },
    do: [
      'Thu thập tối thiểu năm câu nói hoặc hành vi từ khách hàng thật.',
      'Ghi rõ nguồn và hoàn cảnh của từng evidence.',
      'Nếu mới có ba evidence, lập kế hoạch tìm thêm hai evidence thay vì nhờ AI bịa.',
    ],
    qualityGate: [
      'Không coi câu do AI tạo ra là customer evidence.',
      'Không nhập dữ liệu định danh hoặc thông tin nhạy cảm không cần thiết.',
      'Bản đầy đủ có ít nhất năm evidence từ tối thiểu hai nguồn.',
    ],
    minimum: 'Ba evidence thật cùng một kế hoạch cụ thể để tìm thêm hai evidence còn thiếu.',
  },
  {
    day: 3,
    slug: 'day-03',
    title: 'Một bài content chỉ nên làm một việc chính',
    question: 'Content này phải làm việc gì?',
    threshold: 'Một bài vừa muốn viral, giáo dục, chứng minh chuyên môn và bán hàng thường không làm tốt việc nào.',
    artifact: 'Content Job Card',
    locked: false,
    learn: [
      'Challenge chỉ dùng ba job: nhận ra vấn đề, hiểu nguyên nhân hoặc thử một bước tiếp theo.',
      'Một Content Job tốt mô tả niềm tin trước, chuyển dịch mong muốn và hành động nhỏ sau bài viết.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Từ “nhân viên viết yếu” sang “brief đang thiếu tiêu chuẩn”',
      body: 'Studio Mộc chọn job giúp founder hiểu nguyên nhân: nhân viên có thể chưa phải vấn đề gốc; business chưa cung cấp evidence và tiêu chuẩn đủ rõ để đội ngũ tự quyết định.',
    },
    do: [
      'Chọn một evidence từ Customer Voice Mini Bank.',
      'Chọn đúng một trong ba Content Job.',
      'Viết niềm tin trước, điều muốn khách hàng hiểu và một hành động nhỏ tiếp theo.',
    ],
    qualityGate: [
      'Không dùng mục tiêu mơ hồ như tăng nhận diện, tăng tương tác, viral hoặc đăng cho đều.',
      'Phải có một chuyển đổi trong suy nghĩ hoặc hành động.',
    ],
    minimum: 'Một Content Job và một câu chuyển dịch trước–sau có hành động tiếp theo.',
  },
  {
    day: 4,
    slug: 'day-04',
    title: 'Brief trước, prompt sau',
    question: 'Làm sao brief AI cho đúng?',
    threshold: 'Prompt không cứu được một Content Brief thiếu quyết định, evidence và tiêu chuẩn đầu ra.',
    artifact: 'Reusable Content Brief',
    locked: false,
    learn: [
      'Brief tối thiểu phải trả lời: viết cho ai, hoàn cảnh nào, họ nghĩ gì, muốn họ hiểu gì, ý chính, evidence, bước tiếp theo và giọng điệu.',
      'AI có thể chỉ ra chỗ mơ hồ, nhưng con người phải quyết định customer, claim, evidence và CTA.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Studio Mộc nối quyết định của ba ngày đầu thành một brief',
      body: 'Brief dùng đúng founder đã chọn, câu nói về việc phải sửa bài, job hiểu nguyên nhân và luận điểm rằng một tiêu chuẩn yếu biến founder thành nút thắt duyệt nội dung.',
    },
    do: [
      'Lấy Customer Focus, một evidence và Content Job đã hoàn thành.',
      'Điền các trường lõi trước khi mở công cụ AI.',
      'Kiểm tra claim, giọng điệu, điều phải có, điều phải tránh và CTA.',
    ],
    qualityGate: [
      'Một người khác đọc brief phải biết bài dành cho ai, muốn thay đổi gì, dùng evidence nào và muốn khách hàng làm gì.',
      'Không điền từ chung chung chỉ để vượt gate.',
    ],
    minimum: 'Một Reusable Content Brief đủ tám quyết định lõi và có customer evidence thật.',
  },
  {
    day: 5,
    slug: 'day-05',
    title: 'Workflow không phải một prompt thật dài',
    question: 'Làm sao biến brief thành workflow?',
    threshold: 'Workflow là chuỗi bước có input, output và Quality Gate; prompt chỉ là cách giao việc trong chuỗi đó.',
    artifact: 'Content Workflow Prompt v1',
    locked: false,
    learn: [
      'Flow tối giản là brief → ba góc khai thác → con người chọn → outline → draft → self-check → revision request.',
      'Workflow giữ điểm quyết định của con người và cấm AI tự thêm số liệu, câu chuyện hoặc trích dẫn.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Prompt dừng lại trước khi viết để founder chọn góc',
      body: 'Studio Mộc yêu cầu AI kiểm tra brief, đề xuất ba góc và chờ con người chọn. Chỉ sau đó AI mới tạo outline, draft, self-check và đề nghị sửa.',
    },
    do: [
      'Tạo Content Workflow Prompt từ brief của bốn ngày đầu.',
      'Đọc và sửa prompt để phản ánh đúng tiêu chuẩn của business.',
      'Sao chép prompt sang công cụ AI anh đang dùng và giữ quyền chọn góc.',
    ],
    qualityGate: [
      'Prompt có input thật, output contract, ba góc khai thác, self-check và điểm con người quyết định.',
      'Prompt không cho phép AI bịa customer evidence.',
    ],
    minimum: 'Một Content Workflow Prompt có đủ flow và đã được con người đọc lại trước khi dùng.',
  },
  {
    day: 6,
    slug: 'day-06',
    title: 'Bản nháp đầu tiên là nguyên liệu, không phải sản phẩm cuối',
    question: 'Workflow có tạo được content dùng thật không?',
    threshold: 'Một demo đẹp không chứng minh workflow ổn định; cần chạy nhiều lần và tìm lỗi lặp lại.',
    artifact: 'Ba draft và Workflow Feedback Log',
    locked: false,
    learn: [
      'Mỗi draft được chấm sáu tiêu chí từ 0–2; ngưỡng dùng được là 9/12 và không tiêu chí nào bằng 0.',
      'Self-review không tuyên bố chất lượng thị trường; founder vẫn xác minh claim, evidence, voice và quyết định sửa.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Hai draft cùng lộ một lỗi chung',
      body: 'Cả hai bản đầu của Studio Mộc đều giải thích quá dài trước khi đưa evidence. Founder ghi lại lỗi lặp này và sửa prompt để đưa câu khách hàng lên sớm hơn.',
    },
    do: [
      'Chạy workflow ba lần với ba Content Job hoặc evidence khác nhau.',
      'Tự chấm từng draft bằng checklist sáu tiêu chí.',
      'Ghi một quyết định sửa cho từng draft và lỗi lặp cần cập nhật vào workflow.',
    ],
    qualityGate: [
      'Có đúng ba ô draft và ít nhất hai draft đạt cấu trúc 9/12, không tiêu chí nào bằng 0.',
      'Mỗi draft đạt có revision note do người học ghi lại.',
      'Không coi self-score là bằng chứng content sẽ hiệu quả ngoài thị trường.',
    ],
    minimum: 'Hai draft được review có điểm cấu trúc tối thiểu 9/12, không điểm 0 và có quyết định sửa.',
  },
  {
    day: 7,
    slug: 'day-07',
    title: 'Workflow chỉ tồn tại khi được dùng trong thực tế',
    question: 'Làm sao tiếp tục dùng mà không bắt đầu lại?',
    threshold: 'Một file prompt chưa phải workflow; workflow cần đầu vào, cách chạy, tiêu chuẩn và nhịp sử dụng.',
    artifact: 'Content Workflow Starter Kit v1.0',
    locked: false,
    learn: [
      'Starter Kit đóng gói customer, evidence, brief, prompt, content đã review, One-Pager và kế hoạch tiếp tục.',
      'Signal ban đầu có thể là câu hỏi, phản hồi đúng nhóm, cuộc trò chuyện hoặc việc không có phản ứng như dự đoán.',
    ],
    see: {
      label: 'Case mô phỏng',
      title: 'Studio Mộc biến một lần thử thành nhịp ba content mỗi tuần',
      body: 'Founder chọn một draft, gửi cho khách hàng phù hợp, ghi lại câu hỏi nhận được rồi đóng gói đầu vào, các bước, tiêu chuẩn, vai trò AI và vai trò con người thành One-Pager.',
    },
    do: [
      'Chọn một content tốt nhất và đưa tới người thật bằng đăng công khai hoặc gửi trực tiếp.',
      'Ghi trạng thái chia sẻ và signal ban đầu.',
      'Hoàn thành One-Pager và sáu đề mục cho 14 ngày tiếp theo.',
      'Xuất Starter Kit thành Markdown để giữ một bản ngoài trình duyệt.',
    ],
    qualityGate: [
      'Có tối thiểu sáu trong tám artifact.',
      'Bắt buộc có Customer Focus, Evidence Bank, Brief, Workflow Prompt, hai content đã review và One-Page Workflow.',
      'Không bắt website xác minh URL social; người học tự xác nhận trạng thái sử dụng ngoài đời.',
    ],
    minimum: 'Sáu artifact bắt buộc, một content đã đưa tới người thật và một signal ban đầu được ghi lại.',
  },
] as const

export function getContentWorkflowDay(slug: string): ContentWorkflowDay | undefined {
  return CONTENT_WORKFLOW_DAYS.find((lesson) => lesson.slug === slug)
}
