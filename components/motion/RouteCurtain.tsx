'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

type RouteCurtainProps = {
  pathname: string
}

// The curtain names the page it is taking you to and takes the tone of that path.
const LABELS: Record<string, string> = {
  '/': 'Trang chủ',
  '/tensai': 'Tensai',
  '/conan': 'Conan School',
  '/about': 'Về Thông',
}
const TONES: Record<string, string> = { '/tensai': 'lime', '/conan': 'lacquer' }
const COVER_MS = 760
const REVEAL_MS = 980
const FAILSAFE_MS = 4000

function normalise(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

// Internal link clicks close an ink curtain over the page, navigate under it and open it
// again on the next page. Modified clicks, new tabs, downloads, other origins, same-page
// hashes, history navigation and reduced motion all keep the browser's own behaviour.
export default function RouteCurtain({ pathname }: RouteCurtainProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  const reveal = useCallback(() => {
    const curtain = ref.current
    if (!curtain || curtain.dataset.state !== 'cover') return
    clearTimers()
    curtain.dataset.state = 'reveal'
    timers.current.push(
      window.setTimeout(() => {
        curtain.dataset.state = 'idle'
      }, REVEAL_MS),
    )
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const curtain = ref.current
      if (!curtain || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const anchor = (event.target as Element | null)?.closest('a')
      if (!anchor?.href || anchor.hasAttribute('download') || 'noTransition' in anchor.dataset) return
      if (anchor.target && anchor.target !== '_self') return
      const url = new URL(anchor.href, window.location.href)
      const path = normalise(url.pathname)
      if (url.origin !== window.location.origin || path === normalise(window.location.pathname)) return

      event.preventDefault()
      clearTimers()
      if (labelRef.current) labelRef.current.textContent = LABELS[path] ?? 'Thông Phan'
      curtain.dataset.tone = TONES[path] ?? 'paper'
      curtain.dataset.state = 'cover'
      timers.current.push(
        window.setTimeout(() => router.push(url.pathname + url.search + url.hash), COVER_MS),
        window.setTimeout(reveal, COVER_MS + FAILSAFE_MS),
      )
    }
    window.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('click', onClick, true)
      clearTimers()
    }
  }, [router, reveal])

  // The next page has committed; give it two frames to mount its motion, then open.
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(reveal)
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [pathname, reveal])

  return (
    <div ref={ref} className="route-curtain" data-state="idle" data-tone="paper" aria-hidden="true">
      <span className="route-curtain__lead" />
      <span className="route-curtain__panel">
        <span className="route-curtain__mark">Thông Phan</span>
        <span className="route-curtain__mask">
          <span ref={labelRef} className="route-curtain__label" />
        </span>
      </span>
    </div>
  )
}
