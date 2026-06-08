import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Thông Phan — Knowledge Garden',
  description: 'Thông Phan giúp người có chuyên môn biến kinh nghiệm thật thành Brain2, tài sản số và dòng tiền thứ hai bằng AI.' ,
}

const layers = [
  ['KINH NGHIỆM', 'Kinh nghiệm thật', 'Ca thật, lỗi thật, trải nghiệm nghề nghiệp và câu chuyện cá nhân chưa được đóng gói.'],
  ['Brain2', 'Bộ rễ tri thức', 'Ghi chú, liên kết, nguyên lý và ngữ cảnh riêng để AI hiểu cách anh nghĩ.'],
  ['TÀI SẢN', 'Tài sản nhỏ', 'Workbook, prompt pack, bài chẩn đoán, mini kit và hệ thống nội dung tự phục vụ.'],
  ['DÒNG TIỀN', 'Dòng tiền thứ hai', 'Nguồn thu mới mọc lên từ chuyên môn, không đốt cầu việc chính.'],
]

const fruits = [
  ['AI Starter', 'Cho nhân viên văn phòng', '149k'],
  ['Brain2 Canvas', 'Biến tri thức rời rạc thành hệ thống', '199k'],
  ['Hook Pack', 'Cho người có chuyên môn', '99k'],
  ['Digital Asset', 'Bản đồ tạo tài sản nhỏ đầu tiên', '99k'],
]

const signals = [
  ['Tool mới mỗi ngày', '8%', '16%', '-8deg', '-2deg', '0s'],
  ['Prompt không có ngữ cảnh', '68%', '19%', '-2deg', '3deg', '-1.6s'],
  ['Nội dung giống nhau', '14%', '48%', '6deg', '9deg', '-3.2s'],
  ['Kinh nghiệm thật bị chôn', '74%', '54%', '10deg', '12deg', '-4.8s'],
  ['Thu nhập chính còn rủi ro', '38%', '72%', '-12deg', '-7deg', '-6.4s'],
]

function GardenKeyVisual() {
  return (
    <picture className={styles.gardenPicture}>
      <source srcSet="/images/homepage/knowledge-garden-hero-wide-2400.webp" type="image/webp" />
      <img
        className={styles.gardenImage}
        src="/images/homepage/knowledge-garden-hero-wide-3200.png"
        alt="Cây tri thức dạng hệ sinh thái: thân cây mạch vàng, rễ mạng nơ-ron xanh và các nhánh tài sản số trong Knowledge Garden của Thông Phan"
        width="3200"
        height="1800"
        fetchPriority="high"
      />
    </picture>
  )
}

export default function HomePage() {
  return (
    <div className={styles.conceptPage}>
      <section className={styles.hero} data-cinematic-hero>
        <div className={styles.depthLayers} aria-hidden="true">
          <span data-depth-layer="back" />
          <span data-depth-layer="mid" />
          <span data-depth-layer="front" />
        </div>
        <div className={styles.noiseField} aria-hidden="true">
          {signals.map(([signal, x, y, rotFrom, rotTo, delay], index) => (
            <span
              key={signal}
              style={{ '--i': index, '--x': x, '--y': y, '--rot-from': rotFrom, '--rot-to': rotTo, '--delay': delay } as CSSProperties}
            >
              {signal}
            </span>
          ))}
        </div>

        <div className={styles.topRail}>
          <span>THONGPHAN.COM / KNOWLEDGE GARDEN</span>
          <span>Knowledge Garden</span>
          <span>Rõ trong hỗn độn / 2026</span>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-reveal>
            <div className={styles.loadingPill}>
              <span className={styles.loadingDot} />
              <span>Đang nạp lớp trải nghiệm</span>
              <b>58% → 100%</b>
            </div>

            <p className={styles.eyebrow}>Hướng thị giác</p>
            <h1>
              Mỗi trải nghiệm thật
              <em> mọc thành tài sản.</em>
            </h1>
            <p className={styles.lead}>
              Đây là khu vườn tri thức sống của Thông Phan: nơi kinh nghiệm thật được hệ thống hóa thành Brain2, đóng gói thành tài sản số và mở ra dòng tiền thứ hai bằng AI.
            </p>

            <div className={styles.heroActions}>
              <Link href="/diagnostic" className="btn-primary">Quét năng lực AI</Link>
              <Link href="/assets" className="btn-outline">Xem kho tài sản nhỏ</Link>
            </div>
          </div>

          <div className={styles.stageWrap} data-cinematic-mouse aria-label="Knowledge Garden cinematic object">
            <div className={styles.stageCard} data-hero-card>
              <div className={styles.cardChrome}>
                <span>Mỗi lớp kể một câu chuyện</span>
                <b>HỆ ĐANG CHẠY</b>
              </div>

              <div className={styles.gardenObject}>
                <GardenKeyVisual />
              </div>

              <div className={styles.nodePanel} data-hero-fragment>
                <span>Rễ Brain2</span>
                <strong>AI cần bộ rễ tri thức thật, không cần thêm prompt rỗng.</strong>
              </div>

              <div className={styles.assetPanel} data-hero-fragment>
                <span>Tài sản nhỏ</span>
                <strong>Prompt pack · workbook · diagnostic · mini kit</strong>
              </div>
            </div>
            <div className={styles.reflection} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className={styles.layerSection} data-cinematic-scene>
        <div className={styles.sectionIntro}>
          <span>Kể chuyện theo lớp</span>
          <h2>Không kể bằng section. Kể bằng từng lớp được mở ra.</h2>
          <p>Mỗi lớp là một trạng thái chuyển hóa: từ kinh nghiệm thô → bộ rễ Brain2 → tài sản nhỏ → dòng tiền mới.</p>
        </div>

        <div className={styles.layerGrid} data-stage-inner>
          {layers.map(([kicker, title, body], index) => (
            <article className={styles.layerCard} key={title} data-scrub-item style={{ '--index': index } as CSSProperties}>
              <span>{kicker}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.showcase} data-cinematic-scene>
        <div className={styles.showcaseVisual} data-stage-inner>
          <div className={styles.verticalRoot} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.showcaseCopy}>
            <span>Kho tài sản nhỏ</span>
            <h2>Người xem không “mua sản phẩm”. Họ hái một tài sản nhỏ để bắt đầu.</h2>
            <p>Kho tài sản nên được trình bày như những quả chín trên hệ tri thức: nhỏ, rõ đầu ra, tự làm được ngay, không cạnh tranh với Conan Maker.</p>
          </div>
          <div className={styles.fruitGrid}>
            {fruits.map(([title, desc, price]) => (
              <article className={styles.fruitCard} key={title}>
                <span>{price}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.gateSection}>
        <div className={styles.gateCard}>
          <span>Cổng Conan</span>
          <h2>Nếu tài sản nhỏ giúp bắt đầu, Conan là nơi hệ thống này được thực hành mỗi tuần.</h2>
          <p>Homepage mới nên kết thúc bằng một cánh cổng, không phải một nút bán hàng. Người đọc đi qua kinh nghiệm, Brain2, tài sản nhỏ rồi mới thấy Conan là bước sâu hơn.</p>
          <div className={styles.heroActions}>
            <a href="https://com.conan.school" target="_blank" rel="noopener" className="btn-primary">Bước vào Conan</a>
            <Link href="/diagnostic" className="btn-outline">Quét năng lực AI</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
