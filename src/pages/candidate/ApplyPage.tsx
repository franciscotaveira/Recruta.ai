import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicJob, publicApply } from '../../services/api';
import type { PublicJob } from '../../contracts/api';
import { Check, Loader2, Briefcase, ChevronLeft, Send, Sparkles } from 'lucide-react';

const ApplyPage = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cvText, setCvText] = useState('');

  useEffect(() => {
    if (id) {
      getPublicJob(id)
        .then(setJob)
        .catch(() => setError('Vaga não encontrada ou expirada.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      await publicApply({
        name,
        phone,
        email: email || undefined,
        jobId: id,
        cvText,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar candidatura. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Candidatura Enviada!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Obrigado, <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span>!
            Recebemos seus dados. Fique atento ao seu WhatsApp, nosso assistente entrará em contato
            em breve para a próxima etapa.
          </p>
          <Link
            to="/landing"
            className="block w-full py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold transition-all hover:opacity-90"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ops! Algo deu errado.
          </h2>
          <p className="text-slate-500 mb-6">{error || 'Não foi possível carregar a vaga.'}</p>
          <Link to="/landing" className="text-purple-600 font-bold hover:underline">
            Ver outras vagas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Dynamic Background Element */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 pt-12 relative z-10">
        <Link
          to="/landing"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-8 group transition-colors text-sm font-bold"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />{' '}
          Voltar
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Job Info */}
          <div className="flex-1 space-y-6">
            <div>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block border border-purple-200 dark:border-purple-800">
                Candidatura Aberta
              </span>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Briefcase size={16} /> <span>{job.company}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                <span>{job.location}</span>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">
                Sobre a vaga
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Requisitos
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    {req.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                  <Sparkles size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Candidatar-se
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Leva menos de 2 minutos
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nome Completo
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      WhatsApp
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(DD) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Resumo Professional / CV
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Conte um pouco sobre sua experiência..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none dark:text-white"
                  ></textarea>
                </div>

                {error && (
                  <div className="text-xs text-rose-500 font-bold p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={18} /> Enviar Candidatura
                    </>
                  )}
                </button>
              </form>
              <p className="text-[10px] text-slate-400 text-center mt-6 leading-tight">
                Ao clicar em enviar, você concorda com nossos{' '}
                <Link to="/termos" className="underline">
                  Termos de Uso
                </Link>{' '}
                e autoriza o contato via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
