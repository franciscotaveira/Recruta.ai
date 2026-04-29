import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Activity, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';

interface SystemJob {
  id: string;
  action_id: string;
  status: string;
  user_id: string;
  risk_level: string;
  created_at: string;
  error?: string;
}

interface SystemLog {
  id: string;
  event: string;
  level: string;
  details: any;
  created_at: string;
}

export const AuditFeed: React.FC = () => {
  const [jobs, setJobs] = useState<SystemJob[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'jobs' | 'logs'>('jobs');
  const [filter, setFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, logsRes] = await Promise.all([
        supabase.from('system_jobs').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(30)
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Realtime subscriptions
    const jobsChannel = supabase
      .channel('audit-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_jobs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setJobs(prev => [payload.new as SystemJob, ...prev].slice(0, 50));
        } else if (payload.eventType === 'UPDATE') {
          setJobs(prev => prev.map(j => j.id === payload.new.id ? (payload.new as SystemJob) : j));
        }
      })
      .subscribe();

    const logsChannel = supabase
      .channel('audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setLogs(prev => [payload.new as SystemLog, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, []);

  const filteredJobs = jobs.filter(j => 
    j.action_id.toLowerCase().includes(filter.toLowerCase()) || 
    j.status.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.event.toLowerCase().includes(filter.toLowerCase()) || 
    l.level.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setView('jobs')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'jobs' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Jobs de Sistema
          </button>
          <button 
            onClick={() => setView('logs')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'logs' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Audit Logs
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar eventos..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button 
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
              <tr>
                {view === 'jobs' ? (
                  <>
                    <th className="px-6 py-4">Ação</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Risco</th>
                    <th className="px-6 py-4">Iniciado em</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Evento</th>
                    <th className="px-6 py-4">Nível</th>
                    <th className="px-6 py-4">Detalhes</th>
                    <th className="px-6 py-4">Horário</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {view === 'jobs' ? (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-purple-600 dark:text-purple-400">{job.action_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        job.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        job.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        job.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {job.status === 'completed' && <CheckCircle2 size={12} />}
                        {job.status === 'failed' && <XCircle size={12} />}
                        {job.status === 'processing' && <Activity size={12} className="animate-pulse" />}
                        {job.status === 'queued' && <Clock size={12} />}
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold uppercase ${
                        job.risk_level === 'high' ? 'text-red-500' : 
                        job.risk_level === 'medium' ? 'text-amber-500' : 
                        'text-slate-400'
                      }`}>
                        {job.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(job.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-slate-400" />
                        {log.event}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.level === 'error' ? 'bg-red-100 text-red-700' :
                        log.level === 'warn' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.level === 'error' && <AlertTriangle size={10} />}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-[10px] bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 max-w-xs overflow-hidden text-ellipsis">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}

              {(view === 'jobs' ? filteredJobs : filteredLogs).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
