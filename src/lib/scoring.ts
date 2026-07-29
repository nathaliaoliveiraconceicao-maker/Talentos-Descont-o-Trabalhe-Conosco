import { defaultScoringWeights, type ScoringWeights } from '@/types/admin';
import type { CandidateFormData } from '@/types/candidate';

export interface ScoreResult {
  total: number;
  breakdown: Record<string, number>;
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

  const mainArea = data.interest.mainAreaOfInterest;
  const areaExperienceMap: Record<string, boolean> = {
    operador_caixa: data.experience.hasCashierExperience === 'sim',
    fiscal_caixa: data.experience.hasCashierExperience === 'sim',
    repositor: data.experience.hasRestockingExperience === 'sim',
    repositor_hortifruti: data.experience.hasRestockingExperience === 'sim',
    acougueiro: data.experience.hasButcherExperience === 'sim',
    ajudante_acougue: data.experience.hasButcherExperience === 'sim',
    padeiro: data.experience.hasBakeryExperience === 'sim',
    ajudante_padaria: data.experience.hasBakeryExperience === 'sim',
    estoquista: data.experience.hasStockExperience === 'sim',
    conferente: data.experience.hasStockExperience === 'sim',
    atendente_frios: data.experience.hasCustomerServiceExperience === 'sim',
  };
  breakdown.areaExperience = mainArea && areaExperienceMap[mainArea] ? weights.areaExperience : 0;

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
