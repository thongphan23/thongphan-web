import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import './Home.css';

const rotatingTexts = [
    'xây thương hiệu cá nhân',
    'kiếm tiền từ kiến thức',
    'có thương hiệu trong ngành',
    'có sức ảnh hưởng',
];

const pathways = [
    {
        id: 'tensai',
        title: 'Tensai Learning',
        description: 'Hệ thống học tập năng lực cá nhân với phương pháp khoa học, giúp bạn phát triển toàn diện.',
        icon: GraduationCap,
        href: 'https://learn.thongphan.com',
        color: 'primary',
    },
    {
        id: 'blog',
        title: 'Thông Phan Blog',
        description: 'Chia sẻ về xây dựng thương hiệu cá nhân, tạo thu nhập từ kiến thức và phát triển bản thân.',
        icon: BookOpen,
        to: '/blog',
        color: 'secondary',
    },
    {
        id: 'community',
        title: 'Cộng đồng Conan School',
        description: 'Nơi tập trung những người muốn nâng tầm chuyên môn và xây dựng nguồn thu nhập bền vững.',
        icon: Users,
        href: 'https://www.facebook.com/groups/conanschool',
        color: 'accent',
    },
];

export default function Home() {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isTextAnimating, setIsTextAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTextAnimating(true);
            setTimeout(() => {
                setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
                setIsTextAnimating(false);
            }, 300);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-gradient" />
                    <div className="hero-sparkles">
                        {[...Array(20)].map((_, i) => (
                            <span key={i} className="sparkle" style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`,
                            }} />
                        ))}
                    </div>
                </div>

                <div className="hero-content container">
                    <h1 className="hero-title">
                        <span className="hero-title-line">Xin chào, mình là</span>
                        <span className="hero-title-name">Thông Phan</span>
                    </h1>

                    <p className="hero-subtitle">
                        Mình giúp chuyên gia như bạn{' '}
                        <span className="text-rotate-container">
                            <span className={`text-rotate-item ${isTextAnimating ? 'text-rotate-out' : 'text-rotate-in'}`}>
                                {rotatingTexts[currentTextIndex]}
                            </span>
                        </span>
                    </p>

                    <p className="hero-description">
                        Bạn có kiến thức và kinh nghiệm thực chiến. Bạn đã chứng minh được năng lực của mình trong thực tế.
                        Nhưng bạn chưa biết cách biến điều đó thành một thương hiệu cá nhân có sức ảnh hưởng và nguồn thu nhập bền vững.
                    </p>

                    <div className="hero-cta">
                        <MagneticButton variant="primary" size="large" href="https://learn.thongphan.com">
                            Bắt đầu với Tensai
                            <ArrowRight size={20} />
                        </MagneticButton>
                        <MagneticButton variant="secondary" size="large" to="/about">
                            Tìm hiểu về Thông
                        </MagneticButton>
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="journey section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Hành trình của bạn</h2>
                        <p className="section-description">
                            Chọn lối đi phù hợp với nơi bạn đang đứng
                        </p>
                    </div>

                    <div className="pathways-grid">
                        {pathways.map((pathway) => (
                            <PathwayCard key={pathway.id} {...pathway} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Connect Section */}
            <section className="connect section">
                <div className="container text-center">
                    <h2 className="section-title">Bắt đầu ở đây</h2>
                    <p className="section-description">
                        Chọn nơi phù hợp nhất với bạn để bắt đầu hành trình
                    </p>

                    <div className="connect-buttons">
                        <MagneticButton variant="primary" size="large" href="https://learn.thongphan.com">
                            Vào Tensai
                            <GraduationCap size={20} />
                        </MagneticButton>
                        <MagneticButton variant="accent" size="large" href="https://www.facebook.com/groups/conanschool">
                            Tham gia Conan School
                            <Users size={20} />
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}

function PathwayCard({ title, description, icon: Icon, href, to, color }) {
    const CardWrapper = to ? Link : 'a';
    const cardProps = to
        ? { to }
        : { href, target: '_blank', rel: 'noopener noreferrer' };

    return (
        <CardWrapper className={`pathway-card pathway-card-${color}`} {...cardProps}>
            <div className="pathway-icon">
                <Icon size={32} />
            </div>
            <h3 className="pathway-title">{title}</h3>
            <p className="pathway-description">{description}</p>
            <span className="pathway-link">
                Khám phá <ArrowRight size={16} />
            </span>
        </CardWrapper>
    );
}
