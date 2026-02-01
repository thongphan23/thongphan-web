import { ArrowRight, ExternalLink, GraduationCap, Brain, MessageCircle, Lightbulb, Users } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const conanCourses = [
    {
        id: 'learning',
        title: 'Learning How to Learn',
        subtitle: 'Nền tảng',
        description: 'Học cách học - kỹ năng nền tảng để tiếp thu mọi kiến thức hiệu quả',
        icon: Brain,
        href: 'https://learn.thongphan.com',
    },
    {
        id: 'thinking',
        title: 'Tư Duy Phản Biện',
        subtitle: '195 bài',
        description: 'Phân tích và đánh giá thông tin chính xác',
        icon: Lightbulb,
        href: 'https://learn.thongphan.com',
    },
    {
        id: 'communication',
        title: 'Giao Tiếp Không Bạo Lực',
        subtitle: '65 bài',
        description: 'Kết nối sâu sắc qua giao tiếp',
        icon: MessageCircle,
        href: 'https://learn.thongphan.com',
    },
];

const tensaiPillars = [
    { nameEn: 'THINKING', nameVi: 'Tư duy', value: 'Suy nghĩ sắc bén' },
    { nameEn: 'COMMUNICATION', nameVi: 'Giao tiếp', value: 'Kết nối hiệu quả' },
    { nameEn: 'LEARNING', nameVi: 'Học tập', value: 'Tiếp thu nhanh' },
    { nameEn: 'SELF-MANAGEMENT', nameVi: 'Tự quản', value: 'Kiểm soát bản thân' },
];

export default function Courses() {
    return (
        <main className="courses-page">
            {/* Hero */}
            <section className="courses-hero">
                <div className="courses-hero-bg" />
                <div className="container courses-hero-content">
                    <span className="courses-hero-label">Khóa học</span>
                    <h1 className="courses-hero-title">Nâng cao năng lực</h1>
                    <p className="courses-hero-subtitle">
                        Các khóa học được thiết kế bài bản, giúp bạn phát triển năng lực cá nhân một cách có hệ thống
                    </p>
                </div>
            </section>

            {/* Conan School Section */}
            <section className="conan-section">
                <div className="container text-center">
                    <div className="conan-brand">
                        <h2 className="conan-title">Conan School</h2>
                        <span className="conan-tagline">Học để thay đổi, không phải để biết</span>
                    </div>
                    <p className="conan-description">
                        Cộng đồng học tập với các khóa học thực chiến, giúp bạn áp dụng kiến thức vào cuộc sống ngay lập tức
                    </p>

                    <div className="conan-courses-stack">
                        {conanCourses.map((course) => (
                            <a
                                key={course.id}
                                href={course.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="conan-course-row"
                            >
                                <div className="conan-course-icon">
                                    <course.icon size={24} />
                                </div>
                                <div className="conan-course-content">
                                    <div className="conan-course-header">
                                        <span className="conan-course-title">{course.title}</span>
                                        <span className="conan-course-subtitle">{course.subtitle}</span>
                                    </div>
                                    <p className="conan-course-desc">{course.description}</p>
                                </div>
                                <span className="conan-course-link">
                                    Xem chi tiết
                                    <ArrowRight size={16} />
                                </span>
                            </a>
                        ))}
                    </div>

                    <div className="conan-cta">
                        <MagneticButton
                            variant="accent"
                            size="large"
                            href="https://www.facebook.com/groups/conanschool"
                        >
                            <Users size={20} />
                            Tham gia Conan School
                        </MagneticButton>
                    </div>
                </div>
            </section>

            {/* Tensai Section */}
            <section className="tensai-section">
                <div className="container text-center">
                    <div className="tensai-brand">
                        <h2 className="tensai-title">Tensai</h2>
                        <span className="tensai-badge">LMS</span>
                    </div>
                    <p className="tensai-tagline">
                        Nền tảng học tập với <strong>4 trụ cột năng lực</strong> giúp bạn phát triển toàn diện
                    </p>

                    <div className="tensai-pillars-grid">
                        {tensaiPillars.map((pillar) => (
                            <a
                                key={pillar.nameEn}
                                href="https://learn.thongphan.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tensai-pillar-card"
                            >
                                <span className="pillar-name-en">{pillar.nameEn}</span>
                                <span className="pillar-name-vi">{pillar.nameVi}</span>
                                <span className="pillar-value">{pillar.value}</span>
                            </a>
                        ))}
                    </div>

                    <div className="tensai-cta">
                        <MagneticButton
                            variant="primary"
                            size="large"
                            href="https://learn.thongphan.com"
                        >
                            <GraduationCap size={20} />
                            Vào Tensai Learning
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}
