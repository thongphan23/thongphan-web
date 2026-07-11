import type { JourneyAction } from '@/lib/site-journey'

export type DiagnosticLevel = {
  min: number
  no: string
  name: string
  title: string
  diagnosis: string
  stuck: string
  next: string
  recommendations: [JourneyAction, JourneyAction, JourneyAction]
}

export const diagnosticQuestions = [
  { id: 'usage', question: 'Bạn đang dùng AI vào việc gì nhiều nhất?', options: [
    { label: 'Hỏi đáp lẻ tẻ, viết email, tóm tắt', score: 1 },
    { label: 'Tạo nội dung, dàn ý, ý tưởng, hình ảnh', score: 2 },
    { label: 'Có quy trình cố định cho công việc của mình', score: 3 },
    { label: 'Đã dùng AI để tạo tài liệu kéo khách, sản phẩm hoặc phễu bán', score: 4 },
  ] },
  { id: 'knowledge', question: 'Kiến thức chuyên môn của bạn đang được hệ thống hóa tới đâu?', options: [
    { label: 'Nằm trong đầu là chính', score: 1 },
    { label: 'Có ghi chú/tài liệu nhưng rời rạc', score: 2 },
    { label: 'Có phân loại, có khung tư duy, có ca thật', score: 3 },
    { label: 'Có kho tri thức dùng được với AI', score: 4 },
  ] },
  { id: 'content', question: 'Bạn đã biến chuyên môn thành nội dung kéo khách chưa?', options: [
    { label: 'Chưa, thỉnh thoảng mới đăng', score: 1 },
    { label: 'Có đăng nhưng chưa đều và chưa ra lead', score: 2 },
    { label: 'Có vài định dạng hiệu quả, có người hỏi mua/tư vấn', score: 3 },
    { label: 'Có hệ thống nội dung và biết bài nào tạo tiền', score: 4 },
  ] },
  { id: 'asset', question: 'Bạn có tài sản số nào từ kiến thức của mình chưa?', options: [
    { label: 'Chưa có gì rõ ràng', score: 1 },
    { label: 'Có checklist hoặc mẫu nhỏ', score: 2 },
    { label: 'Có tài liệu kéo khách, buổi thực hành hoặc khóa nhỏ', score: 3 },
    { label: 'Có lời mời mua, sản phẩm số hoặc phễu đang bán', score: 4 },
  ] },
  { id: 'safety', question: 'Dòng tiền thứ 2 của bạn đang ở mức nào?', options: [
    { label: 'Chưa có, mới nghĩ tới', score: 1 },
    { label: 'Có cơ hội lẻ tẻ nhưng chưa ổn định', score: 2 },
    { label: 'Có doanh thu phụ nhưng chưa đủ an toàn', score: 3 },
    { label: 'Đang tiến gần mức có thể lựa chọn nghỉ/chuyển hướng', score: 4 },
  ] },
] as const

export const diagnosticLevels: DiagnosticLevel[] = [
  { min: 0, no: '01', name: 'Task AI', title: 'Tầng 1, Task AI', diagnosis: 'Bạn đang dùng AI như trợ lý việc vặt. Có ích, nhưng chưa tạo lợi thế nghề nghiệp hay tài sản riêng.', stuck: 'Bạn đang kẹt ở câu hỏi lẻ, prompt lẻ, đầu ra lẻ. AI giúp nhanh hơn, nhưng chưa biết chuyên môn của bạn là gì.', next: 'Đọc lại bài nền tảng, rồi gom 10 ca thật hoặc kinh nghiệm thật trước khi học thêm công cụ.', recommendations: [
    { eyebrow: 'Đọc nền tảng', label: 'Đọc AI không cướp việc bạn', href: '/blog/ai-khong-cuop-viec-ban', reason: 'Gọi đúng vai trò của AI trước khi học thêm prompt hoặc công cụ.' },
    { eyebrow: 'Mở bản đồ', label: 'Xem lộ trình trong thư viện', href: '/library', reason: 'Chọn bài đọc theo vấn đề thay vì tiếp tục gom kiến thức ngẫu nhiên.' },
    { eyebrow: 'Gỡ một ca', label: 'Đem tình huống vào bàn hỏi', href: '/chat', reason: 'Nói rõ việc đang làm để nhận một hướng đi cụ thể hơn.' },
  ] },
  { min: 9, no: '02', name: 'Content Leverage', title: 'Tầng 2, Content Leverage', diagnosis: 'Bạn đã bắt đầu dùng AI để tạo nội dung hoặc đầu ra. Đây là bước tốt, nhưng chưa đủ để tạo tài sản.', stuck: 'Bạn đang kẹt ở chỗ có nội dung nhưng chưa có hệ thống chứng minh chuyên môn, kéo khách và tái sử dụng tri thức.', next: 'Chọn 3 chủ đề bạn có trải nghiệm thật, rồi biến mỗi chủ đề thành một bài có bằng chứng, câu chuyện và lời mời rõ.', recommendations: [
    { eyebrow: 'Đọc một ca thật', label: 'Xem bài 40 nội dung viral', href: '/blog/40-bai-viral-tui-hoc-duoc-gi', reason: 'Nhìn cách nội dung được đọc như dữ liệu thay vì chạy theo cảm hứng.' },
    { eyebrow: 'Tạo nhịp', label: 'Bắt đầu 21 ngày Brain2', href: '/challenges/brain2-21-ngay', reason: 'Gom trải nghiệm thật thành nguyên liệu có thể tái sử dụng với AI.' },
    { eyebrow: 'Đóng gói nhỏ', label: 'Chọn một tài sản để thử', href: '/assets', reason: 'Biến một chủ đề đã có phản hồi thành đầu ra dùng được.' },
  ] },
  { min: 13, no: '03', name: 'Brain2 Base', title: 'Tầng 3, Brain2 Base', diagnosis: 'Bạn đã có nền chuyên môn và bắt đầu thấy cần một Brain2. Đây là đoạn chuyển từ biết nhiều sang dùng được.', stuck: 'Bạn đang kẹt ở khâu nối tri thức: ghi chú, ca thật, góc nhìn, nội dung và AI chưa chảy thành một hệ thống.', next: 'Xây nền Brain2 đủ dùng: gom tri thức, tách ý một ý, nối với case thật, rồi dùng AI trên kho đó.', recommendations: [
    { eyebrow: 'Kích hoạt hệ thống', label: 'Bắt đầu 21 ngày Brain2', href: '/challenges/brain2-21-ngay', reason: 'Dùng một nhịp ngắn để biến ghi chú thành dữ liệu có liên kết.' },
    { eyebrow: 'Hiểu cấu trúc', label: 'Đọc cách xây Brain2', href: '/blog/xay-brain2-voi-obsidian', reason: 'Thấy rõ vai trò của ghi chú, liên kết và ca thật trong cùng một hệ.' },
    { eyebrow: 'Mở rộng góc nhìn', label: 'Đi vào thư viện sống', href: '/library', reason: 'Đọc những note và bài tuyển chọn theo đúng trạng thái hiện tại.' },
  ] },
  { min: 17, no: '04', name: 'Digital Asset', title: 'Tầng 4, Digital Asset', diagnosis: 'Bạn đã có khả năng biến chuyên môn thành tài sản số. Đoạn này bắt đầu cần thị trường, phản hồi và chuyển đổi.', stuck: 'Bạn đang kẹt ở việc đóng gói: tài liệu, lời mời mua, phễu, assistant hoặc sản phẩm nhỏ chưa có nhịp thử thật.', next: 'Đưa một tài sản ra môi trường có phản hồi: nội dung kéo khách, workshop nhỏ, tài liệu chẩn đoán hoặc offer thử.', recommendations: [
    { eyebrow: 'Đi vào môi trường thật', label: 'Vào Conan Maker', href: '/conanmaker/', reason: 'Thử tài sản trong nhịp có phản hồi, tiêu chuẩn đầu ra và người cùng làm.' },
    { eyebrow: 'Chọn đầu ra', label: 'Xem kho tài sản nhỏ', href: '/assets', reason: 'Chọn một định dạng vừa sức để thử với thị trường trước.' },
    { eyebrow: 'Chốt tình huống', label: 'Chat để chọn tài sản đầu tiên', href: '/chat', reason: 'Đưa bối cảnh và nguồn lực hiện có vào trước khi quyết định.' },
  ] },
  { min: 19, no: '05', name: 'Conan Ready', title: 'Tầng 5, Conan Ready', diagnosis: 'Bạn đã có nền đủ rõ để bước vào môi trường thực hành sâu. Lúc này học thêm một mình sẽ chậm.', stuck: 'Bạn không còn kẹt ở kiến thức. Bạn kẹt ở nhịp thực thi, phản hồi, tiêu chuẩn đầu ra và cộng đồng cùng làm thật.', next: 'Vào Conan Maker để tiếp tục nhịp thực hành, nhận góp ý và giữ accountability dài hạn.', recommendations: [
    { eyebrow: 'Bước vào chương mới', label: 'Vào Conan Maker', href: '/conanmaker/', reason: 'Đưa năng lực hiện có vào một môi trường thực thi và phản hồi dài hạn.' },
    { eyebrow: 'Bổ sung năng lực', label: 'Xem chương trình học', href: '/learn', reason: 'Chọn đúng phần năng lực còn thiếu thay vì học lại từ đầu.' },
    { eyebrow: 'Kiểm tra quyết định', label: 'Hỏi Brain2 trước khi vào', href: '/chat', reason: 'Làm rõ mục tiêu, thời gian và đầu ra mong muốn trước khi cam kết.' },
  ] },
]

export function getDiagnosticLevel(score: number): DiagnosticLevel {
  return [...diagnosticLevels].reverse().find((level) => score >= level.min) ?? diagnosticLevels[0]
}
