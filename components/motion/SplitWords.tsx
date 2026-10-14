import { Fragment, type CSSProperties } from 'react'

type SplitWordsProps = {
  text: string
  // Index of the first word, so several SplitWords in one heading share one stagger.
  start?: number
}

// Server-side word split for first-screen headlines. Each word rises out of its own
// mask with a pure CSS animation (styles/motion.css), so the intro runs on first paint
// without waiting for any JavaScript. Spaces stay real text nodes for screen readers.
export default function SplitWords({ text, start = 0 }: SplitWordsProps) {
  return text.split(' ').map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      {index > 0 ? ' ' : null}
      <span className="intro-word">
        <span style={{ '--i': start + index } as CSSProperties}>{word}</span>
      </span>
    </Fragment>
  ))
}

export function wordCount(text: string) {
  return text.split(' ').length
}
