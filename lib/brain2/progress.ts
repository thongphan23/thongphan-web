export const BRAIN2_PROGRESS_STORAGE_KEY = 'thongphan:brain2:21:progress:v1'

export type Brain2Progress = {
  version: 1
  completed: Record<string, string>
  lastOpened?: string
}

const protectedLoaded = new Set<string>()

const emptyProgress = (): Brain2Progress => ({ version: 1, completed: {} })

const lessonDay = (slug: string) => {
  const match = /^ngay-(\d{2})$/.exec(slug)
  const day = match ? Number(match[1]) : 0
  return day >= 1 && day <= 21 ? day : null
}

const assertLessonSlug = (slug: string) => {
  const day = lessonDay(slug)
  if (!day) throw new RangeError(`Unknown Brain2 lesson slug: ${slug}`)
  return day
}

const canonicalTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return !Number.isNaN(date.valueOf()) && date.toISOString() === value
}

function parseProgress(raw: string | null): Brain2Progress {
  if (!raw) return emptyProgress()
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyProgress()
    const keys = Object.keys(value).sort()
    const allowed = value.lastOpened === undefined
      ? ['completed', 'version']
      : ['completed', 'lastOpened', 'version']
    if (keys.length !== allowed.length || keys.some((key, index) => key !== allowed[index])) return emptyProgress()
    if (value.version !== 1 || !value.completed || typeof value.completed !== 'object' || Array.isArray(value.completed)) {
      return emptyProgress()
    }

    const completed: Record<string, string> = {}
    for (const [slug, timestamp] of Object.entries(value.completed)) {
      if (!lessonDay(slug) || !canonicalTimestamp(timestamp)) return emptyProgress()
      completed[slug] = timestamp
    }
    if (value.lastOpened !== undefined && (!value.lastOpened || !lessonDay(value.lastOpened))) {
      return emptyProgress()
    }
    return {
      version: 1,
      completed,
      ...(value.lastOpened ? { lastOpened: value.lastOpened } : {}),
    }
  } catch {
    return emptyProgress()
  }
}

const browserStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

const persist = (progress: Brain2Progress) => {
  try {
    browserStorage()?.setItem(BRAIN2_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Local progress is an enhancement. Lessons remain usable when storage is blocked.
  }
  return progress
}

export function readBrain2Progress(): Brain2Progress {
  try {
    return parseProgress(browserStorage()?.getItem(BRAIN2_PROGRESS_STORAGE_KEY) ?? null)
  } catch {
    return emptyProgress()
  }
}

export function recordBrain2LessonOpened(slug: string): Brain2Progress {
  assertLessonSlug(slug)
  return persist({ ...readBrain2Progress(), lastOpened: slug })
}

export function setBrain2ProtectedLessonLoaded(slug: string, loaded: boolean): void {
  const day = assertLessonSlug(slug)
  if (day <= 7) return
  if (loaded) protectedLoaded.add(slug)
  else protectedLoaded.delete(slug)
}

export function markBrain2LessonComplete(slug: string, completedAt = new Date()): Brain2Progress {
  const day = assertLessonSlug(slug)
  if (day > 7 && !protectedLoaded.has(slug)) {
    throw new Error('Protected Brain2 lesson content must load before completion')
  }
  if (Number.isNaN(completedAt.valueOf())) throw new TypeError('Completion date must be valid')
  const current = readBrain2Progress()
  return persist({
    ...current,
    completed: { ...current.completed, [slug]: completedAt.toISOString() },
  })
}

export function nextBrain2Lesson(progress: Brain2Progress): string {
  if (progress.lastOpened && !progress.completed[progress.lastOpened]) return progress.lastOpened
  const startDay = progress.lastOpened ? (lessonDay(progress.lastOpened) ?? 0) + 1 : 1
  for (let day = startDay; day <= 21; day += 1) {
    const slug = `ngay-${String(day).padStart(2, '0')}`
    if (!progress.completed[slug]) return slug
  }
  for (let day = 1; day <= 21; day += 1) {
    const slug = `ngay-${String(day).padStart(2, '0')}`
    if (!progress.completed[slug]) return slug
  }
  return 'ngay-21'
}
