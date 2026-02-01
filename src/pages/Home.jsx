import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Users, BookOpen, Facebook, MessageCircle } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const rotatingValues = [
    'xây dựng thương hiệu cá nhân',
    'gia tăng thu nhập',
    'nâng tầm năng lực lõi'
];

const pathways = [
    {
        number: '01',
        title: 'Tôi muốn tự học',
        description: 'Nền tảng học tập tương tác miễn phí, giúp bạn phát triển năng lực theo lộ trình bài bản.',
        cta: 'Vào Tensai',
        href: 'https://learn.thongphan.com',
        highlight: true,
        ctaPrimary: true,
    },
    {
        number: '02',
        title: 'Tôi muốn được hướng dẫn',
        description: 'Trường học "hút khách" đầu tiên tại Việt Nam - Học kinh doanh hiệu quả cùng Thông Phan.',
        cta: 'Khám phá Conan School',
        href: 'https://www.conan.school',
    },
    {
        number: '03',
        title: 'Tôi muốn xem thử',
        description: 'Khám phá các bài viết viral về xây dựng thương hiệu, tư duy và chiến lược.',
        cta: 'Đọc Blog',
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
                        <p className="hero-tagline">Doanh nhân · Nhà đào tạo · Người chia sẻ</p>
                        <h1 className="hero-title">
                            <span className="hero-name">Thông Phan</span>
                        </h1>
                        <p className="hero-subtitle">
                            <span className="subtitle-prefix">Giúp bạn</span>
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
                                to="/about"
                            >
                                Tìm hiểu về tôi
                            </MagneticButton>
                            <MagneticButton
                                variant="ghost"
                                size="large"
                                to="/blog"
                            >
                                Đọc bài viết
                                <ArrowRight size={20} />
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intent Gateway Section */}
            <section className="journey-section section">
                <div className="container">
                    <h2 className="text-center">Bắt đầu ở đây</h2>
                    <p className="text-center text-secondary" style={{ marginBottom: 'var(--space-12)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Chọn lộ trình phù hợp với bạn
                    </p>

                    <div className="pathways-stack">
                        {pathways.map((pathway) => (
                            <PathwayCard key={pathway.number} pathway={pathway} />
                        ))}
                    </div>

                    {/* Direct Connection Section */}
                    <div className="connect-section">
                        <span className="connect-label">Bạn có vấn đề cụ thể?</span>
                        <h3 className="connect-title">Hãy kết nối với tôi</h3>
                        <div className="connect-buttons">
                            <a
                                href="https://m.me/thongphanblog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="connect-btn connect-btn-fb"
                            >
                                <Facebook size={18} />
                                Facebook Messenger
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

                    {/* Năng Lực Bridge CTA */}
                    <Link to="/products" className="portfolio-featured-cta">
                        <div className="portfolio-cta-content">
                            <h3 className="portfolio-cta-title">Khám phá Năng Lực</h3>
                            <p className="portfolio-cta-desc">
                                Chuỗi bài viral, Case cho ngành F&B, AI ứng dụng thực tế
                            </p>
                        </div>
                        <span className="portfolio-cta-btn">
                            Xem Năng Lực
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
