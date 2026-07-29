'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const variants = [
  {
    id: 'devil-wears-prada',
    tab: '01 · Prada',
    title: 'Thành tích công sở và cái giá quan hệ',
    src: '/review/remotion-muc-dich-doi-song/media/devil-wears-prada-film-source-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/devil-wears-prada-film-source-v1-poster.jpg',
    focus: 'Đối chiếu công việc danh giá, sự biến đổi bản thân và đời sống riêng bị công việc lấn át.',
    strength: 'Gần nhất với người trẻ văn phòng; thảm đỏ và nhịp công việc thăng tiến là bằng chứng thành công trực tiếp.',
    risk: 'Các ý trừu tượng đầu video phụ thuộc vào việc đọc được đối trọng văn phòng và quan hệ.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/devil-wears-prada-source-casting-board.json',
  },
  {
    id: 'truman-show',
    tab: '02 · Truman',
    title: 'Tỉnh thức khỏi một mục đích bị áp đặt',
    src: '/review/remotion-muc-dich-doi-song/media/truman-show-film-source-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/truman-show-film-source-v1-poster.jpg',
    focus: 'Theo một tuyến nhân vật từ đời sống hoàn hảo được dàn dựng tới phản kháng và hậu quả lên người chung quanh.',
    strength: 'Cửa, màn hình, phòng điều khiển và phản ứng cơ thể tạo được mạch thức tỉnh - cưỡng ép - dư âm.',
    risk: 'Ẩn dụ kiểm soát rất mạnh nhưng bối cảnh ít gần đời sống công sở Việt Nam hơn bản Prada.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/truman-show-source-casting-board.json',
  },
  {
    id: 'inside-out',
    tab: '03 · Inside Out',
    title: 'Biến đời sống bên trong thành vật thể',
    src: '/review/remotion-muc-dich-doi-song/media/inside-out-film-source-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/inside-out-film-source-v1-poster.jpg',
    focus: 'Trạng thái, ký ức, áp lực và sự mất cân bằng được nhìn thấy trực tiếp qua hệ cảm xúc của nhân vật.',
    strength: 'Gần cách Soul diễn đạt nhất; giải thưởng, bảng điều khiển, DANGER và Sadness đều đọc được khi tắt tiếng.',
    risk: 'Độ rõ khái niệm cao nhưng chất hoạt hình có thể tạo khoảng cách tuổi tác với một phần người xem.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/inside-out-source-casting-board.json',
  },
] as const

export default function VideoReviewGallery() {
  const [activeId, setActiveId] = useState<(typeof variants)[number]['id']>('devil-wears-prada')
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
            <dt>Bằng chứng casting</dt>
            <dd>
              <a className={styles.evidenceLink} href={activeVariant.evidenceHref} target="_blank" rel="noreferrer">
                Mở casting board
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
