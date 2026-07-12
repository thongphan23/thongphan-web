import type { ReadingBlock, ReadingImage, ReadingSection } from '@/lib/readings'
import styles from './ReadingBody.module.css'

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Block({ block }: { block: ReadingBlock }) {
  if (block.kind === 'paragraph') return <p>{block.text}</p>
  if (block.kind === 'highlight') return <p className={styles.highlight}>{block.text}</p>
  if (block.kind === 'pause') {
    return block.text ? <p className={styles.pause}>{block.text}</p> : <hr className={styles.pauseRule} />
  }
  if (block.kind === 'quote') {
    return (
      <blockquote>
        <p>{block.text}</p>
        {block.attribution ? <cite>{block.attribution}</cite> : null}
      </blockquote>
    )
  }
  return (
    <aside className={styles.insight}>
      <strong>{block.label}</strong>
      <p>{block.text}</p>
    </aside>
  )
}

function Figure({ image, lead = false }: { image: ReadingImage; lead?: boolean }) {
  return (
    <figure className={lead ? styles.leadFigure : styles.figure}>
      {/* Static, locally materialized editorial media keeps its natural aspect ratio. */}
      <img src={image.src} alt={image.alt} loading={lead ? 'eager' : 'lazy'} decoding="async" />
      <figcaption>
        <span>{image.caption}</span>
        <small>{image.credit}</small>
      </figcaption>
    </figure>
  )
}

export default function ReadingBody({
  sections,
  images,
}: {
  sections: ReadingSection[]
  images: ReadingImage[]
}) {
  const leadImage = images[0]
  const inlineImages = images.slice(1)
  const imageBySection = new Map<number, ReadingImage[]>()

  inlineImages.forEach((image, index) => {
    const sectionIndex = Math.min(
      sections.length - 1,
      Math.floor((index * sections.length) / Math.max(1, inlineImages.length)),
    )
    imageBySection.set(sectionIndex, [...(imageBySection.get(sectionIndex) ?? []), image])
  })

  return (
    <div className={styles.readerBody}>
      {leadImage ? <Figure image={leadImage} lead /> : null}

      <div className={styles.bodyGrid}>
        <nav className={styles.toc} aria-label="Mục lục bài đọc">
          <p>Mục lục</p>
          <ol>
            {sections.map((section, index) => (
              <li key={`${section.title}-${index}`}>
                <a href={`#${slugifyHeading(section.title)}-${index + 1}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.sections}>
          {sections.map((section, sectionIndex) => (
            <section
              key={`${section.title}-${sectionIndex}`}
              id={`${slugifyHeading(section.title)}-${sectionIndex + 1}`}
              className={styles.section}
            >
              <header>
                <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{section.title}</h2>
                  <small>{section.minutes} phút</small>
                </div>
              </header>
              <div className={styles.prose}>
                {section.blocks.map((block, blockIndex) => (
                  <Block key={`${sectionIndex}-${blockIndex}`} block={block} />
                ))}
              </div>
              {(imageBySection.get(sectionIndex) ?? []).map((image) => (
                <Figure key={image.src} image={image} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
