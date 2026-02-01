import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MagneticButton from './MagneticButton';

const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/about', label: 'Về tôi' },
    { to: '/blog', label: 'Blog' },
    { to: '/products', label: 'Sản phẩm' },
    { to: '/courses', label: 'Khóa học' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location]);

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-inner">
                    <Link to="/" className="navbar-logo">
                        Thông Phan
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-links hide-mobile">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <MagneticButton
                            variant="primary"
                            size="small"
                            href="https://learn.thongphan.com"
                        >
                            Vào Tensai
                        </MagneticButton>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="navbar-mobile-btn show-mobile"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileOpen && (
                    <div className="navbar-mobile-menu">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`navbar-mobile-link ${location.pathname === link.to ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <MagneticButton
                            variant="primary"
                            href="https://learn.thongphan.com"
                            style={{ marginTop: '1rem' }}
                        >
                            Vào Tensai
                        </MagneticButton>
                    </div>
                )}
            </div>
        </nav>
    );
}
