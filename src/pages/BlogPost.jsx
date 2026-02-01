import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { getPostBySlug, getRecentPosts } from '../data/blogPosts';
import './BlogPost.css';

export default function BlogPost() {
    const { slug } = useParams();
    const post = getPostBySlug(slug);

    if (!post) {
        return <Navigate to="/404" replace />;
    }

    const relatedPosts = getRecentPosts(3).filter((p) => p.id !== post.id);

    return (
        <main className="blog-post-page">
            {/* Header */}
            <header className="post-header">
                <div className="container container-narrow">
                    <Link to="/blog" className="back-link">
                        <ArrowLeft size={20} />
                        Quay lại Blog
                    </Link>

                    <div className="post-category-badge">{post.category}</div>

                    <h1 className="post-page-title">{post.title}</h1>

                    <div className="post-header-meta">
                        <span className="meta-item">
                            <User size={16} />
                            {post.author}
                        </span>
                        <span className="meta-item">
                            <Calendar size={16} />
                            {formatDate(post.publishedAt)}
                        </span>
                        <span className="meta-item">
                            <Clock size={16} />
                            {post.readingTime} phút đọc
                        </span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <article className="post-content">
                <div className="container container-narrow">
                    <div
                        className="post-body"
                        dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                    />
                </div>
            </article>

            {/* Author */}
            <section className="post-author">
                <div className="container container-narrow">
                    <div className="author-card">
                        <div className="author-avatar">
                            <span>TP</span>
                        </div>
                        <div className="author-info">
                            <h3 className="author-name">{post.author}</h3>
                            <p className="author-bio">
                                Giúp chuyên gia xây dựng thương hiệu cá nhân và kiếm tiền từ kiến thức.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="related-posts section">
                    <div className="container">
                        <h2 className="section-title text-center">Bài viết liên quan</h2>
                        <div className="related-grid">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.id}
                                    to={`/blog/${relatedPost.slug}`}
                                    className="related-card"
                                >
                                    <div className="related-category">{relatedPost.category}</div>
                                    <h3 className="related-title">{relatedPost.title}</h3>
                                    <div className="related-meta">
                                        <span>{formatDate(relatedPost.publishedAt)}</span>
                                        <span>{relatedPost.readingTime} phút</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatContent(content) {
    // Convert markdown-like content to HTML
    return content
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr />')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Wrap consecutive li in ul
        .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')
        // Line breaks and paragraphs
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.startsWith('<h') ||
                paragraph.startsWith('<blockquote') ||
                paragraph.startsWith('<ul') ||
                paragraph.startsWith('<hr')) {
                return paragraph;
            }
            return `<p>${paragraph.replace(/\n/g, '<br />')}</p>`;
        })
        .join('\n');
}
