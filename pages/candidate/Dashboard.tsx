import React, { useState } from 'react';
import { CURRENT_USER_CANDIDATE, MOCK_JOBS, MOCK_APPLICATIONS } from '../../constants';
import { 
  CheckCircle2, AlertTriangle, Download, FileText, 
  Briefcase, Calendar, Zap, ArrowRight, Sparkles, User, Star, History, Clock, Bot, Copy, ExternalLink, Wand2
} from 'lucide-react';

const CandidateDashboard = () => {
  const user = CURRENT_USER_CANDIDATE;
  const cycle = user.currentCycle;

  // New State for External Optimizer Demo
  const [externalUrl, setExternalUrl] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    if (!externalUrl) return;
    setIsOptimizing(true);
    setTimeout(() => {
        setIsOptimizing(false);
        alert("Currículo otimizado gerado! (Simulação)");
        setExternalUrl('');
    }, 2000);
  }

  const subscribeLink = "https://wa.me/554999999999?text=Olá! Quero assinar a Preparação Contínua (R$ 19,90/mês).";

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 animate-fade-in-up relative">
      
      {/* UX CHANGE: Header is now compact. The Hero is the Optimizer. */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
         <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${cycle?.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ciclo Ativo</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {cycle?.targetRole}
            </h1>
         </div>
         <div className="flex items-center gap-4 text-right">
             <div>
                 <p className="text-[10px] font-bold uppercase text-slate-400">Score SCPD</p>
                 <p className="text-2xl font-black text-emerald-500">{user.score}<span className="text-sm text-slate-500">/100</span></p>
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                 <History size={16} /> Ver Histórico
             </button>
         </div>
      </div>

      {/* 1. CORE VALUE: EXTERNAL OPTIMIZER (THE MOAT) - PRIMARY ACTION */}
      {/* This is now the "Hero" of the dashboard */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-1 border border-purple-500/30 shadow-2xl">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[22px] p-6 md:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 grid md:grid-cols-5 gap-8">
                <div className="md:col-span-2 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 self-start px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-4">
                        <Wand2 size={12} className="text-yellow-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Otimizador de Match</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">Vai aplicar para uma vaga externa?</h2>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Cole a descrição da vaga (LinkedIn, Gupy, etc) ao lado. Nossa IA vai reescrever seu currículo para ter <strong>match semântico</strong> com os robôs de triagem deles.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-purple-300">
                        <span className="flex items-center gap-1"><CheckCircle2 size={14} /> ATS Friendly</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Palavras-chave</span>
                    </div>
                </div>
                
                <div className="md:col-span-3 bg-black/30 rounded-xl border border-white/10 p-1">
                    <textarea 
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="Cole a descrição completa da vaga aqui..."
                        className="w-full h-32 bg-transparent border-none text-white placeholder-slate-500 p-4 focus:ring-0 resize-none text-sm"
                    />
                    <div className="bg-slate-900/80 p-3 rounded-b-lg flex justify-between items-center border-t border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Saída: PDF Otimizado</span>
                        <button 
                            onClick={handleOptimize}
                            disabled={!externalUrl || isOptimizing}
                            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-black text-xs hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isOptimizing ? (
                                <><Zap size={14} className="animate-spin" /> Gerando...</>
                            ) : (
                                <><Zap size={14} fill="currentColor" /> Gerar Agora</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. DIAGNOSTIC & CV (Secondary Info) */}
      <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Análise de Perfil (Diagnóstico)</h2>
                    <p className="text-xs text-slate-500">Baseado no seu currículo mestre.</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border-l-4 border-purple-600">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm italic">
                      "{user.diagnosis}"
                  </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pontos Fortes</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Clareza de trajetória', val: user.scpdBreakdown?.clarity },
                          { label: 'Evidência de resultados', val: user.scpdBreakdown?.evidence },
                          { label: 'Foco em cargo-alvo', val: user.scpdBreakdown?.focus },
                          { label: 'Atualização recente', val: user.scpdBreakdown?.freshness }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                              {item.val ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-amber-500" />}
                          </div>
                        ))}
                      </div>
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Atenção</h3>
                      <div className="space-y-3">
                        {user.attentionPoints?.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-100 dark:border-amber-500/10">
                              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                              <span className="text-xs text-amber-800 dark:text-amber-200 font-medium">{point}</span>
                          </div>
                        ))}
                      </div>
                  </div>
              </div>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm h-fit">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Currículo Mestre</h2>
                    <p className="text-xs text-slate-500">Este é seu perfil base "Vivo".</p>
                  </div>
              </div>
              
              <button className="w-full mb-4 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all shadow-lg">
                  <Download size={18} /> Baixar PDF Original
              </button>
              
              <div className="space-y-4 mt-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">Histórico de Otimizações</p>
                        <span className="text-xs font-bold text-purple-600">3 hoje</span>
                      </div>
                      <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                              <span>p/ Analista Sênior (LinkedIn)</span>
                              <Download size={12} className="text-slate-400 group-hover:text-purple-500" />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                              <span>p/ Gerente de Projetos (Gupy)</span>
                              <Download size={12} className="text-slate-400 group-hover:text-purple-500" />
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </div>

      {/* 4. VAGAS INTERNAS (BÔNUS) - TERTIARY */}
      <div id="jobs" className="pt-8 border-t border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded tracking-wide">Bônus</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Oportunidades Internas (Se houver match)</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <section className="space-y-4">
                {MOCK_JOBS.map(job => (
                    <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{job.title}</h3>
                                <p className="text-xs text-slate-500 font-medium">{job.company} • {job.location}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Match {job.matchScore}%</span>
                        </div>
                        <div className="mt-2 flex justify-end">
                            <button className="text-[10px] font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1">
                                Ver detalhe <ArrowRight size={10} />
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            <section className="space-y-6 flex items-center">
                <div className="bg-transparent p-6 text-center w-full">
                    <p className="text-xs text-slate-400 mb-2">
                        O foco da plataforma é sua preparação. As vagas acima são apenas consequências de um bom perfil.
                    </p>
                </div>
            </section>
          </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;