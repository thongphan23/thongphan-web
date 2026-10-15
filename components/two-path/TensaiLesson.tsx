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
//
// While the card is on screen and nobody has touched it, a ghost pointer answers it by itself on a
// slow loop (first a straight right answer, then the way the app teaches: a wrong pick, "Chọn lại",
// then the right one). Hovering, touching, typing or scrolling into the pinned sequence hands the
// card back; reduced motion gets no loop at all.
type Ghost = HTMLSpanElement

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('aborted', 'AbortError'))
    const id = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('aborted', 'AbortError'))
      },
      { once: true },
    )
  })

export default function TensaiLesson() {
  const lesson = tensaiContent.lesson
  const [picked, setPicked] = useState<Key | null>(null)
  const [demo, setDemo] = useState(false)
  const root = useRef<HTMLElement>(null)
  const ghost = useRef<Ghost>(null)
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
    const pointer = ghost.current
    if (!el) return

    // Who owns the card right now: the ghost loop pauses for each of these and never resumes after
    // a visitor has taken over for good.
    let tookOver = false
    let hovering = false
    let scrolled = false
    let onScreen = false
    let cycle = 0
    let loop: AbortController | null = null
    let resume = 0
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const target = (name: string) => el.querySelector<HTMLElement>(`[data-ghost-target="${name}"]`)
    // A point inside the card's own box, in the card's coordinates (undoing any tilt scale).
    const place = (node: HTMLElement | null, at: { x: number; y: number }) => {
      if (!node || !pointer) return null
      const card = el.getBoundingClientRect()
      const box = node.getBoundingClientRect()
      const scale = card.width / el.offsetWidth || 1
      return {
        x: (box.left - card.left + box.width * at.x) / scale,
        y: (box.top - card.top + box.height * at.y) / scale,
      }
    }
    const aim = (name: string, at = { x: 0.5, y: 0.55 }) => {
      const point = place(target(name), at)
      if (!point || !pointer) return
      pointer.style.setProperty('--gx', `${point.x}px`)
      pointer.style.setProperty('--gy', `${point.y}px`)
    }
    const hover = (name: string | null) => {
      el.querySelectorAll<HTMLElement>('[data-ghost-hover]').forEach((node) => node.removeAttribute('data-ghost-hover'))
      if (name) target(name)?.setAttribute('data-ghost-hover', '')
    }
    const tap = () => {
      if (!pointer) return
      pointer.removeAttribute('data-press')
      void pointer.offsetWidth
      pointer.setAttribute('data-press', '')
    }
    const hide = () => {
      hover(null)
      pointer?.setAttribute('data-ghost', 'off')
    }

    const run = async (signal: AbortSignal) => {
      if (!pointer) return
      try {
        for (;;) {
          await sleep(cycle === 0 ? 2600 : 1600, signal)
          // Enter from the card's lower right, snapped there while still invisible.
          pointer.setAttribute('data-snap', '')
          const start = place(el, { x: 0.86, y: 0.84 })
          if (start) {
            pointer.style.setProperty('--gx', `${start.x}px`)
            pointer.style.setProperty('--gy', `${start.y}px`)
          }
          void pointer.offsetWidth
          pointer.removeAttribute('data-snap')
          pointer.setAttribute('data-ghost', 'on')
          const answer = async (key: Key) => {
            aim(key, { x: 0.3, y: 0.55 })
            await sleep(1050, signal)
            hover(key)
            await sleep(260, signal)
            tap()
            await sleep(140, signal)
            set({ picked: key, demo: true })
            hover(null)
          }
          if (cycle > 0) {
            await answer('B')
            await sleep(2100, signal)
            aim('retry-B', { x: 0.5, y: 0.5 })
            await sleep(1000, signal)
            tap()
            await sleep(160, signal)
            set({ picked: null, demo: false })
            await sleep(500, signal)
          }
          await answer('A')
          await sleep(3600, signal)
          pointer.setAttribute('data-ghost', 'off')
          await sleep(500, signal)
          set({ picked: null, demo: false })
          cycle += 1
        }
      } catch {
        // Aborted: whoever stopped the loop decides what the card shows next.
      }
    }

    const stop = () => {
      loop?.abort()
      loop = null
      window.clearTimeout(resume)
      hide()
    }
    const clearGhostPick = () => {
      if (live.current.demo) set({ picked: null, demo: false })
    }
    const start = () => {
      if (!motionOk || !pointer || loop || tookOver || hovering || scrolled || !onScreen) return
      if (document.visibilityState !== 'visible') return
      loop = new AbortController()
      void run(loop.signal)
    }
    const later = (ms: number) => {
      window.clearTimeout(resume)
      resume = window.setTimeout(start, ms)
    }

    const onDemo = (event: Event) => {
      const play = (event as CustomEvent<{ play: boolean }>).detail?.play
      if (play) {
        scrolled = true
        stop()
      }
      if (play && (!live.current.picked || live.current.demo)) set({ picked: 'A', demo: true })
      if (!play && live.current.demo) set({ picked: null, demo: false })
      if (!play) {
        scrolled = false
        later(1800)
      }
    }
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      hovering = true
      stop()
      clearGhostPick()
    }
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      hovering = false
      later(2200)
    }
    const takeOver = () => {
      tookOver = true
      stop()
      clearGhostPick()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') later(1200)
      else stop()
    }

    el.addEventListener('lesson:demo', onDemo)
    let observer: IntersectionObserver | null = null
    if (motionOk && pointer) {
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('pointerdown', takeOver)
      el.addEventListener('keydown', takeOver)
      el.addEventListener('focusin', takeOver)
      document.addEventListener('visibilitychange', onVisibility)
      observer = new IntersectionObserver(
        ([entry]) => {
          // Mostly in view: half of the card, or half of the screen's height when the card is taller.
          onScreen =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight * 0.55)
          if (onScreen) later(600)
          else {
            stop()
            clearGhostPick()
          }
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      )
      observer.observe(el)
    }
    return () => {
      stop()
      observer?.disconnect()
      el.removeEventListener('lesson:demo', onDemo)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', takeOver)
      el.removeEventListener('keydown', takeOver)
      el.removeEventListener('focusin', takeOver)
      document.removeEventListener('visibilitychange', onVisibility)
    }
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
            data-ghost-target={option.key}
            data-cursor={lesson.cursorPick}
            data-cursor-tone="ink"
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
                data-ghost-target={`retry-${option.key}`}
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

      {/* The ghost pointer of the idle loop: decorative, never takes a click, gone for anyone who
          touches the card. */}
      <span ref={ghost} className={styles.ghost} data-ghost="off" aria-hidden="true">
        <span className={styles.ghostY}>
          <span className={styles.ghostArrow}>
            <span className={styles.ghostArrowShape} />
          </span>
          <span className={styles.ghostRipple} />
        </span>
      </span>
    </article>
  )
}
