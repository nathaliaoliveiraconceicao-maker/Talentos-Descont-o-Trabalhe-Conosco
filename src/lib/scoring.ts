import { defaultScoringWeights, type ScoringWeights } from '@/types/admin';
import type { CandidateFormData } from '@/types/candidate';

export interface ScoreResult {
  total: number;
  breakdown: Record<string, number>;
}

/**
 * Verifica se o candidato tem experiência compatível com a área de maior
 * interesse, por palavras-chave no ID da área (ex.: "caixa", "acougue").
 * Como cada tenant define suas próprias áreas em tenants/{tenantId}/jobs,
 * não é possível ter um mapeamento fixo por ID como no Descontão original —
 * esta heurística cobre os casos mais comuns de varejo/supermercado sem
 * exigir configuração adicional. Um mapeamento por tenant totalmente
 * customizável é um possível refinamento futuro (ver README).
 */
function hasExperienceInArea(data: CandidateFormData): boolean {
  const area = data.interest.mainAreaOfInterest.toLowerCase();
  const exp = data.experience;
  const keywordChecks: [string[], boolean][] = [
    [['caixa'], exp.hasCashierExperience === 'sim'],
    [['repositor', 'reposicao', 'hortifruti'], exp.hasRestockingExperience === 'sim'],
    [['acougue', 'acougueiro'], exp.hasButcherExperience === 'sim'],
    [['padaria', 'padeiro'], exp.hasBakeryExperience === 'sim'],
    [['estoque', 'estoquista', 'conferente'], exp.hasStockExperience === 'sim'],
    [['atendente', 'atendimento', 'frios'], exp.hasCustomerServiceExperience === 'sim'],
    [['lideranca', 'gerente', 'supervisor'], exp.hasLeadershipExperience === 'sim'],
  ];
  return keywordChecks.some(([keywords, hasExp]) => hasExp && keywords.some((k) => area.includes(k)));
}

/**
 * Pontuação automática usada apenas como apoio à triagem.
 * A decisão final sobre cada candidato deve sempre ser humana.
 */
export function calculateScore(
  data: CandidateFormData,
  weights: ScoringWeights = defaultScoringWeights
): ScoreResult {
  const breakdown: Record<string, number> = {};

  breakdown.easyAccess = data.personal.hasEasyAccess === 'sim' ? weights.easyAccess : 0;

  const availabilityCount = [
    data.availability.morning,
    data.availability.afternoon,
    data.availability.night,
  ].filter(Boolean).length;
  breakdown.variedAvailability = availabilityCount >= 2 ? weights.variedAvailability : 0;

  breakdown.weekendAvailability =
    data.availability.saturdays || data.availability.sundays ? weights.weekendAvailability : 0;

  breakdown.areaExperience = hasExperienceInArea(data) ? weights.areaExperience : 0;

  breakdown.supermarketExperience =
    data.experience.workedInSupermarket === 'sim' ? weights.supermarketExperience : 0;

  breakdown.customerServiceExperience =
    data.experience.hasCustomerServiceExperience === 'sim' ? weights.customerServiceExperience : 0;

  breakdown.canStartImmediately =
    data.availability.canStartImmediately === 'sim' ? weights.canStartImmediately : 0;

  breakdown.resumeAttached = data.resume ? weights.resumeAttached : 0;

  const profileFields = [
    data.profile.whyWorkHere,
    data.profile.mainQualities,
    data.profile.reactionToFeedback,
    data.profile.helpingColleagueStory,
    data.profile.goodServiceMeaning,
    data.profile.dissatisfiedCustomerAction,
    data.profile.futureExpectations,
  ];
  const wellFilled = profileFields.every((field) => field.trim().length >= 20);
  breakdown.wellFilledProfile = wellFilled ? weights.wellFilledProfile : 0;

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return { total, breakdown };
}
