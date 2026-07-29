export type BillingPeriod = 'monthly' | 'yearly';

/** plans/{planId} */
export interface Plan {
  planId: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  maxUsers: number;
  maxBranches: number;
  maxCandidatesPerMonth: number;
  reportsEnabled: boolean;
  csvExportEnabled: boolean;
  scoringEnabled: boolean;
  talentBankEnabled: boolean;
  customDomainEnabled: boolean;
  active: boolean;
}

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Mensal',
  yearly: 'Anual',
};
