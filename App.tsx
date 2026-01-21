import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RecruiterLayout from './components/RecruiterLayout';
import CandidateLayout from './components/CandidateLayout';
import Dashboard from './pages/Dashboard';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import CandidateDashboard from './pages/candidate/Dashboard';
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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/privacidade" element={<Legal type="privacy" />} />
        <Route path="/termos" element={<Legal type="terms" />} />
        
        {/* Recruiter / Admin Routes */}
        <Route path="/recruiter/*" element={
          <RecruiterLayout>
            <Routes>
              <Route index element={<RecruiterDashboard />} />
              <Route path="jobs" element={<div className="p-4">Módulo de Vagas (Em breve)</div>} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="analytics" element={<div className="p-4">Analytics (Em breve)</div>} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/recruiter" replace />} />
            </Routes>
          </RecruiterLayout>
        } />

        {/* Candidate Routes */}
        <Route path="/candidate/*" element={
          <CandidateLayout>
            <Routes>
              <Route index element={<CandidateDashboard />} />
              <Route path="profile" element={<div className="text-white p-4">Perfil (Em breve)</div>} />
              <Route path="jobs" element={<div className="text-white p-4">Vagas (Em breve)</div>} />
              <Route path="applications" element={<div className="text-white p-4">Candidaturas (Em breve)</div>} />
              <Route path="evolution" element={<div className="text-white p-4">Evolução (Em breve)</div>} />
              <Route path="*" element={<Navigate to="/candidate" replace />} />
            </Routes>
          </CandidateLayout>
        } />

        {/* Legacy Dashboard Redirect (maintain backward compatibility if needed, or redirect to recruiter) */}
        <Route path="/dashboard/*" element={<Navigate to="/recruiter" replace />} />

        {/* Auth Placeholder - Just for demo, redirects to Candidate Dashboard for now as default login */}
        <Route path="/login" element={<Navigate to="/candidate" />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;