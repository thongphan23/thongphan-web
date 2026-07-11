'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import styles from './page.module.css'

interface TOCHeading {
  id: string
  text: string
  level: number
}

interface ArticleCta {
  label?: string
  title: string
  body?: string
  href: string
  cta: string
}

interface RelatedPost {
  slug: string
  title: string
  description: string
  journey?: string
  readerState?: string
  readingTime: number
}

interface BlogArticleProps {
  title: string
  description: string
  category: string
  journey?: string
  readerState?: string
  promise?: string
  proof?: string
  publishedAt: string
  readingTime: number
  coverImage?: string
  contentHtml: string
  headings: TOCHeading[]
  slug: string
  endCta?: ArticleCta
  relatedPosts: RelatedPost[]
}

const categoryLabels: Record<string, string> = {
  ai: 'Sợ AI / Dùng AI đúng cách',
  brain2: 'Brain2',
  content: 'Content kéo khách',
  career: 'Tài sản số',
  finance: 'Tài sản số',
  conan: 'Conan',
}

const stateDescriptions: Record<string, string> = {
  'Nhẹ nhõm': 'Bớt hoang mang, bớt cảm giác phải chạy theo tất cả.',
  'Sáng tỏ': 'Thấy bản đồ, thấy đúng chỗ mình đang kẹt.',
  'Kiểm soát': 'Có bước tiếp theo đủ nhỏ để làm ngay.',
}

function isExternalHref(href: string) {
  return href.startsWith('http')
}

export default function BlogArticle({
  title,
  description,
  category,
  journey,
  readerState,
  promise,
  proof,
  publishedAt,
  readingTime,
  coverImage,
  contentHtml,
  headings,
  slug,
  endCta,
  relatedPosts,
}: BlogArticleProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeHeading, setActiveHeading] = useState('')
  const [tocOpen, setTocOpen] = useState(false)
  const [articleUrl, setArticleUrl] = useState(`https://thongphan.com/blog/${slug}`)
  const [copyLabel, setCopyLabel] = useState('Copy link')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)
  const storageKey = `tp:blog:bookmark:${slug}`

  const tocHeadings = useMemo(
    () =>
      headings.map((heading) => ({
        ...heading,
        text: heading.text.replace(/^#\s*/, '').trim(),
      })),
    [headings]
  )

  const encodedUrl = encodeURIComponent(articleUrl)
  const showTOC = tocHeadings.length >= 3
  const journeyLabel = journey || categoryLabels[category] || category
  const stateLabel = readerState || 'Sáng tỏ'
  const stateDescription = stateDescriptions[stateLabel] || 'Đọc để thấy rõ hơn giữa nhiễu động AI.'

  useEffect(() => {
    setArticleUrl(window.location.href)
    setIsBookmarked(window.localStorage.getItem(storageKey) === '1')
  }, [storageKey])

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(Math.max(progress, 0), 100))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (tocHeadings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    )

    tocHeadings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [tocHeadings])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl)
      setCopyLabel('Đã copy')
    } catch {
      setCopyLabel('Copy lỗi')
    }

    window.setTimeout(() => setCopyLabel('Copy link'), 1800)
  }

  const shareArticle = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: description, url: articleUrl })
        return
      }
    } catch {
      return
    }

    await copyLink()
  }

  const toggleBookmark = () => {
    const nextValue = !isBookmarked
    setIsBookmarked(nextValue)

    if (nextValue) {
      window.localStorage.setItem(storageKey, '1')
    } else {
      window.localStorage.removeItem(storageKey)
    }
  }

  const renderCtaLink = (cta: ArticleCta, className: string) => {
    if (isExternalHref(cta.href)) {
      return (
        <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
          {cta.cta}
        </a>
      )
    }

    return (
      <Link href={cta.href} className={className}>
        {cta.cta}
      </Link>
    )
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.progressBar}
        style={{ width: `${scrollProgress}%` }}
      />

      <article className={styles.article} ref={articleRef}>
        <header className={styles.header}>
          <div className={styles.headerShell}>
            <div className={styles.headerTopline}>
              <div className={styles.authorLine}>
                <img src="/thong-phan.jpg" alt="Thông Phan" className={styles.authorPhoto} />
                <div>
                  <span>Thông Phan</span>
                  <p>10 năm content & CMO. Brain2 đang chạy thật, Conan là nơi thực hành tiếp.</p>
                </div>
              </div>
              <span className={styles.statePill}>{stateLabel}</span>
            </div>

            <div className={styles.kickerRow}>
              <span>{journeyLabel}</span>
              <span>{readingTime} phút đọc</span>
              <span>{new Date(publishedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </div>

            <h1 className={styles.title}>{title}</h1>
            <p className={styles.promise}>{promise || description}</p>
            <p className={styles.description}>{description}</p>

            <div className={styles.readerState}>
              <span>Đọc để thấy</span>
              <strong>{stateLabel}</strong>
              <p>{stateDescription}</p>
            </div>

            {proof && (
              <p className={styles.headerProof}>
                <span>Proof sống</span>
                {proof}
              </p>
            )}
          </div>
        </header>

        {coverImage && (
          <div className={styles.coverWrap}>
            <div className="container">
              <img
                src={coverImage}
                alt={title}
                className={styles.coverImage}
                loading="eager"
              />
            </div>
          </div>
        )}

        <div className={styles.mobileActionBar} aria-label="Thao tác nhanh">
          <button type="button" onClick={copyLink}>{copyLabel}</button>
          <button type="button" onClick={shareArticle}>Chia sẻ</button>
          <button type="button" onClick={toggleBookmark}>
            {isBookmarked ? 'Đã lưu' : 'Lưu'}
          </button>
        </div>

        <div className={styles.contentLayout}>
          <aside className={styles.readingRail} aria-label="Thao tác đọc">
            <div className={styles.railCard}>
              <div className={styles.railProgress}>
                <span style={{ height: `${scrollProgress}%` }} />
              </div>
              <p>{stateLabel}</p>
              <button type="button" onClick={copyLink}>{copyLabel}</button>
              <button type="button" onClick={shareArticle}>Chia sẻ</button>
              <button type="button" onClick={toggleBookmark}>
                {isBookmarked ? 'Đã lưu' : 'Lưu lại'}
              </button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a href="https://m.me/thongphan.88" target="_blank" rel="noopener noreferrer">
                Nhắn tui
              </a>
            </div>
          </aside>

          <div className={styles.articleColumn}>
            {showTOC && (
              <div className={styles.tocMobile}>
                <button
                  className={styles.tocMobileBtn}
                  type="button"
                  aria-expanded={tocOpen}
                  onClick={() => setTocOpen(!tocOpen)}
                >
                  <span>Mục lục · {tocHeadings.length} phần</span>
                  <span className={`${styles.tocChevron} ${tocOpen ? styles.tocChevronOpen : ''}`}>⌄</span>
                </button>
                {tocOpen && (
                  <nav className={styles.tocMobileNav} aria-label="Mục lục bài viết">
                    <ul className={styles.tocList}>
                      {tocHeadings.map((h) => (
                        <li
                          key={h.id}
                          className={`${styles.tocItem} ${h.level === 3 ? styles.tocSub : ''}`}
                        >
                          <a href={`#${h.id}`} onClick={() => setTocOpen(false)}>
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            )}

            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>

          {showTOC && (
            <aside className={styles.tocDesktop}>
              <nav className={styles.tocNav} aria-label="Mục lục bài viết">
                <div className={styles.tocTitle}>Mục lục</div>
                <ul className={styles.tocList}>
                  {tocHeadings.map((h) => (
                    <li
                      key={h.id}
                      className={`${styles.tocItem} ${h.level === 3 ? styles.tocSub : ''} ${activeHeading === h.id ? styles.tocActive : ''}`}
                    >
                      <a href={`#${h.id}`} onClick={() => setActiveHeading(h.id)}>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>

        <section className={styles.publicationClose} aria-label="Kết bài và đọc tiếp">
          <div className={styles.closeInner}>
            <div className={styles.closeEyebrow}>Publication close</div>
            <div className={styles.closeGrid}>
              <div className={styles.authorCard}>
                <img src="/thong-phan.jpg" alt="Thông Phan" className={styles.authorAvatar} />
                <div className={styles.authorInfo}>
                  <h2>Thông Phan</h2>
                  <p>
                    Tui giúp người có chuyên môn biến kiến thức thật thành tài sản số,
                    hệ thống AI và dòng tiền thứ 2. Không phải bằng cách học 100 công cụ,
                    mà bằng Brain2, proof sống và nhịp thực hành đủ lâu.
                  </p>
                  <ul className={styles.proofList}>
                    <li>14 tháng flop trước khi thấy mẫu lặp lại.</li>
                    <li>40+ bài viral, 80k+ shares tổng cộng.</li>
                    <li>600+ comment đăng ký workshop trong 24 giờ.</li>
                    <li>100+ Conan Makers đang thực hành.</li>
                  </ul>
                  <div className={styles.authorLinks}>
                    <Link href="/diagnostic">Tự chẩn đoán AI</Link>
                    <a href="https://facebook.com/thongphan23" target="_blank" rel="noopener noreferrer">Facebook</a>
                    <a href="https://m.me/thongphan.88" target="_blank" rel="noopener noreferrer">Messenger</a>
                  </div>
                </div>
              </div>

              <div className={styles.nextPanel}>
                <h2>Bài tiếp theo nên đọc</h2>
                <div className={styles.relatedList}>
                  {relatedPosts.map((post) => (
                    <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.relatedItem}>
                      <span>{post.journey || 'Bài viết'}</span>
                      <h3>{post.title}</h3>
                      <p>{post.readerState ? `${post.readerState}: ` : ''}{post.description}</p>
                      <small>{post.readingTime} phút đọc</small>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {endCta && (
              <div className={styles.endCta}>
                <span>{endCta.label || 'Bước tiếp theo'}</span>
                <h2>{endCta.title}</h2>
                {endCta.body && <p>{endCta.body}</p>}
                {renderCtaLink(endCta, 'btn-primary')}
              </div>
            )}
          </div>
        </section>

        <div className={styles.backWrap}>
          <Link href="/blog" className="btn-outline">← Tất cả bài viết</Link>
        </div>
        <ChapterHandoff journeyKey="blog-detail" tone="paper" />
      </article>

    </div>
  )
}
