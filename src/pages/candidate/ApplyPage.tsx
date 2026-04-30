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
  const [file, setFile] = useState<File | null>(null);

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
    if (!file) {
      setError('Por favor, selecione seu currículo (PDF ou Imagem).');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/public/apply-file`, {
        method: 'POST',
        headers: {
          'x-job-id': id,
          'x-candidate-name': name,
          'x-candidate-phone': phone,
          'x-candidate-email': email || '',
          'Content-Type': file.type,
        },
        body: await file.arrayBuffer(),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao processar currículo');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar candidatura. Tente novamente.');
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
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left mb-8 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">
              Obrigado, <span className="font-bold">{name}</span>! O que acontece agora?
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <p className="text-sm text-slate-600 dark:text-slate-400"> Nossa Inteligência Artificial está lendo seu currículo neste exato momento e comparando com os requisitos da vaga.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <p className="text-sm text-slate-600 dark:text-slate-400"> Se o seu perfil for compatível, o recrutador responsável será notificado imediatamente com a sua pontuação de aderência.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                <p className="text-sm text-slate-600 dark:text-slate-400"> Fique de olho no seu <strong>WhatsApp</strong>! Caso avance, você receberá um convite por lá para a próxima etapa.</p>
              </li>
            </ul>
          </div>
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
                    Seu Currículo (PDF ou Imagem)
                  </label>
                  <div className="relative group">
                    <input
                      required
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full px-4 py-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${file ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 group-hover:border-purple-300 dark:group-hover:border-purple-800'}`}>
                      <div className={`p-2 rounded-lg ${file ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>
                        {file ? <Check size={20} /> : <Sparkles size={20} />}
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {file ? file.name : 'Clique para selecionar seu currículo'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        PDF, JPG ou PNG de até 10MB
                      </p>
                    </div>
                  </div>
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
