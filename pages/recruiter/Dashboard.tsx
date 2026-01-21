import React from 'react';
import { 
  Briefcase, Upload, ArrowRight, 
  CheckCircle, XCircle, Zap, Search, ChevronRight, Database, FileSpreadsheet, CreditCard, Plus, FileText
} from 'lucide-react';
import { MOCK_JOBS, MOCK_RECRUITER_STATS } from '../../constants';
import { Link } from 'react-router-dom';

const RecruiterDashboard = () => {
  const stats = MOCK_RECRUITER_STATS;
  const { wallet } = stats;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">TechCorp Brasil</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Inteligência Artificial processou 12 novos perfis hoje.</p>
        </div>
        <div className="flex gap-3">
             {/* WALLET WIDGET */}
             <Link to="/recruiter/billing" className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-500 transition-colors">Saldo Decisório</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{wallet.balance} CR</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <CreditCard size={16} />
                </div>
             </Link>

            <button className="bg-slate-900 dark:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                <Plus size={18} /> Novo Processo
            </button>
        </div>
      </div>

      {/* KPIS REFINADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Processos Ativos</span>
                 <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600"><Briefcase size={20} /></div>
             </div>
             <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.activeJobs}</p>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                 <ArrowRight size={12} className="-rotate-45" /> +2 essa semana
             </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-3">
             <div className="flex justify-between items-center mb-6">
                 <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Funil de Inteligência (Triagem)</span>
                 <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600"><Zap size={20} /></div>
             </div>
             <div className="grid grid-cols-3 gap-8 text-center sm:text-left divide-x divide-slate-100 dark:divide-slate-700">
                 <div className="px-4">
                     <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.invites.sent}</p>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Análises Realizadas</p>
                 </div>
                 <div className="px-8">
                     <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.invites.accepted}</p>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                         <CheckCircle size={12} className="text-emerald-500" /> Qualificados (Match)
                     </p>
                 </div>
                 <div className="px-8">
                     <p className="text-3xl font-black text-slate-300 dark:text-slate-600">{stats.invites.ignored}</p>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                         <XCircle size={12} className="text-slate-400" /> Descartados por IA
                     </p>
                 </div>
             </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* PIPELINE POR VAGA */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Pipeline de Candidatos</h2>
                  <button className="text-xs font-bold text-purple-600 hover:underline">Ver Banco de Talentos</button>
              </div>

              <div className="space-y-6">
                  {MOCK_JOBS.map(job => (
                      <div key={job.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                  <h3 className="font-black text-slate-900 dark:text-white text-xl">{job.title}</h3>
                                  <p className="text-xs text-slate-500 font-medium">{job.location} • Criado em {job.postedDate}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{job.applicantsCount}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Em Triagem</p>
                                </div>
                                <ChevronRight size={20} className="text-slate-300" />
                              </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-6">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {[
                                    { name: 'Francisco Taveira', score: 92, status: 'Aprovação Pendente', initial: 'FT' },
                                    { name: 'Ana Martinez', score: 88, status: 'Entrevista Agendada', initial: 'AM' },
                                    { name: 'Carlos Pereira', score: 85, status: 'Triagem Inicial', initial: 'CP' }
                                  ].map((cand, i) => (
                                      <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 group hover:border-purple-500 cursor-pointer transition-all shadow-sm">
                                          <div className="flex items-center gap-3 mb-3">
                                              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-purple-600 text-white flex items-center justify-center font-black text-[10px]">{cand.initial}</div>
                                              <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">{cand.name}</p>
                                                <p className="text-[10px] text-emerald-500 font-bold">Match: {cand.score}%</p>
                                              </div>
                                          </div>
                                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">{cand.status}</span>
                                      </div>
                                  ))}
                              </div>
                              <button className="w-full mt-6 py-3 text-xs text-slate-500 dark:text-slate-400 font-bold border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                  Ver detalhes dos {job.applicantsCount} perfis
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* COLUNA LATERAL - TRIAGEM DE BASE PRÓPRIA (REFINADO) */}
          <div className="space-y-6">
              <div className="bg-slate-900 dark:bg-purple-900 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden border border-slate-700 dark:border-purple-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
                  
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Database className="text-yellow-400" size={24} />
                    <div>
                        <h2 className="text-xl font-black leading-none">Reaquecimento</h2>
                        <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Base Legada</span>
                    </div>
                  </div>
                  
                  <p className="text-indigo-100 text-xs mb-6 relative z-10 font-medium leading-relaxed">
                      Transforme seus PDFs antigos em candidatos ativos. <span className="text-white font-bold">Importe e deixe a IA revalidar o interesse.</span>
                  </p>

                  <div className="space-y-4 relative z-10">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">1. Vaga Destino</label>
                          <select className="w-full bg-slate-800 dark:bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:ring-purple-500 outline-none cursor-pointer">
                              <option>Analista de Marketing Pleno</option>
                              <option>Coordenador de Projetos</option>
                          </select>
                      </div>

                      {/* Dropzone Style Update */}
                      <div className="border-2 border-dashed border-slate-600 hover:border-yellow-400 bg-slate-800/50 hover:bg-slate-800 rounded-xl p-6 text-center transition-all cursor-pointer group relative">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
                              <Upload size={48} />
                          </div>
                          <div className="flex justify-center gap-2 mb-2 text-slate-400 group-hover:text-yellow-400 transition-colors">
                              <FileSpreadsheet size={24} />
                              <FileText size={24} />
                          </div>
                          <p className="text-xs text-white font-bold">Arraste planilha ou PDFs</p>
                          <p className="text-[9px] text-slate-400 mt-1">Consome 1 Crédito por contato validado.</p>
                      </div>

                      <button className="w-full bg-white text-slate-900 hover:bg-yellow-400 font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95">
                          <Zap size={16} fill="currentColor" /> Disparar Triagem IA
                      </button>
                  </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-widest text-slate-400">Atalhos</h3>
                  <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
                          <span className="flex items-center gap-3"><Briefcase size={18} className="text-slate-400" /> Novo Processo</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
                          <span className="flex items-center gap-3"><Search size={18} className="text-slate-400" /> Buscar Talentos</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;