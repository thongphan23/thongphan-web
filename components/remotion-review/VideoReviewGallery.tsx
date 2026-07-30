'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const variants = [
  {
    id: 'about-time',
    tab: '01 · About Time',
    title: 'Ý nghĩa qua sự hiện diện và người thân',
    src: '/review/remotion-muc-dich-doi-song/media/about-time-visual-proposition-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/about-time-visual-proposition-v1-poster.jpg',
    focus: 'Đi từ bình yên, công việc và kết quả tới áp lực rồi hậu quả lan sang gia đình.',
    strength: 'Khoảnh khắc đời thường và quan hệ giúp ý về mục đích bên trong có vật chứng gần gũi.',
    risk: 'Một số đoạn công việc có sắc thái nhẹ, cần kiểm tra lực tương phản ở cao trào.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/about-time-visual-selection-review.md',
  },
  {
    id: 'click',
    tab: '02 · Click',
    title: 'Thành tựu bên ngoài và phần đời bị bỏ lỡ',
    src: '/review/remotion-muc-dich-doi-song/media/click-visual-proposition-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/click-visual-proposition-v1-poster.jpg',
    focus: 'Dùng công việc, thành tựu, xung đột và mất mát để cho thấy cái giá của sự lệch pha.',
    strength: 'Có đối trọng trực tiếp giữa thành công nhìn thấy được và hậu quả quan hệ.',
    risk: 'Tương phản mạnh nhưng một số cảnh có chất hài; cần chấm xem có làm giảm độ nghiêm túc không.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/click-visual-selection-review.md',
  },
  {
    id: 'up-in-the-air',
    tab: '03 · Up in the Air',
    title: 'Hiệu suất nghề nghiệp và sự cô lập',
    src: '/review/remotion-muc-dich-doi-song/media/up-in-the-air-visual-proposition-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/up-in-the-air-visual-proposition-v1-poster.jpg',
    focus: 'Sân bay, văn phòng, họp hành và sự cô độc tạo một mạch gần đời sống người đi làm thành thị.',
    strength: 'Bối cảnh nghề nghiệp có độ nhận diện cao với nhóm khán giả mục tiêu 25-35 tuổi.',
    risk: 'Có một cảnh gia đình trung tính ngoài phim; cần chấm độ liền mạch khi chuyển nguồn.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/up-in-the-air-visual-selection-review.md',
  },
] as const

export default function VideoReviewGallery() {
  const [activeId, setActiveId] = useState<(typeof variants)[number]['id']>('about-time')
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
          <div>
            <dt>Bằng chứng lựa chọn</dt>
            <dd>
              <a className={styles.evidenceLink} href={activeVariant.evidenceHref} target="_blank" rel="noreferrer">
                Mở quyết định hình ảnh
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
