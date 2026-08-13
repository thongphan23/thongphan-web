const DISPLAY_TITLE_LIMIT = 88

function normalized(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi')
}

export function compactVideoTitle({
  title,
  sourceTitle,
}: {
  title: string
  sourceTitle: string
}) {
  let displayTitle = title.trim().replace(/\s+/g, ' ')
  const trailingParenthetical = displayTitle.match(/\s*\(([^()]*)\)\s*$/)

  if (trailingParenthetical && normalized(trailingParenthetical[1]) === normalized(sourceTitle)) {
    displayTitle = displayTitle.slice(0, trailingParenthetical.index).trim()
  }

  displayTitle = displayTitle.replace(/\s+[-–—]\s+(?:theo|by)\s+[^()]{2,80}$/iu, '').trim()
  if (displayTitle.length <= DISPLAY_TITLE_LIMIT) return displayTitle

  const candidate = displayTitle.slice(0, DISPLAY_TITLE_LIMIT - 1)
  const lastSpace = candidate.lastIndexOf(' ')
  return `${candidate.slice(0, lastSpace > 56 ? lastSpace : DISPLAY_TITLE_LIMIT - 1).trimEnd()}…`
}
