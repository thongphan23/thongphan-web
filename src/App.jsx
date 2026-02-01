import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Products from './pages/Products';
import Courses from './pages/Courses';
import NotFound from './pages/NotFound';

import './styles/design-system.css';

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* 404 page without navbar/footer */}
          <Route path="/404" element={<NotFound />} />

          {/* All other routes with navbar/footer */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
