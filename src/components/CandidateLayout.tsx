import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Mic,
  Sun,
  Moon,
  Gift,
  MessageSquare,
} from 'lucide-react';
import AICopilot from './AICopilot';
import { JobQueue } from '../lib/JobQueue';

import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const CandidateLayout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to true for candidate
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isActive = (path: string) => location.pathname === path;

  // Initialize Governance Realtime
  useEffect(() => {
    JobQueue.initRealtime();
  }, []);

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
    { path: '/candidate/chat', icon: <MessageSquare size={20} />, label: 'Centro de Comando IA' },
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
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-[#1F1F35]">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-900/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
              <path d="M12 2L12 12L22 12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" strokeLinecap="round" />
              <path d="M7 12H12" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-slate-900 dark:text-white tracking-tighter font-heading text-lg">Recrutaria<span className="text-indigo-500">.</span></h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engenharia de Carreira</p>
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
              className={`flex items-center px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
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
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="mr-3">
              <LogOut size={20} />
            </span>
            Sair
          </button>
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
