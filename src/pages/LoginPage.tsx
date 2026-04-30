import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mic, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const segment = useMemo<'candidate' | 'recruiter'>(() => {
    const value = searchParams.get('role');
    return value === 'recruiter' ? 'recruiter' : 'candidate';
  }, [searchParams]);

  usePageMeta({
    title:
      segment === 'recruiter'
        ? 'Entrar como empresa | Recrutaria'
        : 'Entrar como candidato | Recrutaria',
    description:
      segment === 'recruiter'
        ? 'Acesse o app da Recrutaria para publicar vagas, convidar candidatos e acompanhar triagens.'
        : 'Acesse o app da Recrutaria para acompanhar seu diagnóstico, currículo e progresso.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let loginIdentifier = email.trim().toLowerCase();

    if (!loginIdentifier) {
      setError('Digite seu e-mail ou WhatsApp.');
      return;
    }
    if (!password) {
      setError('Digite sua senha ou protocolo.');
      return;
    }

    // Zero-Friction: Convert phone numbers directly into ghost emails
    if (/^\d{10,14}$/.test(loginIdentifier.replace(/\D/g, ''))) {
      const numericPhone = loginIdentifier.replace(/\D/g, '');
      loginIdentifier = `${numericPhone}@recruta.ai`;
    }

    try {
      await login(loginIdentifier, password);
      const persisted = localStorage.getItem('recruta_user');
      const authRole = persisted ? JSON.parse(persisted).role : 'candidate';

      const target =
        authRole === 'admin' ? '/admin' : authRole === 'recruiter' ? '/recruiter' : '/candidate';
      navigate(target, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-6 shadow-xl border border-indigo-500/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-8 h-8"
            >
              <path d="M12 2L12 12L22 12" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                strokeLinecap="round"
              />
              <path d="M7 12H12" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter font-heading">
            Recrutaria<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
            MCT Sovereign Kernel
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          {/* Role Selection Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              onClick={() => navigate('/login?role=recruiter')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                segment === 'recruiter'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Recrutador / Empresa
            </button>
            <button
              onClick={() => navigate('/login?role=candidate')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                segment === 'candidate'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Candidato
            </button>
          </div>

          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-xs leading-6 ${
              segment === 'recruiter'
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300'
            }`}
          >
            {segment === 'recruiter'
              ? 'Acesse o Painel de Controle para gerir vagas, triagens e IA Squad.'
              : 'Acesse o portal para acompanhar seu diagnóstico e refatorar seu currículo.'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {segment === 'recruiter' ? 'E-mail Corporativo' : 'E-mail ou WhatsApp'}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={segment === 'candidate' ? 'voce@email.com ou (11) 99999-9999' : 'voce@empresa.com'}
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 ${
                    segment === 'recruiter' ? 'focus:ring-indigo-500' : 'focus:ring-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Senha ou Protocolo
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 ${
                    segment === 'recruiter' ? 'focus:ring-indigo-500' : 'focus:ring-purple-500'
                  }`}
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
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
                segment === 'recruiter' ? 'bg-indigo-600 shadow-indigo-200 dark:shadow-none' : 'bg-slate-900 dark:bg-purple-600'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Entrando...
                </>
              ) : (
                `Entrar como ${segment === 'recruiter' ? 'Recrutador' : 'Candidato'}`
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-slate-500">
            Não tem conta?{' '}
            <Link
              to={`/registro?role=${segment}`}
              className={`${segment === 'recruiter' ? 'text-indigo-600' : 'text-purple-600'} dark:text-purple-400 font-bold hover:underline`}
            >
              {segment === 'recruiter' ? 'Criar conta empresa' : 'Criar conta grátis'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
