import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandGlyph } from '@/components/BrandGlyph'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Thông Phan — Biến chuyên môn thành tài sản',
  description: 'Nếu bạn giỏi nghề nhưng chưa được thị trường nhìn thấy đúng, đây là nơi bắt đầu biến chuyên môn thành nội dung, tài sản số và cơ hội xứng đáng.',
}

const proofSignals = [
  ['ACV', 'Thật · nhất quán · được nhìn thấy'],
  ['Brain2', 'Kho tri thức riêng để AI hiểu bạn'],
  ['Người giỏi nhưng ít ai biết', 'Có năng lực thật, nhưng chưa được thị trường nhìn thấy đúng'],
]

const painPoints = [
  ['Bạn giỏi, nhưng thị trường chưa hiểu bạn giỏi ở đâu', 'Cơ hội hiếm khi tự tìm đến người im lặng. Nó đến khi người khác hiểu rõ bạn giải quyết vấn đề gì.'],
  ['AI làm thế giới ồn hơn, không tự làm bạn khác biệt hơn', 'Nếu trong đầu chưa rõ, AI chỉ giúp bạn tạo thêm những thứ nghe giống tất cả mọi người.'],
  ['Thu nhập chưa xứng với năng lực thật', 'Vấn đề không phải bạn lười. Vấn đề là kinh nghiệm của bạn chưa được đóng gói thành thứ người khác thấy, tin và muốn mua.'],
]

const acv = [
  ['Authenticity', 'Có gốc thật', 'Không phải diễn cho giống chuyên gia. Là nói từ kinh nghiệm, kết quả, sai lầm và trách nhiệm của chính bạn.'],
  ['Consistency', 'Có hệ thống', 'Người ta tin bạn hơn khi mỗi bài viết, sản phẩm và quyết định đều cùng một mạch tư duy.'],
  ['Visibility', 'Được nhìn thấy đúng cách', 'Không phải ồn ào hơn. Là xuất hiện đủ rõ để người cần bạn hiểu bạn giúp được gì.'],
]

const gardenLayers = [
  ['Đất', 'Trải nghiệm thật', 'Những ca bạn từng xử lý, lỗi từng trả giá, bài học từng tự rút ra.'],
  ['Rễ', 'Brain2', 'Kho tri thức riêng để AI hiểu bối cảnh, giọng và cách nghĩ của bạn.'],
  ['Tán', 'Nội dung', 'Bài viết, video, buổi chia sẻ và luận điểm giúp người khác hiểu bạn.'],
  ['Quả', 'Tài sản số', 'Bài chẩn đoán, workbook, bộ công cụ nhỏ, sản phẩm tri thức có thể bán hoặc tặng.'],
]

const assets = [
  ['Chẩn đoán', 'Biết mình nên bắt đầu từ đâu', 'Trả lời vài câu để khỏi học lan man.'],
  ['Thư viện', 'Đọc theo đúng vấn đề của bạn', 'Không phải lướt thêm bài. Là tìm đúng mảnh đang thiếu.'],
  ['Tài sản nhỏ', 'Làm thử một đầu ra thật', 'Một workbook, checklist hoặc bộ câu hỏi đủ nhỏ để dùng ngay.'],
]

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} data-cinematic-hero>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.kicker}>Cho người giỏi nhưng chưa được nhìn thấy đúng</p>
            <h1>Biến chuyên môn của bạn thành tài sản người khác muốn dùng.</h1>
            <p className={styles.lead}>
              Nếu bạn có năng lực thật nhưng vẫn bị thị trường bỏ qua, vấn đề không nằm ở việc bạn chưa giỏi. Vấn đề là chuyên môn của bạn chưa được biến thành nội dung, bằng chứng và tài sản đủ rõ để người khác tin.
            </p>
            <div className={styles.heroActions}>
              <Link href="/diagnostic" className="btn-primary">Tự chẩn đoán trước</Link>
              <Link href="/library" className="btn-outline">Đọc thư viện</Link>
            </div>
            <div className={styles.proofStrip} aria-label="Tín hiệu thương hiệu">
              {proofSignals.map(([label, body]) => (
                <span key={label}>
                  <strong>{label}</strong>
                  {body}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual} data-cinematic-mouse aria-label="Hệ tri thức riêng giúp chuyên môn mọc thành nội dung và tài sản số">
            <div className={styles.visualPlate}>
              <img
                src="/images/hero-premium-mist-knowledge-garden-chatgpt.png"
                alt="Hệ tri thức được xây từ sách, ghi chú và kinh nghiệm thật"
                width="1680"
                height="960"
                fetchPriority="high"
              />
              <div className={styles.visualCaption}>
                <span>Brain2</span>
                <strong>AI chỉ khuếch đại thứ đã có gốc. Nếu gốc rỗng, đầu ra cũng rỗng.</strong>
              </div>
            </div>
            <span className={styles.orbOne} aria-hidden="true" />
            <span className={styles.orbTwo} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className={styles.scene}>
        <div className={styles.sceneHeader} data-reveal>
          <p className={styles.kicker}>Nếu bạn đang thấy bất công</p>
          <h2>Bạn không thiếu năng lực. Bạn thiếu một hệ thống để người khác nhìn thấy năng lực đó.</h2>
        </div>
        <div className={styles.painGrid}>
          {painPoints.map(([title, body], index) => (
            <article className={styles.editorialCard} key={title} data-reveal>
              <span className={styles.cardIndex}>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.scene} ${styles.acvScene}`}>
        <div className={styles.split}>
          <div className={styles.splitCopy} data-reveal>
            <p className={styles.kicker}>Cách xây niềm tin</p>
            <h2>Muốn người khác tin bạn lâu dài, bạn cần ba thứ: thật, nhất quán và được nhìn thấy đúng cách.</h2>
            <p>
              ACV không phải lịch đăng bài. Nó là cách biến kinh nghiệm trong đầu bạn thành niềm tin, nội dung và cơ hội ngoài thị trường.
            </p>
          </div>
          <div className={styles.acvStack}>
            {acv.map(([label, title, body], index) => (
              <article className={styles.acvCard} key={label} data-reveal>
                <BrandGlyph name={index === 0 ? 'seed' : index === 1 ? 'growthRing' : 'gate'} className={styles.glyph} />
                <span>{label}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.gardenScene}>
        <div className={styles.sceneHeader} data-reveal>
          <p className={styles.kicker}>Bắt đầu từ bộ rễ</p>
          <h2>Muốn nội dung có chiều sâu, bạn phải chăm bộ rễ trước.</h2>
          <p>Bài viết là phần nổi. Brain2 mới là nơi giữ case, góc nhìn, nguyên lý và giọng riêng của bạn.</p>
        </div>
        <div className={styles.layerMap}>
          {gardenLayers.map(([label, title, body], index) => (
            <article className={styles.layerCard} key={label} data-reveal>
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <i aria-hidden="true" style={{ '--i': index } as CSSProperties} />
            </article>
          ))}
        </div>
      </section>

      <section className={styles.scene}>
        <div className={`${styles.split} ${styles.reverse}`}>
          <div className={styles.assetGarden} data-reveal>
            {assets.map(([title, label, body], index) => (
              <Link href={title === 'Chẩn đoán' ? '/diagnostic' : title === 'Thư viện' ? '/library' : '/assets'} className={styles.assetFruit} key={title}>
                <BrandGlyph name={index === 0 ? 'leafNote' : index === 1 ? 'brainTree' : 'fruit'} className={styles.glyph} />
                <span>{title}</span>
                <h3>{label}</h3>
                <p>{body}</p>
              </Link>
            ))}
          </div>
          <div className={styles.splitCopy} data-reveal>
            <p className={styles.kicker}>Tài sản nhỏ, làm được ngay</p>
            <h2>Tài sản số không nên là template rỗng. Nó nên mọc ra từ thứ bạn thật sự biết.</h2>
            <p>
              Bạn có thể bắt đầu rất nhỏ: một bài chẩn đoán, một workbook, một bộ câu hỏi, một thư viện ý tưởng. Miễn là nó giúp người khác tiến thêm một bước thật.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.gate}>
        <div className={styles.gateCard} data-reveal>
          <p className={styles.kicker}>Nếu muốn bắt đầu</p>
          <h2>Nếu bạn có chuyên môn thật, bước tiếp theo là biến nó thành hệ thống có thể tăng trưởng.</h2>
          <p>
            Bắt đầu bằng việc biết mình đang ở tầng nào. Sau đó đọc đúng thứ cần đọc, hỏi đúng câu cần hỏi, rồi mới đi sâu hơn.
          </p>
          <div className={styles.heroActions}>
            <Link href="/diagnostic" className="btn-primary">Làm bài chẩn đoán</Link>
            <a href="https://com.conan.school" target="_blank" rel="noopener" className="btn-outline">Tìm hiểu Conan</a>
          </div>
        </div>
      </section>
    </div>
  )
}
