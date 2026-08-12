import type { PublicVideo } from '../../lib/vid/contracts'
import type { LocalLibrary } from '../../lib/vid/local-library'
import VideoCard from './VideoCard'
import styles from './Vid.module.css'

export default function VideoGrid({
  videos,
  library,
  loading = false,
  error,
  emptyTitle = 'Chưa có video',
  emptyBody = 'Thư viện đang được tuyển chọn. Video mới sẽ xuất hiện tại đây khi đã hoàn chỉnh.',
  onRetry,
  onToggleWatchLater,
}: {
  videos: PublicVideo[]
  library: LocalLibrary
  loading?: boolean
  error?: string | null
  emptyTitle?: string
  emptyBody?: string
  onRetry?: () => void
  onToggleWatchLater?: (slug: string) => void
}) {
  if (loading) {
    return <div className={styles.videoGrid} aria-live="polite" aria-busy="true">{Array.from({ length: 8 }, (_, index) => <span className={styles.skeletonCard} key={index} />)}</div>
  }
  if (error) {
    return <div className={styles.statePanel} role="alert"><h2>Không tải được thư viện</h2><p>{error}</p>{onRetry && <button type="button" onClick={onRetry}>Thử lại</button>}</div>
  }
  if (!videos.length) {
    return <div className={styles.statePanel} aria-live="polite"><h2>{emptyTitle}</h2><p>{emptyBody}</p></div>
  }

  return (
    <div className={styles.videoGrid} aria-live="polite">
      {videos.map((video, index) => {
        const item = library.progress.find(({ slug }) => slug === video.slug)
        return <VideoCard
          key={video.slug}
          video={video}
          priority={index < 4}
          progress={item ? (item.seconds / item.duration) * 100 : 0}
          watchLater={library.watchLater.includes(video.slug)}
          onToggleWatchLater={onToggleWatchLater}
        />
      })}
    </div>
  )
}
