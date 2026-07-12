import Link from 'next/link'
import {
  getJourneyHandoff,
  type JourneyAction,
  type JourneyKey,
} from '@/lib/site-journey'
import styles from './ChapterHandoff.module.css'

type ChapterHandoffProps = {
  journeyKey: JourneyKey
  tone: 'dark' | 'paper'
  className?: string
}

function ActionLink({ action }: { action: JourneyAction }) {
  if (action.href === '/conanmaker/') {
    return (
      <a href={action.href} data-motion-action>
        {action.label} <span aria-hidden="true">→</span>
      </a>
    )
  }

  if (action.external) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" data-motion-action>
        {action.label} <span aria-hidden="true">↗</span>
      </a>
    )
  }

  return (
    <Link href={action.href} data-motion-action>
      {action.label} <span aria-hidden="true">→</span>
    </Link>
  )
}

export default function ChapterHandoff({
  journeyKey,
  tone,
  className = '',
}: ChapterHandoffProps) {
  const handoff = getJourneyHandoff(journeyKey)
  const actions = [handoff.primary, ...handoff.secondary]

  return (
    <section
      className={`${styles.handoff} ${className}`.trim()}
      data-tone={tone}
      data-motion-reveal="fade"
      aria-labelledby={`handoff-${journeyKey}`}
    >
      <header className={styles.intro}>
        <p>{handoff.chapter}</p>
        <h2 id={`handoff-${journeyKey}`}>{handoff.title}</h2>
        <span>{handoff.description}</span>
      </header>

      <div className={styles.actions}>
        {actions.map((action, index) => (
          <article key={action.href} data-primary={index === 0} data-motion-surface>
            <p>{action.eyebrow}</p>
            <span>{action.reason}</span>
            <ActionLink action={action} />
          </article>
        ))}
      </div>
    </section>
  )
}
