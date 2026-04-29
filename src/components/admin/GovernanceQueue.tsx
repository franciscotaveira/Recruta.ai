import React, { useEffect, useState } from 'react';
import { JobQueue, Job } from '../../lib/JobQueue';
import { ActionManager } from '../../lib/ActionManager';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const GovernanceQueue: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    const allJobs = await JobQueue.listJobs();
    setJobs(allJobs);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
    const unsubscribe = JobQueue.subscribe(() => {
      loadJobs();
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: string) => {
    const success = await JobQueue.approveJob(id);
    if (!success) alert('Falha ao aprovar job');
  };

  const handleReject = async (id: string) => {
    const success = await JobQueue.rejectJob(id);
    if (!success) alert('Falha ao rejeitar job');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando fila de governança...</div>;

  const pending = jobs.filter(j => j.status === 'pending_approval');
  const others = jobs.filter(j => j.status !== 'pending_approval').slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-purple-600" size={20} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fila de Aprovação (HITL)</h2>
      </div>

      {pending.length === 0 ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-8 text-center">
          <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
          <p className="text-emerald-800 dark:text-emerald-300 font-medium">Nenhuma ação pendente de revisão humana.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map(job => {
            const metadata = ActionManager.getMetadata(job.actionId);
            return (
              <div key={job.id} className="bg-white dark:bg-slate-900 border-2 border-red-500/20 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-md tracking-wider">
                        {metadata?.risk_level || 'HIGH'} RISK
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{job.id.slice(0,8)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {metadata?.description || job.actionId}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Custo estimado</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{metadata?.estimated_cost || 0} créditos</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Payload de Execução</p>
                  <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
                    {JSON.stringify(job.payload, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApprove(job.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Aprovar Execução
                  </button>
                  <button 
                    onClick={() => handleReject(job.id)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Rejeitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Histórico Recente</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Action</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Data</th>
                  <th className="px-4 py-3 font-bold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {others.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{job.actionId}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        job.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{job.createdAt.toLocaleTimeString()}</td>
                    <td className="px-4 py-3">
                      {job.status === 'completed' ? (
                        <span className="text-emerald-500 text-xs">Sucesso</span>
                      ) : job.status === 'failed' ? (
                        <span className="text-red-500 text-xs truncate max-w-[100px] inline-block">{job.error}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
