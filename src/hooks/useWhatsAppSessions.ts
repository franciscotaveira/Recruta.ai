import { useCallback, useEffect, useState } from 'react';
import { getRecruiterWhatsAppSessions, getWhatsAppSessions } from '../services/api';
import type { WhatsAppSession } from '../contracts/api';

export function useWhatsAppSessions(jobId?: string) {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = jobId
        ? await getWhatsAppSessions(jobId)
        : await getRecruiterWhatsAppSessions();
      setSessions(response.data);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar sessões de WhatsApp');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
