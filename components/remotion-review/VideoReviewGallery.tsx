'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const variants = [
  {
    id: 'soul',
    tab: '01 · Soul',
    title: 'Biểu cảm và biểu tượng đọc được ngay',
    src: '/review/remotion-muc-dich-doi-song/media/soul-visual-fit-v2-web.mp4?v=visual-fit-v2-20260731',
    poster: '/review/remotion-muc-dich-doi-song/media/soul-visual-fit-v2-poster.jpg?v=visual-fit-v2-20260731',
    focus: 'Khoảng lặng, cảm nhận hiện tại, lao động cụ thể, sân khấu, chiếc cúp và đau khổ đều ở trong một thế giới hình ảnh nhất quán.',
    strength: 'Nghĩa được đọc nhanh: chiếc cúp chứng minh thành công trực tiếp; trạng thái và hậu quả có biểu cảm mạnh.',
    risk: 'Ẩn dụ hoạt hình dễ hiểu nhưng có thể tạo khoảng cách với trải nghiệm đời thật của người xem trưởng thành.',
    expressionHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-visual-expression-review-v2.md?v=visual-fit-v2-20260731',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-visual-selection-review-v2.md?v=visual-fit-v2-20260731',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-visual-proposition-graph-v2.json?v=visual-fit-v2-20260731',
    continuityHref: '/review/remotion-muc-dich-doi-song/media/evidence/soul-single-film-continuity-report-v2.json?v=visual-fit-v2-20260731',
  },
  {
    id: 'forrest-gump',
    tab: '02 · Forrest Gump',
    title: 'Một đời người, các hành động cụ thể',
    src: '/review/remotion-muc-dich-doi-song/media/forrest-gump-visual-fit-v2-web.mp4?v=visual-fit-v2-20260731',
    poster: '/review/remotion-muc-dich-doi-song/media/forrest-gump-visual-fit-v2-poster.jpg?v=visual-fit-v2-20260731',
    focus: 'Một mình giữa biển, luyện bóng bàn, cắt cỏ, tốt nghiệp, được công nhận, chịu sức ép và mất mát nối thành một tuyến đời người.',
    strength: 'Nguồn sai “tàu đánh tôm” đã bị loại; hành động bên ngoài giờ có vợt, bóng, máy cắt cỏ và kết quả hữu hình.',
    risk: 'Cảnh suy ngẫm trên ghế vẫn phụ thuộc nhiều vào nét mặt; cần chấm xem trạng thái an nhiên đã đủ rõ chưa.',
    expressionHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-visual-expression-review-v2.md?v=visual-fit-v2-20260731',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-visual-selection-review-v2.md?v=visual-fit-v2-20260731',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-visual-proposition-graph-v2.json?v=visual-fit-v2-20260731',
    continuityHref: '/review/remotion-muc-dich-doi-song/media/evidence/forrest-gump-single-film-continuity-report-v2.json?v=visual-fit-v2-20260731',
  },
  {
    id: 'a-beautiful-mind',
    tab: '03 · A Beautiful Mind',
    title: 'Suy ngẫm, Nobel và cái giá con người',
    src: '/review/remotion-muc-dich-doi-song/media/a-beautiful-mind-visual-fit-v2-web.mp4?v=visual-fit-v2-20260731',
    poster: '/review/remotion-muc-dich-doi-song/media/a-beautiful-mind-visual-fit-v2-poster.jpg?v=visual-fit-v2-20260731',
    focus: 'John một mình suy ngẫm, làm toán, bước lên sân khấu Nobel rồi đi qua mất kiểm soát, đổ vỡ và đau khổ.',
    strength: 'Ba ý khó nhất đều có carrier rõ: cô tịch, nghi thức công nhận và hệ quả đau khổ trên con người.',
    risk: 'Một số cảnh xung đột ở đoạn cao trào dày thông tin; cần chấm khả năng đọc trong nhịp nhanh.',
    expressionHref: '/review/remotion-muc-dich-doi-song/media/evidence/a-beautiful-mind-visual-expression-review-v2.md?v=visual-fit-v2-20260731',
    evidenceHref: '/review/remotion-muc-dich-doi-song/media/evidence/a-beautiful-mind-visual-selection-review-v2.md?v=visual-fit-v2-20260731',
    scorecardHref: '/review/remotion-muc-dich-doi-song/media/evidence/a-beautiful-mind-visual-proposition-graph-v2.json?v=visual-fit-v2-20260731',
    continuityHref: '/review/remotion-muc-dich-doi-song/media/evidence/a-beautiful-mind-single-film-continuity-report-v2.json?v=visual-fit-v2-20260731',
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
            <dt>Concept → dấu hiệu nhìn thấy</dt>
            <dd>
              <a className={styles.evidenceLink} href={activeVariant.expressionHref} target="_blank" rel="noreferrer">
                Mở bản phân rã hình ảnh
              </a>
            </dd>
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
