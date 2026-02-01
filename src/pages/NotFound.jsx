import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import './NotFound.css';

export default function NotFound() {
    return (
        <main className="not-found-page">
            <div className="not-found-content">
                <div className="not-found-code">404</div>
                <h1 className="not-found-title">Không tìm thấy trang</h1>
                <p className="not-found-description">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                </p>
                <div className="not-found-actions">
                    <MagneticButton variant="primary" to="/">
                        <Home size={18} />
                        Về trang chủ
                    </MagneticButton>
                    <MagneticButton variant="secondary" to="/blog">
                        <ArrowLeft size={18} />
                        Xem Blog
                    </MagneticButton>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="not-found-decoration">
                <div className="decoration-circle decoration-circle-1" />
                <div className="decoration-circle decoration-circle-2" />
                <div className="decoration-circle decoration-circle-3" />
            </div>
        </main>
    );
}
