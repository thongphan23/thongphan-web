import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLearnCourse, learnCourses } from '@/lib/learn-catalog'
import { learnPublicEnabled } from '@/lib/learn-release'
import CourseDetail from '../CourseDetail'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return learnCourses.map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = getLearnCourse(slug)
  if (!course) return { title: 'Không tìm thấy khóa học | Thông Phan Learn' }
  return {
    title: `${course.title} | Thông Phan Learn`,
    description: course.promise,
    alternates: { canonical: `/learn/courses/${course.slug}` },
    openGraph: {
      title: course.title,
      description: course.promise,
      url: `/learn/courses/${course.slug}`,
      type: 'website',
      images: [course.image],
    },
  }
}

export default async function LearnCoursePage({ params }: Props) {
  if (!learnPublicEnabled) notFound()

  const { slug } = await params
  const course = getLearnCourse(slug)
  if (!course) notFound()
  return <CourseDetail course={course} />
}
