import React, { useMemo } from 'react';
import type { PublicJob } from '../../contracts/api';
import {
  DollarSign,
  Users,
  Zap,
  Award,
  ArrowUpRight,
  BarChart3,
  Activity,
  Target,
  Clock,
} from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/AsyncStateViews';
import { useBilling } from '../../hooks/useBilling';
import { useRecruiterJobs } from '../../hooks/useRecruiterJobs';

const RecruiterAnalytics = () => {
  const {
    wallet,
    transactions,
    loading: billingLoading,
    error: billingError,
    refresh: refreshBilling,
  } = useBilling();
  const {
    jobs,
    applicationsByJob: jobApps,
    loading: jobsLoading,
    error: jobsError,
    refresh: refreshJobs,
  } = useRecruiterJobs();
  const loading = billingLoading || jobsLoading;
  const error = billingError || jobsError;
  const refresh = () => {
    refreshBilling();
    refreshJobs();
  };

  if (loading) {
    return <LoadingState label="Carregando analytics do recrutador..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const totalApplications = useMemo(
    () =>
      Object.values(jobApps || {}).reduce(
        (sum, applications) => sum + (Array.isArray(applications) ? applications.length : 0),
        0
      ),
    [jobApps]
  );
  const avgMatchScore = useMemo(() => {
    if (totalApplications === 0) return 0;
    return Math.round(
      Object.values(jobApps)
        .flat()
        .reduce((sum, application) => sum + (application.match_score || 0), 0) / totalApplications
    );
  }, [jobApps, totalApplications]);
  const topJob = useMemo(
    () =>
      (Array.isArray(jobs) ? jobs : []).reduce(
        (best, job) => {
          const count = (jobApps && jobApps[job.id])?.length || 0;
          return count > best.count ? { job, count } : best;
        },
        { job: null, count: 0 } as { job: PublicJob | null; count: number }
      ),
    [jobApps, jobs]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Métricas de desempenho do seu recrutamento
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vagas Ativas
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <BriefcaseIcon size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {(jobs || []).length}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <ArrowUpRight size={12} />
            {jobs.filter((j) => j.is_active).length} publicadas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Candidaturas
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <Users size={18} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalApplications}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 font-bold">
            <Target size={12} />
            Média {avgMatchScore}% match
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Créditos
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <DollarSign size={18} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {wallet?.balance || 0}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 font-bold">
            <Zap size={12} />
            {wallet?.total_spent || 0} utilizados
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Vaga
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <Award size={18} className="text-amber-600" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white truncate">
            {topJob.job?.title || '—'}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 font-bold">
            <Users size={12} />
            {topJob.count} candidatura{topJob.count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications per Job */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Candidaturas por Vaga</h3>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma vaga ainda.</p>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(jobs) ? jobs : []).map((job) => {
                const count = (jobApps && jobApps[job.id])?.length || 0;
                const maxCount = Math.max(
                  ...Object.values(jobApps || {}).map((a) => (Array.isArray(a) ? a.length : 0)),
                  1
                );
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={job.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate mr-2">
                        {job.title}
                      </span>
                      <span className="text-slate-500 shrink-0">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Match Score Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Distribuição de Match Score
            </h3>
          </div>
          {totalApplications === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma candidatura ainda.</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const allApps = Object.values(jobApps).flat();
                const ranges = [
                  { label: '90-100%', min: 90, max: 100, color: 'bg-emerald-500' },
                  { label: '70-89%', min: 70, max: 89, color: 'bg-blue-500' },
                  { label: '50-69%', min: 50, max: 69, color: 'bg-amber-500' },
                  { label: '0-49%', min: 0, max: 49, color: 'bg-red-500' },
                ];
                return ranges.map((r) => {
                  const count = allApps.filter(
                    (a) => (a.match_score || 0) >= r.min && (a.match_score || 0) <= r.max
                  ).length;
                  const pct =
                    totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
                  return (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {r.label}
                        </span>
                        <span className="text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${r.color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-slate-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">Transações Recentes</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Nenhuma transação ainda.</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'purchase'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {tx.type === 'purchase' ? (
                      <ArrowUpRight size={14} className="text-emerald-600" />
                    ) : (
                      <DollarSign size={14} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {tx.description}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-black ${tx.type === 'purchase' ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {tx.type === 'purchase' ? '+' : '-'}
                  {tx.amount} CR
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Need BriefcaseIcon since Briefcase is a component not imported
function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default RecruiterAnalytics;
