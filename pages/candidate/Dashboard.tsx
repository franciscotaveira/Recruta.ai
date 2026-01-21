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
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in-up relative">
      
      {/* 1. HEADER: POSICIONAMENTO (Não "Vagas") */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cycle?.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                    {cycle?.status === 'active' ? 'Ciclo de Posicionamento Ativo' : 'Ciclo Finalizado'}
                </span>
                <span className="text-slate-400 text-xs font-medium">Iniciado em {cycle?.startDate}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {cycle?.targetRole}
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
                Seu "Currículo Vivo" está ativo. Use as ferramentas abaixo para adaptar seu perfil a qualquer oportunidade do mercado.
            </p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                 <History size={16} /> Ver Histórico
             </button>
        </div>
      </section>

      {/* 2. CORE VALUE: EXTERNAL OPTIMIZER (THE MOAT) */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/20 mb-4">
                      <Wand2 size={14} className="text-yellow-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Ferramenta Premium</span>
                  </div>
                  <h2 className="text-2xl font-black mb-3">Otimizador de Candidatura Externa</h2>
                  <p className="text-purple-100 text-sm leading-relaxed mb-6">
                      Vai aplicar para uma vaga no LinkedIn, Gupy ou Indeed? Cole o link ou descrição abaixo. Nossa IA reescreverá seu currículo para dar <strong>Match de 100%</strong> com os requisitos deles.
                  </p>
                  <ul className="space-y-2 text-xs text-purple-200 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Ajuste automático de palavras-chave (SEO)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Destaque das experiências relevantes para a vaga</li>
                  </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <label className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-3 block">Cole a descrição da vaga aqui</label>
                  <textarea 
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="Ex: 'Procuramos Analista Sênior com experiência em React...' ou cole a URL."
                    className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none mb-4"
                  />
                  <button 
                    onClick={handleOptimize}
                    disabled={!externalUrl || isOptimizing}
                    className="w-full bg-white text-purple-700 font-black py-3 rounded-lg hover:bg-yellow-400 hover:text-purple-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      {isOptimizing ? (
                          <>Gerando versão otimizada...</>
                      ) : (
                          <><Zap size={18} fill="currentColor" /> Gerar Currículo Adaptado</>
                      )}
                  </button>
                  <p className="text-[10px] text-center text-purple-300 mt-2">Gera um PDF pronto para envio.</p>
              </div>
          </div>
      </div>

      {/* 3. DIAGNÓSTICO E CURRÍCULO */}
      <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600">
                        <User size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Seu Diagnóstico Base</h2>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">{user.score}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score<br/>SCPD</span>
                  </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border-l-4 border-purple-600">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm italic">
                      "{user.diagnosis}"
                  </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pontos Fortes Identificados</h3>
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
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sugestões de Melhoria</h3>
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
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Currículo Vivo</h2>
              </div>
              
              <button className="w-full mb-4 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all shadow-lg">
                  <Download size={18} /> Baixar Versão Base (PDF)
              </button>
              
              <p className="text-[10px] text-center text-slate-400 mb-6">
                  Use o "Otimizador" acima para gerar versões específicas.
              </p>

              <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">Versões Geradas Hoje</p>
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>p/ Analista Sênior (LinkedIn)</span>
                              <Download size={12} className="cursor-pointer hover:text-purple-500" />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>p/ Gerente de Projetos (Gupy)</span>
                              <Download size={12} className="cursor-pointer hover:text-purple-500" />
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </div>

      {/* 4. VAGAS INTERNAS (BÔNUS) - REBAIXADAS VISUALMENTE */}
      <div id="jobs" className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase rounded tracking-wide border border-yellow-200 dark:border-yellow-800">Bônus</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Oportunidades Internas</h2>
            <p className="text-sm text-slate-400 hidden sm:block">- Empresas usando Recruta.AI para triagem</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <section className="space-y-4">
                {MOCK_JOBS.map(job => (
                    <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:border-purple-500 dark:hover:border-purple-500/50 transition-all shadow-sm group opacity-90 hover:opacity-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{job.title}</h3>
                                <p className="text-sm text-slate-500 font-medium">{job.company} • {job.location}</p>
                            </div>
                            <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">Match {job.matchScore}%</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{job.recommendationReason}</p>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                Candidatar com 1 clique <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            <section className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Não achou vaga interna?</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
                        Lembre-se: o Recruta.AI serve para te preparar para o mercado externo. Use o <strong>Otimizador</strong> no topo da página para aplicar em outros sites.
                    </p>
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                        Voltar ao Otimizador
                    </button>
                </div>
            </section>
          </div>
      </div>
      
      {/* Old Floating Placeholder Removed */}

    </div>
  );
};

export default CandidateDashboard;