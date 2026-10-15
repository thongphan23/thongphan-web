'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, Check, Star, X } from 'lucide-react'
import PathLink from '@/components/two-path/PathLink'
import { tensaiContent } from '@/lib/two-path-content'
import styles from './TensaiLesson.module.css'

type Key = (typeof tensaiContent.lesson.options)[number]['key']

// The first exercise of the live Định vị course, playable on the page: pick an answer and the app's
// own reply appears. On wide screens the hero's scroll sequence (lessonStage) can answer it once as
// a demo through a `lesson:demo` event; a visitor's own pick is never undone by scrolling.
export default function TensaiLesson() {
  const lesson = tensaiContent.lesson
  const [picked, setPicked] = useState<Key | null>(null)
  const [demo, setDemo] = useState(false)
  const root = useRef<HTMLElement>(null)
  const firstOption = useRef<HTMLInputElement>(null)
  // Mirrors the state for the event handler, written together with it so quick play/rewind pairs
  // between renders still see the latest pick.
  const live = useRef<{ picked: Key | null; demo: boolean }>({ picked: null, demo: false })
  const name = useId()

  const set = (next: { picked: Key | null; demo: boolean }) => {
    live.current = next
    setPicked(next.picked)
    setDemo(next.demo)
  }

  useEffect(() => {
    const el = root.current
    if (!el) return
    const onDemo = (event: Event) => {
      const play = (event as CustomEvent<{ play: boolean }>).detail?.play
      if (play && !live.current.picked) set({ picked: 'A', demo: true })
      if (!play && live.current.demo) set({ picked: null, demo: false })
    }
    el.addEventListener('lesson:demo', onDemo)
    return () => el.removeEventListener('lesson:demo', onDemo)
  }, [])

  const choice = lesson.options.find((option) => option.key === picked)
  const pick = (key: Key) => set({ picked: key, demo: false })
  const retry = () => {
    set({ picked: null, demo: false })
    firstOption.current?.focus()
  }

  return (
    <article
      ref={root}
      className={styles.card}
      data-lesson-root
      data-state={choice ? (choice.correct ? 'right' : 'wrong') : 'idle'}
      data-demo={demo || undefined}
      aria-labelledby={`${name}-question`}
    >
      <header className={styles.bar}>
        <span className={styles.brand}>
          Tensai<span className={styles.spark} aria-hidden="true">✦</span>
        </span>
        <span className={styles.progress}>
          <span className={styles.progressLabel}>{lesson.chip}</span>
          <span className={styles.track} aria-hidden="true">
            <span className={styles.fill} />
          </span>
        </span>
        <span className={styles.label}>{lesson.label}</span>
      </header>

      <p className={styles.context}>
        {lesson.context.map((part) => ('strong' in part ? <strong key={part.text}>{part.text}</strong> : part.text))}
      </p>

      <fieldset className={styles.choices}>
        <legend id={`${name}-question`} className={styles.question}>
          {lesson.question}
        </legend>
        <p className={styles.lead}>{lesson.lead}</p>
        {lesson.options.map((option, index) => (
          <label
            key={option.key}
            className={styles.option}
            data-result={picked === option.key ? (option.correct ? 'right' : 'wrong') : undefined}
          >
            <input
              ref={index === 0 ? firstOption : undefined}
              type="radio"
              name={name}
              value={option.key}
              checked={picked === option.key}
              onChange={() => pick(option.key)}
            />
            <span className={styles.key} aria-hidden="true">
              <span className={styles.keyLetter}>{option.key}</span>
              <Check className={styles.keyRight} size={16} strokeWidth={3} />
              <X className={styles.keyWrong} size={16} strokeWidth={3} />
            </span>
            <span className={styles.optionText}>{option.text}</span>
          </label>
        ))}
      </fieldset>

      {/* Every reply is laid out in one cell so the card keeps its height whichever one shows. */}
      <div className={styles.replies} data-lesson-replies>
        {/* Before an answer: the invitation, and where this lesson sits in the course. */}
        <div className={`${styles.reply} ${styles.idle}`} data-on={!choice || undefined}>
          <p className={styles.encourage}>{lesson.encouragement}</p>
          <ol className={styles.path} aria-label={lesson.pathNote}>
            {lesson.path.map((step, index) => (
              <li key={step} data-step={index === 0 ? 'current' : undefined}>
                <span className={styles.node} aria-hidden="true">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
            <li className={styles.gate}>
              <span className={styles.node} aria-hidden="true">
                <Star size={13} strokeWidth={2.4} />
              </span>
              {lesson.gate}
            </li>
          </ol>
        </div>
        {lesson.options.map((option) => (
          <div
            key={option.key}
            className={`${styles.reply} ${option.correct ? styles.right : styles.wrong}`}
            data-on={picked === option.key || undefined}
          >
            <p className={styles.verdict}>
              {option.correct ? lesson.right : lesson.wrong} <span>{option.feedback}</span>
            </p>
            {option.correct ? (
              <>
                <p className={styles.remember}>
                  <strong>{lesson.rememberLabel}</strong> {lesson.remember}
                </p>
                <PathLink
                  path="tensai"
                  kind="outbound"
                  placement="hero"
                  className={styles.next}
                  data-motion-action
                >
                  {lesson.continue}
                  <ArrowRight aria-hidden="true" size={17} />
                </PathLink>
              </>
            ) : (
              <button
                type="button"
                className={styles.retry}
                onClick={retry}
              >
                {lesson.retry}
              </button>
            )}
          </div>
        ))}
        <p className={styles.srOnly} aria-live="polite">
          {choice ? `${choice.correct ? lesson.right : lesson.wrong} ${choice.feedback}` : ''}
        </p>
      </div>

    </article>
  )
}
