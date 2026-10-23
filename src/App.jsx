import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { FeedbackProvider } from './components/Feedback.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Learn from './pages/Learn.jsx';

const TITLES = {
  '/': 'Home',
  '/explore': 'Explore the data',
  '/learn': 'Glossary and help',
};

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `South Dakota SLDS: ${TITLES[pathname] ?? 'Data Dashboard'}`;
  }, [pathname]);

  return (
    <FeedbackProvider>
      <div className="page">
        <Header />
        <main id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </FeedbackProvider>
  );
}
