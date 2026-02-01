import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Briefcase, GraduationCap, Award, Users, Calendar, MapPin } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const timeline = [
    {
        year: '2024',
        title: 'Founder Tensai',
        description: 'Ra mắt nền tảng học tập Tensai với các khóa học về tư duy, giao tiếp và kỹ năng mềm.',
        icon: GraduationCap,
        highlight: true,
        links: [
            { label: 'Tensai LMS', href: 'https://learn.thongphan.com' }
        ]
    },
    {
        year: '2023',
        title: 'Content Creator',
        description: 'Bắt đầu chia sẻ kiến thức về xây dựng thương hiệu cá nhân và phát triển sự nghiệp trên Facebook.',
        icon: Award,
        links: [
            { label: 'Facebook', href: 'https://www.facebook.com/thongphanblog' }
        ]
    },
    {
        year: '2020',
        title: 'F&B Entrepreneur',
        description: 'Xây dựng và điều hành chuỗi cửa hàng F&B tại TP.HCM.',
        icon: Briefcase,
    },
];

const mentors = [
    {
        name: 'Naval Ravikant',
        title: 'Investor & Philosopher',
        description: 'Tư duy về wealth, happiness và building yourself.',
        image: 'https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg'
    },
    {
        name: 'James Clear',
        title: 'Author of Atomic Habits',
        description: 'Phương pháp xây dựng thói quen và hệ thống.',
        image: 'https://jamesclear.com/wp-content/uploads/2015/03/james-clear-square.jpg'
    },
    {
        name: 'Tim Ferriss',
        title: 'Author & Podcaster',
        description: 'Phương pháp học nhanh và thử nghiệm cuộc sống.',
        image: 'https://tim.blog/wp-content/uploads/2019/01/tim-ferriss-headshot.jpg'
    },
];

const traits = ['Builder', 'Learner', 'Teacher', 'Systems Thinker'];

export default function About() {
    return (
        <main className="about-page">
            {/* Hero */}
            <section className="about-hero">
                <div className="about-hero-bg" />
                <div className="container about-hero-content">
                    <span className="about-hero-label">Về tôi</span>
                    <h1 className="about-hero-title">Thông Phan</h1>
                    <p className="about-hero-subtitle">
                        Builder, Learner, Teacher
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="about-story section">
                <div className="container">
                    <div className="story-grid">
                        <div className="story-image">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop"
                                alt="Thông Phan"
                                className="story-portrait"
                            />
                        </div>
                        <div className="story-content">
                            <h2>Câu chuyện của tôi</h2>
                            <p>
                                Mình là <strong>Thông Phan</strong> - một người tin rằng ai cũng có thể xây dựng cuộc sống theo ý mình nếu có đúng mindset và đúng hệ thống.
                            </p>
                            <p>
                                Sau nhiều năm làm việc trong lĩnh vực F&B và khởi nghiệp, mình nhận ra rằng <strong>kiến thức và kỹ năng</strong> là tài sản quý giá nhất mà ai cũng có thể tích lũy và biến thành thu nhập.
                            </p>
                            <p>
                                Hiện tại, mình đang tập trung xây dựng <strong>Tensai</strong> - một nền tảng học tập giúp mọi người phát triển năng lực cá nhân một cách có hệ thống.
                            </p>
                            <div className="traits-container">
                                {traits.map((trait) => (
                                    <span key={trait} className="trait-badge">
                                        <span className="trait-label">{trait}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="timeline-section section">
                <div className="container">
                    <h2 className="text-center">Hành trình</h2>
                    <div className="timeline">
                        {timeline.map((item, index) => (
                            <div key={index} className={`timeline-item ${item.highlight ? 'timeline-highlight' : ''}`}>
                                <div className="timeline-marker">
                                    <item.icon size={20} />
                                </div>
                                <div className="timeline-content">
                                    <span className="timeline-year">{item.year}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    {item.links && (
                                        <div className="timeline-links">
                                            {item.links.map((link) => (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="timeline-link"
                                                >
                                                    {link.label}
                                                    <ExternalLink size={12} />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mentors */}
            <section className="mentors-section section">
                <div className="container">
                    <h2 className="text-center">Những người truyền cảm hứng</h2>
                    <div className="mentors-grid">
                        {mentors.map((mentor) => (
                            <div key={mentor.name} className="mentor-card">
                                <div className="mentor-image">
                                    <img src={mentor.image} alt={mentor.name} />
                                </div>
                                <h3>{mentor.name}</h3>
                                <span className="mentor-title">{mentor.title}</span>
                                <p>{mentor.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="philosophy-section section">
                <div className="container">
                    <div className="philosophy-card">
                        <h2>Triết lý sống</h2>
                        <blockquote className="philosophy-quote">
                            "Xây dựng những thứ có giá trị. Học những điều quan trọng. Chia sẻ những gì bạn biết."
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="portfolio-cta-section">
                <div className="container">
                    <div className="portfolio-cta-card">
                        <div className="portfolio-cta-content">
                            <h3>Hãy kết nối với mình</h3>
                            <p>Bắt đầu hành trình phát triển bản thân cùng Tensai</p>
                        </div>
                        <MagneticButton
                            variant="primary"
                            size="large"
                            href="https://learn.thongphan.com"
                        >
                            <GraduationCap size={20} />
                            Vào Tensai
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}
