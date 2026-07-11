export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export function splitSseEvents(remainder: string, chunk: string) {
  const blocks = `${remainder}${chunk}`.split(/\r?\n\r?\n/)
  const nextRemainder = blocks.pop() ?? ''
  const events = blocks.flatMap((block) => block.split(/\r?\n/).filter((line) => line.startsWith('data: ')))
  return { events, remainder: nextRemainder }
}

export const suggestedQuestions = [
  'Tui có chuyên môn nhưng chưa biết biến thành tiền, bắt đầu từ đâu?',
  'Làm sao để AI không viết nội dung chung chung?',
  'Brain2 khác gì ứng dụng ghi chú?',
  'Tui nên xây tài sản số gì từ kiến thức của mình?',
  'Tui đi làm toàn thời gian, tạo dòng tiền thứ 2 thế nào cho an toàn?',
]

export function getMockResponse(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('brain2')) return 'Brain2 là hệ thống quản lý tri thức cá nhân của tui. Nghe ghê vậy thôi, thực ra là cách tui làm cho AI hiểu mình hơn bằng ghi chú, ca thật và những ý được nối lại.'
  if (lower.includes('ai') || lower.includes('cướp')) return 'AI không cướp việc bạn đâu. Người dùng AI giỏi hơn bạn mới cướp. Kinh nghiệm thật cộng với AI là một lợi thế lớn, miễn là kinh nghiệm đó được hệ thống hóa thành dữ liệu, tiêu chuẩn và quy trình.'
  if (lower.includes('conan')) return 'Conan School là nơi tui và anh Đắc xây để người đi làm dùng AI đúng cách: không học công cụ cho vui, mà xây hệ thống và tạo đầu ra thật từ chuyên môn.'
  return 'Tui là Thông Phan. Tui giúp người có chuyên môn biến kiến thức thành tài sản, hệ thống AI và dòng tiền thứ hai. Hãy cho tui biết tình huống thật, thứ bạn đã thử và chỗ đang kẹt.'
}
