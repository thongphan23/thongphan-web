import type { TwoPathPhotoId } from '@/lib/two-path-photos'
import TwoPathPhoto from './TwoPathPhoto'
import styles from './ConanShowcase.module.css'

type MentorCardsProps = {
  people: readonly { name: string; role: string; photoId: TwoPathPhotoId }[]
}

// The Thông Phan portrait is shot wider than the Đắc Nguyễn one; data-face='wide' crops it in so
// both faces fill the same frame at the same size (ConanShowcase.module.css).
const WIDE_PORTRAITS: readonly TwoPathPhotoId[] = ['mentor-thong-phan']

// Portraits open upward one after the other and lean toward a mouse pointer; the name and role sit
// under each portrait, never over the face.
export default function MentorCards({ people }: MentorCardsProps) {
  return (
    <ul className={styles.mentors}>
      {people.map((person, index) => (
        <li
          key={person.name}
          className={styles.mentor}
          data-focus-bloom
          data-face={WIDE_PORTRAITS.includes(person.photoId) ? 'wide' : undefined}
        >
          <div className={styles.mentorCard} data-motion-surface>
            <div
              className={styles.mentorFrame}
              data-img-reveal="up"
              data-reveal-delay={index ? '0.18' : undefined}
              data-tilt="4"
            >
              <div className={styles.mentorMedia} data-reveal-media>
                <TwoPathPhoto id={person.photoId} sizes="(max-width: 999px) 46vw, 600px" className={styles.mentorPhoto} />
              </div>
            </div>
          </div>
          <div className={styles.mentorCaption}>
            <p className={styles.mentorName}>{person.name}</p>
            <p className={styles.mentorRole}>{person.role}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
