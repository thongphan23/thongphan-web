import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Users, BookOpen, Facebook, MessageCircle } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const rotatingValues = [
    'xây dựng thương hiệu cá nhân',
    'tạo thu nhập từ kiến thức',
    'phát triển sự nghiệp bền vững',
    'kết nối cộng đồng'
];

const pathways = [
    {
        number: '01',
        title: 'Học tập',
        description: 'Nâng cao năng lực với các khóa học được thiết kế bài bản.',
        cta: 'Vào Tensai',
        href: 'https://learn.thongphan.com',
        highlight: true,
        ctaPrimary: true,
    },
    {
        number: '02',
        title: 'Kết nối',
        description: 'Tham gia cộng đồng những người muốn phát triển bản thân.',
        cta: 'Conan School',
        href: 'https://www.facebook.com/groups/conanschool',
    },
    {
        number: '03',
        title: 'Đọc Blog',
        description: 'Khám phá các bài viết về tư duy, kỹ năng và kinh nghiệm.',
        cta: 'Xem Blog',
        to: '/blog',
    },
];

export default function Home() {
    const [currentValueIndex, setCurrentValueIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentValueIndex((prev) => (prev + 1) % rotatingValues.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <img
                        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
                        alt=""
                        className="hero-bg-image"
                    />
                    <div className="hero-overlay" />
                </div>

                <div className="hero-sparkles">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="hero-sparkle"
                            style={{
                                left: `${10 + Math.random() * 80}%`,
                                animationDelay: `${i * 0.5}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="hero-content container">
                    <div className="hero-text">
                        <p className="hero-tagline">Xin chào, mình là</p>
                        <h1 className="hero-title">
                            <span className="hero-name">Thông Phan</span>
                        </h1>
                        <p className="hero-subtitle">
                            <span className="subtitle-prefix">Mình giúp bạn</span>
                            <span className="value-rotator">
                                <span className="text-rotate-container">
                                    <span className="text-rotate-item">
                                        {rotatingValues[currentValueIndex]}
                                    </span>
                                </span>
                            </span>
                        </p>
                        <div className="hero-ctas">
                            <MagneticButton
                                variant="primary"
                                size="large"
                                href="https://learn.thongphan.com"
                            >
                                <GraduationCap size={20} />
                                Bắt đầu học
                            </MagneticButton>
                            <MagneticButton
                                variant="ghost"
                                size="large"
                                to="/about"
                            >
                                Về tôi
                                <ArrowRight size={20} />
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="journey-section section">
                <div className="container">
                    <h2 className="text-center">Hành trình của bạn</h2>
                    <p className="text-center text-secondary" style={{ marginBottom: 'var(--space-12)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Chọn điểm bắt đầu phù hợp với bạn
                    </p>

                    <div className="pathways-stack">
                        {pathways.map((pathway) => (
                            <PathwayCard key={pathway.number} pathway={pathway} />
                        ))}
                    </div>

                    {/* Connect Section */}
                    <div className="connect-section">
                        <span className="connect-label">Kết nối với mình</span>
                        <h3 className="connect-title">Nhận cập nhật mới nhất</h3>
                        <div className="connect-buttons">
                            <a
                                href="https://www.facebook.com/thongphanblog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="connect-btn connect-btn-fb"
                            >
                                <Facebook size={18} />
                                Facebook
                            </a>
                            <a
                                href="https://zalo.me/0397887749"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="connect-btn connect-btn-zalo"
                            >
                                <MessageCircle size={18} />
                                Zalo
                            </a>
                        </div>
                    </div>

                    {/* Portfolio CTA */}
                    <Link to="/products" className="portfolio-featured-cta">
                        <div className="portfolio-cta-content">
                            <h3 className="portfolio-cta-title">Khám phá các sản phẩm</h3>
                            <p className="portfolio-cta-desc">
                                Tensai LMS, Content Factory và những dự án mình đang xây dựng
                            </p>
                        </div>
                        <span className="portfolio-cta-btn">
                            Xem sản phẩm
                            <ArrowRight size={20} />
                        </span>
                    </Link>
                </div>
            </section>
        </main>
    );
}

function PathwayCard({ pathway }) {
    const content = (
        <>
            <div className="pathway-number">{pathway.number}</div>
            <div className="pathway-content">
                <h3>{pathway.title}</h3>
                <p>{pathway.description}</p>
                <span className={`pathway-cta ${pathway.ctaPrimary ? 'pathway-cta-primary' : ''}`}>
                    {pathway.cta}
                    <ArrowRight size={16} />
                </span>
            </div>
        </>
    );

    const className = `pathway-card ${pathway.highlight ? 'pathway-highlight' : ''}`;

    if (pathway.href) {
        return (
            <a href={pathway.href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
            </a>
        );
    }

    return (
        <Link to={pathway.to} className={className}>
            {content}
        </Link>
    );
}
