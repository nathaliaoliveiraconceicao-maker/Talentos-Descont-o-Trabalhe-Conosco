import type { JobAreaId } from '@/types/candidate';

export interface JobAreaOption {
  id: JobAreaId;
  label: string;
}

export const JOB_AREAS: JobAreaOption[] = [
  { id: 'caixa', label: 'Operador de caixa' },
  { id: 'repositor', label: 'Repositor' },
  { id: 'acougue', label: 'Açougue' },
  { id: 'padaria', label: 'Padaria' },
  { id: 'hortifruti', label: 'Hortifrúti' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'limpeza', label: 'Limpeza' },
  { id: 'atendimento', label: 'Atendimento' },
  { id: 'administrativo', label: 'Administrativo' },
  { id: 'entregas', label: 'Entregas' },
  { id: 'prevencao_perdas', label: 'Prevenção de perdas' },
  { id: 'lideranca', label: 'Liderança' },
  { id: 'outra', label: 'Outra área' },
];

export function jobAreaLabel(id: string): string {
  return JOB_AREAS.find((area) => area.id === id)?.label ?? id;
}
