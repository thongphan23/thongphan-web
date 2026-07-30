'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const variants = [
  {
    id: 'direct-proof',
    tab: '01 · Bằng chứng trực tiếp',
    title: 'Đổi phim theo ý, ưu tiên vật chứng rõ nhất',
    src: '/review/remotion-muc-dich-doi-song/media/direct-proof-visual-semantic-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/direct-proof-visual-semantic-v1-poster.jpg',
    focus: 'Mỗi beat chọn cảnh đọc được nhanh nhất: làm việc là hành động làm việc, thành công là nhận cúp, hậu quả là tổn thương nhìn thấy được.',
    strength: 'Ít phụ thuộc cốt truyện phim nhất và bám sát keyword của voice nhất.',
    risk: 'Đổi phim nhiều hơn; cần chấm xem continuity cảm xúc có bị gãy hay không.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/direct-proof-visual-selection-review.md',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/direct-proof-visual-proposition-graph.json',
  },
  {
    id: 'soul-centered',
    tab: '02 · Soul làm trục',
    title: 'Giữ một thế giới cảm xúc, không bỏ hard gate nghĩa',
    src: '/review/remotion-muc-dich-doi-song/media/soul-centered-visual-semantic-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/soul-centered-visual-semantic-v1-poster.jpg',
    focus: 'Soul giữ tuyến nhân vật và cảm xúc; cảnh chỉ được dùng khi hành động, trạng thái hoặc hệ quả vẫn tự nói được khi tắt tiếng.',
    strength: 'Tuyến cảm xúc và thẩm mỹ đồng nhất hơn trong khi vẫn giữ cảnh cúp trực tiếp cho “thành công”.',
    risk: 'Hoạt hình có thể tạo khoảng cách với đời sống người xem; cần chấm mức liên tưởng cá nhân.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-centered-visual-selection-review.md',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-centered-visual-proposition-graph.json',
  },
  {
    id: 'office-human',
    tab: '03 · Người đi làm',
    title: 'Bối cảnh người thật và công sở làm điểm tựa',
    src: '/review/remotion-muc-dich-doi-song/media/office-human-visual-semantic-v1-web.mp4',
    poster: '/review/remotion-muc-dich-doi-song/media/office-human-visual-semantic-v1-poster.jpg',
    focus: 'Ưu tiên cảnh người thật, công việc, áp lực và quan hệ quen thuộc với nhóm 25-35 tuổi ở đô thị.',
    strength: 'Mức gần gũi đời sống cao nhất; vẫn giữ Soul ở nơi nó cung cấp biểu tượng thành công rõ hơn cảnh người thật.',
    risk: 'Pha trộn người thật và hoạt hình ở beat thành công; cần chấm xem cú chuyển có hợp lý không.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/office-human-visual-selection-review.md',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/office-human-visual-proposition-graph.json',
  },
] as const

export default function VideoReviewGallery() {
  const [activeId, setActiveId] = useState<(typeof variants)[number]['id']>('direct-proof')
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
          <div>
            <dt>Scorecard và lineage</dt>
            <dd>
              <a className={styles.evidenceLink} href={activeVariant.scorecardHref} target="_blank" rel="noreferrer">
                Mở graph đã khóa
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
