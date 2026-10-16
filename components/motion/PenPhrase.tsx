type PenPhraseProps = {
  text: string
  // The words of text the guide's pen marks (guide-pen.ts); the first occurrence is used.
  phrase: string
  pen: 'circle' | 'underline' | 'arrow' | 'link'
  tone?: 'lacquer' | 'lime' | 'ember' | 'paper' | 'ink'
  start?: string
  end?: string
}

// Sets one phrase of a content string apart in a span for the guide's pen. The text itself is
// unchanged, so readers, screen readers and search see the same sentence.
export default function PenPhrase({ text, phrase, pen, tone, start, end }: PenPhraseProps) {
  const at = text.indexOf(phrase)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <span data-pen={pen} data-pen-tone={tone} data-pen-start={start} data-pen-end={end}>
        {phrase}
      </span>
      {text.slice(at + phrase.length)}
    </>
  )
}
