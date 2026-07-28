import type { ReactNode } from 'react';
import type { CandidateStatus } from '@/types/candidate';
import { STATUS_LABELS } from '@/types/candidate';

const STATUS_COLORS: Record<CandidateStatus, string> = {
  nova_candidatura: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-amber-100 text-amber-800',
  pre_selecionado: 'bg-purple-100 text-purple-800',
  entrevista_agendada: 'bg-indigo-100 text-indigo-800',
  aprovado: 'bg-brand-green-100 text-brand-green-800',
  banco_talentos: 'bg-teal-100 text-teal-800',
  nao_selecionado: 'bg-neutral-200 text-neutral-600',
};

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 ${className}`}
    >
      {children}
    </span>
  );
}
