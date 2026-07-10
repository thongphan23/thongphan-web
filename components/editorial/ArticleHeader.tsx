import Link from 'next/link'
import { topicLabel } from '@/lib/library-discovery'
import styles from './Editorial.module.css'

type ArticleHeaderProps = {
  author: string
  description: string
  label: string
  minutes: number
  source: string
  title: string
  topics: string[]
}

export default function ArticleHeader({
  author,
  description,
  label,
  minutes,
  source,
  title,
  topics,
}: ArticleHeaderProps) {
  return (
    <header className={styles.articleHeader}>
      <Link href="/library/read" className={styles.backLink}>Tuyển đọc thế giới</Link>
      <p className={styles.articleLabel}>{label}</p>
      <h1>{title}</h1>
      <p className={styles.articleDescription}>{description}</p>
      <dl className={styles.articleMeta}>
        <div><dt>Tác giả bài gốc</dt><dd>{author}</dd></div>
        <div><dt>Nguồn</dt><dd>{source}</dd></div>
        <div><dt>Thời lượng bài gốc</dt><dd>{minutes} phút</dd></div>
      </dl>
      <ul className={styles.topicList} aria-label="Chủ đề">
        {topics.map((topic) => <li key={topic}>{topicLabel(topic)}</li>)}
      </ul>
    </header>
  )
}
