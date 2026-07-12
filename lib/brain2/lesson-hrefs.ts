const INTERNAL_LESSON_HREF =
  /^\/(?!\/)(?:[A-Za-z0-9._~!$&'()*+,;=:@%/-])*(?:\?[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)?(?:#[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)?$/

export function isExternalLessonHref(href: string): boolean {
  if (href.includes('\\') || !/^https:\/\//i.test(href)) return false
  try {
    return new URL(href).protocol === 'https:'
  } catch {
    return false
  }
}

export function isInternalLessonHref(href: string): boolean {
  return !href.includes('\\') && INTERNAL_LESSON_HREF.test(href)
}
