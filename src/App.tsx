import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RecruiterLayout from './components/RecruiterLayout';
import CandidateLayout from './components/CandidateLayout';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import JobKanban from './pages/recruiter/JobKanban';
import Billing from './pages/recruiter/Billing';
import CandidateDashboard from './pages/candidate/Dashboard';
import Candidates from './pages/Candidates';
import PendingReviews from './pages/PendingReviews';
import Settings from './pages/Settings';
import Blog from './pages/Blog';
import About from './pages/About';
import Legal from './pages/Legal';
import ScrollToTop from './components/ScrollToTop';
import { FileText, User, TrendingUp } from 'lucide-react';

// Placeholder Components for Candidate Features (To be implemented in future iterations)
const FeaturePlaceholder = ({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: any;
}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 animate-fade-in-up">
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-sm">
      <Icon size={32} />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{desc}</p>
    <button className="mt-8 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
      Voltar ao Dashboard
    </button>
  </div>
);

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

        {/* Recruiter / Admin Routes (B2B - Decision Intelligence) */}
        <Route
          path="/recruiter/*"
          element={
            <RecruiterLayout>
              <Routes>
                <Route index element={<RecruiterDashboard />} />
                <Route path="jobs" element={<RecruiterJobs />} />
                <Route path="jobs/:id" element={<JobKanban />} />

                {/* Note: In a real app, 'Candidates' page uses the updated version in /recruiter/Candidates.tsx */}
                <Route path="candidates" element={<Candidates />} />

                <Route path="reviews" element={<PendingReviews />} />
                <Route path="billing" element={<Billing />} />
                <Route
                  path="analytics"
                  element={
                    <div className="p-8 text-slate-500 dark:text-slate-400 font-medium">
                      Analytics de Decisão (Em desenvolvimento)
                    </div>
                  }
                />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/recruiter" replace />} />
              </Routes>
            </RecruiterLayout>
          }
        />

        {/* Candidate Routes (B2C - Career Engineering) */}
        <Route
          path="/candidate/*"
          element={
            <CandidateLayout>
              <Routes>
                <Route index element={<CandidateDashboard />} />

                {/* Rota: Meu Diagnóstico (SCPD) */}
                <Route
                  path="diagnosis"
                  element={
                    <FeaturePlaceholder
                      title="Detalhamento do Score SCPD"
                      desc="Aqui você visualizará a análise profunda de cada pilar do seu diagnóstico: Clareza, Evidência e Foco. Gráficos de evolução estarão disponíveis na v2."
                      icon={User}
                    />
                  }
                />

                {/* Rota: Currículo Vivo */}
                <Route
                  path="cv"
                  element={
                    <FeaturePlaceholder
                      title="Editor de Currículo Vivo"
                      desc="Seu perfil mestre. Edite suas experiências aqui e a IA propagará as mudanças para todas as futuras versões otimizadas que você gerar."
                      icon={FileText}
                    />
                  }
                />

                {/* Rota: Vagas (Bônus) */}
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

                {/* Rota: Evolução */}
                <Route
                  path="evolution"
                  element={
                    <FeaturePlaceholder
                      title="Linha do Tempo de Carreira"
                      desc="Visualize como seu valor de mercado aumentou desde o início do ciclo. Dados baseados em feedbacks reais de triagens."
                      icon={TrendingUp}
                    />
                  }
                />

                <Route path="*" element={<Navigate to="/candidate" replace />} />
              </Routes>
            </CandidateLayout>
          }
        />

        {/* Legacy Dashboard Redirect */}
        <Route path="/dashboard/*" element={<Navigate to="/recruiter" replace />} />

        {/* Auth Placeholder - Smart Redirect */}
        <Route path="/login" element={<Navigate to="/candidate" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
