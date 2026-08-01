'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/review/remotion-muc-dich-doi-song/page.module.css'

const evidenceRoot =
  '/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1'
const releaseTag = 'semantic-vertical-framing-v1-20260801'

const films = [
  {
    id: 'soul',
    tab: '01 · Soul',
    title: 'Biểu cảm và vật chứng trong một thế giới hoạt hình',
    focus:
      'Khoảng lặng, công việc, thành công và đau khổ được giữ quanh Joe cùng các vật mang nghĩa thay vì quanh tâm khung nguồn.',
    residual:
      'Một shot tối trừu tượng và một shot xe cứu hỏa có motion blur vẫn cần anh đánh giá trong chuyển động thật.',
  },
  {
    id: 'forrest-gump',
    tab: '02 · Forrest Gump',
    title: 'Một đời người được đọc qua hành động cụ thể',
    focus:
      'Khung dọc ưu tiên Forrest, hành động và vật chứng; cảnh nhận bằng giữ người trao cùng tấm bằng trước khi chuyển sang người nhận.',
    residual:
      'Nhân vật ở shot bơi còn nhỏ trong nguồn, nên ý hướng nội phụ thuộc vào chuyển động nhiều hơn một khung tĩnh.',
  },
  {
    id: 'a-beautiful-mind',
    tab: '03 · A Beautiful Mind',
    title: 'Suy ngẫm, công nhận và hệ quả trên con người',
    focus:
      'John Nash, tương tác người-vật và quan hệ nhóm được theo dõi theo từng shot; phụ đề tự đổi vùng khi bằng chứng nằm phía dưới.',
    residual:
      'Nguồn cận cảnh giúp giữ chủ thể tốt, nhưng những đoạn xung đột dày thông tin vẫn cần chấm khả năng đọc ở nhịp thật.',
  },
] as const

type FilmId = (typeof films)[number]['id']

const rounds = [
  {
    id: 'r1',
    number: 1,
    tab: 'Vòng 1',
    status: 'Crop giữa · chưa đạt',
    score: '59,0/100',
    gate: '27/51 shot',
    retention: '79,6%',
    method:
      'Giữ nguyên crop giữa để làm đường cơ sở. Kết quả cho thấy mặt, hành động và quan hệ không gian thường bị cắt dù video vẫn render đúng kỹ thuật.',
    learned:
      'Không thể dùng tâm hình nguồn làm đại diện cho trọng tâm ý nghĩa trong khung dọc.',
    report: `${evidenceRoot}/round-1-self-evaluation.md?v=${releaseTag}`,
    sources: {
      soul: {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r1-soul-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r1-soul-poster.jpg?v=${releaseTag}`,
      },
      'forrest-gump': {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r1-forrest-gump-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r1-forrest-gump-poster.jpg?v=${releaseTag}`,
      },
      'a-beautiful-mind': {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r1-a-beautiful-mind-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r1-a-beautiful-mind-poster.jpg?v=${releaseTag}`,
      },
    },
  },
  {
    id: 'r2',
    number: 2,
    tab: 'Vòng 2',
    status: 'Theo mặt/vùng chú ý · còn false-high',
    score: '59,0/100',
    gate: '44/51 shot',
    retention: '96,6%',
    method:
      'Dùng quan sát mặt và saliency thật, giữ shot ngắn tĩnh, giới hạn tốc độ pan và chuyển phụ đề tránh vùng bằng chứng.',
    learned:
      'Giữ được một khuôn mặt chưa đủ: khuôn mặt lớn nhất có thể không phải người hoặc vật đang mang nghĩa của voice.',
    report: `${evidenceRoot}/round-2-self-evaluation.md?v=${releaseTag}`,
    sources: {
      soul: {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r2-soul-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r2-soul-poster.jpg?v=${releaseTag}`,
      },
      'forrest-gump': {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r2-forrest-gump-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r2-forrest-gump-poster.jpg?v=${releaseTag}`,
      },
      'a-beautiful-mind': {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r2-a-beautiful-mind-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r2-a-beautiful-mind-poster.jpg?v=${releaseTag}`,
      },
    },
  },
  {
    id: 'r3',
    number: 3,
    tab: 'Vòng 3',
    status: 'Vật mang nghĩa · ứng viên cuối',
    score: '97,2/100',
    gate: '51/51 shot',
    retention: '99,5%',
    method:
      'Chọn tín hiệu theo vai trò ngữ nghĩa của shot, dùng đoạn hold/dead-zone, sửa ba false-high bằng pixel thật và thay nguồn khi crop không thể cứu.',
    learned:
      'Khung dọc phải giữ đúng vật mang nghĩa đã quan sát, không chỉ giữ vùng nổi bật về thị giác.',
    report: `${evidenceRoot}/round-3-self-evaluation.md?v=${releaseTag}`,
    sources: {
      soul: {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r3-soul-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r3-soul-poster.jpg?v=${releaseTag}`,
      },
      'forrest-gump': {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r3-forrest-gump-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r3-forrest-gump-poster.jpg?v=${releaseTag}`,
      },
      'a-beautiful-mind': {
        src: `/review/remotion-muc-dich-doi-song/media/vertical-r3-a-beautiful-mind-web.mp4?v=${releaseTag}`,
        poster: `/review/remotion-muc-dich-doi-song/media/vertical-r3-a-beautiful-mind-poster.jpg?v=${releaseTag}`,
      },
    },
  },
] as const

type RoundId = (typeof rounds)[number]['id']

export default function VideoReviewGallery() {
  const [activeRoundId, setActiveRoundId] = useState<RoundId>('r3')
  const [activeFilmId, setActiveFilmId] = useState<FilmId>('soul')
  const activeRound = useMemo(
    () => rounds.find((round) => round.id === activeRoundId) ?? rounds[2],
    [activeRoundId],
  )
  const activeFilm = useMemo(
    () => films.find((film) => film.id === activeFilmId) ?? films[0],
    [activeFilmId],
  )
  const media = activeRound.sources[activeFilm.id]
  const evidencePrefix = `${evidenceRoot}/round-${activeRound.number}-${activeFilm.id}`

  return (
    <section className={styles.review} aria-labelledby="review-heading">
      <div className={styles.selectorBlock}>
        <p className={styles.selectorLabel}>Chọn vòng cải tiến</p>
        <div className={styles.roundTabs} role="group" aria-label="Chọn vòng cải tiến">
          {rounds.map((round) => (
            <button
              key={round.id}
              type="button"
              className={round.id === activeRoundId ? styles.roundTabActive : styles.roundTab}
              aria-pressed={round.id === activeRoundId}
              onClick={() => setActiveRoundId(round.id)}
            >
              <span>{round.tab}</span>
              <small>{round.status}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.selectorBlock}>
        <p className={styles.selectorLabel}>Chọn phim</p>
        <div className={styles.filmTabs} role="group" aria-label="Chọn phim">
          {films.map((film) => (
            <button
              key={film.id}
              type="button"
              className={film.id === activeFilmId ? styles.filmTabActive : styles.filmTab}
              aria-pressed={film.id === activeFilmId}
              onClick={() => setActiveFilmId(film.id)}
            >
              {film.tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.reviewStage}>
        <div className={styles.playerStage}>
          <video
            key={`${activeRound.id}-${activeFilm.id}`}
            className={styles.player}
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
          >
            <source src={media.src} type="video/mp4" />
            Trình duyệt này không hỗ trợ video H.264.
          </video>
        </div>

        <div className={styles.reviewDetail} aria-live="polite">
          <span className={styles.variantNumber}>
            {activeRound.tab} · {activeFilm.tab}
          </span>
          <h2 id="review-heading">{activeFilm.title}</h2>
          <p>{activeFilm.focus}</p>

          <dl className={styles.roundMetrics}>
            <div><dt>Điểm tự đánh giá</dt><dd>{activeRound.score}</dd></div>
            <div><dt>Cổng shot</dt><dd>{activeRound.gate}</dd></div>
            <div><dt>Giữ trọng tâm</dt><dd>{activeRound.retention}</dd></div>
          </dl>

          <dl className={styles.lensNotes}>
            <div><dt>Cách làm vòng này</dt><dd>{activeRound.method}</dd></div>
            <div><dt>Điều hệ thống học được</dt><dd>{activeRound.learned}</dd></div>
            <div><dt>Rủi ro còn lại của phim</dt><dd>{activeFilm.residual}</dd></div>
          </dl>

          <div className={styles.evidenceLinks}>
            <a href={activeRound.report} target="_blank" rel="noreferrer">Báo cáo vòng</a>
            <a href={`${evidencePrefix}-composition-plan.json?v=${releaseTag}`} target="_blank" rel="noreferrer">Kế hoạch khung dọc</a>
            <a href={`${evidencePrefix}-contact-sheet.jpg?v=${releaseTag}`} target="_blank" rel="noreferrer">Contact sheet</a>
          </div>
        </div>
      </div>

      <p className={styles.tasteBoundary}>
        Điểm trên là tự đánh giá kỹ thuật và pixel của hệ thống. Chỉ phản hồi trực tiếp của anh mới
        được tiếp nhận thành bằng chứng Taste sau khi gắn với đúng vòng, phim và shot.
      </p>
    </section>
  )
}
