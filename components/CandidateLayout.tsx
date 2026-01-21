import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, FileText, TrendingUp, LogOut, Menu, X, Mic } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const CandidateLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/candidate', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/candidate/profile', icon: <User size={20} />, label: 'Meu Perfil' },
    { path: '/candidate/jobs', icon: <Briefcase size={20} />, label: 'Vagas & Oportunidades' },
    { path: '/candidate/applications', icon: <FileText size={20} />, label: 'Candidaturas' },
    { path: '/candidate/evolution', icon: <TrendingUp size={20} />, label: 'Evolução' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A14] flex font-sans text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0D0D1A] border-r border-[#1F1F35] flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
             <Mic className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">Recruta.AI</h1>
            <p className="text-xs text-slate-500">Área do Candidato</p>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden ml-auto text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* User Mini Profile */}
        <div className="px-4 mb-6">
          <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2D2D44]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">F</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate text-sm">Francisco T.</p>
                <p className="text-xs text-gray-500 truncate">Arquiteto AI</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">SCPD Score</span>
              <span className="text-xs font-bold text-emerald-400">87/100</span>
            </div>
            <div className="h-1.5 bg-[#252540] rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 text-white border-l-2 border-purple-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`mr-3 ${isActive(item.path) ? 'text-purple-400' : 'text-slate-500 group-hover:text-white'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#1F1F35]">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="mr-3"><LogOut size={20} /></span>
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#0D0D1A] border-b border-[#1F1F35] flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="text-slate-400">
              <Menu size={24} />
            </button>
            <span className="font-semibold text-white">Dashboard</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0A0A14] scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;