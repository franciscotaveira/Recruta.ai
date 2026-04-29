import { useCallback, useState } from 'react';

export function useAsyncState<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <R>(fn: () => Promise<R>, onSuccess?: (result: R) => void) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, setData, loading, error, setError, run };
}
