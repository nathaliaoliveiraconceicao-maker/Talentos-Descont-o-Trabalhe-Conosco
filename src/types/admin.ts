export type AdminRole = 'admin' | 'rh';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  active: boolean;
}

export interface ScoringWeights {
  easyAccess: number;
  variedAvailability: number;
  weekendAvailability: number;
  areaExperience: number;
  supermarketExperience: number;
  customerServiceExperience: number;
  canStartImmediately: number;
  resumeAttached: number;
  wellFilledProfile: number;
}

export const defaultScoringWeights: ScoringWeights = {
  easyAccess: 1,
  variedAvailability: 2,
  weekendAvailability: 2,
  areaExperience: 3,
  supermarketExperience: 2,
  customerServiceExperience: 1,
  canStartImmediately: 1,
  resumeAttached: 1,
  wellFilledProfile: 1,
};

export interface ScoringSettings {
  weights: ScoringWeights;
  updatedAt: string;
  updatedBy: string;
}

export interface RetentionSettings {
  talentPoolRetentionMonths: number;
  updatedAt: string;
  updatedBy: string;
}

export interface JobArea {
  id: string;
  label: string;
  active: boolean;
}
