import { ArrowRight, ExternalLink, GraduationCap, BookOpen, Users } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import './Products.css';

const products = [
    {
        id: 'tensai',
        name: 'Tensai Learning',
        tagline: 'Hệ thống học tập năng lực cá nhân',
        description: 'Nền tảng học tập với phương pháp khoa học, giúp bạn phát triển các kỹ năng cần thiết để thành công trong sự nghiệp và cuộc sống.',
        icon: GraduationCap,
        features: [
            'Học theo lộ trình được thiết kế khoa học',
            'Bài tập thực hành tương tác',
            'Theo dõi tiến độ học tập',
            'Chứng chỉ hoàn thành khóa học',
        ],
        href: 'https://learn.thongphan.com',
        color: 'primary',
        featured: true,
    },
    {
        id: 'blog',
        name: 'Thông Phan Blog',
        tagline: 'Chia sẻ kiến thức & kinh nghiệm',
        description: 'Nơi mình chia sẻ về xây dựng thương hiệu cá nhân, tạo thu nhập từ kiến thức và phát triển bản thân.',
        icon: BookOpen,
        features: [
            'Bài viết chuyên sâu hàng tuần',
            'Case studies thực tế',
            'Frameworks và templates',
            'Hoàn toàn miễn phí',
        ],
        to: '/blog',
        color: 'secondary',
        featured: false,
    },
    {
        id: 'community',
        name: 'Conan School',
        tagline: 'Cộng đồng phát triển bản thân',
        description: 'Cộng đồng những người muốn nâng tầm chuyên môn và xây dựng nguồn thu nhập bền vững từ kiến thức.',
        icon: Users,
        features: [
            'Kết nối với cộng đồng cùng chí hướng',
            'Hỏi đáp và thảo luận',
            'Workshops và events',
            'Networking opportunities',
        ],
        href: 'https://www.facebook.com/groups/conanschool',
        color: 'accent',
        featured: false,
    },
];

export default function Products() {
    return (
        <main className="products-page">
            {/* Hero */}
            <section className="products-hero">
                <div className="container">
                    <h1 className="products-hero-title">Sản phẩm</h1>
                    <p className="products-hero-description">
                        Những công cụ và tài nguyên giúp bạn xây dựng thương hiệu cá nhân và tạo thu nhập từ kiến thức
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="products-list section">
                <div className="container">
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="products-cta section">
                <div className="container text-center">
                    <h2 className="section-title">Không biết bắt đầu từ đâu?</h2>
                    <p className="section-description">
                        Hãy bắt đầu với Tensai Learning - nơi bạn có thể học các kỹ năng cần thiết từ cơ bản đến nâng cao
                    </p>
                    <MagneticButton
                        variant="primary"
                        size="large"
                        href="https://learn.thongphan.com"
                    >
                        Bắt đầu với Tensai
                        <ArrowRight size={20} />
                    </MagneticButton>
                </div>
            </section>
        </main>
    );
}

function ProductCard({ product }) {
    const Icon = product.icon;

    return (
        <div className={`product-card product-card-${product.color} ${product.featured ? 'product-card-featured' : ''}`}>
            {product.featured && <div className="product-badge">Nổi bật</div>}

            <div className="product-icon">
                <Icon size={32} />
            </div>

            <h2 className="product-name">{product.name}</h2>
            <p className="product-tagline">{product.tagline}</p>
            <p className="product-description">{product.description}</p>

            <ul className="product-features">
                {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>

            <div className="product-cta">
                <MagneticButton
                    variant={product.color === 'primary' ? 'primary' : product.color === 'accent' ? 'accent' : 'secondary'}
                    href={product.href}
                    to={product.to}
                >
                    {product.href ? (
                        <>
                            Truy cập <ExternalLink size={16} />
                        </>
                    ) : (
                        <>
                            Khám phá <ArrowRight size={16} />
                        </>
                    )}
                </MagneticButton>
            </div>
        </div>
    );
}
