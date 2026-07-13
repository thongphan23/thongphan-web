import Image from 'next/image'
import Link from 'next/link'
import type { ExperienceDefinition } from '@/lib/experiences'
import styles from './ExperienceCard.module.css'

export default function ExperienceCard({
  experience,
  index,
}: {
  experience: ExperienceDefinition
  index: number
}) {
  return (
    <article
      className={styles.card}
      data-experience-id={experience.id}
      data-motion-surface
      data-reveal
    >
      <figure className={styles.media} data-fit={experience.media.fit}>
        <Image
          src={experience.media.src}
          alt={experience.media.alt}
          width={experience.media.width}
          height={experience.media.height}
          style={{ objectPosition: experience.media.position }}
        />
        <figcaption>TP / EXPERIENCE / {String(index + 1).padStart(2, '0')}</figcaption>
      </figure>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span>{experience.durationLabel}</span>
          <span>{experience.access.label}</span>
        </div>
        <h2>{experience.title}</h2>
        <p className={styles.promise}>{experience.promise}</p>
        <dl>
          <div><dt>Phù hợp</dt><dd>{experience.audience}</dd></div>
          <div><dt>Đầu ra</dt><dd>{experience.output}</dd></div>
        </dl>
        <Link href={experience.href} className={styles.action} data-motion-action>
          {experience.ctaLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
