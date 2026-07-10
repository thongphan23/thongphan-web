export type MenuKeyAction = 'none' | 'close' | 'focus-first' | 'focus-last'

type MenuKeyInput = {
  key: string
  shiftKey: boolean
  activeIndex: number
  itemCount: number
}

export function resolveMenuKeyAction({
  key,
  shiftKey,
  activeIndex,
  itemCount,
}: MenuKeyInput): MenuKeyAction {
  if (key === 'Escape') return 'close'
  if (key !== 'Tab' || itemCount <= 0) return 'none'

  const focusIsOutside = activeIndex < 0 || activeIndex >= itemCount
  if (focusIsOutside) return shiftKey ? 'focus-last' : 'focus-first'
  if (shiftKey && activeIndex === 0) return 'focus-last'
  if (!shiftKey && activeIndex === itemCount - 1) return 'focus-first'
  return 'none'
}
