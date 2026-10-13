'use client'

import Link from 'next/link'
import type { ComponentPropsWithoutRef, MouseEvent } from 'react'
import {
  doorEvent,
  outboundEvent,
  outboundUrl,
  PATH_ROUTES,
  type PathKey,
  type Placement,
} from '@/lib/two-path-links'

type PathLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  path: PathKey
  // door: the branch page on thongphan.com; outbound: the product site, same tab, with UTM.
  kind: 'door' | 'outbound'
  placement: Placement
  'data-motion-action'?: boolean
}

export default function PathLink({ path, kind, placement, onClick, ...props }: PathLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const measured = kind === 'door' ? doorEvent(path, placement) : outboundEvent(path, placement)
    window.dispatchEvent(new CustomEvent(measured.name, { detail: measured.detail }))
    onClick?.(event)
  }

  if (kind === 'outbound') {
    return <a {...props} href={outboundUrl(path, placement)} onClick={handleClick} />
  }

  return <Link {...props} href={PATH_ROUTES[path]} onClick={handleClick} />
}
