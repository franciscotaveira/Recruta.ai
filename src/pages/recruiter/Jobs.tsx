import React, { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import type { JobApplication } from '../../contracts/api';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncStateViews';
import { useRecruiterJobs } from '../../hooks/useRecruiterJobs';

const RecruiterJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { jobs, applicationsByJob, loading, error, refresh } = useRecruiterJobs();

  const filteredJobs = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    const jobsList = Array.isArray(jobs) ? jobs : [];
    if (!normalizedSearch) return jobsList;

    return jobsList.filter(
      (job) =>
        job?.title?.toLowerCase()?.includes(normalizedSearch) ||
        job?.company?.toLowerCase()?.includes(normalizedSearch) ||
        job?.location?.toLowerCase()?.includes(normalizedSearch)
    );
  }, [deferredSearchTerm, jobs]);

  const totalApplications = useMemo(
    () => Object.values(applicationsByJob).reduce((sum, applications) => sum + applications.length, 0),
    [applicationsByJob]
  );

  const averageMatchByJob = (applications: JobApplication[]) => {
    if (applications.length === 0) return null;

    const total = applications.reduce((sum, application) => sum + (application.match_score || 0), 0);
    return Math.round(total / applications.length);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vagas Ativas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Gerencie seus processos seletivos e acompanhe a performance.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 dark:bg-emerald-600"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar vagas
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
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {(jobs || []).length} vaga{(jobs || []).length !== 1 ? 's' : ''} • {totalApplications} candidatura
          {totalApplications !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingState label="Sincronizando vagas e candidaturas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title={(jobs || []).length === 0 ? 'Nenhuma vaga criada ainda' : 'Nenhuma vaga encontrada'}
          description={
            (jobs || []).length === 0
              ? 'As vagas do recrutador ainda não foram carregadas. Crie a primeira vaga no dashboard para iniciar o funil.'
              : 'A busca atual não retornou resultados. Ajuste o termo para encontrar a vaga certa.'
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow"
            >
              {/* Job Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      job.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {job.is_active ? 'Publicada' : 'Pausada'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={14} />
                    {job.company}
                  </span>{' '}
                  •{' '}
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </span>{' '}
                  •{' '}
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={14} />
                    {job.modality || job.job_type || 'Modelo a definir'}
                  </span>{' '}
                  •{' '}
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={14} />
                    {new Date(job.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {(job.requirements || []).slice(0, 4).map((requirement) => (
                    <span
                      key={`${job.id}-${requirement.text}`}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {requirement.text}
                    </span>
                  ))}
                  {(!job.requirements || job.requirements.length === 0) && (
                    <span className="px-2 py-1 rounded text-xs text-slate-500 bg-slate-50 dark:bg-slate-900">
                      Sem requisitos estruturados ainda
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              {(() => {
                const applications = applicationsByJob[job.id] || [];
                const averageMatch = averageMatchByJob(applications);
                return (
                  <div className="flex gap-6 border-l border-slate-100 dark:border-slate-700 pl-6">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {applications.length}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 justify-center">
                        <Users size={12} /> Candidatos
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {averageMatch === null ? '—' : `${averageMatch}%`}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 justify-center">
                        <Users size={12} /> Match Médio
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                <Link
                  to={`/recruiter/jobs/${job.id}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  Ver Pipeline <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
