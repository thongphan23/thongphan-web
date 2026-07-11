import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Trang thử nghiệm lưu trữ — Thông Phan',
  robots: { index: false, follow: false },
}

const heroStats = [
  ['40+', 'bài viral có dữ liệu thật'],
  ['80k+', 'lượt chia sẻ từ góc nhìn'],
  ['600+', 'bình luận đăng ký trong 24h'],
]

const speakerSignals = [
  ['Giữ việc chính an toàn', 'Không bỏ nguồn thu hiện tại chỉ vì sợ bị AI bỏ lại.'],
  ['Biến kinh nghiệm thành tài sản', 'Bài viết, chẩn đoán, tài liệu kéo khách và trợ lý AI.'],
  ['Tạo dòng tiền thứ 2', 'Có hệ thống trước, rồi mới tăng tốc bằng Conan.'],
]

const speakerFragments = [
  ['Kinh nghiệm thật', 'Ca thật, lỗi thật, cách xử lý thật.'],
  ['Brain2', 'Bộ não thứ hai để AI hiểu ngữ cảnh riêng.'],
  ['Tài sản số', 'Bài viết, tài liệu, chẩn đoán, lời mời mua.'],
  ['Dòng tiền thứ 2', 'Nguồn thu mới không đốt cầu việc chính.'],
  ['Conan', 'Môi trường thực hành để làm ra đầu ra thật.'],
  ['Sáng tỏ', 'Bản đồ để bớt rối giữa quá nhiều công cụ AI.'],
]

const chapters = [
  ['01', 'Hỗn loạn'],
  ['02', 'Tín hiệu'],
  ['03', 'Lõi Brain2'],
  ['04', 'Chuyển hóa'],
  ['05', 'Bằng chứng'],
  ['06', 'Chẩn đoán'],
  ['07', 'Conan'],
]

const chaosItems = [
  ['Công cụ mới mỗi ngày', 'vòng lặp cập nhật'],
  ['Danh sách câu lệnh không có ngữ cảnh', 'kỹ năng bề mặt'],
  ['Nội dung nhiều hơn nhưng giống hơn', 'mất niềm tin'],
  ['Kinh nghiệm thật chưa được đóng gói', 'tài sản ẩn'],
  ['Thu nhập chính vẫn là điểm yếu', 'thế đứng còn rủi ro'],
]

const graphNodes = [
  '14 tháng nội dung chưa bật',
  '40+ bài viral',
  'Giải mã khách hàng',
  'Conan',
  'Chuyên môn biết dùng AI',
]

const assetPipeline = [
  ['01', 'Kinh nghiệm thật', 'Ca thật, câu chuyện, khung tư duy, nhận định thị trường và cách bạn xử lý vấn đề ngoài đời.'],
  ['02', 'Brain2', 'Hệ thống hóa thành ghi chú, sơ đồ liên kết, cơ chế tìm lại và ngữ cảnh riêng để AI làm việc đúng gu.'],
  ['03', 'Tài sản số', 'Nội dung tạo uy tín, tài liệu kéo khách, bài chẩn đoán, lời mời mua, sách điện tử và trợ lý AI.'],
  ['04', 'Dòng tiền thứ 2', 'Xây dòng tiền mới đủ vững trước khi có quyền chọn chuyển hướng.'],
]

const proofTiles = [
  ['14', 'tháng viết chưa bật trước khi mở được cách viết có lực'],
  ['40+', 'bài viral từ kinh nghiệm, Brain2 và hệ thống nội dung thật'],
  ['80k+', 'lượt chia sẻ, không dựa vào nỗi sợ bị bỏ lỡ hay danh sách công cụ rỗng'],
  ['600+', 'bình luận đăng ký trong 24h, bằng chứng nhu cầu thật'],
  ['100+', 'người trong Conan đang thực hành biến chuyên môn thành đầu ra thật'],
]

const scanRows = [
  ['Tự động hóa việc vặt', '42%', 'var(--accent-blue)'],
  ['Đòn bẩy nội dung', '62%', 'var(--accent-coral)'],
  ['Nền Brain2', '78%', 'var(--accent-gold)'],
  ['Đóng gói tài sản', '54%', 'var(--accent-green)'],
  ['Sẵn sàng vào Conan', '88%', 'var(--accent-blue)'],
]

const routeLanes = [
  {
    href: '/diagnostic',
    label: 'Nếu đang rối',
    title: 'Tự chẩn đoán AI',
    body: 'Biết mình đang kẹt ở việc vặt, nội dung, Brain2, tài sản số hay bước vào Conan.',
    cta: 'Mở chẩn đoán',
  },
  {
    href: '/challenges/brain2-21-ngay',
    label: 'Nếu muốn bắt đầu',
    title: '21 ngày Brain2',
    body: 'Gom tri thức rời rạc thành nền để AI hiểu chuyên môn riêng của bạn.',
    cta: 'Bắt đầu 21 ngày',
  },
  {
    href: 'https://com.conan.school',
    label: 'Nếu đã sẵn sàng làm thật',
    title: 'Conan',
    body: 'Vào nền tảng Conan đang hoạt động để tiếp tục biến Brain2 thành đầu ra, góp ý và cộng đồng.',
    cta: 'Vào Conan',
    external: true,
  },
]

export default function HomePage() {
  return (
    <div className={styles.homepage}>
      <section className={styles.hero} data-cinematic-hero>
        <div className={styles.heroAtmosphere} aria-hidden="true">
          <span className={styles.depthGrid} data-depth-layer="back" />
          <span className={styles.depthRing} data-depth-layer="mid" />
          <span className={styles.depthBeam} data-depth-layer="front" />
        </div>

        <div className={styles.metaStrip} aria-label="Thông tin hành trình trang chủ Thông Phan">
          <span>Thông Phan / Hệ thống AI cá nhân</span>
          <span>Brain2 → Tài sản số → Dòng tiền thứ 2</span>
          <span>Chẩn đoán → 21 ngày → Conan</span>
        </div>

        <div className={styles.trailerHud} aria-label="Trạng thái trải nghiệm cinematic">
          <span><b>TRAILER MODE</b> Đang mở cảnh đầu</span>
          <span><b>01 / 07</b> Cuộn để đi qua từng cảnh</span>
          <span><b>LIVE SYSTEM</b> Không phải landing page tĩnh</span>
        </div>

        <div className={styles.heroRevealShell}>
          <div className={styles.heroCopy} data-reveal>
            <div className={styles.eyebrow}>Dành cho người có chuyên môn</div>
            <h1 className={styles.heroHeadline} aria-label="Biến chuyên môn thành dòng tiền bằng hệ thống AI cá nhân">
              <span>Biến chuyên môn</span>
              <span>thành <em>dòng tiền</em></span>
              <span>bằng hệ thống</span>
              <span className={styles.heroHeadlineSub}>AI cá nhân</span>
            </h1>
            <p className={styles.heroDesc}>
              Tui giúp anh em biến kinh nghiệm thật thành Brain2, tài sản số và dòng tiền thứ hai bằng AI (trí tuệ nhân tạo), trong khi vẫn giữ an toàn công việc chính.
            </p>
          </div>

          <div className={styles.heroStage} aria-label="Thông Phan đang nói trên sân khấu về hệ thống AI cá nhân" data-cinematic-mouse>
            <div className={styles.speakerStage} data-hero-card>
              <div className={styles.speakerChrome}>
                <span>Từ kinh nghiệm thật</span>
                <strong>Thành hệ thống AI cá nhân</strong>
              </div>
              <span className={styles.signalBeam} aria-hidden="true" />
              <span className={styles.speakerGrid} aria-hidden="true" />
              <span className={styles.starDust} aria-hidden="true" />
              <span className={styles.speakerAura} aria-hidden="true" />

              <div className={styles.speakerOrbit} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <figure className={styles.speakerPhotoWrap} data-speaker-photo>
                <Image
                  src="/images/homepage/thong-stage-anchor.jpg"
                  alt="Thông Phan đứng nói trên sân khấu"
                  width={1365}
                  height={2048}
                  priority
                  className={styles.speakerPhoto}
                />
              </figure>

              {speakerFragments.map(([title, body], index) => (
                <div className={styles.speakerFragment} key={title} data-hero-fragment data-speaker-fragment data-speaker-index={index}>
                  <b>{title}</b>
                  <span>{body}</span>
                </div>
              ))}

              <div className={styles.speakerSignalStack}>
                {speakerSignals.map(([title, body]) => (
                  <div className={styles.signalChip} key={title} data-hero-fragment>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.heroActionBlock}>
            <div className={styles.readerProtection}>
              <strong>Không chạy theo công cụ.</strong>
              <span> Đi từ kinh nghiệm thật, hệ tri thức thật, đầu ra thật rồi mới bước vào Conan.</span>
            </div>
            <div className={styles.heroProofStrip} aria-label="Bằng chứng nổi bật">
              {heroStats.map(([value, label]) => (
                <div key={value}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className={styles.heroCtas}>
              <Link href="/diagnostic" className="btn-primary">Tự chẩn đoán năng lực AI</Link>
              <Link href="/challenges/brain2-21-ngay" className="btn-outline">Kích hoạt 21 ngày Brain2</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.chapterRail} aria-label="Các chặng trong hành trình">
        <div className="container">
          <div className={styles.chapterGrid}>
            {chapters.map(([no, title]) => (
              <div key={title} className={styles.chapter}>
                <span>{no}</span>
                <strong>{title}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cinematicJourney} aria-label="Hành trình từ hỗn loạn AI đến Conan">
        <div className="container">
          <div className={styles.journeyIntro} data-reveal>
            <span className={styles.sectionLabel}>Hệ điều hành tri thức</span>
            <h2>Cuộn qua một hành trình, không phải một trang bán hàng dày chữ.</h2>
            <p>
              Mỗi cảnh chỉ làm một việc: giảm rối, tạo sáng tỏ hoặc đưa anh em về cảm giác kiểm soát.
            </p>
          </div>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 01 / Hỗn loạn</span>
              <h2>AI làm mọi thứ nhanh hơn, nhưng cũng làm đầu anh em <em>rối hơn.</em></h2>
              <p>
                Anh em thấy người khác khoe quy trình, khoe công cụ, khoe clip làm bằng AI. Rồi mình cũng thử, cũng lưu, cũng học.
              </p>
              <p>
                Nhưng nếu đặt hết cạnh nhau, anh em thấy gì? Rất nhiều chuyển động, nhưng chưa có hệ thống nào nói rõ chuyên môn của mình sẽ thành tài sản như thế nào.
              </p>
            </div>
            <div className={`${styles.stageCard} ${styles.stageCoral}`} data-stage-card>
              <div className={styles.stageTop}><span>Bản đồ nhiễu</span><span>Đang bị nỗi sợ kéo đi</span></div>
              <div className={`${styles.chaosStack} ${styles.noiseField}`} data-stage-inner>
                {chaosItems.map(([title, meta]) => (
                  <div key={title} className={`${styles.chaosItem} ${styles.noiseFragment}`} data-scrub-item>
                    <b>{title}</b>
                    <span>{meta}</span>
                  </div>
                ))}
                <div className={styles.clarityMap} data-scrub-item>
                  <small>Bản đồ Brain2</small>
                  <strong>Hỗn loạn → Sáng tỏ</strong>
                  <span>Công cụ rời rạc được kéo về một bản đồ chuyên môn có thể dùng lại.</span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 02 / Tín hiệu</span>
              <h2>Một câu nói đúng sẽ đổi hướng cả trang.</h2>
              <p>
                Không cần làm người đọc sợ thêm. Cần cho họ thấy nỗi sợ thật hơn, gần hơn, và có đường xử lý.
              </p>
              <div className={styles.quote}>AI không cướp việc anh em. Người dùng AI giỏi hơn mới cướp.</div>
            </div>
            <div className={`${styles.stageCard} ${styles.stageBlue}`} data-stage-card>
              <div className={styles.stageTop}><span>Đổi khung nhìn</span><span>Từ nhẹ nhõm tới sáng tỏ</span></div>
              <div className={styles.signalPanel} data-stage-inner>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthBack}`} data-scene-depth>nỗi sợ mơ hồ</span>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthMid}`} data-scene-depth>tín hiệu sáng tỏ</span>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthFront}`} data-scene-depth>người hiểu AI</span>
                <div className={styles.signalText} data-scrub-item>
                  <strong>Mọi người sợ AI. Tui sợ người hiểu AI.</strong>
                  <span>Người đọc được bảo vệ trước, sau đó mới được lật vấn đề.</span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 03 / Lõi Brain2</span>
              <h2>Brain2 không phải kho ghi chú. Nó là nơi AI <em>hiểu mình.</em></h2>
              <p>
                Những thứ đang nằm rời rạc trong đầu, trong bài cũ, trong ca khách hàng và thất bại cũ được kéo về một sơ đồ tri thức.
              </p>
              <p>
                Từ đó AI mới có chất liệu riêng để làm việc. Không còn đầu ra trơn, không còn nội dung giống hàng ngàn người khác.
              </p>
            </div>
            <div className={styles.stageCard} data-stage-card>
              <div className={styles.stageTop}><span>Sơ đồ tri thức</span><span>Các ghi chú đã nối lại</span></div>
              <div className={styles.graphStage} data-stage-inner>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthBack}`} data-scene-depth>kho tri thức</span>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthMid}`} data-scene-depth>ngữ cảnh riêng</span>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthFront}`} data-scene-depth>hệ thống cá nhân</span>
                {graphNodes.map((node) => (
                  <span key={node} className={styles.graphNode} data-scrub-item>{node}</span>
                ))}
                <svg className={styles.graphStageLines} viewBox="0 0 580 580" aria-hidden="true">
                  <path d="M98 96 L290 290 L480 120" />
                  <path d="M110 488 L290 290 L468 470" />
                  <path d="M290 290 L290 102" />
                  <path d="M160 280 L290 290 L420 294" />
                </svg>
                <div className={styles.graphCenter} data-scrub-item>Hệ tri thức<br />Brain2</div>
              </div>
            </div>
          </article>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 04 / Chuyển hóa</span>
              <h2>Kiến thức không tự tạo tiền. Hệ thống mới tạo tiền.</h2>
              <p>
                Thay vì biến mình thành người học công cụ mới liên tục, thử biến chuyên môn thành một dòng chảy tài sản.
              </p>
              <p>
                Từ Brain2 ra nội dung, tài liệu kéo khách, lời mời mua, trợ lý AI và dòng tiền thứ 2. Chậm hơn một chút ở đầu, nhưng có nền để tích lũy.
              </p>
            </div>
            <div className={`${styles.stageCard} ${styles.stageGreen}`} data-stage-card>
              <div className={styles.stageTop}><span>Dòng chảy tài sản</span><span>Chuyên môn thành dòng tiền</span></div>
              <div className={styles.pipeline} data-stage-inner>
                {assetPipeline.map(([no, title, body]) => (
                  <div key={title} className={styles.pipe} data-scrub-item>
                    <i>{no}</i>
                    <div>
                      <b>{title}</b>
                      <span>{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 05 / Mảng bằng chứng</span>
              <h2>Bằng chứng ở đây phục vụ luận điểm, không phải để khoe số.</h2>
              <p>
                14 tháng nội dung chưa bật, 40+ bài viral, 80k+ lượt chia sẻ, 600+ bình luận đăng ký, 100+ người trong Conan và Brain2 đang vận hành thật.
              </p>
              <p>
                Bằng chứng ở đây không để khoe. Nó để anh em thấy con đường này có công sức, có rủi ro, có số liệu và có người đang làm thật.
              </p>
            </div>
            <div className={styles.stageCard} data-stage-card>
              <div className={styles.stageTop}><span>Mảng bằng chứng</span><span>Dữ liệu đang sống</span></div>
              <div className={styles.proofCollage} data-stage-inner>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthBack}`} data-scene-depth>bằng chứng thật</span>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthMid}`} data-scene-depth>dữ liệu đã kiểm</span>
                <span className={`${styles.sceneDepth} ${styles.sceneDepthFront}`} data-scene-depth>làm trước nói sau</span>
                {proofTiles.map(([value, label]) => (
                  <div key={label} className={styles.proofTile} data-scrub-item>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 06 / Chẩn đoán</span>
              <h2>Trước khi học tiếp, anh em cần biết mình đang kẹt ở tầng nào.</h2>
              <p>
                Bài chẩn đoán có cảm giác như quét hệ thống, nhưng kết quả phải đổi lấy sự kiểm soát thật: việc vặt, nội dung, Brain2, tài sản số hay Conan.
              </p>
              <Link href="/diagnostic" className="btn-primary">Mở bảng chẩn đoán</Link>
            </div>
            <div className={`${styles.stageCard} ${styles.stageBlue}`} data-stage-card>
              <div className={styles.stageTop}><span>Quét năng lực AI</span><span>5 câu hỏi</span></div>
              <div className={styles.scanPanel} data-stage-inner>
                {scanRows.map(([label, width, color]) => (
                  <div key={label} className={styles.scanRow} data-scrub-item>
                    <b>{label}</b>
                    <span className={styles.scanBar}><i style={{ width, background: color }} /></span>
                  </div>
                ))}
                <div className={styles.scanAction}>
                  <span>Đầu ra: bước tiếp theo rõ ràng, không chỉ một cái nhãn cho vui.</span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.scene} data-cinematic-scene>
            <div className={styles.sceneCopy} data-scene-copy data-reveal="left">
              <span className={styles.sceneIndex}>Cảnh 07 / Conan</span>
              <h2>21 ngày Brain2 là cửa vào. Conan là môi trường thực hành.</h2>
              <p>
                Sau khi có nền, anh em cần nơi để làm thật: viết, đóng gói, nhận góp ý, biến tri thức thành đầu ra và tiếp tục trong nền tảng Conan đang hoạt động.
              </p>
              <div className={styles.sceneActions}>
                <Link href="/challenges/brain2-21-ngay" className="btn-primary">Bắt đầu 21 ngày Brain2</Link>
                <a href="https://com.conan.school" target="_blank" rel="noopener noreferrer" className="btn-outline">Vào Conan</a>
              </div>
            </div>
            <div className={`${styles.stageCard} ${styles.stageCoral}`} data-stage-card>
              <div className={styles.stageTop}><span>Cổng vào</span><span>Nền tảng riêng</span></div>
              <div className={styles.portal} data-stage-inner>
                <div className={styles.portalFrame} data-scrub-item>
                  <span>Conan</span>
                  <h3>Đăng nhập, thực hành, rồi đi tiếp.</h3>
                  <p>Conan là nền tảng riêng. Người quan tâm không bị kéo sang một cộng đồng ngoài, mà tiếp tục được nuôi dưỡng bằng trải nghiệm thật.</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.routeConsole}>
        <div className="container">
          <div className={styles.routeHeader} data-reveal>
            <span className={styles.sectionLabel}>Bước đầu tiên</span>
            <h2>Nếu chưa biết bắt đầu từ đâu, đừng đoán. <em>Chẩn đoán trước.</em></h2>
            <p>Không ai cần thêm một danh sách công cụ nữa. Anh em cần một bản đồ ngắn gọn để biết chuyên môn của mình đang ở đâu trong hành trình tạo tài sản bằng AI.</p>
          </div>

          <div className={styles.routeGrid}>
            {routeLanes.map((lane) => {
              const content = (
                <>
                  <small>{lane.label}</small>
                  <h3>{lane.title}</h3>
                  <p>{lane.body}</p>
                  <strong>{lane.cta} →</strong>
                </>
              )

              return lane.external ? (
                <a key={lane.href} href={lane.href} target="_blank" rel="noopener noreferrer" className={styles.routeLane} data-stagger>
                  {content}
                </a>
              ) : (
                <Link key={lane.href} href={lane.href} className={styles.routeLane} data-stagger>
                  {content}
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
