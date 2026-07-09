'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

const homepageEvents = {
  primary: 'homepage_primary_cta_clicked',
  proof: 'homepage_proof_opened',
  path: 'homepage_path_selected',
  conan: 'homepage_conan_handoff_clicked',
} as const

type HomepageEvent = (typeof homepageEvents)[keyof typeof homepageEvents]
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

export { homepageEvents }
