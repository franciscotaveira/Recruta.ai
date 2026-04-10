import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Mic,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Gift,
} from 'lucide-react';
import AICopilot from './AICopilot';

interface LayoutProps {
  children: React.ReactNode;
}

const CandidateLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to true for candidate
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isActive = (path: string) => location.pathname === path;

  // Theme Toggle Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const menuItems = [
    { path: '/candidate', icon: <LayoutDashboard size={20} />, label: 'Dashboard & Otimizador' },
    { path: '/candidate/diagnosis', icon: <User size={20} />, label: 'Meu Diagnóstico (SCPD)' },
    { path: '/candidate/cv', icon: <FileText size={20} />, label: 'Currículo Vivo' },
    { path: '/candidate/evolution', icon: <TrendingUp size={20} />, label: 'Evolução de Carreira' },
    // UX DECISION: Moved Bonus Jobs to the bottom and removed "Highlight" color to enforce hierarchy
    { path: '/candidate/jobs', icon: <Gift size={20} />, label: 'Vagas (Bônus)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A14] flex font-sans text-slate-900 dark:text-white transition-colors duration-300 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0D0D1A] border-r border-slate-200 dark:border-[#1F1F35] flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Mic className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight">Recruta.AI</h1>
            <p className="text-xs text-slate-500">Engenharia de Carreira</p>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden ml-auto text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* User Mini Profile */}
        <div className="px-4 mb-6">
          <div className="bg-slate-50 dark:bg-[#1A1A2E] rounded-xl p-4 border border-slate-200 dark:border-[#2D2D44]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                F
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                  Francisco T.
                </p>
                <p className="text-xs text-gray-500 truncate">Ciclo Ativo</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Score SCPD</span>
              <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400">
                87/100
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-[#252540] rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: '87%' }}
              ></div>
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
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-white border-l-2 border-purple-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span
                className={`mr-3 ${isActive(item.path) ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1F1F35]">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="mr-3">
              <LogOut size={20} />
            </span>
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-[#0D0D1A] border-b border-slate-200 dark:border-[#1F1F35] flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="text-slate-500 dark:text-slate-400">
              <Menu size={24} />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white">Dashboard</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Desktop Header Theme Toggle Area */}
        <div className="hidden lg:flex justify-end px-8 pt-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44] rounded-full text-slate-500 dark:text-slate-400 text-sm hover:text-purple-600 dark:hover:text-white transition-colors shadow-sm"
          >
            {isDarkMode ? (
              <>
                <Sun size={16} /> Modo Claro
              </>
            ) : (
              <>
                <Moon size={16} /> Modo Escuro
              </>
            )}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-[#0A0A14] scroll-smooth transition-colors relative">
          {children}
        </main>

        {/* Floating Copilot Component */}
        <AICopilot />
      </div>
    </div>
  );
};

export default CandidateLayout;
