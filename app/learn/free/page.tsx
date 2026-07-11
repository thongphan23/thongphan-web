import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLearnCourse } from '@/lib/learn-catalog'
import { learnPublicEnabled } from '@/lib/learn-release'
import CourseDetail from '../courses/CourseDetail'

export const metadata: Metadata = {
  title: 'AI Foundation miễn phí | Thông Phan Learn',
  description: 'Khóa học AI tương tác miễn phí giúp người đi làm giao đúng việc cho AI, viết yêu cầu rõ và kiểm chứng đầu ra.',
  alternates: { canonical: '/learn/free' },
}

export default function LearnFreePage() {
  if (!learnPublicEnabled) notFound()

  const course = getLearnCourse('ai-foundation')
  if (!course) return null
  return <CourseDetail course={course} />
}
