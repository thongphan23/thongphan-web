'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const variants = [
  {
    id: 'soul',
    tab: '01 · Soul',
    title: 'Khái niệm trở thành hình ảnh',
    src: '/review/remotion-muc-dich-doi-song/media/soul-silent-first-v2-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/soul-silent-first-v2-poster.jpg',
    focus: 'Độ rõ của “mục đích bên trong”, tỉnh thức và sự mất kết nối với đời sống.',
    strength: 'Ngoại hóa trạng thái bên trong rõ nhất; 25 shot dùng 25 nguồn riêng biệt.',
    risk: 'Chất hoạt hình có thể làm thông điệp bớt gần trải nghiệm trưởng thành.',
  },
  {
    id: 'walter-mitty',
    tab: '02 · Mitty',
    title: 'Một hành trình có hướng và có điểm quay về',
    src: '/review/remotion-muc-dich-doi-song/media/walter-mitty-silent-first-v2-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/walter-mitty-silent-first-v2-poster.jpg',
    focus: 'Sự cân bằng giữa người thật, hành động, không gian mở và khoảng lặng.',
    strength: 'Đi một chiều từ văn phòng đến hành trình, rồi chỉ quay về để thấy hậu quả.',
    risk: 'Cảnh hành trình vẫn có thể bị đọc như phiêu lưu nếu voice không khóa được ý nội tâm.',
  },
  {
    id: 'whiplash',
    tab: '03 · Whiplash',
    title: 'Cái giá của thành tích lệch gốc',
    src: '/review/remotion-muc-dich-doi-song/media/whiplash-silent-first-v2-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/whiplash-silent-first-v2-poster.jpg',
    focus: 'Lực cảm xúc của áp lực, cưỡng ép, kiệt sức và trống rỗng sau thành tích.',
    strength: 'Talking-head đã nhường chỗ cho nhạc cụ, di chuyển, va chạm, kiệt sức và phản ứng.',
    risk: 'Phim thể hiện cái giá của thành tích mạnh hơn trạng thái an nhiên.',
  },
] as const

export default function VideoReviewGallery() {
  const [activeId, setActiveId] = useState<(typeof variants)[number]['id']>('soul')
  const activeVariant = useMemo(
    () => variants.find((variant) => variant.id === activeId) ?? variants[0],
    [activeId],
  )

  return (
    <section className={styles.review} aria-labelledby="review-heading">
      <div className={styles.tabs} role="group" aria-label="Chọn phiên bản video">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            className={variant.id === activeId ? styles.tabActive : styles.tab}
            aria-pressed={variant.id === activeId}
            onClick={() => setActiveId(variant.id)}
          >
            {variant.tab}
          </button>
        ))}
      </div>

      <div className={styles.playerStage}>
        <video
          key={activeVariant.id}
          className={styles.player}
          controls
          playsInline
          preload="metadata"
          poster={activeVariant.poster}
        >
          <source src={activeVariant.src} type="video/mp4" />
          Trình duyệt này không hỗ trợ video H.264.
        </video>
      </div>

      <div className={styles.reviewGrid} aria-live="polite">
        <header>
          <span className={styles.variantNumber}>{activeVariant.tab}</span>
          <h2 id="review-heading">{activeVariant.title}</h2>
          <p>{activeVariant.focus}</p>
        </header>
        <dl className={styles.lensNotes}>
          <div>
            <dt>Điểm mạnh dự kiến</dt>
            <dd>{activeVariant.strength}</dd>
          </div>
          <div>
            <dt>Rủi ro cần kiểm tra</dt>
            <dd>{activeVariant.risk}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
