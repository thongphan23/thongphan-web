import type { Metadata } from 'next'
import { getLearnCourse } from '@/lib/learn-catalog'
import CourseDetail from '../courses/CourseDetail'

export const metadata: Metadata = {
  title: 'AI Foundation miễn phí | Thông Phan Learn',
  description: 'Khóa học AI tương tác miễn phí giúp người đi làm giao đúng việc cho AI, viết yêu cầu rõ và kiểm chứng đầu ra.',
  alternates: { canonical: '/learn/free' },
}

export default function LearnFreePage() {
  const course = getLearnCourse('ai-foundation')
  if (!course) return null
  return <CourseDetail course={course} />
}
