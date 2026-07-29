import type { TenantJobArea } from '@/types/tenant';

/**
 * Lista padrão de áreas de interesse usada para semear um tenant novo (ex.:
 * ao cadastrar um cliente pelo painel do superadmin). Cada tenant pode
 * customizar sua própria lista depois em tenants/{tenantId}/jobs — esta
 * lista NÃO é mais a fonte de verdade em tempo de execução (era antes da
 * multi-tenancy); veja src/lib/tenantApi.ts (getTenantJobAreas).
 */
export const DEFAULT_JOB_AREAS_SEED: TenantJobArea[] = [
  { id: 'ajudante_acougue', label: 'Ajudante de Açougue', active: true },
  { id: 'acougueiro', label: 'Açougueiro', active: true },
  { id: 'padeiro', label: 'Padeiro', active: true },
  { id: 'ajudante_padaria', label: 'Ajudante de Padaria', active: true },
  { id: 'repositor_hortifruti', label: 'Repositor de Hortifrúti', active: true },
  { id: 'repositor', label: 'Repositor', active: true },
  { id: 'operador_caixa', label: 'Operador(a) de Caixa', active: true },
  { id: 'fiscal_caixa', label: 'Fiscal de Caixa', active: true },
  { id: 'administrativo', label: 'Administrativo', active: true },
  { id: 'atendente_frios', label: 'Atendente de Frios', active: true },
  { id: 'conferente', label: 'Conferente', active: true },
  { id: 'estoquista', label: 'Estoquista', active: true },
  { id: 'outra', label: 'Outra área', active: true },
];
