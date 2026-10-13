'use client'

import { ArrowRight } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { browserStorage, PATH_MEMORY_EVENT, readStoredPath } from '@/lib/path-memory'
import { PATH_LABELS } from '@/lib/two-path-links'
import PathLink from './PathLink'
import styles from './TwoPath.module.css'

type PathResumeProps = {
  copy: { prefix: string; action: string }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(PATH_MEMORY_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(PATH_MEMORY_EVENT, onChange)
  }
}

const readPath = () => readStoredPath(browserStorage())

// The wrapper always reserves its height so the line appearing after hydration never shifts the layout.
export default function PathResume({ copy }: PathResumeProps) {
  const path = useSyncExternalStore(subscribe, readPath, () => null)

  return (
    <div className={styles.resume}>
      {path ? (
        <p className={styles.resumeLine}>
          <span>
            {copy.prefix} {PATH_LABELS[path]}.
          </span>
          <PathLink path={path} kind="door" placement="hero" className={styles.resumeLink} data-motion-action>
            {copy.action}
            <ArrowRight aria-hidden="true" size={16} />
          </PathLink>
        </p>
      ) : null}
    </div>
  )
}
