'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, Check, Star, X } from 'lucide-react'
import PathLink from '@/components/two-path/PathLink'
import { tensaiContent } from '@/lib/two-path-content'
import styles from './TensaiLesson.module.css'

type Key = (typeof tensaiContent.lesson.options)[number]['key']

// The first exercise of the live Định vị course, playable on the page. It waits, unanswered, until
// the visitor picks: nothing answers it for them. A pick raises the app's verdict from the card's
// foot as a sheet (the way the app's own reply slides up), and the question slides up just enough
// (--lift) to keep the picked answer in view above it.
export default function TensaiLesson() {
  const lesson = tensaiContent.lesson
  const [picked, setPicked] = useState<Key | null>(null)
  const root = useRef<HTMLElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const firstOption = useRef<HTMLInputElement>(null)
  const name = useId()

  // How far the question has to slide up so the picked answer clears the verdict sheet. Layout
  // offsets ignore transforms, so the reading is the same mid-slide or under the stage's tilt.
  useEffect(() => {
    const el = root.current
    const content = body.current
    if (!el || !content) return
    const measure = () => {
      const option = picked ? el.querySelector<HTMLElement>(`[data-option="${picked}"]`) : null
      const sheet = picked ? el.querySelector<HTMLElement>(`[data-reply="${picked}"]`) : null
      if (!option || !sheet) {
        content.style.setProperty('--lift', '0px')
        content.removeAttribute('data-lifted')
        return
      }
      let top = 0
      for (let node: HTMLElement | null = option; node && node !== el; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop
      }
      const room = el.clientHeight - sheet.offsetHeight
      const lift = Math.max(0, Math.ceil(top + option.offsetHeight + 14 - room))
      content.style.setProperty('--lift', `${lift}px`)
      // A lifted question slides its case under the window's top edge; the CSS fades the case out.
      content.toggleAttribute('data-lifted', lift > 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [picked])

  const choice = lesson.options.find((option) => option.key === picked)
  const retry = () => {
    setPicked(null)
    firstOption.current?.focus()
  }

  return (
    <article
      ref={root}
      className={styles.card}
      data-lesson-root
      data-state={choice ? (choice.correct ? 'right' : 'wrong') : 'idle'}
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

      <div className={styles.view}>
        <div ref={body} className={styles.body}>
          <p className={styles.context}>
            {lesson.context.map((part) => ('strong' in part ? <strong key={part.text}>{part.text}</strong> : part.text))}
          </p>

          <fieldset className={styles.choices}>
            <legend id={`${name}-question`} className={styles.question}>
              {lesson.question}
            </legend>
            {lesson.options.map((option, index) => (
              <label
                key={option.key}
                className={styles.option}
                data-result={picked === option.key ? (option.correct ? 'right' : 'wrong') : undefined}
                data-option={option.key}
                data-cursor={lesson.cursorPick}
                data-cursor-tone="ink"
              >
                <input
                  ref={index === 0 ? firstOption : undefined}
                  type="radio"
                  name={name}
                  value={option.key}
                  checked={picked === option.key}
                  onChange={() => setPicked(option.key)}
                />
                <span className={styles.key} aria-hidden="true">
                  <span className={styles.keyLetter}>{option.key}</span>
                  <Check className={styles.keyRight} size={18} strokeWidth={3} />
                  <X className={styles.keyWrong} size={18} strokeWidth={3} />
                </span>
                <span className={styles.optionText}>{option.text}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      {/* One verdict sheet per answer, each resting below the card's foot until its answer is picked. */}
      <div className={styles.replies} data-lesson-replies>
        {lesson.options.map((option) => (
          <div
            key={option.key}
            className={`${styles.reply} ${option.correct ? styles.right : styles.wrong}`}
            data-reply={option.key}
            data-on={picked === option.key || undefined}
          >
            <p className={styles.verdict}>
              <span className={styles.badge} aria-hidden="true">
                {option.correct ? <Check size={20} strokeWidth={3.2} /> : <X size={20} strokeWidth={3.2} />}
              </span>
              {option.correct ? lesson.right : lesson.wrong}
            </p>
            <p className={styles.feedback}>{option.feedback}</p>
            {option.correct ? (
              <PathLink path="tensai" kind="outbound" placement="hero" className={styles.next} data-motion-action>
                {lesson.continue}
                <ArrowRight aria-hidden="true" size={18} />
              </PathLink>
            ) : (
              <button type="button" className={styles.retry} onClick={retry}>
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

type ReplayStep = { readonly title: string; readonly body: string }

const two = (value: number) => String(value).padStart(2, '0')

// The method's three steps played in one lesson window of the same Định vị course, so each one is
// seen happening rather than described: the lesson's one idea marked, an answer picked and the app's
// reply sliding up, then the course's path walked to its gate. On a page with motion the three
// screens sit in one tall strip that scrolls through the window with the page (tensai-stage.ts
// scrubs it, data-replay-* hooks), so every change is continuous: the marker sweeps, the strip moves
// on, the pointer travels to the answer, the sheet rises, the bar fills, the path lights stop by stop.
// A lime note beside the window rolls to each step's title. Decorative and inert: the hero holds the
// card a visitor can answer, and the steps beside the window say the same in words. Without motion
// the three screens stand finished in a column.
export function TensaiLessonReplay({ steps }: { steps: readonly ReplayStep[] }) {
  const lesson = tensaiContent.lesson
  const answer = lesson.options.find((option) => option.correct) ?? lesson.options[0]
  const tag = (index: number) => `${two(index + 1)} · ${steps[index]?.title ?? ''}`
  return (
    <div className={styles.replay} data-replay aria-hidden="true" inert>
      <div className={styles.bar}>
        <span className={styles.brand}>
          Tensai<span className={styles.spark}>✦</span>
        </span>
        <span className={styles.progress}>
          <span className={styles.progressLabel}>{lesson.chip}</span>
          <span className={styles.track}>
            <span className={`${styles.fill} ${styles.replayFill}`} data-replay-fill />
          </span>
        </span>
        <span className={styles.label}>{lesson.label}</span>
      </div>

      <div className={styles.screens}>
        <div className={styles.strip} data-replay-strip>
          {/* One idea: the case, then the line the lesson wants remembered, swept with the marker. */}
          <div className={styles.screen} data-screen="0">
            <p className={styles.screenTag}>{tag(0)}</p>
            <p className={styles.context}>
              {lesson.context.map((part) => ('strong' in part ? <strong key={part.text}>{part.text}</strong> : part.text))}
            </p>
            <div className={styles.idea}>
              <p className={styles.ideaLabel}>{lesson.rememberLabel}</p>
              <p className={styles.ideaText}>
                <span className={styles.ideaMark} data-replay-mark>
                  <span>{lesson.remember}</span>
                </span>
                <span className={styles.ideaInk}>{lesson.remember}</span>
              </p>
            </div>
          </div>

          {/* Try it: the pointer comes to the right answer, presses, the answer turns green and the
              app's reply rises from the foot. */}
          <div className={styles.screen} data-screen="1">
            <p className={styles.screenTag}>{tag(1)}</p>
            <p className={styles.replayQuestion}>{lesson.question}</p>
            <div className={styles.replayOptions}>
              {lesson.options.map((option) => (
                <div
                  key={option.key}
                  className={`${styles.option} ${option.key === answer.key ? styles.picked : styles.passed}`}
                  data-replay-picked={option.key === answer.key || undefined}
                >
                  <span className={styles.key}>
                    <span className={styles.keyLetter}>{option.key}</span>
                    <Check className={styles.keyRight} size={18} strokeWidth={3} />
                  </span>
                  <span className={styles.optionText}>{option.text}</span>
                  {option.key === answer.key && (
                    <span className={styles.replayCursor} data-replay-cursor>
                      <span className={styles.ghostArrow} data-replay-press>
                        <span className={styles.ghostArrowShape} />
                      </span>
                      <span className={styles.ghostRipple} data-replay-ripple />
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className={`${styles.reply} ${styles.right} ${styles.replayReply}`} data-replay-sheet>
              <p className={styles.verdict}>
                <span className={styles.badge}>
                  <Check size={20} strokeWidth={3.2} />
                </span>
                {lesson.right}
              </p>
              <p className={styles.feedback}>{answer.feedback}</p>
            </div>
          </div>

          {/* Pass the gate: the course's lessons done one by one, then the gate the path leads to. */}
          <div className={styles.screen} data-screen="2">
            <p className={styles.screenTag}>{tag(2)}</p>
            <ol className={styles.replayPath}>
              {lesson.path.map((name) => (
                <li key={name} className={styles.pathStop} data-replay-stop>
                  <span className={styles.pathNode}>
                    <Check size={22} strokeWidth={3.2} />
                  </span>
                  {name}
                </li>
              ))}
              <li className={`${styles.pathStop} ${styles.pathGateStop}`} data-replay-stop>
                <span className={styles.pathGate} data-replay-gate>
                  <Star size={26} strokeWidth={2.4} fill="currentColor" />
                </span>
                {lesson.gate}
              </li>
            </ol>
            <p className={styles.pathNote} data-replay-note>
              {lesson.pathNote}
            </p>
          </div>
        </div>
      </div>

      {/* The note beside the window: each step's own title, rolled in from below as its screen comes. */}
      <div className={styles.callout} data-replay-callout>
        <span className={styles.calloutRoll}>
          {steps.map((step, index) => (
            <span key={step.title} className={styles.calloutText} data-callout={index}>
              <b>{two(index + 1)}</b>
              {step.title}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
