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

    if (!email.trim()) {
      setError('Digite seu e-mail.');
      return;
    }
    if (!password) {
      setError('Digite sua senha.');
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 mb-4 shadow-xl">
            <Mic size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruta<span className="text-purple-600">.AI</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {segment === 'recruiter'
              ? 'Acesso da empresa para vagas, convites e diagnóstico'
              : 'Acesso do candidato para currículo, evolução e triagens'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-xs leading-6 ${
              segment === 'recruiter'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300'
            }`}
          >
            {segment === 'recruiter'
              ? 'Use este acesso para publicar vagas, disparar convites por WhatsApp e revisar diagnósticos.'
              : 'Use este acesso para acompanhar seu diagnóstico, editar currículo e participar das próximas etapas.'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
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
                  id="login-password"
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
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-slate-500">
            Não tem conta?{' '}
            <Link
              to={`/registro?role=${segment}`}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              {segment === 'recruiter' ? 'Criar conta empresa' : 'Criar conta grátis'}
            </Link>
          </p>
          <Link to="/admin/login" className="text-xs text-slate-500 hover:text-slate-700 underline">
            Acesso administrativo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
