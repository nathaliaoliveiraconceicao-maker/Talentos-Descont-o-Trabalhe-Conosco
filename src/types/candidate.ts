export type ContactPreference = 'whatsapp' | 'ligacao' | 'email';

export type JobAreaId =
  | 'caixa'
  | 'repositor'
  | 'acougue'
  | 'padaria'
  | 'hortifruti'
  | 'estoque'
  | 'limpeza'
  | 'atendimento'
  | 'administrativo'
  | 'entregas'
  | 'prevencao_perdas'
  | 'lideranca'
  | 'outra';

export type CandidateStatus =
  | 'nova_candidatura'
  | 'em_analise'
  | 'pre_selecionado'
  | 'entrevista_agendada'
  | 'aprovado'
  | 'banco_talentos'
  | 'nao_selecionado';

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  nova_candidatura: 'Nova candidatura',
  em_analise: 'Em análise',
  pre_selecionado: 'Pré-selecionado',
  entrevista_agendada: 'Entrevista agendada',
  aprovado: 'Aprovado',
  banco_talentos: 'Banco de talentos',
  nao_selecionado: 'Não selecionado',
};

export const STATUS_ORDER: CandidateStatus[] = [
  'nova_candidatura',
  'em_analise',
  'pre_selecionado',
  'entrevista_agendada',
  'aprovado',
  'banco_talentos',
  'nao_selecionado',
];

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  activities: string;
  leavingReason: string;
  referenceName?: string;
  referencePhone?: string;
  allowContactReference: boolean;
}

export interface PersonalData {
  fullName: string;
  birthDate: string;
  cpf?: string;
  city: string;
  neighborhood: string;
  addressSummary?: string;
  hasEasyAccess: 'sim' | 'nao' | 'parcialmente' | '';
  accessibilityNeeds?: string;
}

export interface ContactData {
  whatsapp: string;
  alternatePhone?: string;
  email: string;
  contactPreference: ContactPreference | '';
}

export interface InterestData {
  areas: JobAreaId[];
  otherAreaDescription?: string;
  mainAreaOfInterest: JobAreaId | '';
  acceptsOtherRole: 'sim' | 'nao' | '';
  isFirstJob: 'sim' | 'nao' | '';
}

export interface AvailabilityData {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  fullTime: boolean;
  saturdays: boolean;
  sundays: boolean;
  holidays: boolean;
  shiftWork: boolean;
  canStartImmediately: 'sim' | 'nao' | '';
  estimatedStartDate?: string;
  availableForOvertime: 'sim' | 'nao' | '';
}

export interface ExperienceData {
  hasWorkedBefore: 'sim' | 'nao' | '';
  experiences: WorkExperience[];
  workedInSupermarket: 'sim' | 'nao' | '';
  workedInRetail: 'sim' | 'nao' | '';
  hasCustomerServiceExperience: 'sim' | 'nao' | '';
  hasCashierExperience: 'sim' | 'nao' | '';
  hasRestockingExperience: 'sim' | 'nao' | '';
  hasStockExperience: 'sim' | 'nao' | '';
  hasButcherExperience: 'sim' | 'nao' | '';
  hasBakeryExperience: 'sim' | 'nao' | '';
  hasLeadershipExperience: 'sim' | 'nao' | '';
  mostExperiencedArea?: string;
}

export type EducationLevel =
  | 'fundamental_incompleto'
  | 'fundamental_completo'
  | 'medio_incompleto'
  | 'medio_completo'
  | 'superior_incompleto'
  | 'superior_completo'
  | 'pos_graduacao';

export interface EducationData {
  educationLevel: EducationLevel | '';
  institution?: string;
  technicalCourse?: string;
  professionalCourses?: string;
  certifications?: string;
  basicComputerSkills: boolean;
  officePackage: boolean;
  posSystemsExperience: boolean;
  otherSkills?: string;
}

export interface ProfileData {
  whyWorkHere: string;
  mainQualities: string;
  reactionToFeedback: string;
  helpingColleagueStory: string;
  goodServiceMeaning: string;
  dissatisfiedCustomerAction: string;
  futureExpectations: string;
}

export interface ResumeFile {
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface ConsentData {
  confirmsTruthfulness: boolean;
  authorizesDataProcessing: boolean;
}

export interface StatusHistoryEntry {
  id: string;
  status: CandidateStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface CandidateEvaluation {
  recruiterNote?: string;
  recruiterRating?: number; // 1-5
  interviewDate?: string;
  interviewTime?: string;
  responsibleName?: string;
  isFavorite: boolean;
}

export interface Candidate {
  id: string;
  protocol: string;
  personal: PersonalData;
  contact: ContactData;
  interest: InterestData;
  availability: AvailabilityData;
  experience: ExperienceData;
  education: EducationData;
  profile: ProfileData;
  resume?: ResumeFile | null;
  consent: ConsentData;
  status: CandidateStatus;
  score: number;
  scoreBreakdown?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  evaluation?: CandidateEvaluation;
}

export type CandidateFormData = Omit<
  Candidate,
  'id' | 'protocol' | 'status' | 'score' | 'scoreBreakdown' | 'createdAt' | 'updatedAt' | 'evaluation'
>;

export const emptyCandidateFormData: CandidateFormData = {
  personal: {
    fullName: '',
    birthDate: '',
    cpf: '',
    city: '',
    neighborhood: '',
    addressSummary: '',
    hasEasyAccess: '',
    accessibilityNeeds: '',
  },
  contact: {
    whatsapp: '',
    alternatePhone: '',
    email: '',
    contactPreference: '',
  },
  interest: {
    areas: [],
    otherAreaDescription: '',
    mainAreaOfInterest: '',
    acceptsOtherRole: '',
    isFirstJob: '',
  },
  availability: {
    morning: false,
    afternoon: false,
    night: false,
    fullTime: false,
    saturdays: false,
    sundays: false,
    holidays: false,
    shiftWork: false,
    canStartImmediately: '',
    estimatedStartDate: '',
    availableForOvertime: '',
  },
  experience: {
    hasWorkedBefore: '',
    experiences: [],
    workedInSupermarket: '',
    workedInRetail: '',
    hasCustomerServiceExperience: '',
    hasCashierExperience: '',
    hasRestockingExperience: '',
    hasStockExperience: '',
    hasButcherExperience: '',
    hasBakeryExperience: '',
    hasLeadershipExperience: '',
    mostExperiencedArea: '',
  },
  education: {
    educationLevel: '',
    institution: '',
    technicalCourse: '',
    professionalCourses: '',
    certifications: '',
    basicComputerSkills: false,
    officePackage: false,
    posSystemsExperience: false,
    otherSkills: '',
  },
  profile: {
    whyWorkHere: '',
    mainQualities: '',
    reactionToFeedback: '',
    helpingColleagueStory: '',
    goodServiceMeaning: '',
    dissatisfiedCustomerAction: '',
    futureExpectations: '',
  },
  resume: null,
  consent: {
    confirmsTruthfulness: false,
    authorizesDataProcessing: false,
  },
};
