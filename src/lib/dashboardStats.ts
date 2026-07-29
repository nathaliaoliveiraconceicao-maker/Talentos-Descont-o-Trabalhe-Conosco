import { jobAreaLabel } from '@/data/jobAreas';
import { EDUCATION_LEVELS } from '@/data/educationLevels';
import type { Candidate } from '@/types/candidate';

export interface ChartDatum {
  name: string;
  value: number;
}

export function countByStatus(candidates: Candidate[]) {
  const totals = {
    total: candidates.length,
    nova_candidatura: 0,
    em_analise: 0,
    pre_selecionado: 0,
    entrevista_agendada: 0,
    aprovado: 0,
    banco_talentos: 0,
    nao_selecionado: 0,
  };
  candidates.forEach((c) => {
    totals[c.status] += 1;
  });
  return totals;
}

export function countLastNDays(candidates: Candidate[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return candidates.filter((c) => new Date(c.createdAt).getTime() >= cutoff).length;
}

export function countThisMonth(candidates: Candidate[]): number {
  const now = new Date();
  return candidates.filter((c) => {
    const date = new Date(c.createdAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
}

export function candidatesByArea(candidates: Candidate[]): ChartDatum[] {
  const counts = new Map<string, number>();
  candidates.forEach((c) => {
    const area = c.interest?.mainAreaOfInterest;
    if (!area) return;
    counts.set(area, (counts.get(area) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([area, value]) => ({ name: jobAreaLabel(area), value }))
    .sort((a, b) => b.value - a.value);
}

export function candidatesByNeighborhood(candidates: Candidate[]): ChartDatum[] {
  const counts = new Map<string, number>();
  candidates.forEach((c) => {
    const neighborhood = c.personal?.neighborhood?.trim();
    if (!neighborhood) return;
    counts.set(neighborhood, (counts.get(neighborhood) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function candidatesByExperience(candidates: Candidate[]): ChartDatum[] {
  let withExperience = 0;
  let withoutExperience = 0;
  candidates.forEach((c) => {
    if (c.experience?.hasWorkedBefore === 'sim') withExperience += 1;
    else withoutExperience += 1;
  });
  return [
    { name: 'Com experiência', value: withExperience },
    { name: 'Sem experiência', value: withoutExperience },
  ];
}

export function candidatesByAvailability(candidates: Candidate[]): ChartDatum[] {
  const labels: [keyof Candidate['availability'], string][] = [
    ['morning', 'Manhã'],
    ['afternoon', 'Tarde'],
    ['night', 'Noite'],
    ['fullTime', 'Integral'],
    ['saturdays', 'Sábados'],
    ['sundays', 'Domingos'],
  ];
  return labels.map(([key, name]) => ({
    name,
    value: candidates.filter((c) => Boolean(c.availability?.[key])).length,
  }));
}

export function candidatesByEducation(candidates: Candidate[]): ChartDatum[] {
  const counts = new Map<string, number>();
  candidates.forEach((c) => {
    const level = c.education?.educationLevel;
    if (!level) return;
    counts.set(level, (counts.get(level) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([level, value]) => ({
      name: EDUCATION_LEVELS.find((l) => l.id === level)?.label ?? level,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

export function candidatesByFirstJob(candidates: Candidate[]): ChartDatum[] {
  const seeking = candidates.filter((c) => c.interest?.isFirstJob === 'sim').length;
  return [
    { name: 'Buscando 1º emprego', value: seeking },
    { name: 'Já teve experiência', value: candidates.length - seeking },
  ];
}

export function candidatesBySupermarketExperience(candidates: Candidate[]): ChartDatum[] {
  const withExp = candidates.filter((c) => c.experience?.workedInSupermarket === 'sim').length;
  return [
    { name: 'Com experiência em supermercado', value: withExp },
    { name: 'Sem experiência em supermercado', value: candidates.length - withExp },
  ];
}

export function candidatesByStatusChart(
  candidates: Candidate[],
  statusLabels: Record<string, string>
): ChartDatum[] {
  const totals = countByStatus(candidates);
  return Object.entries(totals)
    .filter(([key]) => key !== 'total')
    .map(([status, value]) => ({ name: statusLabels[status] ?? status, value }));
}

export interface FunnelRates {
  preSelectedRate: number;
  interviewRate: number;
  approvalRate: number;
}

export function calculateFunnelRates(candidates: Candidate[]): FunnelRates {
  const total = candidates.length || 1;
  const totals = countByStatus(candidates);
  const round = (n: number) => Math.round((n / total) * 1000) / 10;
  return {
    preSelectedRate: round(totals.pre_selecionado + totals.entrevista_agendada + totals.aprovado),
    interviewRate: round(totals.entrevista_agendada + totals.aprovado),
    approvalRate: round(totals.aprovado),
  };
}

export function filterByDateRange(
  candidates: Candidate[],
  startDate: string,
  endDate: string
): Candidate[] {
  if (!startDate && !endDate) return candidates;
  const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
  const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
  return candidates.filter((c) => {
    const time = new Date(c.createdAt).getTime();
    return time >= start && time <= end;
  });
}
