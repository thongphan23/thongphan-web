export type Challenge = { id: string; slug: string; title: string; tagline: string | null; description: string | null; duration_days: number; is_active: number; created_at: string }

export const challenges: Challenge[] = [{
  id: 'brain2-21-days', slug: 'brain2-21-ngay', title: '21 ngày Brain2, kích hoạt kho kiến thức của bạn',
  tagline: 'Điểm bắt đầu để biến chuyên môn thành tài sản số bằng AI',
  description: 'Mỗi ngày 15 phút để gom kinh nghiệm, ca thật, góc nhìn và bằng chứng thật vào một hệ thống. Sau 21 ngày, bạn có nền để vào Conan Maker và bắt đầu tạo đầu ra thật.',
  duration_days: 21, is_active: 1, created_at: '2026-05-01',
}]

export function getChallenge(slug: string) { return challenges.find((challenge) => challenge.slug === slug) ?? null }
