export function columnCountForWidth(width: number) {
  if (width <= 580) return 1
  if (width <= 940) return 2
  if (width <= 1180) return 3
  return 4
}

export function visibleRowRange({
  itemCount,
  columns,
  rowHeight,
  rowGap,
  scrollTop,
  viewportHeight,
  overscanRows,
}: {
  itemCount: number
  columns: number
  rowHeight: number
  rowGap: number
  scrollTop: number
  viewportHeight: number
  overscanRows: number
}) {
  const total = Math.ceil(itemCount / columns)
  const rowSize = Math.max(1, rowHeight + rowGap)
  const start = Math.max(0, Math.floor(scrollTop / rowSize) - overscanRows)
  const end = Math.min(total, Math.max(start, Math.ceil((scrollTop + viewportHeight) / rowSize) + overscanRows))
  return { start, end, total }
}
