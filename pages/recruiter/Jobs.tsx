import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Users, Eye, PauseCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { MOCK_JOBS } from '../../constants';

const RecruiterJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vagas Ativas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seus processos seletivos e acompanhe a performance.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg">
          <Plus size={18} /> Criar Nova Vaga
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar vaga por título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-600">
          <Filter size={16} /> Status
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow">
            
            {/* Job Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  job.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {job.status === 'active' ? 'Publicada' : 'Pausada'}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">
                {job.location} • {job.modality} • {job.type} • Publicado em {job.postedDate}
              </p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 border-l border-slate-100 dark:border-slate-700 pl-6">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{job.applicantsCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 justify-center">
                  <Users size={12} /> Candidatos
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{job.matchScore}%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 justify-center">
                  <TrendingUp size={12} /> Match Médio
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                  <Eye size={16} /> Ver Pipeline
               </button>
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  <PauseCircle size={16} /> Pausar
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterJobs;