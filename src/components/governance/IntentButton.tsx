import React, { useState, useEffect } from 'react';
import { JobQueue, Job } from '../../lib/JobQueue';
import { ActionId } from '../../contracts/ActionSchemas';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface IntentButtonProps {
  actionId: ActionId;
  payload: any;
  children: React.ReactNode;
  className?: string;
  onCompleted?: (result: any) => void;
  onError?: (error: any) => void;
}

import { useAuth } from '../../contexts/AuthContext';

export const IntentButton: React.FC<IntentButtonProps> = ({
  actionId,
  payload,
  children,
  className = '',
  onCompleted,
  onError,
}) => {
  const { user } = useAuth();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<Job['status'] | null>(null);

  useEffect(() => {
    if (!activeJobId) return;

    const unsubscribe = JobQueue.subscribe((job) => {
      if (job.id === activeJobId) {
        setJobStatus(job.status);
        if (job.status === 'completed' && onCompleted) {
          onCompleted(job.result);
          setTimeout(() => setActiveJobId(null), 3000); // Reset after 3s
        } else if (job.status === 'failed' || job.status === 'cancelled') {
          if (onError) onError(job.error || 'Job cancelled');
          setTimeout(() => setActiveJobId(null), 3000); // Reset after 3s
        }
      }
    });

    return () => unsubscribe();
  }, [activeJobId, onCompleted, onError]);

  const handleClick = async () => {
    if (
      activeJobId &&
      (jobStatus === 'pending_approval' || jobStatus === 'processing' || jobStatus === 'queued')
    ) {
      return; // Prevent duplicate clicks while running
    }
    const job = await JobQueue.createJob(actionId, payload, user?.id);
    if (job) {
      setActiveJobId(job.id);
      setJobStatus(job.status);
    } else {
      console.error('Failed to create job - validation failed');
      if (onError) onError('Validation failed for ' + actionId);
    }
  };

  const isWorking =
    jobStatus === 'pending_approval' || jobStatus === 'queued' || jobStatus === 'processing';
  const isSuccess = jobStatus === 'completed';
  const isError = jobStatus === 'failed' || jobStatus === 'cancelled';

  return (
    <button
      onClick={handleClick}
      disabled={isWorking}
      className={`relative overflow-hidden transition-all duration-300 ${className} ${
        isWorking ? 'opacity-80 cursor-not-allowed' : ''
      } ${isSuccess ? 'bg-green-600 hover:bg-green-700 text-white border-green-500' : ''} ${
        isError ? 'bg-red-600 hover:bg-red-700 text-white border-red-500' : ''
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isWorking && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSuccess && <CheckCircle2 className="w-4 h-4" />}
        {isError && <XCircle className="w-4 h-4" />}

        <span>
          {jobStatus === 'pending_approval'
            ? 'Aguardando Aprovação...'
            : jobStatus === 'queued'
              ? 'Na Fila...'
              : jobStatus === 'processing'
                ? 'Processando...'
                : jobStatus === 'completed'
                  ? 'Sucesso!'
                  : jobStatus === 'failed'
                    ? 'Falhou'
                    : jobStatus === 'cancelled'
                      ? 'Cancelado'
                      : children}
        </span>
      </div>
    </button>
  );
};
