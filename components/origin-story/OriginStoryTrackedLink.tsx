'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

export const ORIGIN_STORY_BRAIN2_EVENT = 'origin_story_brain2_clicked' as const

export default function OriginStoryTrackedLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        window.dispatchEvent(new CustomEvent(ORIGIN_STORY_BRAIN2_EVENT))
        onClick?.(event)
      }}
    />
  )
}
