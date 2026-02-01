import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Star, Mail } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import MagneticButton from '../components/MagneticButton';

const categories = ['Tất cả', 'Thương hiệu cá nhân', 'Tư duy', 'Chiến lược'];

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const filteredPosts = activeCategory === 'Tất cả'
        ? blogPosts
        : blogPosts.filter(post => post.category === activeCategory);

    const featuredPost = blogPosts[0];
    const sidePosts = blogPosts.slice(1, 3);
    const restPosts = blogPosts.slice(3);

    return (
        <main className="blog-page">
            {/* Hero */}
            <section className="blog-hero">
                <div className="blog-hero-bg" />
                <div className="container blog-hero-content">
                    <span className="blog-hero-label">Blog</span>
                    <h1 className="blog-hero-title">Bài viết</h1>
                    <p className="blog-hero-subtitle">
                        Chia sẻ về xây dựng thương hiệu cá nhân, phát triển bản thân và tạo thu nhập từ kiến thức
                    </p>
                </div>
            </section>

            {/* Subscribe */}
            <section className="blog-subscribe-section">
                <div className="container">
                    <div className="subscribe-card">
                        <div className="subscribe-content">
                            <Mail size={32} className="subscribe-icon" />
                            <div>
                                <h3>Đăng ký nhận bài viết mới</h3>
                                <p>Nhận thông báo khi có bài viết mới</p>
                            </div>
                        </div>
                        <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
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
            </section>

            {/* Categories */}
            <section className="blog-categories-section">
                <div className="container">
                    <div className="categories-menu">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured */}
            <section className="featured-section">
                <div className="container">
                    <div className="featured-header">
                        <Star size={20} />
                        <h2>Nổi bật</h2>
                    </div>

                    <div className="featured-grid">
                        {/* Main Featured */}
                        <Link to={`/blog/${featuredPost.slug}`} className="featured-main">
                            <div className="featured-main-overlay" />
                            <div className="featured-main-link">
                                <div className="featured-main-content">
                                    <span className="featured-badge">Nổi bật</span>
                                    <span className="featured-category">{featuredPost.category}</span>
                                    <h3>{featuredPost.title}</h3>
                                    <p>{featuredPost.excerpt}</p>
                                    <div className="featured-meta">
                                        <Clock size={14} />
                                        <span>{featuredPost.readingTime} phút đọc</span>
                                        <span>•</span>
                                        <span>{featuredPost.date}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Side Featured */}
                        <div className="featured-side">
                            {sidePosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    to={`/blog/${post.slug}`}
                                    className="featured-side-card"
                                >
                                    <div className="featured-side-link">
                                        <span className="featured-category">{post.category}</span>
                                        <h4>{post.title}</h4>
                                        <div className="featured-meta">
                                            <Clock size={12} />
                                            <span>{post.readingTime} phút</span>
                                            <span>•</span>
                                            <span>{post.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* All Posts */}
            <section className="blog-posts-section">
                <div className="container">
                    <h2 className="posts-section-title">Tất cả bài viết</h2>

                    <div className="posts-grid">
                        {filteredPosts.map((post) => (
                            <article key={post.slug} className="post-card">
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
                                            {post.readingTime} phút đọc
                                        </span>
                                        <span className="post-read-more">
                                            Đọc thêm
                                            <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
