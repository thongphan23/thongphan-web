export function brain2LessonHref(day: number): string {
  if (!Number.isInteger(day) || day < 1 || day > 21) {
    throw new RangeError('Brain2 lesson day must be an integer from 1 through 21')
  }
  return `/brain2/21-ngay/ngay-${String(day).padStart(2, '0')}`
}
