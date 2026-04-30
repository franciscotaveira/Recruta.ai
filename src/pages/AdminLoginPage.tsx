import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function getPersistedRole(): 'candidate' | 'recruiter' | 'admin' | undefined {
  try {
    const persisted = localStorage.getItem('recruta_user');
    if (!persisted) return undefined;
    const role = JSON.parse(persisted)?.role;
    return role === 'candidate' || role === 'recruiter' || role === 'admin' ? role : undefined;
  } catch {
    return undefined;
  }
}

const AdminLoginPage: React.FC = () => {
  const { login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Digite seu e-mail de administrador.');
      return;
    }
    if (!password) {
      setError('Digite sua senha.');
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      const authRole = getPersistedRole();

      if (authRole !== 'admin') {
        logout();
        setError('Conta autenticada, mas sem permissão de administrador.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-6 shadow-xl border border-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
              <path d="M12 2L12 12L22 12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" strokeLinecap="round" />
              <path d="M7 12H12" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter font-heading">
            Recrutaria<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Console administrativo</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@recrutaria.com.br"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Entrando...
                </>
              ) : (
                'Entrar no Admin'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700 underline">
            Voltar para login de candidato/recrutador
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
