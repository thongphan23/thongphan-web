import type { AnchorHTMLAttributes } from 'react'

/** Full document navigation is intentional: the Vid Worker owns these short subdomain routes. */
export default function VidLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />
}
