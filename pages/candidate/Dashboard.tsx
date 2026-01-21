import React from 'react';
import { CURRENT_USER_CANDIDATE, MOCK_JOBS, MOCK_APPLICATIONS } from '../../constants';
import { 
  CheckCircle2, AlertTriangle, XCircle, Download, FileText, 
  Briefcase, Calendar, Clock, ArrowRight, User, Zap
} from 'lucide-react';

const CandidateDashboard = () => {
  const user = CURRENT_USER_CANDIDATE;
  const cycle = user.currentCycle;

  // 1.1 MAIN ACTION LOGIC
  // If active interviews, show interview tracking. Else show jobs.
  const hasActiveInterviews = user.interviews?.some(i => i.status === 'pending');
  const mainAction = hasActiveInterviews 
    ? { label: "Acompanhar Entrevistas", link: "#interviews" }
    : { label: "Ver Vagas Recomendadas", link: "#jobs" };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* 1.1 HOME / VISÃO GERAL */}
      <section className="space-y-6">
        {/* Cycle Header */}
        <div className="bg-[#1A1A2E] border border-[#2D2D44] rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${cycle?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {cycle?.status === 'active' ? 'Ciclo Ativo' : 'Ciclo Encerrado'}
                    </span>
                    <span className="text-slate-400 text-sm">Iniciado em {cycle?.startDate}</span>
                </div>
                <h1 className="text-2xl font-bold text-white">{cycle?.targetRole}</h1>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity w-full md:w-auto">
                {mainAction.label}
            </button>
        </div>

        {/* SCPD Score (Simplified) */}
        <div className="bg-[#1A1A2E] border border-[#2D2D44] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Score de Clareza Profissional (SCPD)</h2>
                <span className="text-3xl font-bold text-emerald-400">{user.score}/100</span>
            </div>
            <div className="w-full bg-[#252540] rounded-full h-2.5 mb-2">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${user.score}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 text-right">Quanto maior o score, maior a chance de match.</p>
        </div>
      </section>

      {/* 1.2 DIAGNÓSTICO PROFISSIONAL */}
      <section className="bg-[#1A1A2E] border border-[#2D2D44] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={20} className="text-purple-400" />
              Diagnóstico Profissional
          </h2>

          {/* Resumo Interpretado */}
          <div className="bg-[#252540] p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-slate-300 leading-relaxed text-sm">
                  {user.diagnosis}
              </p>
          </div>

          {/* Breakdown do SCPD */}
          <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white mb-2">Análise de Critérios</h3>
                  <div className="flex items-center gap-3 text-sm">
                      {user.scpdBreakdown?.clarity ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                      <span className="text-slate-300">Clareza de trajetória</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      {user.scpdBreakdown?.evidence ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                      <span className="text-slate-300">Evidência de resultados</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      {user.scpdBreakdown?.focus ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                      <span className="text-slate-300">Foco em cargo-alvo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      {user.scpdBreakdown?.freshness ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                      <span className="text-slate-300">Atualização recente</span>
                  </div>
              </div>
              
              {/* Pontos de Atenção */}
              <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white mb-2">Pontos de Atenção</h3>
                  {user.attentionPoints?.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <AlertTriangle size={14} className="text-amber-500 mt-1 flex-shrink-0" />
                          <span>{point}</span>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 1.3 CURRÍCULOS */}
      <section className="bg-[#1A1A2E] border border-[#2D2D44] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              Seus Currículos
          </h2>
          <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#252540] rounded-lg">
                  <div>
                      <p className="text-white font-medium text-sm">Currículo Master</p>
                      <p className="text-xs text-slate-400">Base atualizada em {user.date}</p>
                  </div>
                  <button className="text-slate-400 hover:text-white transition-colors">
                      <Download size={18} />
                  </button>
              </div>
              <div className="p-3 border border-[#2D2D44] rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Gerados para Vagas</p>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Para: Analista de Marketing (TechCorp)</span>
                      <span className="text-xs text-emerald-400">Enviado</span>
                  </div>
              </div>
          </div>
      </section>

      {/* 1.4 VAGAS & CANDIDATURAS */}
      <div id="jobs" className="grid md:grid-cols-2 gap-8">
          
          {/* Vagas Recomendadas */}
          <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-pink-400" />
                  Vagas Recomendadas
              </h2>
              <div className="space-y-3">
                  {MOCK_JOBS.map(job => (
                      <div key={job.id} className="bg-[#1A1A2E] border border-[#2D2D44] p-4 rounded-xl hover:border-pink-500/50 transition-colors cursor-pointer">
                          <h3 className="text-white font-bold">{job.title}</h3>
                          <p className="text-sm text-slate-400">{job.company}</p>
                          <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 inline-block px-2 py-1 rounded">
                              {job.recommendationReason}
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Minhas Candidaturas */}
          <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  Minhas Candidaturas
              </h2>
              <div className="space-y-3">
                  {MOCK_APPLICATIONS.map(app => (
                      <div key={app.id} className="bg-[#1A1A2E] border border-[#2D2D44] p-4 rounded-xl">
                          <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-white font-medium text-sm">{app.company}</h3>
                                <p className="text-xs text-slate-400">{app.jobTitle}</p>
                             </div>
                             <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                                 app.status === 'interview' ? 'bg-purple-500/20 text-purple-400' : 
                                 app.status === 'closed' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                             }`}>
                                 {app.status === 'interview' ? 'Entrevista' : 
                                  app.status === 'closed' ? 'Encerrada' : 'Em Análise'}
                             </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 text-right">{app.appliedDate}</p>
                      </div>
                  ))}
              </div>
          </section>
      </div>

      {/* 1.5 ENTREVISTAS */}
      <section id="interviews" className="bg-[#1A1A2E] border border-[#2D2D44] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-amber-400" />
              Histórico de Entrevistas
          </h2>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-slate-500 uppercase bg-[#252540]">
                      <tr>
                          <th className="px-4 py-3 rounded-l-lg">Empresa</th>
                          <th className="px-4 py-3">Data</th>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3 rounded-r-lg">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2D44]">
                      {user.interviews?.map(int => (
                          <tr key={int.id}>
                              <td className="px-4 py-3 font-medium text-white">{int.company}</td>
                              <td className="px-4 py-3">{int.date}</td>
                              <td className="px-4 py-3">
                                  {int.type === 'active_invite' 
                                    ? <span className="flex items-center gap-1 text-purple-400"><Zap size={12}/> Convocação</span> 
                                    : <span className="text-slate-400">Candidatura</span>
                                  }
                              </td>
                              <td className="px-4 py-3">
                                  {int.status === 'completed' 
                                    ? <span className="text-emerald-400">Concluída</span> 
                                    : <span className="text-amber-400">Aguardando</span>
                                  }
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </section>

      {/* 1.6 HISTÓRICO DE CICLOS */}
      <section className="pt-8 border-t border-[#1F1F35]">
          <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Ciclos Anteriores</h2>
          <div className="space-y-2">
              {user.pastCycles?.map(pc => (
                  <div key={pc.id} className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                          <span className="text-slate-400">{pc.targetRole}</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className="text-slate-600">{pc.startDate}</span>
                          <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded">Encerrado sem contratação</span>
                      </div>
                  </div>
              ))}
          </div>
      </section>

    </div>
  );
};

export default CandidateDashboard;