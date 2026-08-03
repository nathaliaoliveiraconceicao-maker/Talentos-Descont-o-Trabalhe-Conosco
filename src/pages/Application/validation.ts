import type { CandidateFormData } from '@/types/candidate';
import { isAdult, isValidCpf, isValidDate, isValidEmail, isValidPhone, textLengthOk } from '@/lib/validators';
import { RESUME_ACCEPTED_TYPES, RESUME_MAX_SIZE_BYTES } from '@/lib/candidatesApi';
import { LIFE_WHEEL_KEYS, type BehavioralScreeningSettings } from '@/types/behavioralProfile';

export type Errors = Record<string, string>;

export const PROFILE_MAX_LENGTH = 600;
export const BEHAVIORAL_TEXT_MAX_LENGTH = 1500;
export const EMOTIONAL_BALANCE_CONTEXT_MAX_LENGTH = 1000;
export const WORK_ANIMAL_MAX_LENGTH = 1000;
export const THREE_WORDS_MAX_LENGTH = 40;

export function validatePersonal(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { personal } = data;
  if (!personal.fullName.trim()) errors['personal.fullName'] = 'Informe seu nome completo.';
  if (!personal.birthDate) {
    errors['personal.birthDate'] = 'Informe sua data de nascimento.';
  } else if (!isValidDate(personal.birthDate)) {
    errors['personal.birthDate'] = 'Data de nascimento inválida.';
  } else if (!isAdult(personal.birthDate, 14)) {
    errors['personal.birthDate'] = 'É necessário ter ao menos 14 anos para se candidatar.';
  }
  if (personal.cpf && !isValidCpf(personal.cpf)) errors['personal.cpf'] = 'CPF inválido.';
  if (!personal.city.trim()) errors['personal.city'] = 'Informe sua cidade.';
  if (!personal.neighborhood.trim()) errors['personal.neighborhood'] = 'Informe seu bairro.';
  if (!personal.hasEasyAccess) errors['personal.hasEasyAccess'] = 'Selecione uma opção.';
  return errors;
}

export function validateContact(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { contact } = data;
  if (!isValidPhone(contact.whatsapp)) errors['contact.whatsapp'] = 'Informe um número de WhatsApp válido com DDD.';
  if (contact.alternatePhone && !isValidPhone(contact.alternatePhone)) {
    errors['contact.alternatePhone'] = 'Telefone alternativo inválido.';
  }
  if (!isValidEmail(contact.email)) errors['contact.email'] = 'Informe um e-mail válido.';
  if (!contact.contactPreference) errors['contact.contactPreference'] = 'Selecione a melhor forma de contato.';
  return errors;
}

export function validateInterest(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { interest } = data;
  if (interest.areas.length === 0) errors['interest.areas'] = 'Selecione ao menos uma área de interesse.';
  if (!interest.mainAreaOfInterest) errors['interest.mainAreaOfInterest'] = 'Selecione sua área de maior interesse.';
  if (!interest.acceptsOtherRole) errors['interest.acceptsOtherRole'] = 'Selecione uma opção.';
  if (!interest.isFirstJob) errors['interest.isFirstJob'] = 'Selecione uma opção.';
  return errors;
}

export function validateAvailability(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { availability } = data;
  const anyPeriod =
    availability.morning || availability.afternoon || availability.night || availability.fullTime;
  if (!anyPeriod) errors['availability.periods'] = 'Selecione ao menos um período de disponibilidade.';
  if (!availability.canStartImmediately) {
    errors['availability.canStartImmediately'] = 'Selecione uma opção.';
  } else if (availability.canStartImmediately === 'nao' && !availability.estimatedStartDate) {
    errors['availability.estimatedStartDate'] = 'Informe a data estimada para início.';
  }
  if (!availability.availableForOvertime) errors['availability.availableForOvertime'] = 'Selecione uma opção.';
  return errors;
}

export function validateExperience(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { experience } = data;
  if (!experience.hasWorkedBefore) {
    errors['experience.hasWorkedBefore'] = 'Selecione uma opção.';
    return errors;
  }
  if (experience.hasWorkedBefore === 'sim') {
    if (experience.experiences.length === 0) {
      errors['experience.experiences'] = 'Cadastre ao menos uma experiência profissional.';
    }
    experience.experiences.forEach((exp) => {
      if (!exp.company.trim()) errors[`experience.exp.${exp.id}.company`] = 'Informe o nome da empresa.';
      if (!exp.role.trim()) errors[`experience.exp.${exp.id}.role`] = 'Informe o cargo ou função.';
      if (!exp.startDate) errors[`experience.exp.${exp.id}.startDate`] = 'Informe a data de entrada.';
      if (!exp.isCurrentJob && !exp.endDate) {
        errors[`experience.exp.${exp.id}.endDate`] = 'Informe a data de saída ou marque como emprego atual.';
      }
      if (!exp.activities.trim()) errors[`experience.exp.${exp.id}.activities`] = 'Descreva as principais atividades.';
    });
    if (!experience.workedInSupermarket) errors['experience.workedInSupermarket'] = 'Selecione uma opção.';
    if (!experience.workedInRetail) errors['experience.workedInRetail'] = 'Selecione uma opção.';
    if (!experience.hasCustomerServiceExperience) {
      errors['experience.hasCustomerServiceExperience'] = 'Selecione uma opção.';
    }
    if (!experience.hasCashierExperience) errors['experience.hasCashierExperience'] = 'Selecione uma opção.';
    if (!experience.hasRestockingExperience) errors['experience.hasRestockingExperience'] = 'Selecione uma opção.';
    if (!experience.hasStockExperience) errors['experience.hasStockExperience'] = 'Selecione uma opção.';
    if (!experience.hasButcherExperience) errors['experience.hasButcherExperience'] = 'Selecione uma opção.';
    if (!experience.hasBakeryExperience) errors['experience.hasBakeryExperience'] = 'Selecione uma opção.';
    if (!experience.hasLeadershipExperience) errors['experience.hasLeadershipExperience'] = 'Selecione uma opção.';
  }
  return errors;
}

export function validateEducation(data: CandidateFormData): Errors {
  const errors: Errors = {};
  if (!data.education.educationLevel) errors['education.educationLevel'] = 'Selecione sua escolaridade.';
  return errors;
}

export function validateProfile(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { profile } = data;
  const fields: [keyof typeof profile, string][] = [
    ['whyWorkHere', 'Conte por que gostaria de trabalhar conosco.'],
    ['mainQualities', 'Conte suas principais qualidades profissionais.'],
    ['reactionToFeedback', 'Conte como reage a orientações ou correções.'],
    ['helpingColleagueStory', 'Conte uma situação em que ajudou um colega.'],
    ['goodServiceMeaning', 'Conte o que é um bom atendimento para você.'],
    ['dissatisfiedCustomerAction', 'Conte como agiria com um cliente insatisfeito.'],
    ['futureExpectations', 'Conte suas expectativas profissionais futuras.'],
  ];
  fields.forEach(([key, message]) => {
    if (!textLengthOk(profile[key], PROFILE_MAX_LENGTH)) {
      errors[`profile.${key}`] = message;
    }
  });
  return errors;
}

export function validateResume(resumeFile: File | null): Errors {
  const errors: Errors = {};
  if (!resumeFile) return errors;
  if (!RESUME_ACCEPTED_TYPES.includes(resumeFile.type)) {
    errors['resume'] = 'Formato de arquivo não suportado. Envie PDF, DOC, DOCX, JPG ou PNG.';
  } else if (resumeFile.size > RESUME_MAX_SIZE_BYTES) {
    errors['resume'] = 'O arquivo excede o tamanho máximo permitido de 5 MB.';
  }
  return errors;
}

export function validateConsent(data: CandidateFormData): Errors {
  const errors: Errors = {};
  if (!data.consent.confirmsTruthfulness) {
    errors['consent.confirmsTruthfulness'] = 'É necessário confirmar que as informações são verdadeiras.';
  }
  if (!data.consent.authorizesDataProcessing) {
    errors['consent.authorizesDataProcessing'] = 'É necessário autorizar o tratamento dos dados.';
  }
  return errors;
}

/**
 * Só é chamada quando a etapa "Perfil comportamental" está visível (ver
 * isBehavioralScreeningVisible) — o consentimento é sempre obrigatório para
 * avançar dessa etapa; dentro dela, cada pergunta só é obrigatória conforme
 * a configuração da empresa/vaga (settings.<pergunta>.required).
 */
export function validateBehavioral(data: CandidateFormData, settings: BehavioralScreeningSettings): Errors {
  const errors: Errors = {};
  if (!data.behavioralProfileConsent?.accepted) {
    errors['behavioralProfileConsent'] =
      'É necessário marcar a confirmação para continuar respondendo a esta etapa.';
  }

  const bp = data.behavioralProfile ?? {};

  if (settings.threeWords.enabled && settings.threeWords.required) {
    const tw = bp.threeWords;
    if (!tw?.word1?.trim()) errors['behavioralProfile.threeWords.word1'] = 'Informe a primeira palavra.';
    if (!tw?.word2?.trim()) errors['behavioralProfile.threeWords.word2'] = 'Informe a segunda palavra.';
    if (!tw?.word3?.trim()) errors['behavioralProfile.threeWords.word3'] = 'Informe a terceira palavra.';
  }

  if (settings.emotionalBalance.enabled && settings.emotionalBalance.required) {
    if (!bp.emotionalBalance?.score) {
      errors['behavioralProfile.emotionalBalance.score'] = 'Selecione uma nota de 1 a 5.';
    }
    if (!bp.emotionalBalance?.context?.trim()) {
      errors['behavioralProfile.emotionalBalance.context'] = 'Conte o que tem contribuído para essa nota.';
    }
  }

  if (settings.lifeWheel.enabled && settings.lifeWheel.required) {
    LIFE_WHEEL_KEYS.forEach((key) => {
      if (bp.lifeWheel?.[key] == null) {
        errors[`behavioralProfile.lifeWheel.${key}`] = 'Selecione uma nota de 0 a 10.';
      }
    });
  }

  if (settings.workAnimal.enabled && settings.workAnimal.required && !bp.workAnimal?.answer?.trim()) {
    errors['behavioralProfile.workAnimal'] = 'Conte qual animal representa você no ambiente de trabalho.';
  }

  if (settings.constructiveFeedback.enabled && settings.constructiveFeedback.required && !bp.constructiveFeedback?.trim()) {
    errors['behavioralProfile.constructiveFeedback'] = 'Conte sobre um momento em que recebeu uma crítica construtiva.';
  }

  if (settings.conflictManagement.enabled && settings.conflictManagement.required && !bp.conflictManagement?.trim()) {
    errors['behavioralProfile.conflictManagement'] = 'Conte sobre um conflito que enfrentou e como lidou com ele.';
  }

  if (settings.emotionalControl.enabled && settings.emotionalControl.required && !bp.emotionalControl?.trim()) {
    errors['behavioralProfile.emotionalControl'] = 'Descreva uma ocasião em que precisou controlar suas emoções.';
  }

  return errors;
}
