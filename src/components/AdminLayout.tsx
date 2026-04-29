import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  BrainCircuit,
  LogOut,
  LayoutDashboard,
  User,
  Building2,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

const menu = [
  { path: '/admin', label: 'Visão Executiva', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/analytics', label: 'Analytics Global', icon: <BarChart3 size={18} /> },
  { path: '/admin/ai-control', label: 'Controle de IA', icon: <Bot size={18} /> },
  { path: '/admin/ai-squad', label: 'Squad Especialista', icon: <ShieldCheck size={18} /> },
  { path: '/admin/ai-rag', label: 'RAG & Conhecimento', icon: <BrainCircuit size={18} /> },
];

const AdminLayout: React.FC<Props> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 hidden lg:block">
        <div className="mb-6 px-2">
          <p className="text-xs uppercase tracking-wider text-slate-500">Admin Console</p>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Recruta.AI</h1>
        </div>

        <nav className="space-y-1 mb-6">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                isActive(item.path)
                  ? 'bg-slate-900 text-white dark:bg-purple-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          <Link
            to="/recruiter"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Building2 size={16} /> Ver como Recrutador
          </Link>
          <Link
            to="/candidate"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <User size={16} /> Ver como Candidato
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
