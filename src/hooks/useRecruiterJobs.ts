import { useCallback, useEffect, useState } from 'react';
import { getJobApplications, getRecruiterJobs } from '../services/api';
import type { JobApplication, PublicJob } from '../contracts/api';

export function useRecruiterJobs() {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, JobApplication[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const paginated = await getRecruiterJobs();
      const jobList = paginated.data;
      setJobs(jobList);

      const apps: Record<string, JobApplication[]> = {};
      await Promise.all(
        jobList.map(async (job) => {
          try {
            const response = await getJobApplications(job.id);
            apps[job.id] = response.data;
          } catch {
            apps[job.id] = [];
          }
        })
      );
      setApplicationsByJob(apps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
      setJobs([]);
      setApplicationsByJob({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { jobs, applicationsByJob, loading, error, refresh };
}
