/**
 * Triagem emocional e perfil comportamental — seção OPCIONAL do formulário
 * público, usada apenas como apoio à entrevista. Nunca gera diagnóstico,
 * eliminação automática ou pontuação — ver README para os detalhes de
 * privacidade e o motivo das respostas viverem em subcoleções separadas do
 * candidato (isolamento de leitura por papel, algo que o Firestore só
 * garante por documento, não por campo).
 */

export interface ThreeWordsAnswer {
  word1: string;
  word2: string;
  word3: string;
}

export interface EmotionalBalanceAnswer {
  score: number; // 1 a 5
  context: string;
}

export interface LifeWheelAnswer {
  personalFamilyLife: number; // 0 a 10
  physicalHealth: number;
  emotionalHealth: number;
  previousWorkEnvironment: number;
  interpersonalRelationships: number;
  professionalMotivation: number;
}

export const LIFE_WHEEL_KEYS: (keyof LifeWheelAnswer)[] = [
  'personalFamilyLife',
  'physicalHealth',
  'emotionalHealth',
  'previousWorkEnvironment',
  'interpersonalRelationships',
  'professionalMotivation',
];

export const LIFE_WHEEL_LABELS: Record<keyof LifeWheelAnswer, string> = {
  personalFamilyLife: 'Vida pessoal e familiar',
  physicalHealth: 'Saúde física',
  emotionalHealth: 'Saúde emocional',
  previousWorkEnvironment: 'Ambiente de trabalho anterior',
  interpersonalRelationships: 'Relacionamento interpessoal',
  professionalMotivation: 'Motivação profissional',
};

export interface WorkAnimalAnswer {
  answer: string;
}

/** Respostas do candidato — ver src/lib/behavioralProfileApi.ts para onde e como são gravadas. */
export interface BehavioralProfile {
  threeWords?: ThreeWordsAnswer;
  emotionalBalance?: EmotionalBalanceAnswer;
  lifeWheel?: LifeWheelAnswer;
  workAnimal?: WorkAnimalAnswer;
  constructiveFeedback?: string;
  conflictManagement?: string;
  emotionalControl?: string;
  /** Preenchido no envio da candidatura — data/hora do preenchimento desta seção. */
  filledAt?: string;
}

export interface BehavioralProfileConsent {
  accepted: boolean;
  acceptedAt: string;
  policyVersion: string;
}

export const BEHAVIORAL_PROFILE_POLICY_VERSION = '1.0';

export type BehavioralQuestionKey =
  | 'threeWords'
  | 'emotionalBalance'
  | 'lifeWheel'
  | 'workAnimal'
  | 'constructiveFeedback'
  | 'conflictManagement'
  | 'emotionalControl';

export const BEHAVIORAL_QUESTION_KEYS: BehavioralQuestionKey[] = [
  'threeWords',
  'emotionalBalance',
  'lifeWheel',
  'workAnimal',
  'constructiveFeedback',
  'conflictManagement',
  'emotionalControl',
];

export const BEHAVIORAL_QUESTION_LABELS: Record<BehavioralQuestionKey, string> = {
  threeWords: 'Teste das três palavras',
  emotionalBalance: 'Autoavaliação de equilíbrio emocional',
  lifeWheel: 'Mini roda da vida adaptada',
  workAnimal: 'Quem sou eu no trabalho',
  constructiveFeedback: 'Crítica construtiva',
  conflictManagement: 'Gestão de conflitos',
  emotionalControl: 'Controle emocional',
};

export interface BehavioralQuestionSetting {
  enabled: boolean;
  required: boolean;
}

/** tenants/{tenantId}/settings/behavioralScreening (config geral da empresa). */
export interface BehavioralScreeningSettings {
  enabled: boolean;
  threeWords: BehavioralQuestionSetting;
  emotionalBalance: BehavioralQuestionSetting;
  lifeWheel: BehavioralQuestionSetting;
  workAnimal: BehavioralQuestionSetting;
  constructiveFeedback: BehavioralQuestionSetting;
  conflictManagement: BehavioralQuestionSetting;
  emotionalControl: BehavioralQuestionSetting;
  /** Mostra/esconde a área privada "Observações do entrevistador" na ficha do candidato. */
  interviewerNotesEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

const OFF: BehavioralQuestionSetting = { enabled: false, required: false };
const ON_OPTIONAL: BehavioralQuestionSetting = { enabled: true, required: false };

/**
 * Padrão da plataforma quando o tenant nunca configurou nada
 * (tenants/{tenantId}/settings/behavioralScreening ainda não existe) —
 * seção inteira desativada, para nunca aparecer sem uma decisão explícita
 * da empresa.
 */
export const PLATFORM_DEFAULT_BEHAVIORAL_SCREENING: Omit<BehavioralScreeningSettings, 'updatedAt' | 'updatedBy'> = {
  enabled: false,
  threeWords: OFF,
  emotionalBalance: OFF,
  lifeWheel: OFF,
  workAnimal: OFF,
  constructiveFeedback: OFF,
  conflictManagement: OFF,
  emotionalControl: OFF,
  interviewerNotesEnabled: true,
};

/** Valores sugeridos quando a empresa ativa a seção pela primeira vez pela interface. */
export const DEFAULT_ENABLED_BEHAVIORAL_SCREENING: Omit<BehavioralScreeningSettings, 'updatedAt' | 'updatedBy'> = {
  enabled: true,
  threeWords: ON_OPTIONAL,
  emotionalBalance: ON_OPTIONAL,
  lifeWheel: ON_OPTIONAL,
  workAnimal: ON_OPTIONAL,
  constructiveFeedback: ON_OPTIONAL,
  conflictManagement: ON_OPTIONAL,
  emotionalControl: ON_OPTIONAL,
  interviewerNotesEnabled: true,
};

/**
 * Prioridade de configuração: vaga específica > empresa > padrão da
 * plataforma. A configuração da vaga, quando definida, SUBSTITUI
 * inteiramente a da empresa (não é mesclada campo a campo).
 */
export function resolveBehavioralScreeningSettings(
  tenantSettings: BehavioralScreeningSettings | null | undefined,
  jobOverride: BehavioralScreeningSettings | null | undefined
): BehavioralScreeningSettings {
  const fallback: BehavioralScreeningSettings = {
    ...PLATFORM_DEFAULT_BEHAVIORAL_SCREENING,
    updatedAt: '',
    updatedBy: 'sistema',
  };
  return jobOverride ?? tenantSettings ?? fallback;
}

/** true se a seção deve aparecer no formulário (ativa e com ao menos uma pergunta ligada). */
export function isBehavioralScreeningVisible(settings: BehavioralScreeningSettings): boolean {
  return settings.enabled && BEHAVIORAL_QUESTION_KEYS.some((key) => settings[key].enabled);
}
