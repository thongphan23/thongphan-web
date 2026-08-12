'use client'

import { useEffect, useState } from 'react'
import { listVideos } from '../../lib/vid/api-client'
import type { PublicVideo } from '../../lib/vid/contracts'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'
import { useLocalLibraryState } from './useLocalLibraryState'

async function fetchLibraryVideos(signal: AbortSignal) {
  return (await listVideos({ limit: 24 }, { signal })).items
}

export default function LocalLibraryView() {
  const [videos, setVideos] = useState<PublicVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { library, ready, toggleLater } = useLocalLibraryState()

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
      setError('Kết nối mất quá nhiều thời gian. Hãy thử lại.')
      setLoading(false)
    }, 8_000)
    void fetchLibraryVideos(controller.signal)
      .then(setVideos)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Kết nối bị gián đoạn.')
      })
      .finally(() => {
        window.clearTimeout(timeout)
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [])

  const continuing = library.progress.flatMap((item) => {
    const video = videos.find(({ slug }) => slug === item.slug)
    return video ? [video] : []
  })
  const later = library.watchLater.flatMap((slug) => {
    const video = videos.find((item) => item.slug === slug)
    return video ? [video] : []
  })

  return (
    <div className={styles.viewStack}>
      <header className={styles.pageHeading}><p>LƯU TRÊN THIẾT BỊ NÀY</p><h1>Thư viện của bạn</h1><span>Không cần tài khoản. Tiến độ không rời khỏi trình duyệt.</span></header>
      <section aria-labelledby="continue-title"><div className={styles.sectionHeading}><div><p>ĐANG XEM</p><h2 id="continue-title">Xem tiếp</h2></div></div><VideoGrid videos={continuing} library={library} loading={loading || !ready} error={error} emptyTitle="Chưa có video đang xem" emptyBody="Video bạn xem quá 10 giây sẽ xuất hiện tại đây." onRetry={() => window.location.reload()} onToggleWatchLater={toggleLater} /></section>
      <section aria-labelledby="later-title"><div className={styles.sectionHeading}><div><p>ĐÃ LƯU</p><h2 id="later-title">Xem sau</h2></div></div><VideoGrid videos={later} library={library} loading={loading || !ready} error={error} emptyTitle="Chưa có video trong Xem sau" emptyBody="Chọn biểu tượng lưu trên một video để xem lại sau." onRetry={() => window.location.reload()} onToggleWatchLater={toggleLater} /></section>
    </div>
  )
}
