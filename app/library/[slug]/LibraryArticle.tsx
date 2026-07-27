import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { LibraryNote, LibraryNoteMeta, LibraryRelatedLink, LibraryRelation } from '@/lib/library'
import { topicLabel } from '@/lib/library-discovery'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import ReaderLoopArticlePanel from '@/components/reader-loop/ReaderLoopArticlePanel'
import { readerLoopPreviewEnabled } from '@/lib/reader-loop/release'
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
    relations: Record<LibraryRelation, string>
  }
}

function isExternalHref(href: string) {
  return href.startsWith('http')
}

function RelationList({
  links,
  relationLabels,
}: {
  links: HydratedLink[]
  relationLabels: Record<LibraryRelation, string>
}) {
  if (!links.length) return <p className={styles.emptyRelation}>Chưa có liên kết ở chiều này.</p>

  return (
    <ul className={styles.relationList}>
      {links.map((link) => (
        <li key={`${link.relation}-${link.note.slug}`}>
          <Link href={`/library/${link.note.slug}`}>
            <span>{relationLabels[link.relation]}</span>
            <strong>{link.note.title}</strong>
            <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.6} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function LibraryArticle({
  note,
  relatedLinks,
  backlinks,
  labels,
}: LibraryArticleProps) {
  return (
    <article className={styles.article}>
      <div className={styles.pageFrame}>
        <header className={styles.masthead}>
          <Link href="/library" className={styles.backLink}>Ghi chú sống</Link>
          <p className={styles.eyebrow}>Ghi chú sống · {labels.section}</p>

          <div className={styles.heroGrid}>
            <div>
              <h1>{note.title}</h1>
              <p className={styles.promise}>{note.promise}</p>
              <p className={styles.description}>{note.description}</p>
            </div>
            <aside className={styles.proofNote} aria-label="Bằng chứng và bối cảnh">
              <p>Bằng chứng / bối cảnh</p>
              <strong>{note.proof}</strong>
            </aside>
          </div>

          <dl className={styles.articleMeta}>
            <div><dt>Tác giả</dt><dd>{note.author}</dd></div>
            <div><dt>Hành trình</dt><dd>{labels.journey} · {labels.readerState}</dd></div>
            <div><dt>Thời lượng</dt><dd>{note.readTime} phút đọc</dd></div>
            <div><dt>Cập nhật</dt><dd>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</dd></div>
          </dl>

          <ul className={styles.tagList} aria-label="Chủ đề">
            {note.tags.map((tag) => <li key={tag}>{topicLabel(tag)}</li>)}
          </ul>
        </header>

        <div className={styles.readingLayout}>
          <aside className={styles.readingRail}>
            {note.headings.length ? (
              <nav className={styles.toc} aria-label="Mục lục ghi chú">
                <p>Mục lục</p>
                <ol>
                  {note.headings.map((heading) => (
                    <li key={heading.id} data-level={heading.level}>
                      <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <section className={styles.sourceTrace} aria-labelledby="source-trace-title">
              <p id="source-trace-title">Nguồn tạo nên ghi chú này</p>
              <ul>
                {note.sourceTrace.map((source) => <li key={source}>{source}</li>)}
              </ul>
            </section>
          </aside>

          <div className={styles.articleColumn}>
            <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: note.contentHtml }} />

            {readerLoopPreviewEnabled ? <ReaderLoopArticlePanel slug={note.slug} title={note.title} /> : null}

            <section className={styles.connections} aria-labelledby="connections-title">
              <p className={styles.sectionLabel}>Các mối nối</p>
              <h2 id="connections-title">Một ghi chú sống nhờ những đường dẫn có nghĩa.</h2>
              <div className={styles.connectionGrid}>
                <section aria-labelledby="outbound-title">
                  <h3 id="outbound-title">Note này mở ra</h3>
                  <RelationList links={relatedLinks} relationLabels={labels.relations} />
                </section>
                <section aria-labelledby="backlinks-title">
                  <h3 id="backlinks-title">Các note dẫn về đây</h3>
                  <RelationList links={backlinks} relationLabels={labels.relations} />
                </section>
              </div>
            </section>

            <section className={styles.authorClose} aria-labelledby="author-close-title">
              <img src="/thong-phan.jpg" alt="" width="320" height="400" />
              <div>
                <p className={styles.sectionLabel}>Người giữ thư viện</p>
                <h2 id="author-close-title">Thông Phan</h2>
                <p>
                  Tui xây thư viện này như một lớp công khai của hệ tri thức đang vận hành:
                  đủ rõ để đọc, đủ bằng chứng để tin và đủ đường dẫn để đi tiếp mà không bị ngợp.
                </p>
                <div className={styles.authorLinks}>
                  <Link href="/diagnostic">Tự chẩn đoán</Link>
                  <Link href="/library/read">Tuyển đọc thế giới</Link>
                  <a href="https://m.me/thongphan.88" target="_blank" rel="noopener noreferrer">
                    Rời thongphan.com để nhắn qua Messenger (mở thẻ mới)
                  </a>
                </div>
              </div>
            </section>

            {note.cta ? (
              <section className={styles.endCta} aria-labelledby="note-cta-title">
                <p>{note.cta.label || 'Bước tiếp theo'}</p>
                <h2 id="note-cta-title">{note.cta.title}</h2>
                {note.cta.body ? <span>{note.cta.body}</span> : null}
                {isExternalHref(note.cta.href) ? (
                  <a href={note.cta.href} target="_blank" rel="noopener noreferrer">
                    {note.cta.cta} — rời thongphan.com, mở thẻ mới
                    <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.6} />
                  </a>
                ) : (
                  <Link href={note.cta.href}>
                    {note.cta.cta}
                    <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.6} />
                  </Link>
                )}
              </section>
            ) : null}

            <footer className={styles.noteFooter}>
              <Link href="/library">Trở lại toàn bộ thư viện</Link>
              <span>Đăng {new Date(note.publishedAt).toLocaleDateString('vi-VN')} · Cập nhật {new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
            </footer>
          </div>
        </div>

        <ChapterHandoff journeyKey="reader" tone="paper" />
      </div>
    </article>
  )
}
