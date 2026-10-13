import type { TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './TwoPath.module.css'

type MentorCardsProps = {
  people: readonly { name: string; role: string; photoId: TwoPathPhotoId }[]
}

export default function MentorCards({ people }: MentorCardsProps) {
  return (
    <ul className={styles.mentors}>
      {people.map((person) => (
        <li key={person.name} className={styles.mentor} data-motion-surface>
          <TwoPathPhoto id={person.photoId} sizes="(max-width: 639px) 46vw, 240px" className={styles.mentorPhoto} />
          <p className={styles.mentorName}>{person.name}</p>
          <p className={styles.mentorRole}>{person.role}</p>
        </li>
      ))}
    </ul>
  )
}
