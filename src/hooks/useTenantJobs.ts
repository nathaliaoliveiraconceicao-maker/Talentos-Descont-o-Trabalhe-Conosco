import { useEffect, useState } from 'react';
import { getTenantJobAreas } from '@/lib/tenantApi';
import type { TenantJobArea } from '@/types/tenant';

/** Áreas de interesse (cargos) configuradas pelo tenant logado, para uso no painel /app/*. */
export function useTenantJobs(tenantId: string | null) {
  const [jobs, setJobs] = useState<TenantJobArea[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    getTenantJobAreas(tenantId).then(setJobs);
  }, [tenantId]);

  return jobs;
}
