'use client'

import { useEffect, type ReactNode } from 'react'

import type { Brain2LessonAccess } from '@/lib/brain2/lesson-contract'

export type Brain2Event =
  | { name: 'brain2_hub_viewed' }
  | { name: 'brain2_lesson_opened'; detail: { day: number; access: Brain2LessonAccess } }
  | { name: 'brain2_access_gate_viewed'; detail: { day: number } }
  | { name: 'brain2_access_granted'; detail: { day: number } }
  | { name: 'brain2_access_failed'; detail: { day: number; category: 'invalid' | 'rate-limited' | 'unavailable' } }
  | { name: 'brain2_prompt_copied'; detail: { day: number; blockId: string } }
  | { name: 'brain2_lesson_completed'; detail: { day: number } }
  | { name: 'brain2_conan_handoff_clicked'; detail: { placement: 'day-07' | 'day-21' | 'hub' } }

export function dispatchBrain2Event(event: Brain2Event) {
  const detail = 'detail' in event ? event.detail : undefined
  window.dispatchEvent(new CustomEvent(event.name, { detail }))
}

export default function Brain2Analytics({ event }: { event: Brain2Event }) {
  const name = event.name
  const detail = 'detail' in event ? event.detail : undefined

  useEffect(() => {
    dispatchBrain2Event(detail ? { name, detail } as Brain2Event : { name } as Brain2Event)
  }, [name, detail])

  return null
}

export function Brain2ConanLink({
  placement,
  children,
  className,
}: {
  placement: 'day-07' | 'day-21' | 'hub'
  children: ReactNode
  className?: string
}) {
  return (
    <a
      className={className}
      href="/conanmaker/"
      data-motion-action
      onClick={() => dispatchBrain2Event({
        name: 'brain2_conan_handoff_clicked',
        detail: { placement },
      })}
    >
      {children}
    </a>
  )
}
