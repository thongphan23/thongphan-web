import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="not-found-page">
            {/* Fullscreen Effects */}
            <div className="fullscreen-effects">
                <div className="center-glow" />
                <motion.div
                    className="mega-ring ring-1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="mega-ring ring-2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="mega-ring ring-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />

                {/* Floating orbs */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`floating-orb orb-${i + 1}`}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.3
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="not-found-container">
                <motion.div
                    className="giant-404"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                >
                    <span className="digit digit-4-left">4</span>
                    <motion.span
                        className="digit digit-0"
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    >
                        0
                    </motion.span>
                    <span className="digit digit-4-right">4</span>
                </motion.div>

                <motion.div
                    className="not-found-message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h1>Trang không tìm thấy</h1>
                    <p>Có vẻ như bạn đã đi lạc vào một vùng đất chưa được khám phá.</p>
                </motion.div>

                <motion.div
                    className="not-found-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <MagneticButton to="/" variant="primary" size="large">
                        <Home size={18} />
                        Về trang chủ
                    </MagneticButton>
                    <MagneticButton to="/blog" variant="ghost" size="large">
                        <ArrowLeft size={18} />
                        Đọc blog
                    </MagneticButton>
                </motion.div>
            </div>
        </div>
    );
}
