'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { HomepageEvent } from './homepage-events'
type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: HomepageEvent
  eventDetail?: { slug: string }
}

export default function HomeTrackedLink({ eventName, eventDetail, onClick, ...props }: TrackedLinkProps) {
  const handleClick: NonNullable<TrackedLinkProps['onClick']> = (event) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }))
    onClick?.(event)
  }

  if (props.href === '/conanmaker/') {
    const {
      href: _href,
      locale: _locale,
      prefetch: _prefetch,
      replace: _replace,
      scroll: _scroll,
      shallow: _shallow,
      ...anchorProps
    } = props
    return <a {...anchorProps} href="/conanmaker/" onClick={handleClick} />
  }

  return (
    <Link
      {...props}
      onClick={handleClick}
    />
  )
}
