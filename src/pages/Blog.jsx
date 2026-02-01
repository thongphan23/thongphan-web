import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import './Blog.css';

export default function Blog() {
    const featuredPost = blogPosts.find((post) => post.featured);
    const recentPosts = blogPosts
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return (
        <main className="blog-page">
            <section className="blog-hero">
                <div className="container">
                    <h1 className="blog-hero-title">Blog</h1>
                    <p className="blog-hero-description">
                        Chia sẻ về xây dựng thương hiệu cá nhân, tạo thu nhập từ kiến thức và phát triển bản thân.
                    </p>
                </div>
            </section>

            {/* Featured Post */}
            {featuredPost && (
                <section className="blog-featured">
                    <div className="container">
                        <Link to={`/blog/${featuredPost.slug}`} className="featured-card">
                            <div className="featured-content">
                                <span className="featured-badge">Nổi bật</span>
                                <h2 className="featured-title">{featuredPost.title}</h2>
                                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                                <div className="featured-meta">
                                    <span className="meta-item">
                                        <Calendar size={16} />
                                        {formatDate(featuredPost.publishedAt)}
                                    </span>
                                    <span className="meta-item">
                                        <Clock size={16} />
                                        {featuredPost.readingTime} phút đọc
                                    </span>
                                    <span className="meta-item">
                                        <Tag size={16} />
                                        {featuredPost.category}
                                    </span>
                                </div>
                                <span className="featured-link">
                                    Đọc bài viết <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            {/* All Posts */}
            <section className="blog-list section">
                <div className="container">
                    <h2 className="section-title">Tất cả bài viết</h2>
                    <div className="posts-grid">
                        {recentPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

function PostCard({ post }) {
    return (
        <Link to={`/blog/${post.slug}`} className="post-card">
            <div className="post-card-content">
                <div className="post-category">{post.category}</div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                    <span className="meta-item">
                        <Calendar size={14} />
                        {formatDate(post.publishedAt)}
                    </span>
                    <span className="meta-item">
                        <Clock size={14} />
                        {post.readingTime} phút
                    </span>
                </div>
            </div>
        </Link>
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
