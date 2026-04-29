import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { getCandidateProfile } from '../../services/api';
import { Link } from 'react-router-dom';

const DiagnosisPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getCandidateProfile();
      setProfile(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-600" />
      </div>
    );
  }

  const breakdown = profile?.scp_breakdown || { clarity: 0, evidence: 0, focus: 0, freshness: 0 };
  const pillars = [
    {
      id: 'clarity',
      label: 'Clareza',
      score: breakdown.clarity,
      desc: 'Facilidade de entendimento da sua trajetória',
      color: 'bg-blue-500',
    },
    {
      id: 'evidence',
      label: 'Evidência de Resultados',
      score: breakdown.evidence,
      desc: 'Métricas e conquistas tangíveis',
      color: 'bg-purple-500',
    },
    {
      id: 'focus',
      label: 'Foco no Cargo',
      score: breakdown.focus,
      desc: 'Alinhamento com vagas Senior/Especialista',
      color: 'bg-emerald-500',
    },
    {
      id: 'freshness',
      label: 'Atualização',
      score: breakdown.freshness,
      desc: 'Relevância para o momento atual',
      color: 'bg-amber-500',
    },
  ];

  const hasScore = profile?.scp_score > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-fade-in-up px-4 md:px-0">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)]" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-10 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 s-glass border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
            <Sparkles size={12} /> Strategic Analysis v2.0
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
            Diagnóstico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Elite</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Relatório neural gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        {hasScore && (
          <div className="s-glass p-6 border-purple-500/20 shadow-2xl shadow-purple-500/5 flex flex-col items-center min-w-[180px]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Score Global</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-black ${
                profile.scp_score >= 80 ? 'text-emerald-500' : profile.scp_score >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {profile.scp_score}
              </span>
              <span className="text-sm font-black text-slate-600">/100</span>
            </div>
          </div>
        )}
      </div>

      {!hasScore ? (
        <div className="s-glass p-20 text-center border-dashed border-white/10">
          <Zap size={48} className="mx-auto text-slate-700 mb-6" />
          <h2 className="text-2xl font-black text-white mb-3 font-heading">
            Diagnóstico Pendente
          </h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
            Sua trilha de elite ainda não foi processada. Desbloqueie o poder da IA Soberana agora.
          </p>
          <Link
            to="/candidate"
            className="s-btn-primary px-10 py-4 shadow-xl shadow-indigo-500/20"
          >
            Iniciar Análise Estratégica
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Executive Summary */}
            <section className="s-glass p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={14} className="text-indigo-500" /> Sumário Executivo
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed font-medium italic">
                "{profile.diagnosis}"
              </p>
            </section>

            {/* Pillars Detail */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="s-glass p-6 s-glass-hover group transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-white group-hover:text-indigo-400 transition-colors">{pillar.label}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{pillar.desc}</p>
                    </div>
                    <span className={`text-2xl font-black ${
                      pillar.score >= 80 ? 'text-emerald-500' : pillar.score >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {pillar.score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pillar.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Action Plan */}
            {profile.attention_points && profile.attention_points.length > 0 && (
              <section className="s-glass p-8 bg-amber-500/5 border-amber-500/20 shadow-2xl shadow-amber-500/5">
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <AlertTriangle size={14} /> Pontos Críticos
                </h2>
                <ul className="space-y-6">
                  {profile.attention_points.map((pt: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-4 group/item">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 group-hover/item:bg-amber-500 transition-colors">
                        <span className="text-[10px] font-black text-amber-500 group-hover/item:text-white">{idx + 1}</span>
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed font-bold">
                        {pt}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Premium CTA */}
            <section className="s-glass p-8 bg-indigo-600/10 border-indigo-500/20 text-center">
              <Zap size={32} className="mx-auto text-indigo-400 mb-4" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Relatório Completo</h3>
              <p className="text-[10px] text-slate-500 font-bold mb-6">
                Baixe o PDF estratégico para apresentar em entrevistas de elite.
              </p>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Download PDF (Pro)
              </button>
            </section>
          </div>

        </div>
      )}
    </div>
  );
};

export default DiagnosisPage;
