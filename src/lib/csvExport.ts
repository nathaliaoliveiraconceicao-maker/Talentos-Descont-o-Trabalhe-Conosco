import { jobAreaLabel } from '@/data/jobAreas';
import { EDUCATION_LEVELS } from '@/data/educationLevels';
import { STATUS_LABELS, type Candidate } from '@/types/candidate';

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function educationLabel(level: string): string {
  return EDUCATION_LEVELS.find((l) => l.id === level)?.label ?? level;
}

/**
 * Gera as linhas do CSV de candidatos. Por padrão (includeRestricted = false),
 * observações internas e avaliações do RH não são incluídas — apenas dados do
 * próprio candidato, conforme exigido antes de qualquer exportação.
 */
export function candidatesToCsvRows(candidates: Candidate[], includeRestricted: boolean): string[][] {
  const baseHeader = [
    'Protocolo',
    'Nome',
    'WhatsApp',
    'E-mail',
    'Cidade',
    'Bairro',
    'Área principal',
    'Buscando 1º emprego',
    'Experiência em supermercado',
    'Escolaridade',
    'Pontuação',
    'Status',
    'Data da candidatura',
  ];
  const restrictedHeader = [
    'Observações internas',
    'Nota do recrutador',
    'Responsável pela análise',
    'Data da entrevista',
    'Horário da entrevista',
    'Local da entrevista',
  ];

  const header = includeRestricted ? [...baseHeader, ...restrictedHeader] : baseHeader;

  const rows = candidates.map((c) => {
    const base = [
      c.protocol,
      c.personal.fullName,
      c.contact.whatsapp,
      c.contact.email,
      c.personal.city,
      c.personal.neighborhood,
      jobAreaLabel(c.interest.mainAreaOfInterest),
      c.interest.isFirstJob === 'sim' ? 'Sim' : 'Não',
      c.experience.workedInSupermarket === 'sim' ? 'Sim' : 'Não',
      c.education.educationLevel ? educationLabel(c.education.educationLevel) : '',
      String(c.score),
      STATUS_LABELS[c.status],
      new Date(c.createdAt).toLocaleString('pt-BR'),
    ];
    if (!includeRestricted) return base;
    return [
      ...base,
      c.evaluation?.recruiterNote ?? '',
      c.evaluation?.recruiterRating != null ? String(c.evaluation.recruiterRating) : '',
      c.evaluation?.responsibleName ?? '',
      c.evaluation?.interviewDate ?? '',
      c.evaluation?.interviewTime ?? '',
      c.evaluation?.interviewLocation ?? '',
    ];
  });

  return [header, ...rows];
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const csvContent = rows.map((row) => row.map(escapeCsvValue).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
