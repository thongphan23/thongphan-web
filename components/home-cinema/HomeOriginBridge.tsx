import { originStoryPublic } from '@/lib/origin-story-evidence'
import HomeTrackedLink from './HomeTrackedLink'
import { homepageEvents } from './homepage-events'
import styles from './HomeCinema.module.css'

export default function HomeOriginBridge() {
  const coreProductAct = originStoryPublic.acts.find((act) => act.id === 'core-product')
  const debtClaim = coreProductAct?.claims.find((claim) => claim.id === 'hstl-debt')

  if (!debtClaim) {
    throw new Error('Homepage origin bridge evidence is unavailable')
  }

  return (
    <aside
      className={styles.originBridge}
      aria-label="Từ bằng chứng đến câu chuyện thật"
      data-home-origin-bridge
    >
      <span className={styles.originBridgeSource}>Nguồn · {debtClaim.sourceLabel}</span>
      <p className={styles.originBridgeCausal}>Thắng sự chú ý. Thua sản phẩm cốt lõi.</p>
      <p className={styles.originBridgeConsequence}>{debtClaim.text}</p>
      <p className={styles.originBridgePresent}>Brain2 bắt đầu từ quyết định không bỏ phí bài học đó.</p>
      <HomeTrackedLink
        href="/about"
        className={styles.originBridgeAction}
        eventName={homepageEvents.originStory}
        data-motion-action
      >
        <span>Đọc câu chuyện thật</span>
        <span aria-hidden="true">→</span>
      </HomeTrackedLink>
    </aside>
  )
}
