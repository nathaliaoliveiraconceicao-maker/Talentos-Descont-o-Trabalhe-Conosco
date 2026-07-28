import type { EducationLevel } from '@/types/candidate';

export const EDUCATION_LEVELS: { id: EducationLevel; label: string }[] = [
  { id: 'fundamental_incompleto', label: 'Ensino fundamental incompleto' },
  { id: 'fundamental_completo', label: 'Ensino fundamental completo' },
  { id: 'medio_incompleto', label: 'Ensino médio incompleto' },
  { id: 'medio_completo', label: 'Ensino médio completo' },
  { id: 'superior_incompleto', label: 'Ensino superior incompleto' },
  { id: 'superior_completo', label: 'Ensino superior completo' },
  { id: 'pos_graduacao', label: 'Pós-graduação' },
];
