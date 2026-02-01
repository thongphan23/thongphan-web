import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Mail } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import MagneticButton from '../components/MagneticButton';

export default function BlogPost() {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <main className="blog-post-page">
                <div className="container">
                    <div className="post-not-found">
                        <h1>Không tìm thấy bài viết</h1>
                        <p>Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
                        <MagneticButton variant="primary" to="/blog">
                            <ArrowLeft size={18} />
                            Quay lại Blog
                        </MagneticButton>
                    </div>
                </div>
            </main>
        );
    }

    const relatedPosts = blogPosts
        .filter(p => p.slug !== slug && p.category === post.category)
        .slice(0, 2);

    return (
        <main className="blog-post-page">
            {/* Reading Progress */}
            <div className="reading-progress-bar" style={{ width: '0%' }} />

            {/* Header */}
            <header className="blog-post-header">
                <div className="blog-post-header-bg" />
                <div className="container">
                    <Link to="/blog" className="back-link">
                        <ArrowLeft size={18} />
                        Quay lại Blog
                    </Link>

                    <div className="post-header-meta">
                        <span className="post-category">{post.category}</span>
                        <span className="post-date">{post.date}</span>
                        <span className="post-reading-time">
                            <Clock size={14} />
                            {post.readingTime} phút đọc
                        </span>
                    </div>

                    <h1 className="post-header-title">{post.title}</h1>
                    <p className="post-header-excerpt">{post.excerpt}</p>

                    <div className="post-author">
                        <div className="testimonial-avatar">TP</div>
                        <span className="author-name">Thông Phan</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <article className="blog-post-content">
                <div className="container-narrow">
                    <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
            </article>

            {/* Footer */}
            <footer className="blog-post-footer">
                <div className="container-narrow">
                    {/* Share */}
                    <div className="share-section">
                        <button className="share-button">
                            <Share2 size={18} />
                            Chia sẻ bài viết
                        </button>
                    </div>

                    {/* Subscribe CTA */}
                    <div className="subscribe-cta">
                        <Mail size={32} className="subscribe-icon" />
                        <h3>Đừng bỏ lỡ bài viết mới</h3>
                        <p>Đăng ký để nhận thông báo khi có nội dung mới</p>
                        <form className="subscribe-form-inline" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="subscribe-input"
                            />
                            <MagneticButton variant="primary">
                                Đăng ký
                            </MagneticButton>
                        </form>
                    </div>
                </div>
            </footer>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="related-posts-section">
                    <div className="container-narrow">
                        <h3>Bài viết liên quan</h3>
                        <div className="related-posts-grid">
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.slug}
                                    to={`/blog/${related.slug}`}
                                    className="related-post-card"
                                >
                                    <span className="related-category">{related.category}</span>
                                    <h4>{related.title}</h4>
                                    <span className="related-reading-time">
                                        {related.readingTime} phút đọc
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
