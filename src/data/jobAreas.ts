import type { JobAreaId } from '@/types/candidate';

export interface JobAreaOption {
  id: JobAreaId;
  label: string;
}

export const JOB_AREAS: JobAreaOption[] = [
  { id: 'ajudante_acougue', label: 'Ajudante de Açougue' },
  { id: 'acougueiro', label: 'Açougueiro' },
  { id: 'padeiro', label: 'Padeiro' },
  { id: 'ajudante_padaria', label: 'Ajudante de Padaria' },
  { id: 'repositor_hortifruti', label: 'Repositor de Hortifrúti' },
  { id: 'repositor', label: 'Repositor' },
  { id: 'operador_caixa', label: 'Operador(a) de Caixa' },
  { id: 'fiscal_caixa', label: 'Fiscal de Caixa' },
  { id: 'administrativo', label: 'Administrativo' },
  { id: 'atendente_frios', label: 'Atendente de Frios' },
  { id: 'conferente', label: 'Conferente' },
  { id: 'estoquista', label: 'Estoquista' },
  { id: 'outra', label: 'Outra área' },
];

export function jobAreaLabel(id: string): string {
  return JOB_AREAS.find((area) => area.id === id)?.label ?? id;
}
