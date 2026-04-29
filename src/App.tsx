import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import RecruiterLayout from './components/RecruiterLayout';
import CandidateLayout from './components/CandidateLayout';
import AdminLayout from './components/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { isAppSubdomain, isLocalHost } from './utils/runtimeHost';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Blog = lazy(() => import('./pages/Blog'));
const About = lazy(() => import('./pages/About'));
const Legal = lazy(() => import('./pages/Legal'));

const RecruiterDashboard = lazy(() => import('./pages/recruiter/Dashboard'));
const RecruiterJobs = lazy(() => import('./pages/recruiter/Jobs'));
const JobKanban = lazy(() => import('./pages/recruiter/JobKanban'));
const Billing = lazy(() => import('./pages/recruiter/Billing'));
const BulkAnalysis = lazy(() => import('./pages/recruiter/BulkAnalysis'));
const RecruiterAnalytics = lazy(() => import('./pages/recruiter/Analytics'));
const LiveFeed = lazy(() => import('./pages/recruiter/LiveFeed'));
const Candidates = lazy(() => import('./pages/Candidates'));
const PendingReviews = lazy(() => import('./pages/PendingReviews'));
const Settings = lazy(() => import('./pages/Settings'));

const CandidateDashboard = lazy(() => import('./pages/candidate/Dashboard'));
const DiagnosisPage = lazy(() => import('./pages/candidate/Diagnosis'));
const CVEditorPage = lazy(() => import('./pages/candidate/CVEditor'));
const EvolutionPage = lazy(() => import('./pages/candidate/Evolution'));
const CareerChatPage = lazy(() => import('./pages/candidate/CareerChat'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const SDRSimulator = lazy(() => import('./pages/admin/SDRSimulator'));

const ApplyPage = lazy(() => import('./pages/candidate/ApplyPage'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-sm text-slate-500">
      Carregando...
    </div>
  );
}

function getRootEntryPath() {
  if (typeof window === 'undefined') return '/landing';
  const hostname = window.location.hostname;
  if (isLocalHost(hostname)) return '/login';
  return isAppSubdomain(hostname) ? '/login' : '/landing';
}

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to={getRootEntryPath()} replace />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/para-empresas" element={<LandingPage />} />
              <Route path="/para-candidatos" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/vagas/:id/candidatar" element={<ApplyPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/privacidade" element={<Legal type="privacy" />} />
              <Route path="/termos" element={<Legal type="terms" />} />

              <Route
                path="/recruiter/*"
                element={
                  <PrivateRoute requiredRole="recruiter">
                    <RecruiterLayout>
                      <Routes>
                        <Route index element={<RecruiterDashboard />} />
                        <Route path="triagem" element={<BulkAnalysis />} />
                        <Route path="live" element={<LiveFeed />} />
                        <Route path="jobs" element={<RecruiterJobs />} />
                        <Route path="jobs/:id" element={<JobKanban />} />
                        <Route path="candidates" element={<Candidates />} />
                        <Route path="reviews" element={<PendingReviews />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="analytics" element={<RecruiterAnalytics />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/recruiter" replace />} />
                      </Routes>
                    </RecruiterLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/candidate/*"
                element={
                  <PrivateRoute requiredRole="candidate">
                    <CandidateLayout>
                      <Routes>
                        <Route index element={<CandidateDashboard />} />
                        <Route path="chat" element={<CareerChatPage />} />
                        <Route path="diagnosis" element={<DiagnosisPage />} />
                        <Route path="cv" element={<CVEditorPage />} />
                        <Route
                          path="jobs"
                          element={
                            <div className="p-8">
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl mb-6">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-bold">
                                  Lembrete: Vagas são bônus.
                                </p>
                              </div>
                              <CandidateDashboard />
                            </div>
                          }
                        />
                        <Route path="evolution" element={<EvolutionPage />} />
                        <Route path="*" element={<Navigate to="/candidate" replace />} />
                      </Routes>
                    </CandidateLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="analytics" element={<AdminDashboard />} />
                        <Route path="ai-control" element={<AdminDashboard />} />
                        <Route path="ai-squad" element={<AdminDashboard />} />
                        <Route path="ai-rag" element={<AdminDashboard />} />
                        <Route path="simulator" element={<SDRSimulator />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                      </Routes>
                    </AdminLayout>
                  </PrivateRoute>
                }
              />

              <Route path="/dashboard/*" element={<Navigate to="/recruiter" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;
