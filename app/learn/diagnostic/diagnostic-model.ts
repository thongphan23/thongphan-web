export type PlacementChallenge = {
  id: string
  question: string
  context: string
  options: [string, string, string]
  correctIndex: number
}

export type PlacementAnswers = Record<string, number | null>

export const placementChallenges: PlacementChallenge[] = [
  {
    id: 'task-fit',
    question: 'Việc nào phù hợp nhất để giao cho AI trước?',
    context: 'Bạn có 20 email phản hồi khách hàng và cần nhìn ra các chủ đề lặp lại.',
    options: ['Quyết định sa thải nhân sự', 'Nhóm email theo chủ đề để bạn kiểm tra', 'Tự gửi lời xin lỗi cho mọi khách hàng'],
    correctIndex: 1,
  },
  {
    id: 'clear-request',
    question: 'Yêu cầu nào giúp AI hiểu việc rõ nhất?',
    context: 'Bạn cần một email mời khách hàng cũ quay lại.',
    options: ['Viết email thật hay', 'Viết email ngắn', 'Đóng vai CSKH, viết cho khách cũ, mục tiêu là một lần mua lại'],
    correctIndex: 2,
  },
  {
    id: 'evidence',
    question: 'AI đưa ra một con số quan trọng nhưng không có nguồn. Bạn làm gì?',
    context: 'Con số này sẽ xuất hiện trong bản đề xuất gửi khách hàng.',
    options: ['Dùng vì câu trả lời nghe hợp lý', 'Yêu cầu nguồn và kiểm tra lại trước khi dùng', 'Đổi giọng văn cho tự tin hơn'],
    correctIndex: 1,
  },
  {
    id: 'format',
    question: 'Chi tiết nào làm đầu ra dễ dùng ngay hơn?',
    context: 'Bạn cần trình bày kết quả trong cuộc họp 10 phút.',
    options: ['Dùng thật nhiều thuật ngữ', 'Trình bày 3 ý, mỗi ý có bằng chứng và hành động', 'Viết càng dài càng tốt'],
    correctIndex: 1,
  },
  {
    id: 'privacy',
    question: 'Dữ liệu nào không nên đưa nguyên văn vào công cụ AI công khai?',
    context: 'Bạn đang nhờ AI tóm tắt phản hồi của khách hàng.',
    options: ['Tên và số điện thoại khách hàng', 'Danh sách chủ đề đã ẩn danh', 'Một mô tả tổng hợp không nhận diện cá nhân'],
    correctIndex: 0,
  },
  {
    id: 'iteration',
    question: 'Đầu ra chưa đạt. Cách sửa nào có hệ thống nhất?',
    context: 'Email đúng chủ đề nhưng chưa có lời kêu gọi hành động rõ.',
    options: ['Viết lại prompt hoàn toàn ngẫu nhiên', 'Thêm nhiều tính từ', 'Đối chiếu mục tiêu và bổ sung phần CTA đang thiếu'],
    correctIndex: 2,
  },
  {
    id: 'judgment',
    question: 'Ai chịu trách nhiệm cho quyết định cuối cùng?',
    context: 'AI đề xuất một thay đổi giá bán có tác động đến khách hàng.',
    options: ['AI vì nó đã phân tích', 'Người ra quyết định sau khi kiểm tra bằng chứng', 'Không ai nếu prompt đủ dài'],
    correctIndex: 1,
  },
  {
    id: 'workflow',
    question: 'Khi nào một prompt nên trở thành quy trình?',
    context: 'Đội của bạn lặp lại cùng một việc mỗi tuần.',
    options: ['Khi có bước, tiêu chí và đầu ra lặp lại được', 'Ngay khi prompt dài hơn ba dòng', 'Chỉ khi mua công cụ mới'],
    correctIndex: 0,
  },
]

export function scorePlacementAnswers(answers: PlacementAnswers) {
  const answered = placementChallenges.filter((challenge) => Number.isInteger(answers[challenge.id])).length
  const correct = placementChallenges.filter(
    (challenge) => answers[challenge.id] === challenge.correctIndex,
  ).length
  const confidence = Number(
    Math.min(0.9, 0.45 + (answered / placementChallenges.length) * 0.25 + (correct / placementChallenges.length) * 0.2).toFixed(2),
  )

  const recommendedStart =
    correct <= 2
      ? 'AI Foundation · Bài 1'
      : correct <= 5
        ? 'AI Foundation · Bài 3'
        : 'AI Foundation · Luyện tập Chặng 1'

  return { answered, correct, confidence, recommendedStart }
}
