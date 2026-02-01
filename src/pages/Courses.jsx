import { ArrowRight, ExternalLink, GraduationCap, Brain, MessageCircle, Lightbulb } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import './Courses.css';

const courses = [
    {
        id: 'learning-how-to-learn',
        name: 'Learning How to Learn',
        tagline: 'Học cách học - Nền tảng của mọi sự phát triển',
        description: 'Khóa học giúp bạn nắm vững các phương pháp học tập hiệu quả, từ đó tối ưu thời gian và nâng cao khả năng tiếp thu kiến thức.',
        icon: Brain,
        duration: '4 tuần',
        lessons: '65+ bài',
        level: 'Cơ bản',
        href: 'https://learn.thongphan.com',
        color: 'primary',
        featured: true,
    },
    {
        id: 'critical-thinking',
        name: 'Tư Duy Phản Biện',
        tagline: 'Phân tích và đánh giá thông tin chính xác',
        description: 'Phát triển khả năng tư duy logic, phân tích vấn đề và đưa ra quyết định sáng suốt trong công việc và cuộc sống.',
        icon: Lightbulb,
        duration: '6 tuần',
        lessons: '195 bài',
        level: 'Trung cấp',
        href: 'https://learn.thongphan.com',
        color: 'secondary',
        featured: false,
    },
    {
        id: 'communication',
        name: 'Giao Tiếp Không Bạo Lực',
        tagline: 'Kết nối sâu sắc qua giao tiếp',
        description: 'Học cách giao tiếp hiệu quả, xây dựng mối quan hệ lành mạnh và giải quyết xung đột một cách hòa bình.',
        icon: MessageCircle,
        duration: '5 tuần',
        lessons: '65 bài',
        level: 'Cơ bản',
        href: 'https://learn.thongphan.com',
        color: 'accent',
        featured: false,
    },
];

export default function Courses() {
    return (
        <main className="courses-page">
            {/* Hero */}
            <section className="courses-hero">
                <div className="container">
                    <h1 className="courses-hero-title">Khóa học</h1>
                    <p className="courses-hero-description">
                        Các khóa học được thiết kế để giúp bạn phát triển năng lực cá nhân một cách toàn diện
                    </p>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="courses-list section">
                <div className="container">
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="courses-cta section">
                <div className="container text-center">
                    <h2 className="section-title">Bắt đầu hành trình học tập</h2>
                    <p className="section-description">
                        Truy cập Tensai Learning để khám phá tất cả các khóa học và bắt đầu phát triển bản thân ngay hôm nay
                    </p>
                    <MagneticButton
                        variant="primary"
                        size="large"
                        href="https://learn.thongphan.com"
                    >
                        <GraduationCap size={20} />
                        Vào Tensai Learning
                    </MagneticButton>
                </div>
            </section>
        </main>
    );
}

function CourseCard({ course }) {
    const Icon = course.icon;

    return (
        <div className={`course-card course-card-${course.color} ${course.featured ? 'course-card-featured' : ''}`}>
            {course.featured && <div className="course-badge">Phổ biến</div>}

            <div className="course-icon">
                <Icon size={32} />
            </div>

            <h2 className="course-name">{course.name}</h2>
            <p className="course-tagline">{course.tagline}</p>
            <p className="course-description">{course.description}</p>

            <div className="course-meta">
                <div className="course-meta-item">
                    <span className="meta-label">Thời lượng</span>
                    <span className="meta-value">{course.duration}</span>
                </div>
                <div className="course-meta-item">
                    <span className="meta-label">Bài học</span>
                    <span className="meta-value">{course.lessons}</span>
                </div>
                <div className="course-meta-item">
                    <span className="meta-label">Cấp độ</span>
                    <span className="meta-value">{course.level}</span>
                </div>
            </div>

            <div className="course-cta">
                <MagneticButton
                    variant={course.color === 'primary' ? 'primary' : 'secondary'}
                    href={course.href}
                >
                    Xem khóa học
                    <ExternalLink size={16} />
                </MagneticButton>
            </div>
        </div>
    );
}
