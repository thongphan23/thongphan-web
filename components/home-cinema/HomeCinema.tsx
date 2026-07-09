import Image from 'next/image'
import HomeMirror from './HomeMirror'
import HomeTrackedLink, { homepageEvents } from './HomeTrackedLink'
import ProofImage from './ProofImage'
import { methodSteps, pathItems, proofItems } from './home-cinema-content'
import styles from './HomeCinema.module.css'

export default function HomeCinema() {
  return (
    <div className={styles.page} data-cinema-root>
      <section id="story" className={styles.hero} data-home-section>
        <div className={styles.heroPhoto} data-focus-pull>
          <Image
            src="/images/homepage/thong-stage-anchor.jpg"
            alt="Thông Phan đang cầm micro chia sẻ trên sân khấu."
            fill
            priority
            sizes="(max-width: 767px) 100vw, 62vw"
          />
        </div>
        <div className={styles.heroEdgeFade} aria-hidden="true" />

        <p className={styles.displayName} aria-hidden="true" data-cinema-reveal>
          <span>THÔNG</span>
          <span>PHAN</span>
        </p>

        <div className={styles.evidenceStamp} aria-hidden="true" data-evidence-stamp>
          <span>LÀM THẬT · TRẢ GIÁ THẬT · HỆ THỐNG THẬT</span>
        </div>

        <div className={styles.heroCopy} data-cinema-reveal>
          <h1>Biến chuyên môn thật thành <em>tài sản</em> có người muốn dùng.</h1>
          <p className={styles.heroLead}>Từ trải nghiệm thật đến cộng đồng trả phí — không cần rời bỏ công việc hiện tại.</p>
          <HomeTrackedLink
            href="/diagnostic"
            className={styles.primaryButton}
            eventName={homepageEvents.primary}
          >
            Khám phá lộ trình của bạn
          </HomeTrackedLink>
          <p className={styles.proofMicrocopy}>Làm thật <i /> Trả giá thật <i /> Hệ thống thật</p>
        </div>

        <div className={styles.heroFilm} aria-label="Hai khung bằng chứng mở đầu">
          <div className={styles.filmEdge} aria-hidden="true" />
          {proofItems.map((item) => (
            <article key={item.slug} className={styles.heroFrame}>
              <ProofImage
                src={item.image}
                alt={item.alt}
                sizes="(max-width: 767px) 86vw, 46vw"
                priority
              />
              <div className={styles.heroFrameCaption}>
                <span>{item.frame}</span>
                <strong>{item.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="mirror" className={`${styles.act} ${styles.mirrorAct}`} data-cinema-reveal>
        <HomeMirror />
      </section>

      <section id="proof" className={`${styles.act} ${styles.proofAct}`} data-home-section>
        <header className={styles.actHeader} data-cinema-reveal>
          <span>ACT 03 · BẰNG CHỨNG</span>
          <h2>Đừng tin một lời hứa. Hãy nhìn dấu vết công việc.</h2>
          <p>Hai hình ảnh dưới đây không kể hết hành trình. Chúng chỉ nói điều có thể kiểm chứng từ chính những gì đang thấy.</p>
        </header>

        <div className={styles.proofRail} tabIndex={0} aria-label="Dải bằng chứng, có thể cuộn ngang">
          {proofItems.map((item) => (
            <article key={item.slug} className={styles.proofItem} data-focus-pull>
              <div className={styles.proofFrameTop} aria-hidden="true"><span>{item.frame}</span><span>TP · ARCHIVE</span></div>
              <ProofImage src={item.image} alt={item.alt} sizes="(max-width: 767px) 88vw, 62vw" />
              <div className={styles.proofBody}>
                <p className={styles.proofSource}>{item.source}</p>
                <h3>{item.title}</h3>
                <p>{item.proof}</p>
                <HomeTrackedLink
                  href={item.href}
                  eventName={homepageEvents.proof}
                  eventDetail={{ slug: item.slug }}
                >
                  {item.linkLabel}
                </HomeTrackedLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="method" className={`${styles.act} ${styles.methodAct}`} data-home-section>
        <header className={`${styles.actHeader} ${styles.methodHeader}`} data-cinema-reveal>
          <span>ACT 04 · PHƯƠNG PHÁP</span>
          <h2>Một đường thẳng từ thứ bạn biết đến nơi người khác cùng làm.</h2>
        </header>
        <ol className={styles.methodList}>
          {methodSteps.map(([index, title, body]) => (
            <li key={title} data-cinema-reveal>
              <span>{index}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="paths" className={`${styles.act} ${styles.pathsAct}`} data-home-section>
        <header className={styles.pathsHeader} data-cinema-reveal>
          <span>ACT 05 · CHỌN MỘT ĐƯỜNG</span>
          <h2>Bạn không cần làm tất cả. Chỉ cần đi đúng bước kế tiếp.</h2>
        </header>
        <div className={styles.pathList}>
          {pathItems.map((item) => (
            <HomeTrackedLink
              key={item.slug}
              href={item.href}
              className={styles.pathRow}
              eventName={homepageEvents.path}
              eventDetail={{ slug: item.slug }}
              data-cinema-reveal
            >
              <span className={styles.pathIndex}>{item.index}</span>
              <span className={styles.pathCopy}>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </span>
              <span className={styles.pathCta}>{item.cta}</span>
            </HomeTrackedLink>
          ))}
        </div>
      </section>

      <section id="conan" className={styles.conanAct} data-home-section>
        <div className={styles.conanPortrait} data-focus-pull>
          <Image
            src="/thong-phan.jpg"
            alt="Chân dung Thông Phan."
            fill
            sizes="(max-width: 767px) 100vw, 38vw"
          />
        </div>
        <div className={styles.conanCopy} data-cinema-reveal>
          <span>ACT 06 · CONAN HANDOFF</span>
          <h2>Khi đã sẵn sàng làm thật, đừng đi một mình.</h2>
          <p>Conan Maker thêm vào điều một trang web không thể cho bạn: môi trường triển khai dài hạn, phản hồi và những người đang cùng xây.</p>
          <ul>
            <li>Một môi trường triển khai 12 tháng</li>
            <li>Nhịp vận hành và phản hồi đều đặn</li>
            <li>Những maker khác đang xây bên cạnh bạn</li>
          </ul>
          <HomeTrackedLink
            href="/conanmaker"
            className={styles.primaryButton}
            eventName={homepageEvents.conan}
          >
            Xem Conan Maker
          </HomeTrackedLink>
        </div>
      </section>
    </div>
  )
}
