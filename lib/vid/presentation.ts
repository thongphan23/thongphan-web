const DISPLAY_TITLE_LIMIT = 88
const FEATURED_TITLE_LIMIT = 48

const featuredEditorialBySourceTitle: Record<string, { headline: string; speaker: string }> = {
  'principles for dealing with the changing world order by ray dalio': {
    headline: 'Trật tự thế giới đang thay đổi',
    speaker: 'Ray Dalio',
  },
}

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

export function getFeaturedPresentation(video: {
  title: string
  sourceTitle: string
  sourceCreator: string
}) {
  const editorial = featuredEditorialBySourceTitle[normalized(video.sourceTitle)]
  if (editorial) return editorial

  const compactTitle = compactVideoTitle(video)
  const pipeAttribution = compactTitle.match(/\s+\|\s+(.+)$/u)
  const title = pipeAttribution && normalized(pipeAttribution[1]) === normalized(video.sourceCreator)
    ? compactTitle.slice(0, pipeAttribution.index).trim()
    : compactTitle
  if (title.length <= FEATURED_TITLE_LIMIT) {
    return { headline: title, speaker: video.sourceCreator }
  }

  const candidate = title.slice(0, FEATURED_TITLE_LIMIT - 1)
  const lastSpace = candidate.lastIndexOf(' ')
  return {
    headline: `${candidate.slice(0, lastSpace > 28 ? lastSpace : FEATURED_TITLE_LIMIT - 1).trimEnd()}…`,
    speaker: video.sourceCreator,
  }
}
