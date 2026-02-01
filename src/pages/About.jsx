import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Briefcase, GraduationCap, Award, Users, Calendar, MapPin } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const coreTraits = [
    { label: 'Sáng tạo', icon: '✨' },
    { label: 'Tò mò', icon: '🔍' },
    { label: 'Hài hước', icon: '😄' },
];

const expertise = [
    { skill: 'Marketing', level: 95 },
    { skill: 'Content', level: 90 },
    { skill: 'AI & Automation', level: 85 },
];

const timeline = [
    {
        year: '2006',
        title: 'Nền tảng học thuật',
        description: 'Chuyên Lý, Chuyên Tiền Giang',
        icon: GraduationCap,
    },
    {
        year: '2015',
        title: 'Hoa Sơn Tửu Lầu',
        description: 'Kiếm hiệp lầu, được CNN Travel, VTV3, Thanh Niên, Tuổi Trẻ đưa tin',
        icon: Award,
        links: [
            { label: 'CNN Travel', href: 'https://cnn.com' },
            { label: 'VTV3', href: 'https://vtv.vn' },
        ],
    },
    {
        year: '2016-2017',
        title: 'Serial Entrepreneurship',
        description: 'Kiếm Vương, Thánh Địa Liên Quân, Vietnam938. Quy mô: 50+ nhân sự',
        icon: Briefcase,
    },
    {
        year: '2018-2021',
        title: 'Marketing Leadership',
        description: 'Saffron Việt Nam, iCheck Corp. Dẫn dắt thị trường với 200+ nhân sự',
        icon: Users,
    },
    {
        year: '2022',
        title: 'CMO Autoshop',
        description: 'Top 1 giải pháp cho ngành F&B. Phục vụ hàng nghìn quán cafe và trà sữa trên toàn quốc',
        icon: Award,
    },
    {
        year: 'Hiện tại',
        title: 'Founder Conan School',
        description: 'Trường "Kinh doanh hiệu quả" đầu tiên tại Việt Nam',
        icon: GraduationCap,
        highlight: true,
    },
];

const mentors = [
    {
        name: 'Ba của tôi',
        title: 'Phan Quân Chiêu',
        lesson: 'Resilience và Determination - PhD từ Bách Khoa',
        image: '/images/mentor-father.jpg',
        link: 'https://phanquanchieu.com',
    },
    {
        name: 'Alex Hormozi',
        title: 'Entrepreneur',
        lesson: 'Business scaling và value creation',
        image: '/images/mentor-hormozi.jpg',
        link: 'https://acquisition.com',
    },
    {
        name: 'Nguyễn Ngọc Long',
        title: 'Brand Strategist',
        lesson: 'Media consciousness và brand strategy',
        image: '/images/mentor-nguyenngoclong.jpg',
        link: 'https://nguyenngoclong.com',
    },
];

export default function About() {
    return (
        <main className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-glow" />
                <div className="container">
                    <div className="about-hero-content">
                        <span className="section-label">Câu chuyện cá nhân</span>
                        <h1>Về Thông Phan</h1>
                        <p className="about-subtitle">
                            Sinh năm 1988 tại Tiền Giang. Tốt nghiệp UEH (Math/Stats).
                            Từ shipper, sales, diễn viên quần chúng đến doanh nhân và nhà đào tạo.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Traits */}
            <section className="traits-section section">
                <div className="container">
                    <div className="traits-badges">
                        {coreTraits.map((trait) => (
                            <span key={trait.label} className="trait-badge">
                                <span className="trait-icon">{trait.icon}</span>
                                {trait.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Expertise Bars */}
            <section className="expertise-section section">
                <div className="container">
                    <h2>Chuyên môn</h2>
                    <div className="expertise-bars">
                        {expertise.map((item) => (
                            <div key={item.skill} className="expertise-bar">
                                <div className="expertise-header">
                                    <span className="expertise-label">{item.skill}</span>
                                    <span className="expertise-value">{item.level}%</span>
                                </div>
                                <div className="expertise-track">
                                    <div
                                        className="expertise-fill"
                                        style={{ width: `${item.level}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="timeline-section section">
                <div className="container">
                    <h2>Hành trình</h2>
                    <div className="timeline">
                        {timeline.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <div
                                    key={item.year}
                                    className={`timeline-item ${item.highlight ? 'timeline-highlight' : ''}`}
                                >
                                    <div className="timeline-marker">
                                        <div className="timeline-icon">
                                            <IconComponent size={20} />
                                        </div>
                                    </div>
                                    <div className="timeline-content">
                                        <span className="timeline-year">{item.year}</span>
                                        <h3 className="timeline-title">{item.title}</h3>
                                        <p className="timeline-description">{item.description}</p>
                                        {item.links && (
                                            <div className="timeline-links">
                                                {item.links.map((link) => (
                                                    <a
                                                        key={link.label}
                                                        href={link.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="timeline-link"
                                                    >
                                                        {link.label}
                                                        <ExternalLink size={14} />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Mentors */}
            <section className="mentors-section section">
                <div className="container">
                    <h2>Người dẫn đường</h2>
                    <p className="mentors-subtitle">
                        Những người đã ảnh hưởng sâu sắc đến tư duy và hành động của tôi
                    </p>
                    <div className="mentors-grid">
                        {mentors.map((mentor) => (
                            <a
                                key={mentor.name}
                                href={mentor.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mentor-card"
                            >
                                <div className="mentor-image">
                                    <img src={mentor.image} alt={mentor.name} />
                                </div>
                                <div className="mentor-content">
                                    <h3 className="mentor-name">{mentor.name}</h3>
                                    <span className="mentor-title">{mentor.title}</span>
                                    <p className="mentor-lesson">{mentor.lesson}</p>
                                    <span className="mentor-link">
                                        Xem thêm
                                        <ExternalLink size={14} />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="philosophy-section section">
                <div className="container">
                    <div className="philosophy-content">
                        <h2>Triết lý sống</h2>
                        <blockquote className="philosophy-quote">
                            "Nói ít, làm nhiều và chứng minh bằng hành động."
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="about-cta section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Khám phá Năng Lực</h2>
                        <p>Chuỗi bài viral, Case cho ngành F&B, AI ứng dụng thực tế</p>
                        <MagneticButton variant="primary" to="/products">
                            Xem Năng Lực
                            <ArrowRight size={20} />
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}
