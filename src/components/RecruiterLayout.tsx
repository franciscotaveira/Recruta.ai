import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  PieChart,
  Settings,
  LogOut,
  FileCheck,
  Bell,
  Menu,
  Sun,
  Moon,
  CreditCard,
  Zap,
  Activity,
} from 'lucide-react';
import { JobQueue } from '../lib/JobQueue';

import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const RecruiterLayout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    JobQueue.initRealtime();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Improved active logic
  const isActive = (path: string) => {
    if (path === '/recruiter') {
      return location.pathname === '/recruiter';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const menuItems = [
    { path: '/recruiter', icon: <LayoutDashboard size={20} />, label: 'Visão Geral' },
    { path: '/recruiter/triagem', icon: <Zap size={20} />, label: 'Triagem Inteligente' },
    { path: '/recruiter/live', icon: <Activity size={20} />, label: 'Feed em Tempo Real' },
    { path: '/recruiter/jobs', icon: <Briefcase size={20} />, label: 'Vagas Ativas' },
    { path: '/recruiter/candidates', icon: <Users size={20} />, label: 'Banco de Talentos' },
    { path: '/recruiter/reviews', icon: <FileCheck size={20} />, label: 'Pendências' },
    { path: '/recruiter/billing', icon: <CreditCard size={20} />, label: 'Carteira de Créditos' },
    { path: '/recruiter/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
    { path: '/recruiter/settings', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center mr-3 border border-indigo-500/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-5 h-5"
            >
              <path d="M12 2L12 12L22 12" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                strokeLinecap="round"
              />
              <path d="M7 12H12" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white font-heading">
            Recrutaria<span className="text-indigo-500">.</span>
          </span>
        </div>

        <div className="p-4 flex-1">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
              TC
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                TechCorp Brasil
              </p>
              <p className="text-xs text-slate-500 truncate">Plano Enterprise</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`mr-3 ${isActive(item.path) ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-8 transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white hidden sm:block">
              Painel Administrativo
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-purple-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer">
              M
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
