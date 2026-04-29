import React, { useEffect, useState } from 'react';
import { JobQueue, Job } from '../../lib/JobQueue';
import { ActionManager } from '../../lib/ActionManager';

export const ApprovalWidget: React.FC = () => {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadPending = async () => {
      const jobs = await JobQueue.listJobs();
      setPendingJobs(jobs.filter(j => j.status === 'pending_approval'));
    };
    loadPending();

    // Subscribe to changes
    const unsubscribe = JobQueue.subscribe((updatedJob) => {
      setPendingJobs(prev => {
        const filtered = prev.filter(j => j.id !== updatedJob.id);
        if (updatedJob.status === 'pending_approval') {
          return [...filtered, updatedJob].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        return filtered;
      });
    });

    return () => unsubscribe();
  }, []);

  if (pendingJobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50 flex flex-col gap-3">
      {pendingJobs.map(job => {
        const metadata = ActionManager.getMetadata(job.actionId);
        
        return (
          <div key={job.id} className="bg-slate-900/80 backdrop-blur-md border border-red-500/30 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Aprovação Pendente
              </h3>
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-md uppercase font-mono">
                {metadata?.risk_level || 'HIGH'} RISK
              </span>
            </div>
            
            <p className="text-slate-300 text-sm mb-3">
              {metadata?.description || `Action: ${job.actionId}`}
            </p>
            
            <div className="bg-black/40 rounded p-2 mb-4">
              <pre className="text-xs text-slate-400 font-mono overflow-x-auto">
                {JSON.stringify(job.payload, null, 2)}
              </pre>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => JobQueue.approveJob(job.id)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
              >
                Approve
              </button>
              <button 
                onClick={() => JobQueue.rejectJob(job.id)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm border border-slate-700"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
