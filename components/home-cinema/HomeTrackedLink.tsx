'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { HomepageEvent } from './homepage-events'
type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: HomepageEvent
  eventDetail?: { slug: string }
}

export default function HomeTrackedLink({ eventName, eventDetail, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        window.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }))
        onClick?.(event)
      }}
    />
  )
}
