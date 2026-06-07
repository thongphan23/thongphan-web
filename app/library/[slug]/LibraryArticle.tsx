import Link from 'next/link'
import type { LibraryNote, LibraryNoteMeta, LibraryRelatedLink, LibraryRelation } from '@/lib/library'
import styles from './page.module.css'

interface HydratedLink extends LibraryRelatedLink {
  note: LibraryNoteMeta
}

interface LibraryArticleProps {
  note: LibraryNote
  relatedLinks: HydratedLink[]
  backlinks: HydratedLink[]
  labels: {
    section: string
    journey: string
    readerState: string
    status: string
    relations: Record<LibraryRelation, string>
  }
}

function groupByRelation(links: HydratedLink[]) {
  return links.reduce<Partial<Record<LibraryRelation, HydratedLink[]>>>((groups, link) => {
    groups[link.relation] = [...(groups[link.relation] || []), link]
    return groups
  }, {})
}

function isExternalHref(href: string) {
  return href.startsWith('http')
}

export default function LibraryArticle({
  note,
  relatedLinks,
  backlinks,
  labels,
}: LibraryArticleProps) {
  const groupedLinks = groupByRelation(relatedLinks)
  const groupedBacklinks = groupByRelation(backlinks)
  const hasGraph = relatedLinks.length > 0 || backlinks.length > 0

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className={styles.headerShell}>
          <div className={styles.authorLine}>
            <img src="/thong-phan.jpg" alt="Thông Phan" className={styles.authorPhoto} />
            <div>
              <span>{note.author}</span>
              <p>Brain2 đang chạy thật. Conan là nơi thực hành tiếp, không phải nơi lấn át personal brand.</p>
            </div>
          </div>

          <div className={styles.kickerRow}>
            <span>{labels.section}</span>
            <span>{labels.journey}</span>
            <span>{labels.readerState}</span>
            <span>{labels.status}</span>
            <span>Cập nhật {new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
          </div>

          <h1>{note.title}</h1>
          <p className={styles.promise}>{note.promise}</p>
          <p className={styles.description}>{note.description}</p>

          <div className={styles.headerProof}>
            <span>Proof / context</span>
            <p>{note.proof}</p>
          </div>
        </div>
      </header>

      {hasGraph && (
        <section className={styles.graphSection} aria-labelledby="local-graph-title">
          <div className={styles.graphInner}>
            <div>
              <span className={styles.graphEyebrow}>Local graph</span>
              <h2 id="local-graph-title">Liên kết trong hệ tri thức</h2>
              <p>
                Đây là graph quanh note hiện tại. Không render toàn bộ mạng lưới để tránh rối,
                chỉ giữ những link có quan hệ rõ.
              </p>
            </div>
            <div className={styles.graphColumns}>
              <GraphGroups title="Note này trỏ tới" groups={groupedLinks} relationLabels={labels.relations} />
              <GraphGroups title="Note khác trỏ về đây" groups={groupedBacklinks} relationLabels={labels.relations} />
            </div>
          </div>
        </section>
      )}

      <div className={styles.contentLayout}>
        <div className={styles.articleColumn}>
          <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
        </div>

        <aside className={styles.readingRail} aria-label="Thông tin note">
          <div className={styles.railCard}>
            <span>Reader state</span>
            <strong>{labels.readerState}</strong>
            <p>{note.readTime} phút đọc · {labels.status}</p>
          </div>

          {note.headings.length >= 3 && (
            <nav className={styles.railCard} aria-label="Mục lục note">
              <span>Mục lục</span>
              <ul className={styles.tocList}>
                {note.headings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? styles.tocSub : ''}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className={styles.railCard}>
            <span>Source trace</span>
            <ul className={styles.sourceList}>
              {note.sourceTrace.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className={styles.closeSection} aria-label="End of note">
        <div className={styles.closeInner}>
          <div className={styles.closeEyebrow}>End of note</div>
          <div className={styles.closeGrid}>
            <div className={styles.authorCard}>
              <img src="/thong-phan.jpg" alt="Thông Phan" className={styles.authorAvatar} />
              <div>
                <h2>Thông Phan</h2>
                <p>
                  Tui xây thư viện này như một lớp public của Brain2: đủ rõ để anh em đọc,
                  đủ có proof để tin, đủ có link để đi tiếp mà không bị ngợp.
                </p>
                <div className={styles.authorLinks}>
                  <Link href="/diagnostic">Tự chẩn đoán AI</Link>
                  <Link href="/library/ban-do-xay-brain2-trong-21-ngay">21 ngày Brain2</Link>
                  <a href="https://m.me/thongphan.88" target="_blank" rel="noopener noreferrer">Messenger</a>
                </div>
              </div>
            </div>

            <div className={styles.nextPanel}>
              <h2>Đọc tiếp theo link trong graph</h2>
              <div className={styles.nextList}>
                {relatedLinks.slice(0, 4).map((link) => (
                  <Link href={`/library/${link.note.slug}`} key={`${link.relation}-${link.note.slug}`}>
                    <span>{labels.relations[link.relation]}</span>
                    <h3>{link.note.title}</h3>
                    <p>{link.note.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {note.cta && (
            <div className={styles.endCta}>
              <span>{note.cta.label || 'Bước tiếp theo'}</span>
              <h2>{note.cta.title}</h2>
              {note.cta.body && <p>{note.cta.body}</p>}
              {isExternalHref(note.cta.href) ? (
                <a href={note.cta.href} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  {note.cta.cta}
                </a>
              ) : (
                <Link href={note.cta.href} className="btn-primary">
                  {note.cta.cta}
                </Link>
              )}
            </div>
          )}

          <div className={styles.timestamp}>
            <span>Published {new Date(note.publishedAt).toLocaleDateString('vi-VN')}</span>
            <span>Updated {new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
            <span>Status {labels.status}</span>
          </div>
        </div>
      </section>

      <div className={styles.backWrap}>
        <Link href="/library" className="btn-outline">← Tất cả note</Link>
      </div>
    </article>
  )
}

function GraphGroups({
  title,
  groups,
  relationLabels,
}: {
  title: string
  groups: Partial<Record<LibraryRelation, HydratedLink[]>>
  relationLabels: Record<LibraryRelation, string>
}) {
  const entries = Object.entries(groups) as [LibraryRelation, HydratedLink[]][]

  if (entries.length === 0) {
    return (
      <div className={styles.graphGroup}>
        <h3>{title}</h3>
        <p className={styles.graphEmpty}>Chưa có link ở chiều này.</p>
      </div>
    )
  }

  return (
    <div className={styles.graphGroup}>
      <h3>{title}</h3>
      {entries.map(([relation, links]) => (
        <div className={styles.relationGroup} key={relation}>
          <span>{relationLabels[relation]}</span>
          {links.map((link) => (
            <Link href={`/library/${link.note.slug}`} key={`${relation}-${link.note.slug}`}>
              {link.note.title}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
