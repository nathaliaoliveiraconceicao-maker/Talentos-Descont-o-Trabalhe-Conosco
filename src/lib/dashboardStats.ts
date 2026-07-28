import { jobAreaLabel } from '@/data/jobAreas';
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
