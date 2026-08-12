'use client'

import { ArrowRight, Play } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'
import { listTopics, listVideos, type PublicTopic } from '../../lib/vid/api-client'
import type { PublicVideo } from '../../lib/vid/contracts'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'
import { useLocalLibraryState } from './useLocalLibraryState'
import VidLink from './VidLink'

async function fetchHomeData(signal: AbortSignal) {
  const [catalog, topics] = await Promise.all([
    listVideos({ pageSize: 48 }, { signal }),
    listTopics({ signal }),
  ])
  return { videos: catalog.items, topics: topics.filter(({ videoCount }) => videoCount > 0) }
}

export default function HomeView() {
  const [videos, setVideos] = useState<PublicVideo[]>([])
  const [topics, setTopics] = useState<PublicTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { library, toggleLater } = useLocalLibraryState()

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
      setError('Kết nối mất quá nhiều thời gian. Hãy thử lại.')
      setLoading(false)
    }, 8_000)
    void fetchHomeData(controller.signal)
      .then((result) => {
        setVideos(result.videos)
        setTopics(result.topics)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Kết nối bị gián đoạn.')
      })
      .finally(() => {
        window.clearTimeout(timeout)
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [])

  const featured = videos.find(({ featuredRank }) => featuredRank !== null) ?? videos[0]
  const videosWithoutFeatured = featured ? videos.filter(({ slug }) => slug !== featured.slug) : videos
  const recent = videosWithoutFeatured.length ? videosWithoutFeatured : videos
  const continuing = library.progress.flatMap((progress) => {
    const item = videos.find(({ slug }) => slug === progress.slug)
    return item ? [item] : []
  }).slice(0, 4)
  const topicLanes = topics.slice(0, 2).map((topic) => ({
    topic,
    videos: videos.filter((video) => video.topics.includes(topic.slug)).slice(0, 4),
  })).filter(({ videos: items }) => items.length)

  return (
    <div className={styles.viewStack}>
      <nav className={styles.topicRail} aria-label="Chủ đề video">
        <VidLink href="/topic?slug=all">Tất cả</VidLink>
        {topics.map((topic) => <VidLink key={topic.slug} href={`/topic?slug=${encodeURIComponent(topic.slug)}`}>{topic.label}<span>{topic.videoCount}</span></VidLink>)}
      </nav>

      {featured && (
        <section className={styles.featured} aria-labelledby="featured-title">
          <span
            className={styles.featuredImage}
            data-vid-featured-media
            aria-hidden="true"
            style={{ '--focal-x': `${featured.thumbnailFocalX ?? 50}%`, '--focal-y': `${featured.thumbnailFocalY ?? 24}%` } as CSSProperties}
          >
            <Image src={featured.thumbnailUrl} alt="" fill unoptimized priority sizes="(max-width: 780px) 100vw, 56vw" />
          </span>
          <span className={styles.featuredShade} aria-hidden="true" />
          <div data-vid-featured-copy>
            <p>SUẤT CHIẾU NỔI BẬT</p>
            <h1 id="featured-title">{featured.title}</h1>
            <span>{featured.sourceCreator} · {featured.topics[0]}</span>
            <VidLink href={`/watch?v=${encodeURIComponent(featured.slug)}`}><Play fill="currentColor" aria-hidden="true" /> Xem ngay</VidLink>
          </div>
        </section>
      )}

      <section aria-labelledby="recent-title">
        <header className={styles.sectionHeading}>
          <div><p>VỪA LÊN KỆ</p><h2 id="recent-title">Mới tuyển chọn</h2></div>
          {!!recent.length && <VidLink href="/topic?slug=all">Xem tất cả <ArrowRight aria-hidden="true" /></VidLink>}
        </header>
        <VideoGrid videos={recent.slice(0, 8)} library={library} loading={loading} error={error} onRetry={() => window.location.reload()} onToggleWatchLater={toggleLater} />
      </section>

      {!!continuing.length && <section aria-labelledby="home-continue-title">
        <header className={styles.sectionHeading}><div><p>ĐANG XEM</p><h2 id="home-continue-title">Xem tiếp</h2></div><VidLink href="/library?tab=continue">Mở thư viện <ArrowRight aria-hidden="true" /></VidLink></header>
        <VideoGrid videos={continuing} library={library} onToggleWatchLater={toggleLater} />
      </section>}

      {!!topicLanes.length && <section aria-labelledby="topic-lanes-title" className={styles.topicLanes}>
        <header className={styles.sectionHeading}><div><p>TUYỂN THEO MẠCH</p><h2 id="topic-lanes-title">Theo chủ đề</h2></div></header>
        {topicLanes.map(({ topic, videos: items }) => <div key={topic.slug}>
          <header className={styles.laneHeading}><h3>{topic.label}</h3><VidLink href={`/topic?slug=${encodeURIComponent(topic.slug)}`}>Xem chủ đề <ArrowRight aria-hidden="true" /></VidLink></header>
          <VideoGrid videos={items} library={library} onToggleWatchLater={toggleLater} />
        </div>)}
      </section>}

      {recent.length > 8 && <section aria-labelledby="all-videos-title">
        <header className={styles.sectionHeading}><div><p>TOÀN BỘ THƯ VIỆN</p><h2 id="all-videos-title">Chiếu tiếp</h2></div></header>
        <VideoGrid videos={recent.slice(8)} library={library} onToggleWatchLater={toggleLater} />
      </section>}
    </div>
  )
}
