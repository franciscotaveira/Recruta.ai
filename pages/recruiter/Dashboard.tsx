import React from 'react';
import { 
  Users, Briefcase, Upload, MoreHorizontal, ArrowRight, 
  CheckCircle, XCircle, Clock, Search 
} from 'lucide-react';
import { MOCK_JOBS, MOCK_RECRUITER_STATS } from '../../constants';

const RecruiterDashboard = () => {
  const stats = MOCK_RECRUITER_STATS;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500 text-sm">Acompanhe seu pipeline e tome decisões rápidas.</p>
      </div>

      {/* 2.1 HOME - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-slate-500 text-sm font-medium">Vagas Ativas</span>
                 <Briefcase size={20} className="text-blue-600" />
             </div>
             <p className="text-3xl font-bold text-slate-900">{stats.activeJobs}</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-3">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-500 text-sm font-medium">Status de Convites (Convocação Ativa)</span>
                 <Users size={20} className="text-purple-600" />
             </div>
             <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
                 <div>
                     <p className="text-2xl font-bold text-slate-900">{stats.invites.sent}</p>
                     <p className="text-xs text-slate-500 uppercase mt-1">Enviados</p>
                 </div>
                 <div>
                     <p className="text-2xl font-bold text-emerald-600">{stats.invites.accepted}</p>
                     <p className="text-xs text-slate-500 uppercase mt-1 flex items-center justify-center gap-1">
                         <CheckCircle size={12} /> Aceitos
                     </p>
                 </div>
                 <div>
                     <p className="text-2xl font-bold text-slate-400">{stats.invites.ignored}</p>
                     <p className="text-xs text-slate-500 uppercase mt-1 flex items-center justify-center gap-1">
                         <XCircle size={12} /> Ignorados
                     </p>
                 </div>
             </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 2.2 PIPELINE POR VAGA */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Vagas Ativas</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver todas</button>
              </div>

              <div className="space-y-4">
                  {MOCK_JOBS.map(job => (
                      <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                              <div>
                                  <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                                  <p className="text-sm text-slate-500">Postada em {job.postedDate}</p>
                              </div>
                              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">
                                  {job.applicantsCount} Candidatos
                              </span>
                          </div>
                          
                          {/* Mini Candidate List Placeholder (MVP Representation) */}
                          <div className="bg-slate-50 p-4">
                              <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex justify-between">
                                  <span>Top Candidatos (SCPD)</span>
                                  <span>Status</span>
                              </div>
                              <div className="space-y-2">
                                  {[1,2,3].map((_, i) => (
                                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors group">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                  {['FT', 'AM', 'CP'][i]}
                                              </div>
                                              <div>
                                                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                                                      {['Francisco Taveira', 'Ana Martinez', 'Carlos Pereira'][i]}
                                                  </p>
                                                  <p className="text-xs text-slate-500">SCPD: {[92, 88, 85][i]}/100</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                  {['Entrevista', 'Triagem', 'Novo'][i]}
                                              </span>
                                              <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <button className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium border border-dashed border-slate-300 rounded hover:bg-slate-100 transition-colors">
                                  Ver todos os candidatos desta vaga
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* 2.4 CONVOCAÇÃO ATIVA */}
          <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full blur-[60px] opacity-50"></div>
                  
                  <h2 className="text-lg font-bold mb-2 relative z-10">Convocação Ativa</h2>
                  <p className="text-slate-300 text-sm mb-6 relative z-10">
                      Importe sua base de candidatos. Nós fazemos a triagem e o diagnóstico via WhatsApp.
                  </p>

                  <div className="space-y-4 relative z-10">
                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">1. Selecione a Vaga</label>
                          <select className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500">
                              <option>Analista de Marketing Pleno</option>
                              <option>Coordenador de Projetos</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">2. Upload da Base (CSV)</label>
                          <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:bg-slate-800 transition-colors cursor-pointer">
                              <Upload size={24} className="mx-auto text-slate-500 mb-2" />
                              <p className="text-xs text-slate-400">Arraste ou clique para enviar</p>
                          </div>
                      </div>

                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors">
                          Iniciar Triagem Automática
                      </button>
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Acesso Rápido</h3>
                  <div className="space-y-2">
                      <button className="w-full flex items-center justify-between p-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group">
                          <span className="flex items-center gap-2"><Briefcase size={16} /> Criar Nova Vaga</span>
                          <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group">
                          <span className="flex items-center gap-2"><Search size={16} /> Buscar Talentos (Banco)</span>
                          <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600" />
                      </button>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default RecruiterDashboard;