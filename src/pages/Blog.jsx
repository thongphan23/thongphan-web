import { Link } from 'react-router-dom';
import { posts, getFeaturedPosts } from '../data/posts';
import { Clock, ArrowRight } from 'lucide-react';
import './Blog.css';

export default function Blog() {
    const featuredPosts = getFeaturedPosts();

    return (
        <>
            {/* Hero */}
            <section className="blog-hero">
                <div className="blog-hero-bg" />
                <div className="container blog-hero-content">
                    <span className="blog-hero-label">Blog</span>
                    <h1 className="blog-hero-title">Góc suy ngẫm</h1>
                    <p className="blog-hero-subtitle">
                        Những bài viết chia sẻ về xây dựng thương hiệu cá nhân, học tập và phát triển bản thân.
                    </p>
                </div>
            </section>

            {/* Posts List */}
            <section className="blog-posts-section">
                <div className="container">
                    <h2 className="posts-section-title">Tất cả bài viết</h2>

                    <div className="posts-grid">
                        {posts.map(post => (
                            <article key={post.id} className="post-card">
                                <Link to={`/blog/${post.slug}`} className="post-card-link">
                                    <div className="post-meta">
                                        <span className="post-category">{post.category}</span>
                                        <span className="post-date">{post.date}</span>
                                    </div>

                                    <h3 className="post-title">{post.title}</h3>
                                    <p className="post-excerpt">{post.excerpt}</p>

                                    <div className="post-footer">
                                        <span className="post-reading-time">
                                            <Clock size={14} />
                                            {post.readingTime}
                                        </span>
                                        <span className="post-read-more">
                                            Đọc tiếp <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
