import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, PieChart, Settings, LogOut, Search, Bell, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const RecruiterLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/recruiter', icon: <LayoutDashboard size={20} />, label: 'Visão Geral' },
    { path: '/recruiter/jobs', icon: <Briefcase size={20} />, label: 'Vagas' },
    { path: '/recruiter/candidates', icon: <Users size={20} />, label: 'Banco de Talentos' },
    { path: '/recruiter/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
    { path: '/recruiter/settings', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white mr-3">
                <Briefcase size={16} />
            </div>
            <span className="font-bold text-lg text-slate-900">Recruta.AI <span className="text-purple-600 text-xs">Corp</span></span>
            <button onClick={toggleSidebar} className="lg:hidden ml-auto text-slate-400">
                <X size={24} />
            </button>
        </div>

        <div className="p-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    TC
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">TechCorp Brasil</p>
                    <p className="text-xs text-slate-500 truncate">Plano Enterprise</p>
                </div>
            </div>

            <nav className="space-y-1">
            {menuItems.map((item) => (
                <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
                >
                <span className={`mr-3 ${isActive(item.path) ? 'text-purple-300' : 'text-slate-400'}`}>{item.icon}</span>
                {item.label}
                </Link>
            ))}
            </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="mr-3"><LogOut size={20} /></span>
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-700">
                    <Menu size={24} />
                </button>
                <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">Visão Geral</h2>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar candidatos, vagas..." 
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-64 transition-all"
                    />
                </div>
                <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs cursor-pointer">
                    M
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;