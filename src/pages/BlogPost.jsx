import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '../data/posts';
import './BlogPost.css';

export default function BlogPost() {
    const { slug } = useParams();
    const post = getPostBySlug(slug);
    const relatedPosts = post ? getRelatedPosts(slug, 2) : [];

    if (!post) {
        return (
            <section className="section post-not-found">
                <div className="container">
                    <h1>Bài viết không tìm thấy</h1>
                    <p>Xin lỗi, bài viết bạn tìm không tồn tại.</p>
                    <Link to="/blog" className="btn btn-primary">
                        <ArrowLeft size={16} /> Quay lại Blog
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <article className="blog-post-page">
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
                            {post.readingTime}
                        </span>
                    </div>

                    <h1 className="post-header-title">{post.title}</h1>
                    <p className="post-header-excerpt">{post.excerpt}</p>

                    <div className="post-author">
                        <span className="author-name">Thông Phan</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <section className="blog-post-content">
                <div className="container-narrow">
                    <div
                        className="prose"
                        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>').replace(/## /g, '<h2>').replace(/### /g, '<h3>') }}
                    />
                </div>
            </section>

            {/* Footer */}
            <section className="blog-post-footer">
                <div className="container-narrow">
                    <div className="share-section">
                        <button className="share-button">
                            <Share2 size={18} />
                            Chia sẻ bài viết
                        </button>
                    </div>
                </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="related-posts-section">
                    <div className="container-narrow">
                        <h3>Bài viết liên quan</h3>
                        <div className="related-posts-grid">
                            {relatedPosts.map(related => (
                                <Link key={related.id} to={`/blog/${related.slug}`} className="related-post-card">
                                    <span className="related-category">{related.category}</span>
                                    <h4>{related.title}</h4>
                                    <span className="related-reading-time">{related.readingTime}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
}
