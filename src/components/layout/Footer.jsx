import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import './Footer.css';

const footerLinks = {
    navigation: [
        { path: '/', label: 'Trang chủ' },
        { path: '/about', label: 'About' },
        { path: '/portfolio', label: 'Năng lực' },
        { path: '/blog', label: 'Blog' },
    ],
    products: [
        { path: '/products', label: 'Sản phẩm' },
        { path: '/courses', label: 'Khóa học' },
    ],
    social: [
        { url: 'https://www.facebook.com/thongphan23', label: 'Facebook', external: true },
        { url: 'https://zalo.me/thongphan', label: 'Zalo', external: true },
    ],
};

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">Thông Phan</Link>
                        <p className="footer-tagline">
                            Giúp chuyên gia xây dựng thương hiệu cá nhân và tạo thu nhập từ chuyên môn.
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Điều hướng</h4>
                        <div className="footer-links">
                            {footerLinks.navigation.map(link => (
                                <Link key={link.path} to={link.path} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Connect Column */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Kết nối</h4>
                        <div className="footer-links">
                            {footerLinks.social.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-link footer-link-external"
                                >
                                    {link.label}
                                    <ExternalLink size={14} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Thông Phan. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
