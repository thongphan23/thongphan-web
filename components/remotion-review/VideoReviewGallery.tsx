'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const variants = [
  {
    id: 'soul',
    tab: '01 · Soul',
    title: 'Một thế giới hoạt hình, một mạch cảm xúc',
    src: '/review/remotion-muc-dich-doi-song/media/soul-single-film-v2-web.mp4?v=single-film-v2-20260731',
    poster: '/review/remotion-muc-dich-doi-song/media/soul-single-film-v2-poster.jpg?v=single-film-v2-20260731',
    focus: 'Chỉ dùng cảnh từ Soul: cô độc và suy ngẫm cho mục đích bên trong; nghề nghiệp, biểu diễn, được công nhận và hụt hẫng cho mục đích bên ngoài.',
    strength: 'Hệ biểu tượng nhất quán, trạng thái nội tâm rõ và có cảnh nhận cúp làm bằng chứng trực tiếp cho thành công.',
    risk: 'Hoạt hình vẫn có thể tạo khoảng cách với trải nghiệm người đi làm; cần chấm mức liên tưởng cá nhân.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-visual-selection-review.md?v=single-film-v2-20260731',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-visual-proposition-graph.json?v=single-film-v2-20260731',
    continuityHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-single-film-continuity-report.json?v=single-film-v2-20260731',
  },
  {
    id: 'click',
    tab: '02 · Click',
    title: 'Công việc, gia đình và cái giá mất kiểm soát',
    src: '/review/remotion-muc-dich-doi-song/media/click-single-film-v2-web.mp4?v=single-film-v2-20260731',
    poster: '/review/remotion-muc-dich-doi-song/media/click-single-film-v2-poster.jpg?v=single-film-v2-20260731',
    focus: 'Chỉ dùng Click để nối tham vọng công việc với sự xa cách gia đình, áp lực tăng tốc và khoảnh khắc nhận ra mình đã bỏ lỡ điều gì.',
    strength: 'Người thật, công sở và gia đình gần với đời sống của nhóm 25-35 tuổi ở đô thị Việt Nam.',
    risk: 'Một số ý nội tâm phải dựa vào biểu cảm và hậu quả thay vì vật chứng trực tiếp như Soul.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/click-visual-selection-review.md?v=single-film-v2-20260731',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/click-visual-proposition-graph.json?v=single-film-v2-20260731',
    continuityHref: '/review/remotion-muc-dich-doi-song/media/evidence/click-single-film-continuity-report.json?v=single-film-v2-20260731',
  },
  {
    id: 'forrest-gump',
    tab: '03 · Forrest Gump',
    title: 'Một đời người trong cùng một tuyến phim',
    src: '/review/remotion-muc-dich-doi-song/media/forrest-gump-single-film-v2-web.mp4?v=single-film-v2-20260731',
    poster: '/review/remotion-muc-dich-doi-song/media/forrest-gump-single-film-v2-poster.jpg?v=single-film-v2-20260731',
    focus: 'Chỉ dùng Forrest Gump để đi từ khoảng lặng một mình, hành động, thành tựu, áp lực đến quan hệ và mất mát trong một đời người.',
    strength: 'Có độ rộng về thời gian, thành tựu và quan hệ nhưng vẫn giữ nguyên tuyến nhân vật và thế giới phim.',
    risk: 'Cần chấm xem những cảnh có đủ nghĩa khi người xem chưa từng biết cốt truyện Forrest Gump.',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-visual-selection-review.md?v=single-film-v2-20260731',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-visual-proposition-graph.json?v=single-film-v2-20260731',
    continuityHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-single-film-continuity-report.json?v=single-film-v2-20260731',
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
          <div>
            <dt>Liên tục nguồn phim</dt>
            <dd>
              <a className={styles.evidenceLink} href={activeVariant.continuityHref} target="_blank" rel="noreferrer">
                Mở kiểm tra một-phim
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
