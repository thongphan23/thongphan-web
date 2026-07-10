import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ReadingSummary } from '@/lib/readings'
import styles from './Editorial.module.css'

export default function ReadNext({ readings }: { readings: ReadingSummary[] }) {
  if (!readings.length) return null

  return (
    <section className={styles.readNext} aria-labelledby="read-next-title">
      <p className={styles.sectionIndex}>Đọc tiếp</p>
      <h2 id="read-next-title">Ba lối rẽ để nghĩ tiếp.</h2>
      <div className={styles.readNextList}>
        {readings.map((reading, index) => (
          <Link href={reading.readingPath} key={reading.slug}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{reading.title}</strong>
            <small>{reading.author} · {reading.minutes} phút</small>
            <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.6} />
          </Link>
        ))}
      </div>
    </section>
  )
}
