import {
  BRAIN2_LESSON_METADATA,
  BRAIN2_PUBLIC_LESSONS,
} from './brain2-data.generated'
import type {
  Brain2LessonMeta,
  Brain2LessonPackage,
} from './lesson-contract'

export { brain2LessonHref } from './routes'

const metaBySlug = new Map<string, Brain2LessonMeta>(
  BRAIN2_LESSON_METADATA.map((meta) => [meta.slug, meta]),
)
const publicBySlug: Readonly<Record<string, Brain2LessonPackage>> = BRAIN2_PUBLIC_LESSONS

export function getBrain2LessonMeta(slug: string): Brain2LessonMeta | null {
  return metaBySlug.get(slug) ?? null
}

export function getPublicBrain2Lesson(slug: string): Brain2LessonPackage | null {
  return Object.hasOwn(publicBySlug, slug) ? publicBySlug[slug] : null
}

export function getBrain2LessonParams(): Array<{ day: string }> {
  return BRAIN2_LESSON_METADATA.map(({ slug }) => ({ day: slug }))
}

export const brain2LessonMetadata: readonly Brain2LessonMeta[] = BRAIN2_LESSON_METADATA
