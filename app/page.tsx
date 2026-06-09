import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandGlyph } from '@/components/BrandGlyph'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Thông Phan — Cinematic Knowledge Garden',
  description: 'Thông Phan giúp Invisible Experts biến tri thức sống thành thương hiệu cá nhân, Brain2, tài sản số và cơ hội xứng đáng bằng AI.',
}

const proofSignals = [
  ['ACV', 'Authenticity · Consistency · Visibility'],
  ['Brain2', 'Bộ rễ tri thức cá nhân'],
  ['Invisible Experts', 'Người giỏi nhưng chưa được biết đến'],
]

const painPoints = [
  ['Giỏi nhưng ít người biết', 'Cơ hội không tự đến với người có năng lực. Nó đến với người được nhìn thấy đúng cách.'],
  ['AI làm noise dày hơn', 'Nếu không có bộ rễ tri thức riêng, AI chỉ giúp tạo thêm nội dung giống người khác.'],
  ['Thu nhập chưa xứng năng lực', 'Nỗi đau không nằm ở thiếu chăm chỉ. Nó nằm ở việc chuyên môn chưa thành tài sản có thể phân phối.'],
]

const acv = [
  ['Authenticity', 'Có gốc thật', 'Kinh nghiệm, tài năng, góc nhìn và trách nhiệm cá nhân — thứ AI không thể fake bền vững.'],
  ['Consistency', 'Có hệ thống', 'Mỗi bài viết, sản phẩm và quyết định đều đi ra từ cùng một bộ rễ tư duy.'],
  ['Visibility', 'Có phân phối', 'Không chỉ giỏi trong im lặng, mà xuất hiện đủ rõ để thị trường hiểu giá trị của anh.'],
]

const gardenLayers = [
  ['Đất', 'Trải nghiệm thật', 'Câu chuyện, case, lỗi, bài học, câu hỏi sống.'],
  ['Rễ', 'Brain2', 'Ghi chú liên kết, framework, nguyên lý, context riêng.'],
  ['Tán', 'Content', 'Bài viết, video, lớp học, luận điểm có chiều sâu.'],
  ['Quả', 'Tài sản số', 'Diagnostic, workbook, mini kit, productized knowledge.'],
]

const assets = [
  ['Diagnostic', 'Chẩn đoán năng lực AI cá nhân', 'Bắt đầu bằng việc biết mình đang thiếu lớp nào.'],
  ['Library', 'Thư viện sống', 'Các bài viết/framework được tổ chức như một bản đồ tri thức.'],
  ['Assets', 'Kho tài sản nhỏ', 'Những sản phẩm nhỏ để thử năng lực hệ thống trước khi đi sâu.'],
]

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} data-cinematic-hero>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.kicker}>Cinematic Knowledge Garden</p>
            <h1>Biến tri thức sống thành tài sản số.</h1>
            <p className={styles.lead}>
              Anh Thông giúp những người giỏi nhưng chưa được biết đến xây thương hiệu cá nhân bằng Brain2, ACV và AI — để kinh nghiệm thật mọc thành nội dung, sản phẩm và cơ hội xứng đáng.
            </p>
            <div className={styles.heroActions}>
              <Link href="/diagnostic" className="btn-primary">Chẩn đoán năng lực AI</Link>
              <Link href="/library" className="btn-outline">Khám phá thư viện</Link>
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

          <div className={styles.heroVisual} data-cinematic-mouse aria-label="Cây tri thức 3D đại diện cho Brain2 và tài sản số">
            <div className={styles.visualPlate}>
              <img
                src="/images/hero-premium-mist-knowledge-garden-chatgpt.png"
                alt="Cây tri thức 3D trên những lớp sách và ghi chú, ánh sáng cinematic, đại diện cho Brain2 và tài sản số"
                width="1680"
                height="960"
                fetchPriority="high"
              />
              <div className={styles.visualCaption}>
                <span>Brain2</span>
                <strong>Kinh nghiệm thật có rễ. AI chỉ khuếch đại thứ đã có rễ.</strong>
              </div>
            </div>
            <span className={styles.orbOne} aria-hidden="true" />
            <span className={styles.orbTwo} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className={styles.scene}>
        <div className={styles.sceneHeader} data-reveal>
          <p className={styles.kicker}>Invisible Experts</p>
          <h2>Vấn đề không phải là anh chưa giỏi. Vấn đề là thị trường chưa nhìn thấy đúng giá trị của anh.</h2>
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
            <p className={styles.kicker}>ACV Framework</p>
            <h2>Thương hiệu cá nhân bền vững cần ba lớp: thật, nhất quán, và được nhìn thấy.</h2>
            <p>
              ACV không phải công thức đăng bài. Nó là hệ điều hành giúp chuyên môn của anh có gốc, có nhịp và có đường ra thị trường.
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
          <p className={styles.kicker}>Brain2 as Garden</p>
          <h2>Brain2 là bộ rễ. Content và sản phẩm chỉ là phần mọc lên trên mặt đất.</h2>
          <p>Nếu chỉ nhìn vào bài viết, người ta thấy output. Nếu nhìn vào Brain2, họ thấy moat.</p>
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
              <Link href={title === 'Diagnostic' ? '/diagnostic' : title === 'Library' ? '/library' : '/assets'} className={styles.assetFruit} key={title}>
                <BrandGlyph name={index === 0 ? 'leafNote' : index === 1 ? 'brainTree' : 'fruit'} className={styles.glyph} />
                <span>{title}</span>
                <h3>{label}</h3>
                <p>{body}</p>
              </Link>
            ))}
          </div>
          <div className={styles.splitCopy} data-reveal>
            <p className={styles.kicker}>Digital Assets</p>
            <h2>Tài sản số là quả chín của một hệ tri thức được chăm sóc lâu dài.</h2>
            <p>
              Website không nên bán ồn ào. Nó nên cho người xem hái một tài sản nhỏ, trải nghiệm chất lượng tư duy, rồi tự muốn đi sâu hơn.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.gate}>
        <div className={styles.gateCard} data-reveal>
          <p className={styles.kicker}>Garden Gate</p>
          <h2>Nếu anh có chuyên môn thật, bước tiếp theo là biến nó thành hệ thống có thể tăng trưởng.</h2>
          <p>
            Bắt đầu bằng chẩn đoán năng lực AI cá nhân, đọc thư viện sống, hoặc đi sâu hơn trong hệ sinh thái Conan.
          </p>
          <div className={styles.heroActions}>
            <Link href="/diagnostic" className="btn-primary">Chẩn đoán ngay</Link>
            <a href="https://com.conan.school" target="_blank" rel="noopener" className="btn-outline">Bước vào Conan</a>
          </div>
        </div>
      </section>
    </div>
  )
}
