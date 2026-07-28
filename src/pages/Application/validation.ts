import type { CandidateFormData } from '@/types/candidate';
import { isAdult, isValidCpf, isValidDate, isValidEmail, isValidPhone, textLengthOk } from '@/lib/validators';
import { RESUME_ACCEPTED_TYPES, RESUME_MAX_SIZE_BYTES } from '@/lib/candidatesApi';

export type Errors = Record<string, string>;

export const PROFILE_MAX_LENGTH = 600;

export function validateStep(step: number, data: CandidateFormData, resumeFile: File | null): Errors {
  switch (step) {
    case 1:
      return validatePersonal(data);
    case 2:
      return validateContact(data);
    case 3:
      return validateInterest(data);
    case 4:
      return validateAvailability(data);
    case 5:
      return validateExperience(data);
    case 6:
      return validateEducation(data);
    case 7:
      return validateProfile(data);
    case 8:
      return validateResume(resumeFile);
    case 9:
      return validateConsent(data);
    default:
      return {};
  }
}

function validatePersonal(data: CandidateFormData): Errors {
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

function validateContact(data: CandidateFormData): Errors {
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

function validateInterest(data: CandidateFormData): Errors {
  const errors: Errors = {};
  const { interest } = data;
  if (interest.areas.length === 0) errors['interest.areas'] = 'Selecione ao menos uma área de interesse.';
  if (!interest.mainAreaOfInterest) errors['interest.mainAreaOfInterest'] = 'Selecione sua área de maior interesse.';
  if (!interest.acceptsOtherRole) errors['interest.acceptsOtherRole'] = 'Selecione uma opção.';
  if (!interest.isFirstJob) errors['interest.isFirstJob'] = 'Selecione uma opção.';
  return errors;
}

function validateAvailability(data: CandidateFormData): Errors {
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

function validateExperience(data: CandidateFormData): Errors {
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

function validateEducation(data: CandidateFormData): Errors {
  const errors: Errors = {};
  if (!data.education.educationLevel) errors['education.educationLevel'] = 'Selecione sua escolaridade.';
  return errors;
}

function validateProfile(data: CandidateFormData): Errors {
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

function validateResume(resumeFile: File | null): Errors {
  const errors: Errors = {};
  if (!resumeFile) return errors;
  if (!RESUME_ACCEPTED_TYPES.includes(resumeFile.type)) {
    errors['resume'] = 'Formato de arquivo não suportado. Envie PDF, DOC, DOCX, JPG ou PNG.';
  } else if (resumeFile.size > RESUME_MAX_SIZE_BYTES) {
    errors['resume'] = 'O arquivo excede o tamanho máximo permitido de 5 MB.';
  }
  return errors;
}

function validateConsent(data: CandidateFormData): Errors {
  const errors: Errors = {};
  if (!data.consent.confirmsTruthfulness) {
    errors['consent.confirmsTruthfulness'] = 'É necessário confirmar que as informações são verdadeiras.';
  }
  if (!data.consent.authorizesDataProcessing) {
    errors['consent.authorizesDataProcessing'] = 'É necessário autorizar o tratamento dos dados.';
  }
  return errors;
}
