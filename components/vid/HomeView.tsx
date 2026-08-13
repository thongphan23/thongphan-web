'use client'

import { ArrowRight, Play } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'
import { listTopics, type PublicTopic } from '../../lib/vid/api-client'
import { getFeaturedPresentation } from '../../lib/vid/presentation'
import InfiniteVideoFeed from './InfiniteVideoFeed'
import VideoGrid from './VideoGrid'
import styles from './Vid.module.css'
import { useInfiniteVideoFeed } from './useInfiniteVideoFeed'
import { useLocalLibraryState } from './useLocalLibraryState'
import VidLink from './VidLink'

const homeFilters = { limit: 24 }

export default function HomeView() {
  const feed = useInfiniteVideoFeed(homeFilters)
  const [topics, setTopics] = useState<PublicTopic[]>([])
  const { library, toggleLater } = useLocalLibraryState()

  useEffect(() => {
    const controller = new AbortController()
    void listTopics({ signal: controller.signal })
      .then((items) => setTopics(items.filter(({ videoCount }) => videoCount > 0)))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const videos = feed.items
  const featured = videos.find(({ featuredRank }) => featuredRank !== null) ?? videos[0]
  const featuredPresentation = featured ? getFeaturedPresentation(featured) : null
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
  const hiddenSlugs = new Set([
    featured?.slug,
    ...recent.slice(0, 8).map(({ slug }) => slug),
    ...topicLanes.flatMap(({ videos: items }) => items.map(({ slug }) => slug)),
  ].filter((slug): slug is string => Boolean(slug)))

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
            <p>NỔI BẬT</p>
            <h1 id="featured-title" title={featured.title}>{featuredPresentation?.headline}</h1>
            <span>{featuredPresentation?.speaker}</span>
            <VidLink href={`/watch?v=${encodeURIComponent(featured.slug)}`}><Play fill="currentColor" aria-hidden="true" /> Xem ngay</VidLink>
          </div>
        </section>
      )}

      {feed.status !== 'error' && <section aria-labelledby="recent-title">
        <header className={styles.sectionHeading}>
          <div><p>VỪA LÊN KỆ</p><h2 id="recent-title">Mới tuyển chọn</h2></div>
          {!!recent.length && <VidLink href="/topic?slug=all">Xem tất cả <ArrowRight aria-hidden="true" /></VidLink>}
        </header>
        <VideoGrid videos={recent.slice(0, 8)} library={library} loading={feed.status === 'loading'} onToggleWatchLater={toggleLater} />
      </section>}

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

      <section aria-labelledby="all-videos-title">
        <header className={styles.sectionHeading}><div><p>TOÀN BỘ THƯ VIỆN</p><h2 id="all-videos-title">Chiếu tiếp</h2></div></header>
        <InfiniteVideoFeed feed={feed} filters={homeFilters} library={library} hiddenSlugs={hiddenSlugs} emptyTitle="Chưa có video phù hợp" emptyBody="Thư viện đang được tuyển chọn." onToggleWatchLater={toggleLater} />
      </section>
    </div>
  )
}
