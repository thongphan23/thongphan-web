import { ArrowRight, ExternalLink, Share2, Eye, Newspaper, Play, Image } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const viralStats = [
    { value: '100k+', label: 'Shares' },
    { value: '40+', label: 'Bài viral (>1k shares)' },
    { value: '30M+', label: 'Views' },
];

const pressLinks = [
    { name: 'Kenh14', href: 'https://kenh14.vn' },
    { name: 'VietnamNet', href: 'https://vietnamnet.vn' },
    { name: 'VnExpress', href: 'https://vnexpress.net' },
    { name: 'CafeBiz', href: 'https://cafebiz.vn' },
];

const hstlStats = [
    { value: '12,000%', label: 'ROI (500k ads → 60tr/ngày)' },
    { value: '6', label: 'Chi nhánh (3-5% chi phí quảng cáo)' },
    { value: '400+', label: 'Khách/đêm (2x turnover rate)' },
];

const products = [
    {
        id: 'tensai',
        name: 'Tensai LMS',
        status: 'Live',
        description: 'Nền tảng học tập tương tác cao, giúp người đi làm phát triển năng lực nền tảng.',
        href: 'https://learn.thongphan.com',
    },
    {
        id: 'penpal',
        name: 'Pen Pal CRM',
        status: 'Internal',
        description: 'Hệ thống quản lý kết nối cá nhân quy mô lớn (10,000+ người).',
    },
    {
        id: 'content-factory',
        name: 'Content Factory',
        status: 'Internal',
        description: 'Factory sản xuất content viral theo công thức khoa học.',
    },
    {
        id: 'ag-os',
        name: 'AG-OS',
        status: 'Internal',
        description: 'Hệ điều hành đa tác tử (Multi-Agent Operating System) cho automation.',
    },
];

export default function Products() {
    return (
        <main className="products-page">
            {/* Hero Section */}
            <section className="products-hero">
                <div className="products-hero-bg" />
                <div className="container">
                    <span className="section-label">Thành tựu & Chia sẻ</span>
                    <h1>Năng Lực</h1>
                    <p className="products-subtitle">
                        Chuỗi bài viral, Case cho ngành F&B, AI ứng dụng thực tế
                    </p>
                </div>
            </section>

            {/* Viral Content Showcase */}
            <section className="viral-section section">
                <div className="container">
                    <h2>Tôi viral, bạn cũng có thể</h2>
                    <p className="viral-description">
                        Viral là có công thức và nó hoàn toàn khoa học, không phải ngẫu nhiên hay may mắn.
                    </p>

                    <div className="viral-stats">
                        {viralStats.map((stat) => (
                            <div key={stat.label} className="viral-stat">
                                <span className="viral-stat-value">{stat.value}</span>
                                <span className="viral-stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Viral Marquee - Placeholder for JS-Driven Marquee */}
                <div className="viral-marquee">
                    <div className="marquee-track">
                        {/* Viral posts screenshots will be displayed here */}
                        <div className="marquee-placeholder">
                            <span>Viral Content Showcase</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* HSTL Story Box */}
            <section className="story-section section">
                <div className="container">
                    <div className="story-box">
                        <h2>Khác biệt để tồn tại, đột phá để dẫn đầu</h2>
                        <p>
                            Tôi không làm giống số đông. <strong>Hoa Sơn Tửu Lầu</strong> và <strong>Vietnam938</strong> là minh chứng
                            — khi bạn dám khác biệt, thị trường sẽ tự tìm đến bạn.
                        </p>

                        <div className="hstl-stats">
                            {hstlStats.map((stat) => (
                                <div key={stat.label} className="hstl-stat">
                                    <span className="hstl-stat-value">{stat.value}</span>
                                    <span className="hstl-stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* HSTL Carousel Placeholder */}
                        <div className="hstl-carousel">
                            <div className="carousel-placeholder">
                                <Image size={48} />
                                <span>Hoa Sơn Tửu Lầu Gallery</span>
                            </div>
                        </div>

                        {/* Deep Dive CTA */}
                        <div className="story-cta">
                            <MagneticButton
                                variant="secondary"
                                href="https://docs.google.com/document/d/1ICuFf1RMQTwyH5QhRb5dhk_gn5CdcwA84J7A6uGTsxw/edit?tab=t.sg6nqwo399mz"
                            >
                                Đọc Case Study HSTL
                                <ExternalLink size={18} />
                            </MagneticButton>
                        </div>

                        {/* Press Proof */}
                        <div className="press-proof">
                            {pressLinks.map((press) => (
                                <a
                                    key={press.name}
                                    href={press.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="press-link-item"
                                >
                                    <Newspaper size={16} />
                                    {press.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Vietnam938 Showcase */}
            <section className="vn938-section section">
                <div className="container">
                    <h2 className="vn938-title">Vietnam938</h2>
                    <p className="vn938-description">
                        Nhà hàng mang phong cách dã sử đầu tiên tại Việt Nam, tái hiện lại trận Bạch Đằng năm 938.
                        Đến quán bạn sẽ như quay lại thời phong kiến và được gọi là "tiểu thư, công tử"
                        và được trổ tài xạ tiễn nhận thưởng. Quán tọa lạc tại Núi Trúc, Hà Nội.
                    </p>

                    {/* VN938 Carousel Placeholder */}
                    <div className="vn938-carousel">
                        <div className="carousel-placeholder">
                            <Image size={48} />
                            <span>Vietnam938 Gallery</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Press Coverage */}
            <section className="press-section section">
                <div className="container">
                    <h2>Báo chí trích dẫn</h2>
                    <div className="press-grid">
                        <a href="https://cafebiz.vn" target="_blank" rel="noopener noreferrer" className="press-card">
                            <Newspaper size={32} />
                            <span className="press-name">CafeBiz</span>
                            <span className="press-excerpt">"Mô hình kinh doanh F&B sáng tạo..."</span>
                        </a>
                        <a href="https://theleader.vn" target="_blank" rel="noopener noreferrer" className="press-card">
                            <Newspaper size={32} />
                            <span className="press-name">The Leader</span>
                            <span className="press-excerpt">"Doanh nhân trẻ với tư duy khác biệt..."</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="products-grid-section section">
                <div className="container">
                    <span className="section-label">Công cụ & Hệ thống</span>
                    <h2>Sản phẩm</h2>
                    <p className="products-grid-subtitle">
                        Những công cụ và hệ thống tôi xây dựng để giải quyết vấn đề thực tế.
                    </p>

                    <div className="products-grid">
                        {products.map((product) => (
                            <div key={product.id} className="product-card">
                                <div className="product-header">
                                    <h3 className="product-name">{product.name}</h3>
                                    <span className={`product-status product-status-${product.status.toLowerCase()}`}>
                                        {product.status}
                                    </span>
                                </div>
                                <p className="product-description">{product.description}</p>
                                {product.href && (
                                    <a href={product.href} target="_blank" rel="noopener noreferrer" className="product-link">
                                        Truy cập
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
