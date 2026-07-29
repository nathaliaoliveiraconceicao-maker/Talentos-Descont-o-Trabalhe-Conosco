import { useCallback, useEffect, useState } from 'react';
import { listCandidates } from '@/lib/candidatesApi';
import type { Candidate } from '@/types/candidate';

export function useCandidates(tenantId: string | undefined) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listCandidates(tenantId);
      setCandidates(data);
    } catch {
      setError('Não foi possível carregar os candidatos. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { candidates, loading, error, reload };
}
