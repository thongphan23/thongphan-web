'use client'

import { useId, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import PathLink from '@/components/two-path/PathLink'
import { tensaiContent } from '@/lib/two-path-content'
import styles from './TensaiTryCard.module.css'

// One question from a real Tensai lesson, set at reading size in front of the map screenshot.
// The visitor can pick an answer here; the app, not this page, says whether it is right.
export default function TensaiTryCard({ className = '' }: { className?: string }) {
  const card = tensaiContent.tryCard
  const [picked, setPicked] = useState<string | null>(null)
  const name = useId()

  return (
    <form className={`${styles.card} ${className}`} data-picked={picked ?? undefined} onSubmit={(event) => event.preventDefault()}>
      <div className={styles.top}>
        <span className={styles.lesson}>{card.lesson}</span>
        <span className={styles.label}>{card.label}</span>
      </div>
      <p className={styles.scenario}>
        {card.scenario.map((part) => ('strong' in part ? <strong key={part.text}>{part.text}</strong> : part.text))}
      </p>
      <fieldset className={styles.choices}>
        <legend className={styles.question}>{card.question}</legend>
        {card.options.map((option) => (
          <label key={option.key} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.key}
              checked={picked === option.key}
              onChange={() => setPicked(option.key)}
            />
            <span className={styles.key} aria-hidden="true">
              {option.key}
            </span>
            <span className={styles.optionText}>{option.text}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.foot}>
        {picked ? (
          <PathLink path="tensai" kind="outbound" placement="hero" className={styles.check} data-motion-action>
            {card.checkLive}
            <ArrowRight aria-hidden="true" size={17} />
          </PathLink>
        ) : (
          <button type="button" className={styles.check} disabled>
            {card.check}
          </button>
        )}
        <p className={styles.note} aria-live="polite">
          {picked ? card.handoff : card.pickHint}
        </p>
      </div>
      <p className={styles.encouragement}>{card.encouragement}</p>
    </form>
  )
}
