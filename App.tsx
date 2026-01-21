import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import PendingReviews from './pages/PendingReviews';
import Settings from './pages/Settings';
import Blog from './pages/Blog';
import About from './pages/About';
import Legal from './pages/Legal';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/privacidade" element={<Legal type="privacy" />} />
        <Route path="/termos" element={<Legal type="terms" />} />
        
        {/* Admin Dashboard Routes 
            Using '/*' allows the nested Routes inside Layout to handle sub-paths 
        */}
        <Route path="/dashboard/*" element={
          <Layout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="pending" element={<PendingReviews />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />

        {/* Auth Placeholder */}
        <Route path="/login" element={<Navigate to="/dashboard" />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;