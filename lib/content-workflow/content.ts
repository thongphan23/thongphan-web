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
  see: Readonly<{ label: 'Tình huống mô phỏng'; title: string; body: string }>
  do: readonly string[]
  qualityGate: readonly string[]
  minimum: string
}>

export const SIMULATED_CASE = {
  label: 'Tình huống mô phỏng',
  name: 'Studio Mộc',
  isRealCustomerProof: false,
  disclosure: 'Ví dụ tổng hợp để thực hành, không phải lời chứng thực (testimonial) hoặc bằng chứng từ khách hàng thật.',
  business: 'Studio tư vấn thương hiệu cho doanh nghiệp dịch vụ nhỏ.',
  offer: 'Gói định vị và hệ thống thông điệp trong 6 tuần.',
  customer: 'Người sáng lập công ty dịch vụ có đội tiếp thị từ 1–3 người.',
  situation: 'Đăng bài đều nhưng người sáng lập vẫn phải sửa gần như mọi nội dung trước khi xuất bản.',
  evidence: '“Thuê người viết rồi nhưng cuối cùng chị vẫn phải sửa lại gần hết.”',
} as const

export const CONTENT_WORKFLOW_DAYS: readonly ContentWorkflowDay[] = [
  {
    day: 1,
    slug: 'day-01',
    title: 'Nội dung không dành cho tất cả mọi người',
    question: 'Tôi đang tạo nội dung cho ai?',
    threshold: 'Một quy trình nội dung không thể hoạt động nếu mỗi lần AI phải đoán lại khách hàng là ai.',
    artifact: 'Thẻ trọng tâm khách hàng (Customer Focus Card)',
    locked: false,
    learn: [
      'Nhóm độc giả rộng không thay thế được một khách hàng cụ thể trong một hoàn cảnh đang xảy ra.',
      'Trọng tâm khách hàng cần khóa doanh nghiệp, sản phẩm đang bán, nhóm khách hàng, tình huống, vấn đề và chuyển dịch mong muốn.',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Studio Mộc chọn một người sáng lập đang bị kẹt trong khâu duyệt bài',
      body: 'Thay vì viết cho mọi chủ doanh nghiệp, Studio Mộc chọn người sáng lập công ty dịch vụ có đội tiếp thị nhỏ, đang đăng đều nhưng vẫn phải sửa gần hết nội dung trước khi xuất bản.',
    },
    do: [
      'Chọn một doanh nghiệp và một sản phẩm sẽ dùng xuyên suốt thử thách.',
      'Mô tả một nhóm khách hàng bằng tình huống và vấn đề cụ thể.',
      'Hoàn thành câu trọng tâm khách hàng bằng ngôn ngữ của bạn.',
    ],
    qualityGate: [
      'Không dùng nhóm rộng như “mọi người”, “chủ doanh nghiệp” hoặc “người quan tâm tiếp thị” nếu thiếu tình huống.',
      'Phải có một vấn đề đang xảy ra và một chuyển dịch khách hàng muốn đạt tới.',
    ],
    minimum: 'Một câu trọng tâm khách hàng hoàn chỉnh, đủ cụ thể để người khác biết nội dung này dành cho ai.',
  },
  {
    day: 2,
    slug: 'day-02',
    title: 'AI chỉ tốt bằng dữ liệu bạn đưa cho nó',
    question: 'Tôi biết gì thật về họ?',
    threshold: 'Bằng chứng khách hàng thật mạnh hơn chân dung giả định (persona) hoặc câu nói do AI tự tưởng tượng để lấp chỗ trống.',
    artifact: 'Ngân hàng tiếng nói khách hàng (Customer Voice Mini Bank)',
    locked: false,
    learn: [
      'Bằng chứng có thể đến từ tin nhắn, bình luận, cuộc gọi bán hàng, thư điện tử, hệ thống quản lý quan hệ khách hàng (CRM), lý do từ chối hoặc cuộc trò chuyện trực tiếp.',
      'Mỗi bằng chứng cần giữ câu nói hoặc hành vi, hoàn cảnh, nguồn và điều có thể hiểu từ đó.',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Một câu nói thật thay đổi cách chẩn đoán vấn đề',
      body: 'Câu “Thuê người viết rồi nhưng cuối cùng chị vẫn phải sửa lại gần hết” cho thấy nút thắt có thể nằm ở bản giao việc và tiêu chuẩn, không chỉ ở kỹ năng viết của nhân sự.',
    },
    do: [
      'Thu thập tối thiểu năm câu nói hoặc hành vi từ khách hàng thật.',
      'Ghi rõ nguồn và hoàn cảnh của từng bằng chứng.',
      'Nếu mới có ba bằng chứng, lập kế hoạch tìm thêm hai bằng chứng thay vì nhờ AI bịa.',
    ],
    qualityGate: [
      'Không coi câu do AI tạo ra là bằng chứng khách hàng.',
      'Không nhập dữ liệu định danh hoặc thông tin nhạy cảm không cần thiết.',
      'Bản đầy đủ có ít nhất năm bằng chứng từ tối thiểu hai nguồn.',
    ],
    minimum: 'Ba bằng chứng thật cùng một kế hoạch cụ thể để tìm thêm hai bằng chứng còn thiếu.',
  },
  {
    day: 3,
    slug: 'day-03',
    title: 'Một bài nội dung chỉ nên làm một việc chính',
    question: 'Nội dung này phải làm việc gì?',
    threshold: 'Một bài vừa muốn lan truyền, giáo dục, chứng minh chuyên môn và bán hàng thường không làm tốt việc nào.',
    artifact: 'Thẻ nhiệm vụ nội dung (Content Job Card)',
    locked: false,
    learn: [
      'Thử thách chỉ dùng ba nhiệm vụ: nhận ra vấn đề, hiểu nguyên nhân hoặc thử một bước tiếp theo.',
      'Một nhiệm vụ nội dung tốt mô tả niềm tin trước, chuyển dịch mong muốn và hành động nhỏ sau bài viết.',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Từ “nhân viên viết yếu” sang “bản giao việc đang thiếu tiêu chuẩn”',
      body: 'Studio Mộc chọn nhiệm vụ giúp người sáng lập hiểu nguyên nhân: nhân viên có thể chưa phải vấn đề gốc; doanh nghiệp chưa cung cấp bằng chứng và tiêu chuẩn đủ rõ để đội ngũ tự quyết định.',
    },
    do: [
      'Chọn một bằng chứng từ ngân hàng tiếng nói khách hàng.',
      'Chọn đúng một trong ba nhiệm vụ nội dung.',
      'Viết niềm tin trước, điều muốn khách hàng hiểu và một hành động nhỏ tiếp theo.',
    ],
    qualityGate: [
      'Không dùng mục tiêu mơ hồ như tăng nhận diện, tăng tương tác, lan truyền hoặc đăng cho đều.',
      'Phải có một chuyển đổi trong suy nghĩ hoặc hành động.',
    ],
    minimum: 'Một nhiệm vụ nội dung và một câu chuyển dịch trước–sau có hành động tiếp theo.',
  },
  {
    day: 4,
    slug: 'day-04',
    title: 'Bản giao việc trước, câu lệnh sau',
    question: 'Làm sao giao việc cho AI đúng?',
    threshold: 'Câu lệnh không cứu được một bản giao việc nội dung thiếu quyết định, bằng chứng và tiêu chuẩn đầu ra.',
    artifact: 'Bản giao việc nội dung dùng lại được (Reusable Content Brief)',
    locked: false,
    learn: [
      'Bản giao việc tối thiểu phải trả lời: viết cho ai, hoàn cảnh nào, họ nghĩ gì, muốn họ hiểu gì, ý chính, bằng chứng, bước tiếp theo và giọng điệu.',
      'AI có thể chỉ ra chỗ mơ hồ, nhưng con người phải quyết định khách hàng, luận điểm, bằng chứng và lời kêu gọi hành động (CTA).',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Studio Mộc nối quyết định của ba ngày đầu thành một bản giao việc',
      body: 'Bản giao việc dùng đúng người sáng lập đã chọn, câu nói về việc phải sửa bài, nhiệm vụ hiểu nguyên nhân và luận điểm rằng một tiêu chuẩn yếu biến người sáng lập thành nút thắt duyệt nội dung.',
    },
    do: [
      'Lấy trọng tâm khách hàng, một bằng chứng và nhiệm vụ nội dung đã hoàn thành.',
      'Điền các trường lõi trước khi mở công cụ AI.',
      'Kiểm tra luận điểm, giọng điệu, điều phải có, điều phải tránh và lời kêu gọi hành động.',
    ],
    qualityGate: [
      'Một người khác đọc bản giao việc phải biết bài dành cho ai, muốn thay đổi gì, dùng bằng chứng nào và muốn khách hàng làm gì.',
      'Không điền từ chung chung chỉ để vượt tiêu chí.',
    ],
    minimum: 'Một bản giao việc nội dung dùng lại được, đủ tám quyết định lõi và có bằng chứng khách hàng thật.',
  },
  {
    day: 5,
    slug: 'day-05',
    title: 'Quy trình không phải một câu lệnh thật dài',
    question: 'Làm sao biến bản giao việc thành quy trình?',
    threshold: 'Quy trình là chuỗi bước có đầu vào, đầu ra và tiêu chí kiểm tra; câu lệnh chỉ là cách giao việc trong chuỗi đó.',
    artifact: 'Câu lệnh quy trình nội dung v1 (Content Workflow Prompt)',
    locked: false,
    learn: [
      'Luồng tối giản là bản giao việc → ba góc khai thác → con người chọn → dàn ý → bản nháp → tự kiểm tra → yêu cầu chỉnh sửa.',
      'Quy trình giữ điểm quyết định của con người và cấm AI tự thêm số liệu, câu chuyện hoặc trích dẫn.',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Câu lệnh dừng lại trước khi viết để người sáng lập chọn góc',
      body: 'Studio Mộc yêu cầu AI kiểm tra bản giao việc, đề xuất ba góc và chờ con người chọn. Chỉ sau đó AI mới tạo dàn ý, bản nháp, tự kiểm tra và đề nghị sửa.',
    },
    do: [
      'Tạo câu lệnh quy trình nội dung từ bản giao việc của bốn ngày đầu.',
      'Đọc và sửa câu lệnh để phản ánh đúng tiêu chuẩn của doanh nghiệp.',
      'Sao chép câu lệnh sang công cụ AI bạn đang dùng và giữ quyền chọn góc.',
    ],
    qualityGate: [
      'Câu lệnh có đầu vào thật, cam kết đầu ra, ba góc khai thác, bước tự kiểm tra và điểm con người quyết định.',
      'Câu lệnh không cho phép AI bịa bằng chứng khách hàng.',
    ],
    minimum: 'Một câu lệnh quy trình nội dung có đủ luồng và đã được con người đọc lại trước khi dùng.',
  },
  {
    day: 6,
    slug: 'day-06',
    title: 'Bản nháp đầu tiên là nguyên liệu, không phải sản phẩm cuối',
    question: 'Quy trình có tạo được nội dung dùng thật không?',
    threshold: 'Một bản minh họa đẹp không chứng minh quy trình ổn định; cần chạy nhiều lần và tìm lỗi lặp lại.',
    artifact: 'Ba bản nháp và nhật ký phản hồi quy trình (Workflow Feedback Log)',
    locked: false,
    learn: [
      'Mỗi bản nháp được chấm sáu tiêu chí từ 0–2; ngưỡng dùng được là 9/12 và không tiêu chí nào bằng 0.',
      'Tự đánh giá không chứng minh chất lượng ngoài thị trường; người sáng lập vẫn phải xác minh luận điểm, bằng chứng, giọng điệu và quyết định sửa.',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Hai bản nháp cùng lộ một lỗi chung',
      body: 'Cả hai bản đầu của Studio Mộc đều giải thích quá dài trước khi đưa bằng chứng. Người sáng lập ghi lại lỗi lặp này và sửa câu lệnh để đưa câu khách hàng lên sớm hơn.',
    },
    do: [
      'Chạy quy trình ba lần với ba nhiệm vụ nội dung hoặc bằng chứng khác nhau.',
      'Tự chấm từng bản nháp bằng bảng kiểm sáu tiêu chí.',
      'Ghi một quyết định sửa cho từng bản nháp và lỗi lặp cần cập nhật vào quy trình.',
    ],
    qualityGate: [
      'Có đúng ba ô bản nháp và ít nhất hai bản đạt cấu trúc 9/12, không tiêu chí nào bằng 0.',
      'Mỗi bản đạt có ghi chú chỉnh sửa do người học ghi lại.',
      'Không coi điểm tự chấm là bằng chứng nội dung sẽ hiệu quả ngoài thị trường.',
    ],
    minimum: 'Hai bản nháp đã được đánh giá có điểm cấu trúc tối thiểu 9/12, không điểm 0 và có quyết định sửa.',
  },
  {
    day: 7,
    slug: 'day-07',
    title: 'Quy trình chỉ tồn tại khi được dùng trong thực tế',
    question: 'Làm sao tiếp tục dùng mà không bắt đầu lại?',
    threshold: 'Một tệp câu lệnh chưa phải quy trình; quy trình cần đầu vào, cách chạy, tiêu chuẩn và nhịp sử dụng.',
    artifact: 'Bộ khởi đầu quy trình nội dung v1.0 (Content Workflow Starter Kit)',
    locked: false,
    learn: [
      'Bộ khởi đầu đóng gói khách hàng, bằng chứng, bản giao việc, câu lệnh, nội dung đã đánh giá, bản tóm tắt một trang và kế hoạch tiếp tục.',
      'Tín hiệu ban đầu có thể là câu hỏi, phản hồi đúng nhóm, cuộc trò chuyện hoặc việc không có phản ứng như dự đoán.',
    ],
    see: {
      label: 'Tình huống mô phỏng',
      title: 'Studio Mộc biến một lần thử thành nhịp ba bài mỗi tuần',
      body: 'Người sáng lập chọn một bản nháp, gửi cho khách hàng phù hợp, ghi lại câu hỏi nhận được rồi đóng gói đầu vào, các bước, tiêu chuẩn, vai trò AI và vai trò con người thành bản tóm tắt một trang.',
    },
    do: [
      'Chọn một nội dung tốt nhất và đưa tới người thật bằng đăng công khai hoặc gửi trực tiếp.',
      'Ghi trạng thái chia sẻ và tín hiệu ban đầu.',
      'Hoàn thành bản tóm tắt một trang và sáu đề mục cho 14 ngày tiếp theo.',
      'Tải bộ khởi đầu thành tệp văn bản (.md) để giữ một bản ngoài trình duyệt.',
    ],
    qualityGate: [
      'Có tối thiểu sáu trong tám sản phẩm.',
      'Bắt buộc có trọng tâm khách hàng, ngân hàng bằng chứng, bản giao việc, câu lệnh quy trình, hai nội dung đã đánh giá và bản tóm tắt quy trình một trang.',
      'Không bắt trang web xác minh địa chỉ mạng xã hội; người học tự xác nhận trạng thái sử dụng ngoài đời.',
    ],
    minimum: 'Sáu sản phẩm bắt buộc, một nội dung đã đưa tới người thật và một tín hiệu ban đầu được ghi lại.',
  },
] as const

export function getContentWorkflowDay(slug: string): ContentWorkflowDay | undefined {
  return CONTENT_WORKFLOW_DAYS.find((lesson) => lesson.slug === slug)
}
