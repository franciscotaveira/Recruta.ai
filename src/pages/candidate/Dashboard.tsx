import React, { useState, useEffect } from 'react';
import { useCandidateDashboard } from '../../hooks/useCandidateDashboard';
import {
  Sparkles,
  Briefcase,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Loader2,
  ArrowRight,
  FileText,
  Building2,
  DollarSign,
  ExternalLink,
  CreditCard,
} from 'lucide-react';
import AudioInput from '../../components/AudioInput';
import { transcribeAudioBlob } from '../../services/api';
import { IntentButton } from '../../components/governance/IntentButton';
import { ApprovalWidget } from '../../components/governance/ApprovalWidget';

const CandidateDashboard = () => {
  const {
    profile,
    jobs,
    analysis,
    appliedJobs,
    error,
    runAnalyzeCV,
    runApply,
    runDiagnosticCheckout,
  } = useCandidateDashboard();
  const [cvText, setCvText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [audioNotice, setAudioNotice] = useState('');

  // Payment state
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [billingPhone, setBillingPhone] = useState('');
  const [billingTaxId, setBillingTaxId] = useState('');

  useEffect(() => {
    if (profile?.cv_master) setCvText(profile.cv_master);
    if (profile?.phone && !billingPhone) setBillingPhone(profile.phone);
  }, [profile?.cv_master, profile?.phone, billingPhone]);

  const handleAnalyzeCV = async () => {
    if (!cvText.trim() || cvText.length < 100) {
      setAnalysisError('Cole seu currículo com pelo menos 100 caracteres.');
      return;
    }
    setAnalyzing(true);
    setAnalysisError('');
    try {
      const result = await runAnalyzeCV(cvText);
      setAnalysisError(result.error?.message || '');
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : 'Erro ao analisar currículo');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBuyDiagnostic = async () => {
    if (!billingPhone.trim() || !billingTaxId.trim()) {
      alert('Por favor, preencha o Telefone e o CPF/CNPJ para gerar o pagamento.');
      return;
    }

    setPaying(true);
    try {
      const customer = {
        name: profile?.name || 'Candidate',
        email: profile?.email || '',
        phone: billingPhone.trim(),
        taxId: billingTaxId.trim(),
      };
      const result = await runDiagnosticCheckout(customer);
      setCheckoutUrl(result.checkoutUrl);
      window.open(result.checkoutUrl, '_blank');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao criar pagamento');
    } finally {
      setPaying(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await runApply(jobId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao se candidatar');
    }
  };

  const handleAudioTranscribe = async (audio: Blob) => {
    const result = await transcribeAudioBlob(audio);
    const text = result.text?.trim();
    if (!text) {
      setAudioNotice('Não foi possível extrair texto do áudio.');
      return;
    }
    setCvText((prev) => {
      const base = prev.trim();
      return base ? `${base}\n\n${text}` : text;
    });
    setAudioNotice('Transcrição adicionada ao texto do currículo. Revise antes de analisar.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-fade-in-up px-4 md:px-0">
      <ApprovalWidget />
      
      {/* Visual background decor - Advanced Gradient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05),transparent_40%)]" />

      {/* Checkout URL prompt */}
      {checkoutUrl && (
        <div className="s-glass border-emerald-500/30 p-5 flex items-center justify-between shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl animate-pulse">
              <ExternalLink size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-400 font-heading">
                Checkout de Diagnóstico Aberto
              </p>
              <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-widest mt-0.5">
                Pague via PIX para liberar sua análise completa agora.
              </p>
            </div>
          </div>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-600/20"
          >
            Ir para Pagamento
          </a>
        </div>
      )}

      {/* Header / Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 s-glass border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">
            <Sparkles size={12} /> Candidate Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-heading leading-tight">
            Seja bem-vindo, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400">
              {profile?.name || 'Candidato'}
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-lg font-medium leading-relaxed">
            Sua carreira impulsionada por inteligência artificial soberana.
          </p>
        </div>
        
        {/* Quick Stats for Candidate */}
        <div className="flex gap-4">
          <div className="s-glass p-5 min-w-[140px] text-center border-white/5">
            <p className="text-2xl font-black text-white">{appliedJobs.size}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Candidaturas</p>
          </div>
          <div className="s-glass p-5 min-w-[140px] text-center border-white/5">
            <p className="text-2xl font-black text-emerald-400">{analysis?.score || '--'}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">IA Match Avg</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* 1. CV Upload + Analysis */}
      <div className="s-glass p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">Seu Currículo Master</h2>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Otimização AI-Driven</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Cole aqui o texto completo do seu currículo..."
            className="w-full h-64 px-6 py-5 s-glass bg-slate-950/40 border-white/5 text-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none resize-none transition-all placeholder:text-slate-600 leading-relaxed"
          />
          <div className="absolute bottom-5 right-5 text-[9px] font-black text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5 uppercase tracking-widest">
            {cvText.length} Characters
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-8 md:items-center">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Input de Voz</p>
            <div className="inline-block">
              <AudioInput maxDurationSec={120} onTranscribe={handleAudioTranscribe} />
            </div>
            {audioNotice && (
              <p className="mt-4 text-xs font-bold text-emerald-400 animate-fade-in-up flex items-center gap-2">
                <Sparkles size={14} /> {audioNotice}
              </p>
            )}
          </div>

          <div className="shrink-0">
            {!profile?.diagnostic_unlocked ? (
              <button
                onClick={handleBuyDiagnostic}
                disabled={paying}
                className="group relative flex flex-col items-center gap-1 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  {paying ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                  Desbloquear Diagnóstico IA
                </div>
                <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Apenas R$ 29,90 (Elite Advisor)</span>
              </button>
            ) : (
              <IntentButton
                actionId="candidate.analyze_cv"
                payload={{ 
                  cv_id: profile?.id || 'default_profile', 
                  target_role: profile?.target_role || 'Developer' 
                }}
                onSuccess={() => refresh()}
                className="s-btn-primary px-10 py-5 shadow-2xl shadow-indigo-500/20"
              >
                <Sparkles size={20} /> Analisar Perfil
              </IntentButton>
            )}
          </div>
        </div>

        {!profile?.diagnostic_unlocked && (
          <div className="grid md:grid-cols-2 gap-4 mt-8 p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <div className="md:col-span-2 mb-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Dados para Faturamento PIX
              </p>
            </div>
            <input
              value={billingPhone}
              onChange={(e) => setBillingPhone(e.target.value)}
              placeholder="WhatsApp com DDD"
              className="w-full px-5 py-4 s-glass bg-slate-900/50 border-white/5 text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none"
            />
            <input
              value={billingTaxId}
              onChange={(e) => setBillingTaxId(e.target.value)}
              placeholder="CPF ou CNPJ"
              className="w-full px-5 py-4 s-glass bg-slate-900/50 border-white/5 text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none"
            />
          </div>
        )}

        {/* Analysis Result - Stitch Optimized */}
        {analysis && (
          <div className="mt-12 pt-12 border-t border-white/5 animate-fade-in-up">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-8 s-glass border-white/5">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" 
                      strokeDasharray={`${analysis.score}, 100`}
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        analysis.score >= 70 ? 'text-emerald-500' : analysis.score >= 40 ? 'text-amber-500' : 'text-red-500'
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white leading-none">{analysis.score}</span>
                    <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase mt-2">IA Index</span>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Avaliação</p>
                  <p className={`text-sm font-black uppercase tracking-wider ${analysis.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {analysis.score >= 70 ? 'Elite Tier' : analysis.score >= 40 ? 'Mid Range' : 'Low Match'}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Análise por Pilares</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Clareza', val: analysis.breakdown?.clarity, color: 'text-blue-400' },
                      { label: 'Evidência', val: analysis.breakdown?.evidence, color: 'text-purple-400' },
                      { label: 'Foco', val: analysis.breakdown?.focus, color: 'text-emerald-400' },
                      { label: 'Atualização', val: analysis.breakdown?.freshness, color: 'text-amber-400' },
                    ].map((p, i) => (
                      <div key={i} className="s-glass p-4 border-white/5 flex flex-col items-center">
                        <span className={`text-xl font-black ${p.color}`}>{p.val}%</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-1">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Estratégia de Rationale</p>
                  <div className="p-6 bg-white/5 rounded-3xl border-l-4 border-indigo-500 shadow-inner">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {analysis.reasoning}
                    </p>
                  </div>
                </div>

                {analysis.attention_points?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Pontos de Atenção</p>
                    <div className="grid gap-3">
                      {analysis.attention_points.map((ap: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                          <p className="text-[11px] text-amber-200/70 font-bold">{ap}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.suggestions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Optimization Roadmap</p>
                    <div className="grid gap-4">
                      {analysis.suggestions.map((s: string, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 s-glass border-white/5 s-glass-hover">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-indigo-400">{i+1}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-bold">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Job Board */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-2xl">
              <Briefcase size={24} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-heading">Oportunidades Abertas</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Soberania em Recrutamento</p>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-24 s-glass border-white/5 opacity-60">
            <Loader2 size={32} className="mx-auto text-slate-700 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Aguardando novas vagas curadas...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {jobs.map((job, idx) => {
              const isApplied = appliedJobs.has(job.id);
              return (
                <div
                  key={job.id}
                  className="s-glass p-8 s-glass-hover group/card animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex flex-col h-full gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-black text-white group-hover/card:text-indigo-400 transition-colors leading-tight">
                          {job.title}
                        </h3>
                        <span className={`s-badge ${isApplied ? 's-badge-success' : 's-badge-info'}`}>
                          {isApplied ? 'Aplicado' : 'Open'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-[11px] font-black text-slate-500">
                        <div className="flex items-center gap-1.5"><Building2 size={14} className="text-indigo-500" /> {job.company}</div>
                        <div className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {job.location}</div>
                        {job.salary_range && <div className="flex items-center gap-1.5"><DollarSign size={14} className="text-amber-500" /> {job.salary_range}</div>}
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5">
                      {!isApplied ? (
                        <button
                          onClick={() => handleApply(job.id)}
                          className="w-full py-4 s-btn-primary justify-center shadow-lg shadow-indigo-500/10"
                        >
                          Aplicar Agora <ArrowRight size={18} />
                        </button>
                      ) : (
                        <div className="w-full py-4 s-glass bg-emerald-500/10 text-emerald-400 font-black text-xs text-center border-emerald-500/20 flex items-center justify-center gap-3">
                          <CheckCircle2 size={18} /> Candidatura em análise
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
