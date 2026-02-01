import { Home, ArrowLeft } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

export default function NotFound() {
    return (
        <div className="not-found-page">
            {/* Background Effects */}
            <div className="fullscreen-effects">
                <div className="mega-ring ring-1" />
                <div className="mega-ring ring-2" />
                <div className="mega-ring ring-3" />
                <div className="center-glow" />

                {/* Floating Orbs */}
                <div className="floating-orb orb-1" />
                <div className="floating-orb orb-2" />
                <div className="floating-orb orb-3" />
                <div className="floating-orb orb-4" />
                <div className="floating-orb orb-5" />
                <div className="floating-orb orb-6" />
                <div className="floating-orb orb-7" />
                <div className="floating-orb orb-8" />
            </div>

            <div className="not-found-container">
                {/* Giant 404 */}
                <div className="giant-404">
                    <span className="digit digit-4-left">4</span>
                    <span className="digit digit-0">0</span>
                    <span className="digit digit-4-right">4</span>
                </div>

                {/* Message */}
                <div className="not-found-message">
                    <h1>Không tìm thấy trang</h1>
                    <p>
                        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                    </p>
                </div>

                {/* Actions */}
                <div className="not-found-actions">
                    <MagneticButton variant="primary" to="/">
                        <Home size={18} />
                        Về trang chủ
                    </MagneticButton>
                    <MagneticButton variant="ghost" to="/blog">
                        <ArrowLeft size={18} />
                        Xem Blog
                    </MagneticButton>
                </div>
            </div>
        </div>
    );
}
